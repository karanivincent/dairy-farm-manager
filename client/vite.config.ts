import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false, // Don't auto-open browser
    host: true, // Listen on all addresses
  },
  preview: {
    port: 5173,
    open: false,
    host: true,
  },
})
