import type { CampusContainer } from './container'
import type { CampusConfig } from './contracts/config'

/**
 * 应用上下文，在 Provider、Plugin 与业务模块之间传递。
 * 只暴露容器与配置读写能力，不暴露框架内部实现。
 */
export class CampusContext {
  constructor(
    readonly config: CampusConfig,
    readonly container: CampusContainer,
  ) {}

  /** 读取配置，支持 config.get('request.timeout') 形式 */
  get<T = unknown>(key: string, fallback?: T): T {
    const segments = key.split('.')
    let current: unknown = this.config
    for (const segment of segments) {
      if (typeof current !== 'object' || current === null) return fallback as T
      current = (current as Record<string, unknown>)[segment]
      if (current === undefined) return fallback as T
    }
    return current as T
  }

  /** 写入运行时配置，例如读取远端配置后再下发 */
  set(key: string, value: unknown): void {
    const segments = key.split('.')
    let current: Record<string, unknown> = this.config as unknown as Record<string, unknown>
    segments.slice(0, -1).forEach((segment) => {
      const next = current[segment]
      if (typeof next !== 'object' || next === null) {
        current[segment] = {}
      }
      current = current[segment] as Record<string, unknown>
    })
    current[segments[segments.length - 1] as string] = value
  }

  bind<T>(key: string, value: T | (() => T)): void {
    this.container.bind(key, value)
  }

  make<T>(key: string): T | undefined {
    return this.container.make<T>(key)
  }

  resolve<T>(key: string): T {
    return this.container.resolve<T>(key)
  }
}
