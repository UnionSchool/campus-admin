import type { CampusProvider } from './contracts/provider'

/**
 * 轻量服务容器，只保留最小能力集：绑定、单例、解析。
 *
 * 只做 bind、singleton、make，不引入装饰器、反射或自动依赖注入。
 */
export class CampusContainer {
  private readonly entries = new Map<string, unknown>()

  /** 绑定实例或工厂函数，单例语义 */
  bind<T>(key: string, value: T | (() => T)): void {
    this.entries.set(key, value)
  }

  /** 绑定单例，等价于 bind，语义更明确的别名 */
  singleton<T>(key: string, value: T | (() => T)): void {
    this.bind(key, value)
  }

  /** 解析服务，未注册时返回 undefined */
  make<T>(key: string): T | undefined {
    if (!this.entries.has(key)) return undefined
    const entry = this.entries.get(key)
    if (typeof entry === 'function') {
      const factory = entry as () => T
      const instance = factory()
      this.entries.set(key, instance)
      return instance
    }
    return entry as T
  }

  /** 解析服务，未注册时抛错，用于必需依赖 */
  resolve<T>(key: string): T {
    const instance = this.make<T>(key)
    if (instance === undefined) {
      throw new Error(`[campus] 服务未注册: ${key}`)
    }
    return instance
  }

  has(key: string): boolean {
    return this.entries.has(key)
  }

  /** 移除绑定，主要供测试使用 */
  forget(key: string): void {
    this.entries.delete(key)
  }
}

export function isCampusProvider(value: unknown): value is CampusProvider {
  return (
    typeof value === 'object'
    && value !== null
    && typeof (value as CampusProvider).name === 'string'
  )
}
