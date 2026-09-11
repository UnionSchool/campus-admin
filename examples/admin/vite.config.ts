import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  /**
   * 资源用相对路径：部署在 COS 域名根目录下行为不变，
   * 同时保证直接双击 dist/index.html（file://）也能打开，
   * 与路由的 hash 模式约定一致（见 src/router/index.ts）。
   */
  base: './',
  /**
   * 示例仍然按包名引用（不写 src 别名），但把构建解析优先级设为 source。
   *
   * 各包的 exports 里同时声明了 source 与 import：
   * - 开发与构建命中 source，直接消费源码，跨包的 re-export 不会在打包时被优化掉
   * - 发布到 npm 后没有 source 条件，使用方拿到 dist，行为与线上一致
   *
   * 这是 Vite 处理 monorepo 工作区包的推荐做法，也是官方模板的默认行为。
   */
  resolve: {
    conditions: ['source', 'import', 'module', 'browser', 'default'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
