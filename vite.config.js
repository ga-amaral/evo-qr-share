import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/supabase': {
        target: import.meta.env.VITE_SUPABASE_URL || 'https://supabase-evo.portfolioshowcase.tech',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase/, '')
      }
    }
  }
})