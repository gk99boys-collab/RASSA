import { statSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { trackPath, withTrack } from './fixtures/soundtrack'

test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  args: ['--autoplay-policy=no-user-gesture-required'] } })

const meta = 'meta[name="rassa-soundtrack"]'

test.beforeEach(async ({ page }) => {
  await page.route('https://rassa-fixture.invalid/**', r => r.fulfill({ status: 403, json: {} }))
})

test('only an uploaded track is advertised by the Pages build', async ({ page }) => {
  const file = statSync(`public/${trackPath}`, { throwIfNoEntry: false })
  const present = !!(file?.isFile() && file.size)
  let requests = 0
  page.on('request', r => { if (r.url().endsWith(trackPath)) requests++ })
  await page.goto('./#home')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator(meta)).toHaveCount(present ? 1 : 0)
  await expect(page.locator('audio')).toHaveCount(present ? 1 : 0)
  if (present) await expect(page.locator(meta)).toHaveAttribute('content', `./${trackPath}`)
  else expect(requests).toBe(0)
})

test('music starts on entry, loops, and stays paused after an explicit pause and reload', async ({ page }) => {
  await withTrack(page)
  await page.goto('./#home')
  const audio = page.locator('audio')
  await expect(audio).toHaveJSProperty('loop', true)
  await expect(page.locator('.soundtrack-key')).toHaveAttribute('data-playing', 'true')
  // With no user seeks, this event is the native loop returning to the start of the file.
  await audio.evaluate(el => new Promise<void>(resolve => el.addEventListener('seeked', () => resolve(), { once: true })))
  await expect(audio).toHaveJSProperty('paused', false)
  await expect(audio).toHaveJSProperty('muted', false)
  expect(await audio.evaluate(el => (el as HTMLAudioElement).volume)).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'مکث موسیقی خراسانی' }).click()
  await expect(audio).toHaveJSProperty('paused', true)
  await page.reload()
  await page.locator('h1').click()
  await expect(audio).toHaveJSProperty('paused', true)
  await page.getByRole('button', { name: 'پخش موسیقی خراسانی' }).click()
  await expect(page.locator('.soundtrack-key')).toHaveAttribute('data-playing', 'true')
})

test('entry starts the audible player even while the React bundle is still loading', async ({ page }) => {
  let release!: () => void
  const hold = new Promise<void>(resolve => { release = resolve })
  await withTrack(page)
  await page.route('**/assets/site-*.js', async route => { await hold; await route.continue() })
  try {
    await page.goto('./#home', { waitUntil: 'commit' })
    await expect(page.locator('audio')).toHaveJSProperty('paused', false)
    await expect(page.locator('audio')).toHaveJSProperty('muted', false)
    await expect(page.locator('#root')).toBeEmpty()
  } finally { release() }
  await expect(page.locator('.soundtrack-key')).toHaveAttribute('data-playing', 'true')
  await expect(page.locator('audio')).toHaveCount(1)
})

test('a media error disables the control without blocking navigation', async ({ page }) => {
  await withTrack(page, true)
  await page.goto('./#home')
  await expect(page.getByRole('button', { name: 'موسیقی خراسانی در دسترس نیست' })).toBeDisabled()
  await page.locator('.header-cta').click()
  await expect(page).toHaveURL(/#members$/)
})
