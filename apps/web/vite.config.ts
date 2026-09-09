import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // Same-origin in development, the way nginx serves it in the container.
      "/api": { target: process.env.API_URL ?? "http://localhost:3001", changeOrigin: false },
    },
  },
  plugins: [react()],
})
