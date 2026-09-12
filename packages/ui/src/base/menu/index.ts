/**
 * 菜单组件分类。
 *
 * 后续各类菜单都放在这里，例如：
 * - dropdown-menu 下拉菜单（操作项、更多操作）
 * - context-menu  右键菜单
 * - tree-menu     树形选择菜单
 * - nav-menu      水平导航菜单
 * 各菜单共用的树拍平、key 解析与展开状态处理放在 category 下，避免逐个组件重复实现。
 */
export { CaSideMenu } from './side-menu'
export type { FlatSideMenuItem, SideMenuItem } from './side-menu'
export { collectExpandableKeys, flattenMenu, resolveKey } from './core'
