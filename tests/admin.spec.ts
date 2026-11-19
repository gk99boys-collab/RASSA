import { randomBytes, randomUUID } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'
import { FALLBACK_TEAM } from '../src/data/fallbackData'
import type { Member } from '../src/types'
import { publicConfig } from './fixtures/publicConfig'

const api = 'https://rassa-fixture.invalid'
const fixturePin = '7406'
const bucket = '/storage/v1/object/rassa-member-media'
const publicMedia = `${api}/storage/v1/object/public/rassa-member-media/`
async function backend(page: Page) {
  const link = randomBytes(32).toString('hex')
  let ticket: string | null = null, tries = 0, closes = 0
  const rows: Member[] = [], writes: string[] = []
  const objects = new Map<string, {body:Buffer; contentType:string}>(), uploads: string[] = []
  let failCover = false
  await page.route(`${api}/**`, route => {
    const request = route.request(), url = new URL(request.url()), path = url.pathname
    expect(url.href).not.toContain(link); expect(url.searchParams.has('p_pin')).toBe(false)
    if (path.endsWith('/rassa-public-config')) return route.fulfill({ json: publicConfig })
    if (path.endsWith('/rassa_open_desk')) {
      const p = request.postDataJSON(); expect(request.method()).toBe('POST')
      if (p.p_link !== link || p.p_pin !== fixturePin) { tries++; return route.fulfill({json:tries >= 5 ? {state:'wait',seconds:1800} : {state:'denied'}}) }
      ticket = randomBytes(32).toString('hex')
      return route.fulfill({ json: {state:'ok',ticket,expires_in:1800} })
    }
    if (url.href.startsWith(publicMedia)) {
      expect(request.headers()['x-rassa-desk-session']).toBeUndefined()
      const image = objects.get(url.href.slice(publicMedia.length))
      return image ? route.fulfill(image) : route.fulfill({status:404})
    }
    const authorized = !!ticket && request.headers()['x-rassa-desk-session'] === ticket
    if (path === bucket || path.startsWith(bucket+'/')) {
      if (!authorized) return route.fulfill({status:403,json:{message:'Access denied',statusCode:'403'}})
      if (request.method() === 'DELETE') {
        for (const key of request.postDataJSON().prefixes) {
          if (!rows.some(row => row.media?.portrait_path === key || row.media?.cover_path === key)) objects.delete(key)
        }
        return route.fulfill({json:[]})
      }
      expect(request.method()).toBe('POST')
      const key = path.slice(bucket.length+1), mime = request.headers()['content-type']
      expect(key).toMatch(/^(portrait|cover)\/[a-f0-9]{32}\.webp$/); expect(request.headers()['x-upsert']).toBe('false')
      const bytes = request.postDataBuffer()!; expect(mime).toBe('image/webp'); expect(bytes.toString('ascii',8,12)).toBe('WEBP')
      uploads.push(key); expect(objects.has(key)).toBe(false)
      if (failCover && key.startsWith('cover/')) { failCover=false; return route.fulfill({status:503,json:{message:'Fixture unavailable'}}) }
      objects.set(key,{body:bytes,contentType:mime}); return route.fulfill({json:{Key:`rassa-member-media/${key}`,Id:randomUUID()}})
    }
    if (path.endsWith('/rassa_is_member_admin')) return route.fulfill({json:authorized})
    if (path.endsWith('/members')) {
      expect(url.searchParams.get('select')).toContain('media:rassa_member_media(portrait_path,cover_path)')
      return route.fulfill({json:rows})
    }
    if (path.endsWith('/team')) return route.fulfill({json:[FALLBACK_TEAM]})
    if (path.includes('/rpc/')) {
      if (!ticket || request.headers()['x-rassa-desk-session'] !== ticket) return route.fulfill({status:403,json:{code:'42501',message:'Session expired'}})
      if (path.endsWith('/rassa_close_desk')) { ticket=null; closes++; return route.fulfill({status:204}) }
      const p=request.postDataJSON(), id=p.p_id ?? randomUUID()
      if (path.endsWith('/rassa_save_member_card')) {
        const media = {...rows.find(r=>r.id===id)?.media}
        for (const [slot,key] of Object.entries(p.p_media) as ['portrait'|'cover',string|null][]) {
          if (key) expect(objects.has(key)).toBe(true)
          media[`${slot}_path`]=key
        }
        const row = { id, sort_order:p.p_sort_order, name:p.p_name, role:p.p_role, skills:p.p_skills, bio:p.p_bio, photo_url:p.p_photo_url, links:p.p_links, media:{portrait_path:media.portrait_path ?? null,cover_path:media.cover_path ?? null} }
        if (p.p_id) Object.assign(rows.find(r=>r.id===id)!,row); else rows.push(row)
        writes.push(p.p_id ? 'edit' : 'add')
      } else if (path.endsWith('/rassa_delete_member')) { rows.splice(rows.findIndex(r=>r.id===id),1); writes.push('delete') }
      else throw new Error(`Unexpected procedure: ${path}`)
      return route.fulfill({json:id})
    }
    return route.abort()
  })
  return { link,rows,writes,objects,uploads,failCoverOnce(){failCover=true},revoke() { ticket=null },closed:()=>closes }
}
async function enter(page: Page, pin: string) {
  await page.getByLabel('رمز مدیریت').fill(pin)
  await page.getByRole('button',{name:'ورود به پنل'}).click()
}

