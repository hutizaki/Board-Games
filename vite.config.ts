import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  base: process.env.NODE_ENV === 'production' ? '/Board-Games/' : '/',
  build: {
    // Optimize for performance
    minify: 'esbuild',
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion']
        }
      }
    },
    // Target modern browsers for better performance
    target: 'es2020',
    // Enable source maps for debugging
    sourcemap: false
  },
  server: {
    // Enable HMR for faster development
    hmr: true
  }
})
