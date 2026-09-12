import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // 声明文件由 tsc 先输出，构建阶段不能再清空 dist
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'CampusLocale',
      formats: ['es', 'umd'],
      fileName: format => (format === 'es' ? 'index.js' : 'index.umd.cjs'),
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
