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
   * 示例只按包名引用，不写 src 别名，保证“验证的是发布产物”。
   *
   * 各包的 exports 里 source 排在 import 之后，所以开发与构建都命中 dist：
   * 与发布到 npm 后的行为一致，改完组件源码记得先跑 pnpm run build:packages。
   */
  resolve: {
    conditions: ['source', 'import', 'module', 'browser', 'default'],
  },
  /**
   * 工作区包不参与依赖预打包。
   *
   * 预打包会用 import/module 条件解析到 dist，而源码图用 source 条件解析到 src，
   * 同一个包被加载两份就会出现「两个语言实例 / 两个注入 key」这类问题
   * （现象是业务文案跟着切换、组件文案不跟着变）。
   */
  optimizeDeps: {
    exclude: [
      '@campus-admin/core',
      '@campus-admin/ui',
      '@campus-admin/locale',
      '@campus-admin/icon',
    ],
  },
  /**
   * 开发服务器：固定 8091 端口 + 自动打开浏览器。
   *
   * 为什么不用默认的 5173：很容易被别的 Vite 项目或上一次没退干净的实例占住，
   * 自动跳端口会让每次的地址都不一样。这里用示例专属端口 + strictPort，
   * 端口被占时直接报错（而不是悄悄换端口），临时换端口用 `npm run dev -- --port 8092`。
   */
  server: {
    port: 8091,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