test('a private link still needs the PIN; the bare desk, incorrect PIN and cooldown expose no editor', async ({page}) => {
  const f = await backend(page)
  await page.goto('./#home'); await expect(page.locator('a[href*="admin/"]')).toHaveCount(0)
  await page.goto('./admin/'); await enter(page,fixturePin); await expect(page.getByRole('alert')).toContainText('لینک خصوصی کامل')
  await page.goto(`./admin/#k=${f.link}`)
  await expect(page.locator('input')).toHaveCount(1)
  await expect(page.locator('audio, input[type=email]')).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/)
  for (let i=0;i<5;i++) { await enter(page,'0000'); await expect(page.getByRole('alert')).toContainText(i===4?'موقتاً بسته':'درست نیست') }
  await expect(page.getByRole('form',{name:'فرم عضو'})).toHaveCount(0); expect(f.writes).toEqual([])
})

test('one PIN with Persian digits opens the desk; authorized edits, confirmed deletion and public empty roster persist', async ({page}) => {
  await page.setViewportSize({width:390,height:844})
  const {link,rows,writes}=await backend(page)
  await page.goto(`./admin/#k=${link}`); await enter(page,'۷۴۰۶')
  await expect(page.getByRole('heading',{name:'دفتر اعضای رَسا'})).toBeVisible()
  await page.getByRole('button',{name:'عضو جدید'}).click()
  await page.getByLabel('نام و نام خانوادگی').fill('عضو آزمایشی'); await page.getByLabel('نقش در تیم').fill('طراح موبایل')
  await page.getByLabel('شمارهٔ نمایش').fill('7'); await page.locator('.desk-media summary').click()
  await page.getByLabel('نشانی عکس عضو').fill('avatar.webp')
  await page.getByLabel('زندگی‌نامه').fill('شرح عضو'); await page.getByLabel('مهارت‌ها').fill('طراحی، موبایل')
  await page.getByRole('button',{name:'افزودن پیوند'}).click(); await page.getByLabel('عنوان پیوند ۱').fill('وب‌سایت')
  await page.getByLabel('نشانی پیوند ۱').fill('https://example.org/work')
  await page.getByRole('button',{name:'ثبت عضو',exact:true}).click()
  await expect(page.getByRole('heading',{name:'ویرایش عضو آزمایشی'})).toBeVisible()
  expect(rows[0]).toMatchObject({sort_order:7,name:'عضو آزمایشی',role:'طراح موبایل',bio:'شرح عضو',photo_url:'avatar.webp',skills:['طراحی','موبایل'],links:[{label:'وب‌سایت',url:'https://example.org/work'}]})
  await page.getByLabel('نام و نام خانوادگی').fill('نام ویرایش‌شده'); await page.getByRole('button',{name:'ذخیرهٔ تغییرات'}).click()
  await expect(page.getByRole('heading',{name:'ویرایش نام ویرایش‌شده'})).toBeVisible()
  await page.getByRole('link',{name:'بازگشت به سایت'}).click()
  await expect(page.locator('#member-profile')).toContainText('نام ویرایش‌شده')
  await page.goto(`./admin/#k=${link}`); await enter(page,fixturePin)
  await page.getByRole('button',{name:'حذف عضو',exact:true}).click(); await expect(page.getByRole('dialog')).toContainText('نام ویرایش‌شده')
  await page.getByRole('button',{name:'انصراف'}).click(); expect(writes).toEqual(['add','edit'])
  await page.getByRole('button',{name:'حذف عضو',exact:true}).click(); await page.getByRole('button',{name:'تأیید حذف'}).click()
  await expect(page.getByText('عضو از سایت حذف شد.')).toBeVisible(); expect(writes).toEqual(['add','edit','delete'])
  await page.getByRole('link',{name:'بازگشت به سایت'}).click(); await expect(page.locator('#members')).toContainText('هنوز عضوی معرفی نشده است.')
})

