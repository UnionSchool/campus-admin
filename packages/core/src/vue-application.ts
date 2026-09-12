import type { App as VueApp, Component } from 'vue'
import { setCurrentCampus } from './facade'
import type { CampusApplication } from './application'
import type { CampusPlugin, CampusProvider } from './contracts/provider'

/** Vue 视图层的应用句柄，隔离 Vue 实例与 Campus 生命周期 */
export interface CampusVueApplication {
  /** 作为 Vue 插件安装 */
  install(app: VueApp): void
  /** 注册全局组件 */
  component(name: string, component: Component): CampusVueApplication
  /** 注册服务提供者 */
  register(provider: CampusProvider | CampusProvider[]): CampusVueApplication
  /** 装载核心层插件 */
  use(plugin: CampusPlugin | CampusPlugin[]): CampusVueApplication
  /** 启动 Campus 应用 */
  start(): CampusVueApplication
  /** Vue 应用实例，安装后可用 */
  readonly vue?: VueApp
  /** 当前 Campus 应用实例 */
  readonly campus: CampusApplication
}

export function createVueApplication(application: CampusApplication): CampusVueApplication {
  const registered = new Map<string, Component>()
  let vueApp: VueApp | undefined

  const bridge: CampusVueApplication = {
    campus: application,
    get vue() {
      return vueApp
    },
    component(name, component) {
      registered.set(name, component)
      if (vueApp) vueApp.component(name, component)
      return bridge
    },
    register(provider) {
      application.register(provider)
      return bridge
    },
    use(plugin) {
      application.use(plugin)
      return bridge
    },
    start() {
      application.start()
      setCurrentCampus(application)
      return bridge
    },
    install(app) {
      vueApp = app
      registered.forEach((component, name) => app.component(name, component))
    },
  }

  return bridge
}
