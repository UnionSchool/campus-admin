/**
 * @campus-admin/core —— 框架层与装配入口。
 *
 * 一个包给出三件事：
 * 1. **内核**：应用生命周期、服务容器、上下文、契约与 Facade；
 * 2. **Vue 适配**：响应式 API 出口、`useCampus`、弹层宿主与命令式 API（`ca.*`）；
 * 3. **装配**：`createCampusAdmin()` 一次装好组件库、语言实例与弹层宿主。
 *
 * 业务只需要安装本包；组件与样式由 `@campus-admin/ui` 提供，国际化由
 * `@campus-admin/locale` 提供，两者都在这里再导出，业务不必分别安装。
 */

// 组件样式与弹层样式随主包一起输出，使用方只需引入 @campus-admin/core/style.css
import '@campus-admin/ui/style.css'
import './components/overlay/style'

/* ---------- 内核：不依赖 Vue 的部分 ---------- */
export { CampusApplication, createCampus, definePlugin, defineProvider } from './application'
export type { CampusApplicationOptions, CampusLifecycle } from './application'
export { CampusContainer, isCampusProvider } from './container'
export { CampusContext } from './context'
export type { CampusConfig } from './contracts/config'
export type { CampusPlugin, CampusProvider } from './contracts/provider'
export { campus, getCurrentCampus, setCurrentCampus } from './facade'

/* ---------- Vue 适配层 ---------- */
export { createVueApplication } from './vue-application'
export type { CampusVueApplication } from './vue-application'
export { CAMPUS_KEY, useCampus } from './campus'
export * from './services'
export * from './vue'

// 命令式 API 的渲染宿主
export { CaLoadingOverlay, CaOverlayHost, CaOverlayList, CaToastList } from './components/overlay'

/* ---------- 装配入口与全局命令式 API ---------- */
export { ca, createCampusAdmin } from './plugin'

/* ---------- 组件库与国际化 ---------- */
export * from '@campus-admin/ui'
export * from '@campus-admin/locale'
// 组件库的 toast 与框架的 ca.toast 共用同一份队列，这里显式再导出组件库版本，
// 消除与框架同名导出的歧义（框架层同名函数只是它的适配器）
export { clearToasts, closeToast, toast } from '@campus-admin/ui'

import { createCampusAdmin } from './plugin'

/** 默认导出保持插件语义，仍可使用 app.use(CampusAdmin) */
export default {
  install(app: Parameters<ReturnType<typeof createCampusAdmin>['install']>[0]) {
    createCampusAdmin().install(app)
  },
}
