import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    // 声明文件由 tsc 先输出，构建阶段不能再清空 dist
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'CampusCore',
      formats: ['es', 'umd'],
      fileName: format => (format === 'es' ? 'index.js' : 'index.umd.cjs'),
      cssFileName: 'core',
    },
    rollupOptions: {
      external: ['vue', '@lucide/vue', '@campus-admin/ui', '@campus-admin/locale', '@campus-admin/icon'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          '@lucide/vue': 'LucideVue',
          '@campus-admin/ui': 'CampusUI',
          '@campus-admin/locale': 'CampusLocale',
          '@campus-admin/icon': 'CampusIcon',
        },
      },
    },
  },
})
