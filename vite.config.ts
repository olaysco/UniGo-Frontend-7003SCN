/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vendor-vue';
            }
            if (id.includes('@ionic')) {
              return 'vendor-ionic';
            }
            if (id.includes('ionicons')) {
              return 'vendor-ionicons';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
