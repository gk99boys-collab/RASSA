import { expect, test } from '@playwright/test'
import { withTrack } from './fixtures/soundtrack'

test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 760 },
  launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ['--autoplay-policy=document-user-activation-required'] } })

test.beforeEach(async ({ page }) => {
  await page.route('https://rassa-fixture.invalid/**', r => r.fulfill({ status: 403, json: {} }))
})

test('the first tap unlocks playback, but taps after a manual pause leave it paused', async ({ page }) => {
  await withTrack(page)
  await page.goto('./#home')
  await expect(page.getByRole('button', { name: 'پخش موسیقی خراسانی' })).toBeVisible()
  await expect(page.locator('audio')).toHaveJSProperty('paused', true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await page.locator('h1').tap()
  await expect(page.locator('.soundtrack-key')).toHaveAttribute('data-playing', 'true')
  await page.getByRole('button', { name: 'مکث موسیقی خراسانی' }).tap()
  await page.locator('h1').tap()
  await expect(page.locator('audio')).toHaveJSProperty('paused', true)
})

test('keyboard activation of the music button unlocks audio across section navigation', async ({ page }) => {
  await withTrack(page)
  await page.goto('./#home')
  await page.getByRole('button', { name: 'پخش موسیقی خراسانی' }).press('Enter')
  await expect(page.locator('.soundtrack-key')).toHaveAttribute('data-playing', 'true')
  await page.locator('.header-cta').tap()
  await expect(page).toHaveURL(/#members$/)
  await expect(page.locator('audio')).toHaveJSProperty('paused', false)
})
