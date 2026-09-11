import { useRequest } from '../request-helper'
import type { ApiEnvelope } from '../types'

/**
 * 菜单接口。
 *
 * 菜单由后端下发，前端只负责渲染与跳转，因此权限变化、学校差异都无需改前端代码。
 */

export interface MenuNode {
  /** 菜单唯一标识 */
  id: string
  /** 显示名 */
  label: string
  /**
   * 词条键，可选。
   * 后端不传时前端按 menu.<id> 取词条，取不到就用 label 兜底，
   * 这样后端只需要返回稳定 id 就能支持多语言。
   */
  labelKey?: string
  /**
   * 路由地址。
   * 有 path 的是可跳转页面，没有 path 的是分组标题（用于展开收起）。
   */
  path?: string
  /**
   * 图标名，与 @lucide/vue 的组件名一致，例如 LayoutDashboard。
   * 用字符串而不是直接传组件，因为菜单来自接口，无法序列化组件。
   */
  icon?: string
  /** 右侧角标，通常是待办数量 */
  badge?: string
  /** 排序，小的靠前 */
  order?: number
  children?: MenuNode[]
}

/**
 * 获取主菜单
 * uri：GET /menu/main
 * mock：lib/mock/menu/main.json
 */
export function getMainMenu(): Promise<ApiEnvelope<MenuNode[]>> {
  return useRequest().get<ApiEnvelope<MenuNode[]>>('/menu/main')
}
