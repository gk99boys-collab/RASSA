import { statSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const soundtrack = 'music/Khorasani.mp3'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), {
    name: 'optional-soundtrack',
    transformIndexHtml() {
      // Only advertise tracks included in this deployment. No 404 probe on each visit.
      const file = statSync(new URL(`./public/${soundtrack}`, import.meta.url), { throwIfNoEntry: false })
      return file?.isFile() && file.size > 0
        ? [{ tag: 'meta', attrs: { name: 'rassa-soundtrack', content: `./${soundtrack}` } }]
        : []
    },
  }],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    cors: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
