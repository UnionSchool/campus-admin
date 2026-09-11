import type { App, Component } from '@unionschool/campus-framework'
import {
  alert as overlayAlert,
  CaOverlayHost,
  confirm as overlayConfirm,
  createApp,
  createVueApplication,
  CAMPUS_KEY,
  hideLoading,
  overlayStore,
  showLoading,
  showToast,
} from '@unionschool/campus-framework'
import { CampusApplication } from '@unionschool/campus-core'
import type { CampusApplicationOptions } from '@unionschool/campus-core'
import { builtInComponents } from '@unionschool/campus-ui'
import { createLocale, installLocale } from '@unionschool/campus-ui'
import type { CaLocaleConfig } from '@unionschool/campus-ui'

/**
 * 全局命令式 API。
 *
 * 直接在这里定义而不是从框架 re-export：打包器会沿跨包 re-export 链做分析，
 * 常量对象容易被当成无副作用代码剔除，导致业务侧拿到 undefined。
 * 放在 campus-admin 内部，是它最靠近用户、且能保证被保留的位置。
 */
export const ca = {
  /** 显示加载动画，返回关闭句柄。不支持并发，任意句柄 hide() 都会关闭 */
  loading: (text?: string) => showLoading(text),
  /** 轻提示：success 为 true 显示对勾，false 显示叉号 */
  toast: (text: string, success = true) => showToast(text, success),
  /** 提示框：单确定按钮，第三个参数为确认回调 */
  alert: (first: string, second?: string | (() => void), third?: () => void) => overlayAlert(first, second, third),
  /** 确认框：返回是否点了确定 */
  confirm: (first: string, second?: string) => overlayConfirm(first, second),
  /** 通用弹层，按需传标题、内容与回调 */
  modal: (options: { title?: string; content: string; onConfirm?: () => void }) => {
    overlayStore.set(prev => ({
      list: [...prev.list, {
        id: Date.now(),
        variant: 'alert',
        title: options.title,
        content: options.content,
        confirmText: '确定',
        onConfirm: options.onConfirm,
      }],
    }))
  },
  /** 关闭当前加载动画，供请求拦截器等场景兜底 */
  hideLoading,
}

/** 框架自带组件，不进入 UI 组件库的注册表 */
const frameworkComponents: Record<string, Component> = {
  CaOverlayHost,
}

/**
 * 把命令式 API 的渲染宿主挂到 body。
 *
 * 用独立 app 实例挂载，避免宿主组件参与业务组件的更新；
 * 业务方不需要手动在模板里加任何东西。
 */
function mountOverlayHost() {
  if (typeof document === 'undefined') return () => {}
  const container = document.createElement('div')
  container.setAttribute('data-ca-overlay', '')
  document.body.appendChild(container)
  const overlayApp = createApp(CaOverlayHost)
  overlayApp.mount(container)
  return () => {
    overlayApp.unmount()
    container.remove()
  }
}

/**
 * 把 ca 挂到 window，业务页面即可直接 ca.toast(...)，不必 import。
 *
 * 由安装插件时自动调用；已有同名全局对象时不覆盖，避免与第三方脚本冲突。
 * 需要类型提示时仍可 `import { ca } from '@unionschool/campus-admin'`。
 */
function exposeGlobalCa(): void {
  if (typeof window === 'undefined') return
  const target = window as unknown as { ca?: typeof ca }
  if (!target.ca) target.ca = ca
}

/**
 * Campus Admin 完整入口。
 *
 * 返回值是 Vue 插件，可直接 app.use(...)；
 * 同时带有 component / register / use / start，便于按需扩展请求层与权限层。
 */
export function createCampusAdmin(options: CampusApplicationOptions = {}) {
  const application = new CampusApplication(options)
  const bridge = createVueApplication(application)

  /**
   * 语言实例：内置 zh-CN / en-US 词条，
   * 业务通过 config.locale.messages 追加自己的词条（deep merge，ca 命名空间由组件库保留）。
   */
  const locale = createLocale((options.config?.locale ?? {}) as CaLocaleConfig)

  Object.entries(builtInComponents).forEach(([name, component]) => bridge.component(name, component as Component))
  Object.entries(frameworkComponents).forEach(([name, component]) => bridge.component(name, component))
  bridge.register(options.providers ?? [])
  bridge.use(options.plugins ?? [])

  let unmountOverlay: (() => void) | null = null

  return {
    ...bridge,
    name: 'campus-admin',
    /** 语言实例，非 setup 场景（路由、请求拦截器）可直接使用 */
    locale,
    install(app: App) {
      bridge.start()
      app.provide(CAMPUS_KEY, application)
      installLocale(app, locale)
      bridge.install(app)
      // 命令式 API 的宿主独立挂载，挂载失败不影响主应用
      unmountOverlay = mountOverlayHost()
      exposeGlobalCa()
    },
    /** 卸载宿主，供测试或微应用场景回收 */
    unmount() {
      unmountOverlay?.()
      unmountOverlay = null
    },
  }
}
