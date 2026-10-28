import { defineConfig } from 'vite'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5174,
    hmr: {
      port: 5174,
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'https://api.alacademeya.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
