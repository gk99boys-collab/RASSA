import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('https://rassa-fixture.invalid/**', (route) => route.fulfill({ status: 403, json: {} }))
})

test('the Pages build loads all five Kalameh faces without fetching an icon font for text', async ({ page }) => {
  const files = new Map<string, number>()
  page.on('response', (res) => {
    if (res.request().resourceType() === 'font') files.set(new URL(res.url()).pathname, res.status())
  })
  await page.goto('./#home')
  const faces = await page.evaluate(async () => {
    const weights = [400, 600, 700, 800, 900]
    return Promise.all(weights.map(async (w) => {
      const [face] = await document.fonts.load(`${w} 18px Kalameh`, 'رَسا ۰۱۲۳۴۵۶۷۸۹')
      return [face?.family, face?.weight, face?.status]
    }))
  })
  expect(faces).toEqual(['400', '600', '700', '800', '900'].map(w => ['Kalameh', w, 'loaded']))
  for (const name of ['Regular', 'SemiBold', 'Bold', 'ExtraBold', 'Black']) {
    expect(files.get(`/RASSA/fonts/KalamehWeb(FaNum)-${name}.woff2`)).toBe(200)
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-family', /^Kalameh,/)
  expect([...files.keys()].some(path => path.includes('bootstrap-icons'))).toBe(false)
  const icon = await page.evaluate(async () => (await document.fonts.load('16px "bootstrap-icons"'))[0]?.status)
  expect(icon).toBe('loaded')
})

test('Vazirmatn still renders the page if the uploaded text fonts are unavailable', async ({ page }) => {
  await page.route('**/fonts/KalamehWeb*', (route) => route.abort())
  await page.goto('./#home')
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  expect(await page.evaluate(() => Array.from(document.fonts).find(f => f.family === 'Vazirmatn')?.status)).toBe('loaded')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('تیم نرم‌افزاری رَسا')
})
