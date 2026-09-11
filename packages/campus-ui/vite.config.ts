import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'CampusUI',
      formats: ['es', 'umd'],
      fileName: format => (format === 'es' ? 'campus-ui.js' : 'campus-ui.umd.cjs'),
      cssFileName: 'campus-ui',
    },
    rollupOptions: {
      external: ['vue', '@lucide/vue', '@unionschool/campus-framework'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          '@lucide/vue': 'LucideVue',
          '@unionschool/campus-framework': 'CampusFramework',
        },
      },
    },
  },
})
