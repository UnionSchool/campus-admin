/**
 * 页面文件扫描。
 *
 * 只负责「目录结构 → 路由地址 + 组件」，不关心菜单标题与图标：
 * 这些展示信息由后端下发的菜单决定，见 ./index.ts 的路由注册。
 *
 * 约定：
 * - `pages/xxx.vue`                     → `/xxx`
 * - `pages/<分组>/xxx.vue`              → `/<分组>/xxx`
 * - `pages/<分组>/<子分组>/xxx.vue`      → `/<分组>/<子分组>/xxx`
 *
 * 例：`pages/teach/course/schedule.vue` → `/teach/course/schedule`
 */

/** 所有页面文件，目录层级不限 */
const pageModules = import.meta.glob('../pages/**/*.vue')

/** glob key 的相对前缀，形如 `../pages/` */
const PAGES_PREFIX = /^(\.\.\/|\.\/)+pages\//

/**
 * 从 glob key 取路径片段。
 * `../pages/teach/course/schedule.vue` → ['teach', 'course', 'schedule']
 */
function segmentsOf(key: string): string[] {
  return key
    .replace(PAGES_PREFIX, '')
    .replace(/\.vue$/, '')
    .split('/')
}

export interface PageRoute {
  /** 路由地址 */
  path: string
  /** 路由名，取文件相对路径 */
  name: string
  /** 懒加载组件 */
  loader: () => Promise<unknown>
}

/** 扫描 pages 目录，得到全部页面路由 */
export function scanPages(): PageRoute[] {
  return Object.entries(pageModules).map(([key, loader]) => {
    const segments = segmentsOf(key)
    return {
      path: `/${segments.join('/')}`,
      name: segments.join('-'),
      loader: loader as () => Promise<unknown>,
    }
  })
}
