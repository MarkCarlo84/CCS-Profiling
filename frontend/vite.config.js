import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core':   ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'lucide':       ['lucide-react'],
          'axios':        ['axios'],
        },
      },
    },
  },
})
