import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  envDir: path.resolve(__dirname, '../'),
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('/', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utilities', import.meta.url)),
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        passes: 2,
      },
      mangle: true,
      format: { comments: false },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    watch: {
      include: ['src/**'],
      exclude: 'node_modules/**, .git/**, dist/**, .vscode/**',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/my-announcement.min.js',
        assetFileNames: 'assets/my-announcement.min.[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('moment')) return 'vendor-moment'
            if (id.includes('vue')) return 'vendor-vue'
            return 'vendor'
          }
        },
      },
    },
  }
})
