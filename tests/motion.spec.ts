import { expect, test, type Page } from '@playwright/test'

test.use({ reducedMotion: 'no-preference' })
test.beforeEach(async ({ page }) => {
  // These scenarios need only the local team; keep the production bundle off the network.
  await page.route('https://rassa-fixture.invalid/**', (r) => r.fulfill({ status: 403, json: { message: 'Offline fixture' } }))
})

async function paints(page: Page, count: number) {
  await page.evaluate((n) => new Promise<void>((done) => {
    let frames = 0
    const tick = () => { if (++frames >= n) done(); else requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  }), count)
}

async function expectHeldFrame(page: Page) {
  const sample = () => page.locator('.cursor-print, .reel-rail > i').evaluateAll((els) => els.map((el) => getComputedStyle(el).transform))
  // Let the last scheduled motion-value write reach the compositor before sampling.
  await paints(page, 3)
  const held = await sample()
  await paints(page, 8)
  expect(await sample()).toEqual(held)
}

test('the print reel advances, pauses in place, seeks and loops', async ({ page }) => {
  await page.goto('./#home')
  const reel = page.getByRole('figure', { name: 'موشن‌پوستر رَسا در رویداد هشتم' })
  const build = reel.getByRole('button', { name: 'قاب ۰۲: می‌سازیم' })
  await expect(reel).toHaveAttribute('data-running', 'true')
  await expect(build).toHaveAttribute('aria-pressed', 'true', { timeout: 7500 })
  await reel.getByRole('button', { name: 'مکث پوستر' }).click()
  await expect(reel).toHaveAttribute('data-running', 'false')
  await expectHeldFrame(page)
  const shine = reel.getByRole('button', { name: 'قاب ۰۳: می‌درخشیم' })
  await shine.focus(); await page.keyboard.press('Enter')
  await expect(shine).toHaveAttribute('aria-pressed', 'true')
  await expect(reel.locator('.reel-label')).toContainText('می‌درخشیم')
  await reel.getByRole('button', { name: 'پخش پوستر' }).click()
  await expect(reel.getByRole('button', { name: 'قاب ۰۱: می‌رسیم' })).toHaveAttribute('aria-pressed', 'true', { timeout: 5500 })
})

test('offscreen and hidden documents suspend the same clock and resume it on return', async ({ page }) => {
  await page.goto('./#home')
  const reel = page.locator('.reel')
  await expect(reel).toHaveAttribute('data-running', 'true')
  await page.locator('#honors').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }))
  await expect(reel).toHaveAttribute('data-running', 'false')
  await expectHeldFrame(page)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(reel).toHaveAttribute('data-running', 'true')
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(reel).toHaveAttribute('data-running', 'false')
  await expectHeldFrame(page)
  await page.evaluate(() => { Reflect.deleteProperty(document, 'hidden'); document.dispatchEvent(new Event('visibilitychange')) })
  await expect(reel).toHaveAttribute('data-running', 'true')
})

test('mouse depth returns to a flat print, and stays flat in quiet mode', async ({ page }) => {
  await page.goto('./#home')
  const bed = page.locator('.poster-window')
  await expect(page.locator('.reel')).toHaveAttribute('data-running', 'true')
  const box = (await bed.boundingBox())!
  const pose = () => page.locator('.poster-art').evaluate((el) => getComputedStyle(el).transform)
  await page.mouse.move(box.x + box.width * .82, box.y + box.height * .21)
  await expect.poll(pose).toMatch(/^matrix3d/)
  await page.mouse.move(10, 10)
  await expect.poll(pose).toBe('none')
  await page.getByRole('button', { name: /انیمیشن‌های سایت/ }).click()
  await page.mouse.move(box.x + box.width * .8, box.y + box.height * .3)
  await paints(page, 4)
  expect(await pose()).toBe('none')
})

test('quiet mode persists, and OS reduced motion takes precedence even mid-playback', async ({ page }) => {
  await page.goto('./#home')
  const mode = page.getByRole('button', { name: /انیمیشن‌های سایت/ })
  await mode.click()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'quiet')
  await page.goto('./')
  await expect(mode).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'قاب ۰۲: می‌سازیم' }).click()
  await expect(page.locator('.reel-label')).toContainText('می‌سازیم')
  await expectHeldFrame(page)
  await mode.click()
  // Selecting a still never implicitly starts the film.
  await page.getByRole('button', { name: 'پخش پوستر' }).click()
  await expect(page.locator('.reel')).toHaveAttribute('data-running', 'true')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(mode).toBeDisabled()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'quiet')
  await expect(page.locator('.reel')).toHaveAttribute('data-running', 'false')
  await expectHeldFrame(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(mode).toBeEnabled()
  await expect(page.locator('.reel')).toHaveAttribute('data-running', 'true')
})

test('fast file turns expose only the new sheet, and each number wheel lands on its label', async ({ page }) => {
  await page.goto('./#members')
  const master = page.getByRole('tablist', { name: 'فهرست اعضای تیم' })
  await master.getByRole('tab', { name: /مجتبی میدانی/ }).focus()
  await page.keyboard.press('End'); await page.keyboard.press('Home'); await page.keyboard.press('ArrowDown')
  const panel = page.locator('#member-profile')
  await expect(panel.getByRole('heading', { level: 3 })).toHaveCount(1)
  await expect(panel.getByRole('heading', { level: 3 })).toHaveText('محمد صحرانورد')
  await expect(master.getByRole('tab', { name: /محمد صحرانورد/ })).toBeFocused()
  await expect(panel.locator('.file-leaf')).toHaveCount(1)
  await page.locator('#honors').scrollIntoViewIfNeeded()
  await expect(page.locator('.metric-value .sr-only')).toHaveText(['۰۱', '۰۷', '۰۵'])
  await expect.poll(() => page.locator('.digit-window').evaluateAll((windows) => windows.length === 6 && windows.every((win) => {
    const final = win.querySelector('.digit-belt > span:last-child')!
    return Math.abs(win.getBoundingClientRect().top - final.getBoundingClientRect().top) < 1
  }))).toBe(true)
})

test.describe('touch playback', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 740 } })
  test('all three stills are reachable without hover or dragging', async ({ page }) => {
    await page.goto('./#home')
    for (const name of ['قاب ۰۲: می‌سازیم', 'قاب ۰۳: می‌درخشیم', 'قاب ۰۱: می‌رسیم']) {
      const key = page.getByRole('button', { name })
      await key.tap(); await expect(key).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('.reel')).toHaveAttribute('data-running', 'false')
    }
    await page.getByRole('button', { name: 'پخش پوستر' }).tap()
    await expect(page.locator('.reel')).toHaveAttribute('data-running', 'true')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)
  })
})
