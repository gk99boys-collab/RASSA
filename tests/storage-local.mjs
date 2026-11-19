// Accept ONLY an ephemeral local `supabase status -o json` on stdin. Never run
// a migration or integration-test write against a hosted database or roster.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { setTimeout as delay } from 'node:timers/promises'
import { createClient } from '@supabase/supabase-js'

const config = JSON.parse(readFileSync(0, 'utf8'))
const api = new URL(config.API_URL), pg = new URL(config.DB_URL)
for (const url of [api,pg]) assert.ok(['localhost','127.0.0.1'].includes(url.hostname), 'Local fixture only')
assert.equal(api.port,'54321'); assert.equal(pg.port,'54322')
const sql = input => execFileSync('psql',[pg.href,'-XqAt','-v','ON_ERROR_STOP=1'],{input,encoding:'utf8'}).trim()
assert.equal(sql("select to_regclass('public.members') is null"),'t','Use a fresh, disposable database')
for (const file of ['supabase/schema.sql',...readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort().map(f=>`supabase/migrations/${f}`)]) sql(readFileSync(file))
const link=randomBytes(32).toString('hex'), pin='7406'
sql(`insert into rassa_private.pin_gate(link_hash,pin_verifier) values(sha256(convert_to('${link}','UTF8')),extensions.crypt('${link}:${pin}',extensions.gen_salt('bf',4))); notify pgrst,'reload schema'`)
const db=createClient(api.origin,config.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
let login
for (let i=0;i<8;i++) { login=await db.rpc('rassa_open_desk',{p_link:link,p_pin:pin}); if(!login.error) break; await delay(500) }
assert.equal(login.data?.state,'ok','Fixture PIN login')
const header='x-rassa-desk-session', ticket=login.data.ticket, bucket='rassa-member-media'
const files=()=>db.storage.from(bucket), desk=()=>files().setHeader(header,ticket)
const portrait=`portrait/${randomUUID().replaceAll('-','')}.png`,cover=`cover/${randomUUID().replaceAll('-','')}.png`
const bytes=readFileSync('public/favicon.png'), options={upsert:false,contentType:'image/png'}
assert.ok((await files().upload(portrait,bytes,options)).error,'No public upload')
for(const path of [portrait,cover]) assert.ifError((await desk().upload(path,bytes,options)).error)
assert.ok((await desk().upload(portrait,bytes,{...options,upsert:true})).error,'No overwrite')
const save=patch=>db.rpc('rassa_save_member_card',{p_id:null,p_sort_order:6,p_name:'آزمون',p_role:'طراح',p_bio:'',p_photo_url:null,p_links:[],p_skills:[],p_media:patch})
const patch={portrait,cover}; assert.ok((await save(patch)).error)
const saved=await save(patch).setHeader(header,ticket); assert.ifError(saved.error)
const row=await db.from('members').select('media:rassa_member_media(portrait_path,cover_path)').eq('id',saved.data).single(); assert.ifError(row.error)
assert.deepEqual(row.data.media,{portrait_path:portrait,cover_path:cover})
assert.ifError((await desk().remove([cover])).error)
for(const path of [portrait,cover]) {
  const read=await fetch(files().getPublicUrl(path).data.publicUrl); assert.equal(read.status,200)
  assert.deepEqual(Buffer.from(await read.arrayBuffer()),bytes)
}
assert.ifError((await db.rpc('rassa_delete_member',{p_id:saved.data}).setHeader(header,ticket)).error)
assert.ifError((await desk().remove([portrait,cover])).error)
assert.equal(sql(`select count(*) from storage.objects where bucket_id='${bucket}'`),'0')
assert.ifError((await db.rpc('rassa_close_desk').setHeader(header,ticket)).error)
assert.ok((await desk().upload(cover,bytes,options)).error,'Revoked ticket must not upload')
console.log('Real local Storage + PostgREST: PIN-gated uploads, two public images, immutable files, guarded cleanup and revocation passed.')