test('revoked or closed sessions return to the PIN form; reload does not remember a login', async ({page}) => {
  const f=await backend(page); await page.goto(`./admin/#k=${f.link}`); await enter(page,fixturePin)
  await page.getByLabel('نام و نام خانوادگی').fill('عضو آزمایشی'); await page.getByLabel('نقش در تیم').fill('طراح')
  f.revoke(); await page.getByRole('button',{name:'ثبت عضو',exact:true}).click()
  await expect(page.getByRole('status')).toContainText('نشست مدیریت پایان یافت'); expect(f.writes).toEqual([])
  await enter(page,fixturePin); await page.getByRole('button',{name:'خروج'}).click(); await expect.poll(f.closed).toBe(1)
  await enter(page,fixturePin); await expect(page.getByRole('heading',{name:'دفتر اعضای رَسا'})).toBeVisible()
  await page.reload(); await expect(page.getByLabel('رمز مدیریت')).toBeVisible()
  expect(await page.evaluate(()=>Object.keys(localStorage).concat(Object.keys(sessionStorage)).some(k=>/pin|ticket|auth-token/.test(k)))).toBe(false)
})

test('timer expiry relocks the desk and a failed network logout never claims server confirmation', async ({page}) => {
  const f=await backend(page); await page.clock.install(); await page.goto(`./admin/#k=${f.link}`)
  await enter(page,fixturePin); await expect(page.getByRole('heading',{name:'دفتر اعضای رَسا'})).toBeVisible()
  await page.clock.fastForward(30 * 60 * 1000 + 1000)
  await expect(page.getByRole('status')).toContainText('نشست مدیریت پایان یافت')
  await page.route(`${api}/rest/v1/rpc/rassa_close_desk`, r => r.fulfill({status:503,json:{message:'Offline'}}))
  await enter(page,fixturePin); await page.getByRole('button',{name:'خروج'}).click()
  await expect(page.getByRole('status')).toContainText('سرور پاسخ نداد')
  await expect(page.getByLabel('رمز مدیریت')).toBeVisible(); expect(f.closed()).toBe(0)
})


const logo = 'public/logo-rasa-mark.png', jacket = 'public/member-covers/mobile-756.webp'
async function prepareCard(page: Page) {
  const f=await backend(page); await page.goto(`./admin/#k=${f.link}`); await enter(page,fixturePin)
  await page.getByLabel('نام و نام خانوادگی').fill('عضو نمونه'); await page.getByLabel('نقش در تیم').fill('طراح موبایل')
  const portrait = page.getByLabel('انتخاب فایل لوگو یا عکس عضو'), cover = page.getByLabel('انتخاب فایل کاور کارت عضو')
  const proof = (slot:'portrait'|'cover') => page.locator(`.image-picker[data-slot="${slot}"] .image-proof img`)
  return { ...f, portrait,cover,proof,save:page.getByRole('button',{name:'ثبت عضو',exact:true}),edit:page.getByRole('button',{name:'ذخیرهٔ تغییرات'}),
    async pickBoth() {
      await portrait.setInputFiles(logo); await cover.setInputFiles(jacket)
      await expect(proof('portrait')).toHaveAttribute('src',/^blob:/); await expect(proof('cover')).toHaveAttribute('src',/^blob:/)
    },
  }
}

test('mobile: preview both files locally, save once, preserve them on a text edit and display both in the public roster',async({page})=>{
  await page.setViewportSize({width:375,height:667})
  const f=await prepareCard(page); await f.pickBoth(); expect(f.uploads).toEqual([]); expect(f.rows).toEqual([])
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await f.save.click(); await expect(page.getByRole('heading',{name:'ویرایش عضو نمونه'})).toBeVisible()
  const [avatar,cover]=f.uploads; expect(f.rows[0].media).toEqual({portrait_path:avatar,cover_path:cover})
  await expect(f.proof('portrait')).toHaveAttribute('src',publicMedia+avatar); await expect(f.proof('cover')).toHaveAttribute('src',publicMedia+cover)
  await page.getByLabel('زندگی‌نامه').fill('توضیح تازه'); await f.edit.click(); await expect.poll(()=>f.rows[0].bio).toBe('توضیح تازه')
  await page.getByRole('link',{name:'بازگشت به سایت'}).click()
  for (const selector of ['.portrait-mini img','#member-profile .portrait img']) await expect(page.locator(selector)).toHaveJSProperty('currentSrc',publicMedia+avatar)
  for (const selector of ['.proof-thumb img','.studio-illustration']) await expect(page.locator(selector)).toHaveJSProperty('currentSrc',publicMedia+cover)
  await expect(page.locator('.studio-illustration')).toHaveJSProperty('naturalWidth',756)
  expect(f.uploads).toHaveLength(2); expect(f.objects.size).toBe(2); expect(f.writes).toEqual(['add','edit'])
})

