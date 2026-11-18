import { expect, test } from '@playwright/test'

test.use({ reducedMotion: 'no-preference' })
test.beforeEach(async ({page}) => { await page.route('https://rassa-fixture.invalid/**', r => r.fulfill({status:403,json:{}})) })

for (const width of [1280,390]) {
  test(`native scroll pins, reads the cards in both directions and releases the page at ${width}px`,async ({page}) => {
    await page.setViewportSize({width,height:860})
    await page.goto('./#members')
    const track=page.locator('#members'), stage=page.locator('.member-stage')
    await expect(track).toHaveAttribute('data-pinned','true')
    await page.evaluate(() => document.fonts.ready)
    const selected = track.locator('[role="tab"][aria-selected="true"]')
    const start = await track.evaluate(el => window.scrollY + el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).getPropertyValue('--member-top')))
    const step = Math.round(860*.45)
    async function stop(i:number) { await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),start+i*step) }
    await stop(0); await expect(selected).toHaveId('seat-1')
    const pinnedTop = (await stage.boundingBox())!.y
    for(const i of [1,2,3,4,3,2]) {
      await stop(i); await expect(selected).toHaveId(`seat-${i+1}`)
      expect(Math.abs((await stage.boundingBox())!.y-pinnedTop)).toBeLessThan(2)
    }
    await track.getByRole('button',{name:'عضو بعدی'}).click(); await expect(selected).toHaveId('seat-4')
    await stop(4); await page.mouse.wheel(0,1200)
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
