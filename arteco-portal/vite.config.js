import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
