import type { Page } from '@playwright/test'

export const trackPath = 'music/Khorasani.mp3'

// Simulate a deployment with the upload, without writing a song to the repository.
export async function withTrack(page: Page, broken = false) {
  await page.route('**/RASSA/', async route => {
    const response = await route.fetch()
    const html = (await response.text()).replace(/<meta name="rassa-soundtrack"[^>]*>/g, '')
    await route.fulfill({ response, body: html.replace('</head>', `<meta name="rassa-soundtrack" content="./${trackPath}"></head>`) })
  })
  // 24 silent MPEG-1 Layer III frames at 128 kbps / 44.1 kHz (mono).
  const mp3 = Buffer.alloc(24 * 417)
  for (let i = 0; i < mp3.length; i += 417) mp3.writeUInt32BE(0xfffb90c0, i)
  await page.route(`**/RASSA/${trackPath}`, route => broken
    ? route.fulfill({ status: 404, body: '' })
    : route.fulfill({ contentType: 'audio/mpeg', body: mp3 }))
}
