import { randomBytes, randomUUID } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'
import { FALLBACK_TEAM } from '../src/data/fallbackData'
import type { Member } from '../src/types'
import { publicConfig } from './fixtures/publicConfig'

const api = 'https://rassa-fixture.invalid'
const fixturePin = '7406'
async function backend(page: Page) {
  const link = randomBytes(32).toString('hex')
  let ticket: string | null = null, tries = 0, closes = 0
  const rows: Member[] = [], writes: string[] = []
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
    if (path.endsWith('/members')) return route.fulfill({json:rows})
    if (path.endsWith('/team')) return route.fulfill({json:[FALLBACK_TEAM]})
    if (path.includes('/rpc/')) {
      if (!ticket || request.headers()['x-rassa-desk-session'] !== ticket) return route.fulfill({status:403,json:{code:'42501',message:'Session expired'}})
      if (path.endsWith('/rassa_close_desk')) { ticket=null; closes++; return route.fulfill({status:204}) }
      const p=request.postDataJSON(), id=p.p_id ?? randomUUID()
      if (path.endsWith('/rassa_save_member')) {
        const row = { id, sort_order:p.p_sort_order, name:p.p_name, role:p.p_role, skills:p.p_skills, bio:p.p_bio, photo_url:p.p_photo_url, links:p.p_links }
        if (p.p_id) Object.assign(rows.find(r=>r.id===id)!,row); else rows.push(row)
        writes.push(p.p_id ? 'edit' : 'add')
      } else if (path.endsWith('/rassa_delete_member')) { rows.splice(rows.findIndex(r=>r.id===id),1); writes.push('delete') }
      else throw new Error(`Unexpected procedure: ${path}`)
      return route.fulfill({json:id})
    }
    return route.abort()
  })
  return { link,rows,writes,revoke() { ticket=null },closed:()=>closes }
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
  await page.getByLabel('شمارهٔ نمایش').fill('7'); await page.getByLabel('عکس عضو').fill('avatar.webp')
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
