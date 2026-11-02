import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    hmr: {
      host: 'localhost',
    },
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
      },
      '/broadcasting': {
        target: 'http://localhost',
        changeOrigin: true,
      },
    },
  },
})