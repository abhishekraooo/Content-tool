import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Proxy /api calls to Vercel dev server during local development
  // `vercel dev` runs both the frontend and API functions together,
  // so this proxy is only needed if you run `vite` directly (not `vercel dev`)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
