import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'CampusFramework',
      formats: ['es', 'umd'],
      fileName: format => (format === 'es' ? 'index.js' : 'index.umd.cjs'),
    },
    rollupOptions: {
      external: ['vue', '@unionschool/campus-core', '@lucide/vue'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue', '@unionschool/campus-core': 'CampusCore', '@lucide/vue': 'LucideVue' },
      },
    },
  },
})
