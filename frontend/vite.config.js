import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000", // redirect /api requests to backend
      "/uploads": "http://localhost:5000" // serve static files from backend
    },
  },
})
