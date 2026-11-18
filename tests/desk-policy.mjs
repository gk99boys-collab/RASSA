import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

// Actual PostgreSQL functions, in memory. Never exercise mutations on the live roster.
const db = new PGlite({ extensions: { pgcrypto } })
const link = randomBytes(32).toString('hex'), code = '7406'
const open = async (k = link, p = code) => (await db.query('select public.rassa_open_desk($1,$2) as login', [k,p])).rows[0].login
const present = t => db.query("select set_config('request.headers',$1,false)", [JSON.stringify(t ? { 'x-rassa-desk-session': t } : {})])
const create = `select public.rassa_save_member(null,1,'عضو آزمون','طراح','{}','',null,'[]') as id`
const denied = e => e.code === '42501'
try {
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema extensions;
    create extension pgcrypto with schema extensions;
    create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$select null::uuid$$;
    create table public.members(id uuid primary key default gen_random_uuid(),sort_order integer not null unique,
      name text not null, role text not null, skills text[] not null, bio text not null, photo_url text, links jsonb not null);
    alter table public.members enable row level security; grant select on public.members to anon,authenticated;
    create policy read_only on public.members for select to anon,authenticated using(true);`)
  const migrations = new URL('../supabase/migrations/', import.meta.url)
  for (const f of readdirSync(migrations).filter(f => f.endsWith('.sql')).sort()) await db.exec(readFileSync(new URL(f,migrations),'utf8'))
  await db.exec('set role anon'); assert.equal((await open()).state,'denied'); await db.exec('reset role')
  await db.query(`insert into rassa_private.pin_gate(link_hash,pin_verifier) values
    (sha256(convert_to($1,'UTF8')),extensions.crypt($1 || ':' || $2,extensions.gen_salt('bf',4)))`,[link,code])
  await db.exec('set role anon')
  for (const role of ['anon','authenticated']) {
    await db.exec(`reset role; set role ${role}`)
    await assert.rejects(db.query(create), denied)
    assert.equal((await db.query(`select has_schema_privilege(current_user,'rassa_private','USAGE') as readable`)).rows[0].readable,false)
    for (const privilege of ['INSERT','UPDATE','DELETE']) assert.equal((await db.query("select has_table_privilege(current_user,'public.members',$1) as direct",[privilege])).rows[0].direct,false)
  }
  await db.exec('reset role; set role anon')
  assert.equal((await open(null,null)).state,'denied')
  for (let i=0;i<6;i++) assert.equal((await open('a'.repeat(64),code)).state,'denied')
  for (let i=0;i<4;i++) assert.equal((await open(link,'0000')).state,'denied')
  assert.equal((await open(link,'0000')).state,'wait')
  assert.equal((await open()).state,'wait')
  await db.exec("reset role; update rassa_private.pin_gate set retry_at=now()-interval '1 second'; set role anon")
  const first = await open(), second = await open()
  assert.equal(second.state,'ok'); assert.match(second.ticket,/^[0-9a-f]{64}$/)
  await present(first.ticket); await assert.rejects(db.query(create),denied)
  await present(second.ticket)
  const {id}=(await db.query(create)).rows[0]
  await assert.rejects(db.query(create),e=>e.code==='23505')
  await db.query(`select public.rassa_save_member($1,2,'نام تازه','طراح','{}','','photo.jpg','{}')`,[id])
  assert.equal((await db.query('select name from public.members')).rows[0].name,'نام تازه')
  await db.query('select public.rassa_close_desk()'); await assert.rejects(db.query('select public.rassa_delete_member($1)',[id]),denied)
  await present((await open()).ticket); await db.query('select public.rassa_delete_member($1)',[id]); assert.equal((await db.query('select * from public.members')).rows.length,0)
  await db.exec("reset role; update rassa_private.pin_gate set session_until=now()-interval '1 second'; set role anon")
  await assert.rejects(db.query(create),denied)
  console.log('PIN desk: private gate, persistent retry limit, no public DML, scoped CRUD, expiry, replacement and logout passed.')
} finally { await db.close() }
