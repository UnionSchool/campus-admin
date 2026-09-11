import { inject } from './vue'
import type { InjectionKey } from 'vue'
import { getCurrentCampus } from '@unionschool/campus-core'
import type { CampusApplication } from '@unionschool/campus-core'

/** 应用实例注入键，业务代码通常不需要直接使用 */
export const CAMPUS_KEY: InjectionKey<CampusApplication> = Symbol('campus')

/**
 * 在组件中获取 Campus 应用实例。
 * 优先使用组件树注入，其次回退到全局 Facade，便于单测与脚本环境。
 */
export function useCampus(): CampusApplication {
  return inject(CAMPUS_KEY, undefined) ?? (getCurrentCampus() as CampusApplication)
}
