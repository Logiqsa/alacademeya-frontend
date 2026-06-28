import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Dev-only fix for the CORS error on login/API calls:
    // any request starting with /api gets forwarded server-to-server
    // to the real backend, so the browser never sees a cross-origin call.
    proxy: {
      '/api': {
        target: 'https://api.alacademeya.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})