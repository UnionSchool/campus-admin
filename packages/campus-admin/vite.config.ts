import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'CampusAdmin',
      formats: ['es', 'umd'],
      fileName: format => (format === 'es' ? 'campus-admin.js' : 'campus-admin.umd.cjs'),
      cssFileName: 'campus-admin',
    },
    rollupOptions: {
      external: ['vue', '@lucide/vue', '@unionschool/campus-core', '@unionschool/campus-framework', '@unionschool/campus-ui'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          '@lucide/vue': 'LucideVue',
          '@unionschool/campus-core': 'CampusCore',
          '@unionschool/campus-framework': 'CampusFramework',
          '@unionschool/campus-ui': 'CampusUI',
        },
      },
    },
  },
})
