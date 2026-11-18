import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'

// Disposable PostgreSQL in memory, never the team's database. Minimal Auth/role fixtures.
const db = new PGlite()
const uid = randomUUID()
try {
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('test.uid',true),'')::uuid $$;
    create table public.members(id uuid primary key default gen_random_uuid(),sort_order integer not null unique,
      name text not null, role text not null, skills text[] not null, bio text not null, photo_url text, links jsonb not null);
    alter table public.members enable row level security;
    grant select on public.members to anon,authenticated;
    create policy read_only on public.members for select to anon,authenticated using(true);`)
  await db.exec(readFileSync(new URL('../supabase/migrations/20261118211030_member_desk.sql', import.meta.url), 'utf8'))

  const create = `select public.rassa_save_member(null,1,'عضو آزمون','طراح','{}','',null,'[]') as id`
  const denied = e => e.code === '42501'
  await db.exec('set role anon')
  await assert.rejects(db.query(create), denied)
  await db.exec('reset role; set role authenticated')
  assert.equal((await db.query('select public.rassa_is_member_admin() as ok')).rows[0].ok, false)
  await assert.rejects(db.query(create), denied)
  await assert.rejects(db.query('select public.rassa_delete_member($1)', [uid]), denied)
  assert.equal((await db.query(`select has_table_privilege(current_user,'public.members','UPDATE') as direct`)).rows[0].direct, false)

  await db.exec('reset role')
  await db.query('insert into auth.users values($1)', [uid])
  await db.query('insert into rassa_private.member_admins values($1)', [uid])
  await db.query("select set_config('test.uid',$1,false)", [uid])
  await db.exec('set role authenticated')
  const { id } = (await db.query(create)).rows[0]
  await assert.rejects(db.query(create), e => e.code === '23505')
  await db.query(`select public.rassa_save_member($1,2,'نام تازه','طراح','{}','','photo.jpg','{}')`, [id])
  assert.equal((await db.query('select name from public.members')).rows[0].name, 'نام تازه')
  await db.query('select public.rassa_delete_member($1)', [id])
  assert.equal((await db.query('select * from public.members')).rows.length, 0)
  await db.exec('reset role; delete from rassa_private.member_admins; set role authenticated')
  await assert.rejects(db.query(create), denied)
  console.log('Desk authorization passed: read-only public roles, approved CRUD, uniqueness and immediate revocation.')
} finally { await db.close() }
