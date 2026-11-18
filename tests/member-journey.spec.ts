import { expect, test } from '@playwright/test'
import { FALLBACK_MEMBERS, FALLBACK_TEAM } from '../src/data/fallbackData'
import { publicConfig } from './fixtures/publicConfig'

test.use({ reducedMotion: 'no-preference' })
test.beforeEach(async ({page}) => { await page.route('https://rassa-fixture.invalid/**', r => r.fulfill({status:403,json:{}})) })

for (const [width,height] of [[1280,860],[390,860],[375,667],[1366,640]]) {
  test(`native scroll pins, reads the cards in both directions and releases the page at ${width}×${height}`,async ({page}) => {
    await page.setViewportSize({width,height})
    await page.goto('./#members')
    const track=page.locator('#members'), stage=page.locator('.member-stage')
    await expect(track).toHaveAttribute('data-pinned','true')
    await page.evaluate(() => document.fonts.ready)
    const selected = track.locator('[role="tab"][aria-selected="true"]')
    const start = await track.evaluate(el => window.scrollY + el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).getPropertyValue('--member-top')))
    const step = Math.round(Math.min(420, Math.max(180, height*.45)))
    async function stop(i:number) { await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),start+i*step) }
    await stop(0); await expect(selected).toHaveId('seat-1')
    const pinnedTop = (await stage.boundingBox())!.y
    for(const i of [1,2,3,4,3,2]) {
      await stop(i); await expect(selected).toHaveId(`seat-${i+1}`)
      expect(Math.abs((await stage.boundingBox())!.y-pinnedTop)).toBeLessThan(2)
    }
    await track.getByRole('button',{name:'عضو بعدی'}).click(); await expect(selected).toHaveId('seat-4')
    await stop(4); await expect(selected).toHaveId('seat-5')
    const card = (await page.locator('#member-profile').boundingBox())!
    expect(card.y).toBeGreaterThanOrEqual((await page.locator('.masthead').boundingBox())!.height)
    expect(card.y + card.height).toBeLessThanOrEqual(height)
    // There must be no second, empty runway after the final stop.
    await page.evaluate(() => window.scrollBy({top:40,behavior:'instant'}))
    await expect.poll(async () => (await stage.boundingBox())!.y).toBeLessThan(pinnedTop - 30)
    await page.mouse.wheel(0,1200)
    await expect(page.locator('#honors')).toBeInViewport()
    await expect(selected).toHaveId('seat-5')
  })
}

test('quiet and short viewports leave a normal, manually navigable member section',async ({page}) => {
  await page.setViewportSize({width:800,height:340}); await page.goto('./#members')
  await expect(page.locator('.member-stage')).toHaveCSS('position','static')
  await page.emulateMedia({reducedMotion:'reduce'}); await page.setViewportSize({width:1200,height:900})
  await expect(page.locator('.member-stage')).toHaveCSS('position','static')
  await page.getByRole('button',{name:'عضو بعدی'}).click(); await expect(page.locator('#seat-2')).toHaveAttribute('aria-selected','true')
  await page.getByRole('link',{name:'عبور از اعضا'}).click(); await expect(page).toHaveURL(/#honors$/)
})

test('a long edited biography remains readable and the next manual selection resumes at the chosen stop', async ({page}) => {
  const api = 'https://rassa-fixture.invalid'
  await page.route(`${api}/functions/v1/rassa-public-config`, r => r.fulfill({json:publicConfig}))
  await page.route(`${api}/rest/v1/team?**`, r => r.fulfill({json:[FALLBACK_TEAM]}))
  const members = FALLBACK_MEMBERS.map((m,i) => i === 1 ? {...m,bio:'نمونهٔ زندگی‌نامهٔ بلند. '.repeat(200)} : m)
  await page.route(`${api}/rest/v1/members?**`, r => r.fulfill({json:members}))
  await page.setViewportSize({width:375,height:667}); await page.goto('./#members')
  const section = page.locator('#members'), next = section.getByRole('button',{name:'عضو بعدی'})
  await expect(page.locator('#member-profile')).toHaveAttribute('aria-busy','false')
  await expect(section).toHaveAttribute('data-pinned','true'); await next.click()
  await expect(page.locator('#seat-2')).toHaveAttribute('aria-selected','true')
  await expect(page.locator('.member-stage')).toHaveCSS('position','static')
  await expect(section.locator('.bio').last()).toContainText('زندگی‌نامهٔ بلند')
  await next.click(); await expect(section).toHaveAttribute('data-pinned','true')
  await expect(page.locator('#seat-3')).toHaveAttribute('aria-selected','true')
  expect((await page.locator('#member-profile').boundingBox())!.y).toBeGreaterThan(0)
})
