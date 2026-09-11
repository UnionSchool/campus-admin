import type { App } from '@unionschool/campus-framework'
import './styles.css'

// 基础组件
import { CaAvatar } from './components/base/avatar'
import { CaButton } from './components/base/button'
import { CaIcon } from './components/base/icon'
import { CaTag } from './components/base/tag'
// 表单组件
import { CaCheckbox } from './components/form/checkbox'
import { CaInput } from './components/form/input'
import { CaSelect } from './components/form/select'
import { CaSwitch } from './components/form/switch'
import { CaTextarea } from './components/form/textarea'
// 数据展示
import { CaPagination } from './components/data/pagination'
import { CaStatistic } from './components/data/statistic'
import { CaTable } from './components/data/table'
// 反馈与弹层
import { CaEmpty } from './components/feedback/empty'
import { CaModal } from './components/feedback/modal'
import { CaProgress } from './components/feedback/progress'
import { CaSkeleton } from './components/feedback/skeleton'
import { CaToastContainer } from './components/feedback/toast'
// 导航与布局
import { CaBreadcrumb } from './components/navigation/breadcrumb'
import { CaDrawer } from './components/navigation/drawer'
// 菜单
import { CaSideMenu } from './components/menu'
import { CaPageHeader } from './components/layout/page-header'
import { CaSearchForm } from './components/layout/search-form'
// 校园业务组件
import { CaAttendanceBadge } from './components/campus/attendance-badge'
import { CaClassTree } from './components/campus/class-tree'
import { CaStudentPicker } from './components/campus/student-picker'
// 课表与日程
import { CaDailyAgenda } from './components/daily-agenda'
import { CaWeeklyTimetable } from './components/weekly-timetable'

export {
  CaAttendanceBadge, CaAvatar, CaBreadcrumb, CaButton, CaCheckbox, CaClassTree,
  CaDailyAgenda, CaDrawer, CaEmpty, CaIcon, CaInput, CaModal, CaPageHeader,
  CaPagination, CaProgress, CaSearchForm, CaSelect, CaSideMenu, CaSkeleton, CaStatistic,
  CaStudentPicker, CaSwitch, CaTable, CaTag, CaTextarea, CaToastContainer,
  CaWeeklyTimetable,
}

export { clearToasts, closeToast, toast } from './components/feedback/toast'
export type { ToastItem, ToastOptions, ToastTone } from './components/feedback/toast'
export type { BreadcrumbItem } from './components/navigation/breadcrumb'
export type { FlatSideMenuItem, SideMenuItem } from './components/menu'
export type { SelectOption, SelectOptions } from './components/form/select'
export type { SortOrder, TableColumn } from './components/data/table'
export type { AttendanceMeta, AttendanceStatus } from './components/campus/attendance-badge'
export type { ClassNode as ClassTreeNode, GradeNode as GradeTreeNode } from './components/campus/class-tree'
export type { StudentOption, StudentValue } from './components/campus/student-picker'
export type { AgendaDateCell, AgendaItem } from './components/daily-agenda'
export type { Lesson, LessonPeriod, LessonTone, TimetableDay, TimetableMode } from './components/weekly-timetable'

// 工具
export { COMPONENT_PREFIX, cx, ns } from './core/namespace'
export type { ComponentSize, ComponentTone } from './core/namespace'

/** 组件注册表，campus-admin 与 CampusUI 插件共用 */
export const builtInComponents = {
  CaAttendanceBadge, CaAvatar, CaBreadcrumb, CaButton, CaCheckbox, CaClassTree,
  CaDailyAgenda, CaDrawer, CaEmpty, CaIcon, CaInput, CaModal, CaPageHeader,
  CaPagination, CaProgress, CaSearchForm, CaSelect, CaSideMenu, CaSkeleton, CaStatistic,
  CaStudentPicker, CaSwitch, CaTable, CaTag, CaTextarea, CaToastContainer,
  CaWeeklyTimetable,
}

/**
 * 组件库插件，用于单独安装 campus-ui。
 * 完整后台请直接使用 @unionschool/campus-admin，它已自动注册这些组件。
 */
export const CampusUI = {
  install(app: App) {
    Object.entries(builtInComponents).forEach(([name, component]) => {
      app.component(name, component as Parameters<App['component']>[1])
    })
  },
}

export default CampusUI
