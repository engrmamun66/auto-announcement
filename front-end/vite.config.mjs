import { defineConfig, version as viteVersion } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// The app ships as ONE js + ONE css file (fixed names, no code splitting).
// Vite 8+ (rolldown) renamed the option: inlineDynamicImports -> codeSplitting: false under rolldownOptions.
// Pick the right one so the same config builds without warnings on both the server and older local installs.
const isRolldownVite = Number(String(viteVersion).split('.')[0]) >= 8
const singleBundleOutput = {
  entryFileNames: 'assets/my-announcement.min.js',
  assetFileNames: 'assets/my-announcement.min.[ext]',
  ...(isRolldownVite ? { codeSplitting: false } : { inlineDynamicImports: true }),
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  optimizeDeps: {
    include: ['highcharts', 'highcharts-vue'],
  },
  envDir: fileURLToPath(new URL('../', import.meta.url)), // ESM equivalent of path.resolve(__dirname, '../')
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
    minify: true,
    sourcemap: true,
    chunkSizeWarningLimit: 3000, // single-bundle by design (~1.6 MB), so only warn if it grows a lot
    watch: {
      include: ['src/**'],
      exclude: 'node_modules/**, .git/**, dist/**, .vscode/**',
    },
    [isRolldownVite ? 'rolldownOptions' : 'rollupOptions']: {
      output: singleBundleOutput,
    },
  }
})
