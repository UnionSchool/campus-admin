import type { CampusContext } from '../context'

/**
 * 服务提供者：把一组服务绑定进容器，分 register 与 boot 两个阶段执行。
 *
 * register 只做绑定与配置，boot 只做依赖其他提供者的初始化。
 * 业务代码依赖本契约，不直接依赖 Vue、Vite 或任何 UI 框架。
 */
export interface CampusProvider {
  /** 提供者名称，用于日志和重复注册检查 */
  readonly name: string
  /** 注册服务、配置和契约绑定 */
  register?(context: CampusContext): void
  /** 应用启动阶段执行，此时所有提供者已完成 register */
  boot?(context: CampusContext): void
}

/**
 * 应用插件：面向能力扩展的装配入口。
 * 与 Provider 的区别是：Plugin 面向能力扩展，Provider 面向服务装配。
 */
export interface CampusPlugin {
  readonly name: string
  /** 应用注册阶段执行，可继续注册 Provider */
  install(context: CampusContext): void
}
