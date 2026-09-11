export { ca, createCampusAdmin } from './plugin'

// 组件样式随主包一起输出，使用方只需引入 @unionschool/campus-admin/style.css
import '@unionschool/campus-ui/style.css'
// 弹层宿主样式来自框架层，同样随主包一起输出，
// 否则命令式 API 的弹层会渲染成没有样式的裸 DOM
import '@unionschool/campus-framework/style.css'

// 框架核心，统一从主包出口提供，业务项目无需单独安装
export {
  CampusApplication,
  CampusContainer,
  CampusContext,
  campus,
  createCampus,
  definePlugin,
  defineProvider,
  getCurrentCampus,
  isCampusProvider,
  setCurrentCampus,
} from '@unionschool/campus-core'
export type {
  CampusApplicationOptions,
  CampusConfig,
  CampusLifecycle,
  CampusPlugin,
  CampusProvider,
} from '@unionschool/campus-core'

// Vue 适配层：响应式 API、useCampus、createVueApplication 等
export * from '@unionschool/campus-framework'


// 组件库
export * from '@unionschool/campus-ui'

// 组件库的 toast 与框架的 ca.toast 共用同一份消息队列，
// 这里显式再导出组件库版本，消除与框架同名导出的歧义
export { clearToasts, closeToast, toast } from '@unionschool/campus-ui'

import { createCampusAdmin } from './plugin'

// 默认导出保持插件语义，仍可使用 app.use(CampusAdmin)
export default {
  install(app: Parameters<ReturnType<typeof createCampusAdmin>['install']>[0]) {
    createCampusAdmin().install(app)
  },
}
