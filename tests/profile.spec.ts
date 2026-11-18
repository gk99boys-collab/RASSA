import { expect, test, type Page } from '@playwright/test'
import { FALLBACK_MEMBERS, FALLBACK_TEAM } from '../src/data/fallbackData'
import type { Member, Team } from '../src/types'

const api = 'https://rassa-fixture.invalid'
async function fixture(page: Page, team: Team = FALLBACK_TEAM, members: Member[] = FALLBACK_MEMBERS) {
  await page.route(`${api}/rest/v1/**`, async (route) => {
    expect(route.request().method()).toBe('GET')
    const isTeam = new URL(route.request().url()).pathname.endsWith('/team')
    await route.fulfill({ json: isTeam ? [team] : members })
  })
}

// No fixtures, keys or browser binaries are shipped with the site.
test('a slow, unavailable backend keeps the printed shell, then reveals the complete local profile', async ({ page }) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => { release = resolve })
  await page.route(`${api}/rest/v1/**`, async (route) => {
    await pending
    await route.fulfill({ status: 403, json: { message: 'Fixture: unavailable' } })
  })
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('تیم نرم‌افزاری رَسا')
  await expect(page.getByRole('status', { name: 'در حال دریافت مشخصات عضو' })).toBeVisible()
  release()
  await expect(page.locator('#member-profile')).toHaveAttribute('aria-busy', 'false')
  await expect(page.locator('.tagline')).toHaveText(FALLBACK_TEAM.tagline)
  await expect(page.locator('#about')).toContainText(FALLBACK_TEAM.description)
  await expect(page.locator('#honors')).toContainText(FALLBACK_TEAM.achievement_text)
  const tabs = page.getByRole('tablist', { name: 'فهرست اعضای تیم' }).getByRole('tab')
  await expect(tabs).toHaveCount(5)
  for (const [index, member] of FALLBACK_MEMBERS.entries()) {
    await tabs.nth(index).click()
    await expect(page.locator('#member-profile')).toContainText(member.bio)
    for (const skill of member.skills) await expect(page.locator('.skills')).toContainText(skill)
  }
  await expect(page.locator('.locked-profile')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(() => Array.from(document.images).every((im) => im.complete && im.naturalWidth > 0))).toBe(true)
})

test('a renamed fifth seat, real bucket paths and edited team/member links use remote rows', async ({ page }) => {
  const team = { ...FALLBACK_TEAM, links: { website: 'https://example.org/team' } }
  const members = FALLBACK_MEMBERS.map((m) => ({ ...m }))
  members[0].photo_url = 'missing.jpg'
  members[4] = { ...members[4], name: 'عضو تازه', role: 'طراح محصول', bio: 'زندگی‌نامه تازه', skills: ['طراحی رابط'],
    photo_url: 'member-photos/fifth.png', links: { locked: true, portfolio: 'https://example.org/portfolio' } }
  await fixture(page, team, members)
  await page.route(`${api}/storage/v1/object/public/member-photos/missing.jpg`, (r) => r.fulfill({ status: 404, body: '' }))
  await page.route(`${api}/storage/v1/object/public/member-photos/fifth.png`, (r) => r.fulfill({ path: 'public/logo-rasa-mark.png', contentType: 'image/png' }))
  await page.goto('./#members')
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'وب‌سایت', exact: true })).toHaveAttribute('href', team.links.website)
  await expect(page.locator('.portrait .portrait-id')).toBeVisible()
  await page.getByRole('tab', { name: /عضو تازه/ }).click()
  const panel = page.locator('#member-profile')
  await expect(panel.getByRole('heading', { name: 'عضو تازه' })).toBeVisible()
  await expect(panel).toContainText('طراحی رابط')
  await expect(panel.getByRole('link', { name: 'نمونه‌کار' })).toHaveAttribute('href', 'https://example.org/portfolio')
  await expect(panel.getByRole('img', { name: 'عضو تازه' })).toHaveJSProperty('naturalWidth', 512)
  await expect(page.locator('.locked-profile')).toHaveCount(0)
})

test('section anchors, RTL values tabs, member keyboard navigation and counters', async ({ page }) => {
  await fixture(page)
  await page.goto('./')
  const nav = page.getByRole('navigation', { name: 'ناوبری اصلی' })
  await nav.getByRole('link', { name: 'درباره تیم' }).click()
  const firstValue = page.getByRole('tab', { name: /می‌رسیم/ })
  await firstValue.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('tab', { name: /می‌سازیم/ })).toBeFocused()
  await expect(page.locator('#value-note')).toContainText('کدنویسی')
  await nav.getByRole('link', { name: 'اعضای تیم' }).click()
  await page.getByRole('tab', { name: /مجتبی میدانی/ }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('tab', { name: /محمد صحرانورد/ })).toBeFocused()
  await page.keyboard.press('End')
  await expect(page.locator('.locked-profile')).toBeVisible()
  await page.getByRole('button', { name: 'عضو بعدی' }).click()
  await expect(page.locator('.member-identity h3')).toHaveText(FALLBACK_MEMBERS[0].name)
  await nav.getByRole('link', { name: 'افتخارات' }).click()
  await expect(page).toHaveURL(/#honors$/)
  await expect(nav.getByRole('link', { name: 'افتخارات' })).toHaveAttribute('aria-current', 'location')
  await expect(page.locator('.metric-value [aria-hidden=true]')).toHaveText(['۰۱', '۰۷', '۰۵'])
})

test('mobile navigation, scrollable roster and page width down to 320 pixels', async ({ page }) => {
  await fixture(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  const menu = page.getByRole('button', { name: 'فهرست بخش‌ها' })
  await menu.click(); await page.keyboard.press('Escape'); await expect(menu).toBeFocused()
  await menu.click(); await page.locator('#site-nav').getByRole('link', { name: 'اعضای تیم' }).click()
  await expect(page.locator('#site-nav')).toBeHidden()
  await page.getByRole('tab', { name: /مجتبی میدانی/ }).focus(); await page.keyboard.press('ArrowLeft')
  await expect(page.locator('.member-identity h3')).toHaveText(FALLBACK_MEMBERS[1].name)
  for (const width of [320, 375, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  }
})

test('the normal-motion intro is skippable and does not replay on refresh', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await fixture(page)
  await page.goto('./', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'رد کردن' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
