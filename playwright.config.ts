import { defineConfig } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4174/RASSA/'
const outDir = 'node_modules/.cache/rassa-e2e'

// Exercise the production bundle under the Pages subpath. Never contact a real DB.
export default defineConfig({
  testDir: './tests',
  outputDir: 'node_modules/.cache/rassa-results',
  workers: 1,
  use: {
    baseURL, viewport: { width: 1280, height: 820 }, reducedMotion: 'reduce',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
  webServer: {
    command: `vite build --outDir ${outDir} && vite preview --outDir ${outDir} --base /RASSA/ --port 4174 --strictPort`,
    env: { VITE_SUPABASE_URL: 'https://rassa-fixture.invalid', VITE_SUPABASE_ANON_KEY: 'public-test-fixture' },
    url: baseURL,
  },
})
