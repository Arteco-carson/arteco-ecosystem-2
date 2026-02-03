import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/acm/',
  plugins: [react()],
  envDir: '..', // <--- This allows ACM to read the single .env file in the root
  server: {
    proxy: {
      '/api': {
        target: 'https://arteco-fineartapi-prod-bxetekage3a2b6em.eastus2-01.azurewebsites.net',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})