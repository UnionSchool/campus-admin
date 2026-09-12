import type { App } from 'vue'
import './styles.css'

import { atomComponents } from './atom'
import { baseComponents } from './base'
import { featureComponents } from './feature'
import { createLocale, installLocale } from '@campus-admin/locale'

/**
 * 组件库入口。
 *
 * 分成 atom / base / feature 三层，判据见各层 index.ts 的注释。
 * 新增一个组件只需要改两处：组件自己的目录 + 所属层的 index.ts，
 * 顶层注册表由三层合并而来，不会再出现"导出了但没注册"。
 */
export * from './atom'
export * from './base'
export * from './feature'

// 工具
export { COMPONENT_PREFIX, cx, ns } from './core/namespace'
export type { ComponentSize, ComponentTone } from './core/namespace'

// 主题与品牌色（明暗模式、运行时换主色）
export {
  getPrimaryColor,
  getTheme,
  isDarkTheme,
  resetPrimaryColor,
  setPrimaryColor,
  setTheme,
  setupTheme,
  THEME_ATTRIBUTE,
} from './core/theme'
export type { CaTheme } from './core/theme'

/** 组件注册表，campus-admin 与 CampusUI 插件共用 */
export const builtInComponents = {
  ...atomComponents,
  ...baseComponents,
  ...featureComponents,
}

/**
 * 组件库插件，用于只做 UI 的项目单独安装组件库。
 * 完整后台请直接使用 @campus-admin/core，它已自动注册这些组件。
 *
 * 主题与品牌色不在这里初始化：默认亮色 + 默认蓝色由 token.css 提供，
 * 需要切换时在应用入口调用 setTheme() / setPrimaryColor()。
 */
export const CampusUI = {
  install(app: App) {
    Object.entries(builtInComponents).forEach(([name, component]) => {
      app.component(name, component as Parameters<App['component']>[1])
    })
    // 单独使用组件库时提供一份默认语言实例，业务无需额外配置
    installLocale(app, createLocale())
  },
}

export default CampusUI
