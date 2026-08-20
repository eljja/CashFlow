import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/CashFlow/', // Essential for GitHub Pages (https://eljja.github.io/CashFlow/)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'echarts-vendor': ['echarts', 'echarts-for-react'],
          'xlsx-vendor': ['xlsx']
        }
      }
    }
  }
})
