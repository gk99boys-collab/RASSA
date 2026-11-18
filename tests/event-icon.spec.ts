import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

test('the site and the unlisted desk resolve the same event tab and touch icons under the Pages path', async ({ page }) => {
  await page.route('https://rassa-fixture.invalid/**', route => route.abort())
  for (const path of ['./#home', './admin/']) {
    await page.goto(path)
    for (const [selector, filename] of [
      ['link[rel=icon][type="image/x-icon"]', 'favicon.ico'],
      ['link[rel=icon][type="image/png"]', 'favicon.png'],
      ['link[rel=apple-touch-icon]', 'event-touch.png'],
    ]) {
      const url = await page.locator(selector).evaluate(el => (el as HTMLLinkElement).href)
      expect(new URL(url).pathname).toBe(`/RASSA/${filename}`)
      const res = await page.request.get(url)
      expect(res.ok()).toBe(true)
      expect(await res.body()).toEqual(readFileSync(`public/${filename}`))
    }
  }
})