test('a second-file failure leaves the member unchanged and the form retryable; a later cover replacement and removal leave the portrait alone',async({page})=>{
  const f=await prepareCard(page); await f.pickBoth(); f.failCoverOnce(); await f.save.click()
  await expect(page.getByRole('alert')).toContainText('آپلود کاور کارت عضو کامل نشد'); expect(f.rows).toEqual([])
  await expect.poll(()=>f.objects.size).toBe(0); await expect(f.proof('portrait')).toHaveAttribute('src',/^blob:/)
  await f.save.click(); await expect(f.edit).toBeEnabled(); const {portrait_path:avatar,cover_path:first} = f.rows[0].media!
  await f.cover.setInputFiles('public/member-covers/data-756.webp'); await expect(f.proof('cover')).toHaveAttribute('src',/^blob:/)
  await f.edit.click(); await expect.poll(()=>f.rows[0].media?.cover_path).not.toBe(first)
  const second = f.rows[0].media!.cover_path!; await expect(f.proof('cover')).toHaveAttribute('src',publicMedia+second)
  const panel=page.locator('[data-slot="cover"]'); await panel.getByRole('button',{name:'بازگشت به پیش‌فرض'}).click()
  await expect(f.proof('cover')).toHaveAttribute('src','../member-covers/mobile-756.webp')
  await panel.getByRole('button',{name:'لغو تغییر'}).click(); await expect(f.proof('cover')).toHaveAttribute('src',publicMedia+second)
  await panel.getByRole('button',{name:'بازگشت به پیش‌فرض'}).click(); await f.edit.click()
  await expect.poll(()=>f.rows[0].media).toEqual({cover_path:null,portrait_path:avatar}); await expect.poll(()=>Array.from(f.objects.keys())).toEqual([avatar])
  expect(f.uploads).toHaveLength(5)
  await page.getByRole('link',{name:'بازگشت به سایت'}).click(); await expect(page.locator('.studio-illustration')).toHaveAttribute('src',/mobile-756.webp$/)
  await expect(page.locator('#member-profile .portrait img')).toHaveJSProperty('currentSrc',publicMedia+avatar)
})

test('wrong format, oversized and undecodable files never upload; discarding a preview or losing authorization cannot publish it',async({page})=>{
  const f=await prepareCard(page)
  const alert=page.locator('[data-slot="portrait"]').getByRole('alert')
  for(const [file,reason] of [
    [{name:'not.png',mimeType:'image/png',buffer:Buffer.from('not an image')},'تصویر واقعی'],
    [{name:'large.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(5*1024*1024+1)},'۵ مگابایت'],
    [{name:'broken.jpg',mimeType:'image/jpeg',buffer:Buffer.from([255,216,255,0])},'باز نشد'],
  ] as const) { await f.portrait.setInputFiles(file); await expect(alert).toContainText(reason) }
  await f.portrait.setInputFiles(logo); await expect(f.proof('portrait')).toHaveAttribute('src',/^blob:/)
  await page.getByRole('button',{name:'عضو جدید'}).click(); await page.getByRole('button',{name:'ادامه بدون ذخیره'}).click()
  await expect(f.proof('portrait')).toHaveCount(0); expect(f.uploads).toEqual([])
  await page.getByLabel('نام و نام خانوادگی').fill('عضو نمونه'); await page.getByLabel('نقش در تیم').fill('طراح')
  await f.portrait.setInputFiles(logo); await expect(f.proof('portrait')).toHaveAttribute('src',/^blob:/)
  f.revoke(); await f.save.click(); await expect(page.getByRole('status')).toContainText('نشست مدیریت پایان یافت')
  expect(f.objects.size).toBe(0); expect(f.rows).toEqual([])
})
