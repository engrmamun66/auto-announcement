import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utilities', import.meta.url)),
    }
  },
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: true,
    chunkSizeWarningLimit: 1600,
    watch: {
      include: ['src/**', 'templates/**'],
      exclude: 'node_modules/**, .git/**, dist/**, .vscode/**',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/script_prod.js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  }
})
