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
    create schema storage; grant usage on schema storage to anon,authenticated;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(bucket_id text references storage.buckets, name text,metadata jsonb,primary key(bucket_id,name));
    alter table storage.objects enable row level security; grant select,insert,update,delete on storage.objects to anon,authenticated;
    create function storage.allow_only_operation(op text) returns boolean language sql stable as $$
      select current_setting('storage.operation',true) = 'storage.' || op $$;
    insert into storage.buckets(id,name,public) values ('member-photos','member-photos',true);
    create policy read_legacy on storage.objects for select using (bucket_id='member-photos');
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
  await checkMedia()
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

// Exercise the actual RLS + atomic RPC with Storage's request context. Only the
// Storage HTTP layer is simulated here; every grant/policy runs in PostgreSQL.
async function checkMedia() {
  const bucket='rassa-member-media', photo=`portrait/${'1'.repeat(32)}.webp`, cover=`cover/${'2'.repeat(32)}.png`
  const insert = (path, b=bucket) => db.query(`insert into storage.objects values ($1,$2,'{"mimetype":"image/webp"}')`,[b,path])
  const op = name => db.query("select set_config('storage.operation',$1,false)", ['storage.' + name])
  const save = (id,patch,name='تصاویر آزمون') => db.query(`select public.rassa_save_member_card($1,6,$2,'طراح','{}','','legacy.jpg','[]',$3::jsonb) as id`, [id,name,JSON.stringify(patch)])
  const del = path => db.query('delete from storage.objects where bucket_id=$1 and name=$2 returning name',[bucket,path])
  const token = (await db.query("select current_setting('request.headers')::jsonb->>'x-rassa-desk-session' as t")).rows[0].t
  const denied = e => e.code === '42501'
  await present(null); await op('object.upload'); await assert.rejects(insert(photo),denied); await assert.rejects(save(null,{}),denied)
  await present(token); await assert.rejects(insert(photo,'member-photos'),denied); await assert.rejects(insert('portrait/not-an-image.svg'),denied)
  await op('object.sign_upload_url'); await assert.rejects(insert(photo),denied)
  await op('object.upload'); await insert(photo); await insert(cover)
  assert.equal((await db.query(`update storage.objects set metadata='{}' where name=$1 returning name`,[photo])).rows.length,0)
  const {id}=(await save(null,{portrait:photo,cover})).rows[0]
  const media=async()=>(await db.query('select portrait_path,cover_path from public.rassa_member_media where member_id=$1',[id])).rows[0]
  assert.deepEqual(await media(),{portrait_path:photo,cover_path:cover}); await save(id,{})
  assert.deepEqual(await media(),{portrait_path:photo,cover_path:cover})
  await assert.rejects(db.query('update public.rassa_member_media set cover_path=null'),denied)
  await op('object.delete_many'); assert.equal((await del(photo)).rows.length,0)
  for(const bad of [{cover:photo},{cover:`cover/${'9'.repeat(32)}.png`},{other:photo},{cover:3}]) {
    await assert.rejects(save(id,bad,'نباید ذخیره شود'), e=>e.code==='22023')
  }
  assert.equal((await db.query('select name from public.members where id=$1',[id])).rows[0].name,'تصاویر آزمون')
  await save(id,{portrait:null}); assert.deepEqual(await media(),{portrait_path:null,cover_path:cover}); assert.equal((await del(photo)).rows.length,1)
  await present(null); assert.deepEqual(await media(),{portrait_path:null,cover_path:cover}); assert.equal((await db.query('select * from storage.objects')).rows.length,0)
  await assert.rejects(save(id,{cover:null}),denied); assert.equal((await del(cover)).rows.length,0)
  await present(token); await db.query('select public.rassa_delete_member($1)',[id]); assert.equal(await media(),undefined); assert.equal((await del(cover)).rows.length,1)
  console.log('Member media passed: scoped insert, immutable files, atomic patch, public references, protected cleanup and cascade.')
}
