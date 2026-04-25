import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Only proxy our backend API calls — NOT /api/assets (those are local static files)
      '/api/admin': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/cart': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/orders': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/login': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/register': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/logout': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/me': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/courses': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/combos': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/books': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/exams': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/feedbacks': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/documents': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/settings': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/homepage-sections': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/webhook': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/upload': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/health': { target: 'http://localhost:3001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
})
