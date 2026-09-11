import { CampusContainer, isCampusProvider } from './container'
import { CampusContext } from './context'
import type { CampusConfig } from './contracts/config'
import type { CampusPlugin, CampusProvider } from './contracts/provider'

export interface CampusApplicationOptions {
  /** 应用名称 */
  name?: string
  /** 应用版本 */
  version?: string
  /** 其他业务配置，可自由扩展 */
  config?: Record<string, unknown>
  /** 启动时装载的服务提供者 */
  providers?: CampusProvider[]
  /** 启动时装载的插件 */
  plugins?: CampusPlugin[]
}

/** Laravel 风格的应用生命周期：register → boot → start */
export type CampusLifecycle = 'created' | 'registered' | 'booted' | 'started'

/**
 * Campus 应用实例，对应 Laravel 的 Application。
 *
 * 该类属于核心层，不引入 Vue 或任何 UI 框架。
 * 与 Vue 的桥接放在 @unionschool/campus-framework 中，
 * 保证升级 Vue 时核心层不受影响。
 */
export class CampusApplication {
  readonly container = new CampusContainer()
  readonly context: CampusContext
  readonly providers: CampusProvider[] = []
  readonly plugins: CampusPlugin[] = []

  private state: CampusLifecycle = 'created'
  private readonly bootedProviders = new WeakSet<CampusProvider>()

  constructor(options: CampusApplicationOptions = {}) {
    const config: CampusConfig = {
      name: options.name ?? 'Campus Admin',
      version: options.version ?? '0.0.0',
      ...options.config,
    }
    if (options.config?.name) config.name = String(options.config.name)
    if (options.config?.version) config.version = String(options.config.version)
    this.context = new CampusContext(config, this.container)
    options.providers?.forEach(provider => this.register(provider))
    options.plugins?.forEach(plugin => this.use(plugin))
  }

  get lifecycle(): CampusLifecycle {
    return this.state
  }

  get name(): string {
    return this.context.config.name
  }

  get version(): string {
    return this.context.config.version
  }

  /** 注册服务提供者，立即执行 register */
  register(provider: CampusProvider | CampusProvider[]): this {
    const list = Array.isArray(provider) ? provider : [provider]
    list.forEach((item) => {
      if (!isCampusProvider(item)) {
        throw new Error('[campus] 无效的服务提供者')
      }
      if (this.providers.some(exist => exist.name === item.name)) return
      this.providers.push(item)
      item.register?.(this.context)
    })
    this.state = this.state === 'created' ? 'registered' : this.state
    return this
  }

  /** 装载插件，插件可继续注册提供者 */
  use(plugin: CampusPlugin | CampusPlugin[]): this {
    const list = Array.isArray(plugin) ? plugin : [plugin]
    list.forEach((item) => {
      if (item && typeof item.install === 'function') {
        item.install(this.context)
        this.plugins.push(item)
      }
    })
    return this
  }

  /** 启动应用：执行所有提供者的 boot，然后触发启动回调 */
  start(): this {
    if (this.state === 'started') return this
    this.providers.forEach(provider => this.bootProvider(provider))
    this.state = 'started'
    const hooks = this.container.make<Array<() => void>>('campus.started')
    hooks?.forEach(hook => hook())
    return this
  }

  /** 注册启动回调，等价于 Laravel 的 booted 回调 */
  started(callback: () => void): this {
    const hooks = this.container.make<Array<() => void>>('campus.started') ?? []
    hooks.push(callback)
    this.container.bind('campus.started', hooks)
    return this
  }

  private bootProvider(provider: CampusProvider): void {
    if (this.bootedProviders.has(provider)) return
    provider.boot?.(this.context)
    this.bootedProviders.add(provider)
    this.state = 'booted'
  }
}

/** 极简工厂，方便在 main.ts 中创建应用 */
export function createCampus(options: CampusApplicationOptions = {}): CampusApplication {
  return new CampusApplication(options)
}

/** 服务提供者工厂，保留类型推断 */
export function defineProvider(provider: CampusProvider): CampusProvider {
  return provider
}

/** 插件工厂，保留类型推断 */
export function definePlugin(plugin: CampusPlugin): CampusPlugin {
  return plugin
}
