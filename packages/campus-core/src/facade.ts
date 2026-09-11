import type { CampusApplication } from './application'

let currentApplication: CampusApplication | undefined

/**
 * 设置当前应用实例，由 campus-framework 在安装插件时调用。
 * 核心层只保存引用，不感知框架实现。
 */
export function setCurrentCampus(application: CampusApplication): void {
  currentApplication = application
}

export function getCurrentCampus(): CampusApplication | undefined {
  return currentApplication
}

/**
 * Campus Facade，对应 Laravel 的 Facade。
 *
 * 业务代码用 campus('request') 取服务，而不是直接 import 具体实现，
 * 这样替换实现时无需改动业务代码。
 */
export function campus(): CampusApplication
export function campus<T>(service: string): T
export function campus<T>(service?: string): CampusApplication | T {
  if (!currentApplication) {
    throw new Error('[campus] 应用尚未创建，请先调用 createCampusAdmin')
  }
  return service ? currentApplication.context.resolve<T>(service) : currentApplication
}
