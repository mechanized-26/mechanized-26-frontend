import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT) || 5173,
    host: true, // Listen on all local IPs
    open: true
  },
  preview: {
    port: parseInt(process.env.PORT) || 5173,
    host: true,
  },
  define: {
    global: 'globalThis',
  }
})
