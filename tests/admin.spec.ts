import { randomUUID } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'
import { FALLBACK_TEAM } from '../src/data/fallbackData'
import type { Member } from '../src/types'

const api = 'https://rassa-fixture.invalid'
async function backend(page: Page, granted: boolean) {
  const user = { id: randomUUID(), aud: 'authenticated', email: 'editor@example.test', app_metadata: {}, user_metadata: {} }
  const rows: Member[] = [], writes: string[] = []
  await page.route(`${api}/**`, route => {
    const url = new URL(route.request().url()), path = url.pathname
    if (path.endsWith('/token')) return route.fulfill({ json: { access_token: 'offline-test-session', refresh_token: 'offline-refresh', expires_in: 3600, token_type: 'bearer', user } })
    if (path.endsWith('/logout')) return route.fulfill({ status: 204 })
    if (path.endsWith('/rassa_is_member_admin')) return route.fulfill({ json: granted })
    if (path.endsWith('/members')) return route.fulfill({ json: rows })
    if (path.endsWith('/team')) return route.fulfill({ json: [FALLBACK_TEAM] })
    if (path.includes('/rpc/')) {
      if (!granted) return route.fulfill({ status: 403, json: { code: '42501', message: 'Desk access revoked' } })
      expect(route.request().headers().authorization).toBe('Bearer offline-test-session')
      const p = route.request().postDataJSON(), id = p.p_id ?? randomUUID()
      if (path.endsWith('/rassa_save_member')) {
        const row = { id, sort_order:p.p_sort_order, name:p.p_name, role:p.p_role, skills:p.p_skills, bio:p.p_bio, photo_url:p.p_photo_url, links:p.p_links }
        if (p.p_id) Object.assign(rows.find(r => r.id === id)!,row); else rows.push(row)
        writes.push(p.p_id ? 'edit' : 'add')
      } else if (path.endsWith('/rassa_delete_member')) { rows.splice(rows.findIndex(r => r.id === id), 1); writes.push('delete') }
      else throw new Error(`Unexpected procedure: ${path}`)
      return route.fulfill({ json: id })
    }
    return route.abort()
  })
  return { rows, writes, revoke() { granted = false } }
}
async function signIn(page: Page) {
  await page.goto('./admin/')
  await page.getByLabel('ایمیل مدیر').fill('editor@example.test')
  await page.getByLabel('رمز عبور').fill('local-form-fixture')
  await page.getByRole('button', {name:'ورود به پنل'}).click()
}

test('the unlinked static desk denies a signed-in non-manager and has no music or public signup', async ({page}) => {
  const { writes } = await backend(page,false)
  await page.goto('./#home')
  await expect(page.locator('a[href*="admin/"]')).toHaveCount(0)
  await signIn(page)
  await expect(page.getByRole('heading',{name:'این حساب مجوز مدیریت ندارد'})).toBeVisible()
  await expect(page.locator('audio, form, [name="rassa-soundtrack"]')).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/)
  await page.reload()
  await expect(page.getByLabel('رمز عبور')).toBeVisible()
  expect(writes).toEqual([])
})

test('an authorized desk can publish every editable field, edit, cancel deletion, and remove the last card', async ({page}) => {
  await page.setViewportSize({width:390,height:844})
  const { rows,writes } = await backend(page,true)
  await signIn(page)
  await expect(page.getByRole('heading',{name:'دفتر اعضای رَسا'})).toBeVisible()
  await page.getByRole('button',{name:'عضو جدید'}).click()
  await page.getByLabel('نام و نام خانوادگی').fill('عضو آزمایشی')
  await page.getByLabel('نقش در تیم').fill('طراح موبایل')
  await page.getByLabel('شمارهٔ نمایش').fill('7')
  await page.getByLabel('عکس عضو').fill('avatar.webp')
  await page.getByLabel('زندگی‌نامه').fill('شرح عضو')
  await page.getByLabel('مهارت‌ها').fill('طراحی، موبایل')
  await page.getByRole('button',{name:'افزودن پیوند'}).click()
  await page.getByLabel('عنوان پیوند ۱').fill('وب‌سایت')
  await page.getByLabel('نشانی پیوند ۱').fill('https://example.org/work')
  await page.getByRole('button',{name:'ثبت عضو',exact:true}).click()
  await expect(page.getByRole('heading',{name:'ویرایش عضو آزمایشی'})).toBeVisible()
  expect(rows[0]).toMatchObject({sort_order:7,name:'عضو آزمایشی',role:'طراح موبایل',bio:'شرح عضو',photo_url:'avatar.webp',skills:['طراحی','موبایل'],links:[{label:'وب‌سایت',url:'https://example.org/work'}]})
  await page.getByLabel('نام و نام خانوادگی').fill('نام ویرایش‌شده')
  await page.getByRole('button',{name:'ذخیرهٔ تغییرات'}).click()
  await expect(page.getByRole('heading',{name:'ویرایش نام ویرایش‌شده'})).toBeVisible()
  await page.getByRole('button',{name:'حذف عضو',exact:true}).click()
  await expect(page.getByRole('dialog')).toContainText('نام ویرایش‌شده')
  await page.getByRole('button',{name:'انصراف'}).click()
  expect(writes).toEqual(['add','edit'])
  await page.getByRole('button',{name:'حذف عضو',exact:true}).click()
  await page.getByRole('button',{name:'تأیید حذف'}).click()
  await expect(page.getByText('عضو از سایت حذف شد.')).toBeVisible()
  expect(writes).toEqual(['add','edit','delete'])
  await page.getByRole('link',{name:'بازگشت به سایت'}).click()
  await expect(page.locator('#members')).toContainText('هنوز عضوی معرفی نشده است.')
  await expect(page.locator('.member-tab')).toHaveCount(0)
})


test('revocation during an open edit fails closed without a success message', async ({page}) => {
  const fixture = await backend(page,true)
  await signIn(page)
  await page.getByLabel('نام و نام خانوادگی').fill('عضو آزمایشی')
  await page.getByLabel('نقش در تیم').fill('طراح')
  fixture.revoke()
  await page.getByRole('button',{name:'ثبت عضو',exact:true}).click()
  await expect(page.getByRole('heading',{name:'این حساب مجوز مدیریت ندارد'})).toBeVisible()
  await expect(page.getByRole('form',{name:'فرم عضو'})).toHaveCount(0)
  expect(fixture.writes).toEqual([])
})
