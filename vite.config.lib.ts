import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: new URL('./src/index.ts', import.meta.url).pathname,
      name: 'CampusAdmin',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'campus-admin.js' : 'campus-admin.umd.cjs',
      cssFileName: 'campus-admin',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue' },
      },
    },
  },
})
