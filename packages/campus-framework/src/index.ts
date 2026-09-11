// 引入弹层宿主（含样式），保证命令式 API 的弹层渲染正常
export { CaOverlayHost } from './components/overlay'

export { createVueApplication } from './application'
export type { CampusVueApplication } from './application'
export { CAMPUS_KEY, useCampus } from './campus'
export * from './services'
export * from './vue'
