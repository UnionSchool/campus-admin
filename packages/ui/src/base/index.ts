/**
 * 基础类组件。
 *
 * 判据：区域级、能直接放进页面布局，给一个宽度就能自己撑满并正常运作；
 * 与业务无关，不含校园数据模型。
 *
 * 价值在于"渲染结构"的组件放这里；价值在于"完成一件事"的放到 feature。
 */
import { CaBreadcrumb } from './breadcrumb'
import { CaClassTree } from './class-tree'
import { CaCopyright } from './copyright'
import { CaDrawer } from './drawer'
import { CaEmpty } from './empty'
import { CaModal } from './modal'
import { CaPageHeader } from './page-header'
import { CaPagination } from './pagination'
import { CaSearchForm } from './search-form'
import { CaSideMenu } from './menu'
import { CaSkeleton } from './skeleton'
import { CaStatistic } from './statistic'
import { CaTable } from './table'
import { CaToastContainer } from './toast'

export {
  CaBreadcrumb,
  CaClassTree,
  CaCopyright,
  CaDrawer,
  CaEmpty,
  CaModal,
  CaPageHeader,
  CaPagination,
  CaSearchForm,
  CaSideMenu,
  CaSkeleton,
  CaStatistic,
  CaTable,
  CaToastContainer,
}

export { clearToasts, closeToast, setToasts, toast, toasts } from './toast'
export type { ToastItem, ToastOptions, ToastTone } from './toast'
export type { BreadcrumbItem } from './breadcrumb'
export type { ClassNode as ClassTreeNode, GradeNode as GradeTreeNode } from './class-tree'
export type { FlatSideMenuItem, SideMenuItem } from './menu'
export type { SortOrder, TableColumn } from './table'

/** 基础层注册表，由顶层 index.ts 合并成 builtInComponents */
export const baseComponents = {
  CaBreadcrumb,
  CaClassTree,
  CaCopyright,
  CaDrawer,
  CaEmpty,
  CaModal,
  CaPageHeader,
  CaPagination,
  CaSearchForm,
  CaSideMenu,
  CaSkeleton,
  CaStatistic,
  CaTable,
  CaToastContainer,
}
