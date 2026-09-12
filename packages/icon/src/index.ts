/**
 * 校园图标集。
 *
 * 这个包解决三件事：
 * 1. **语义别名**：把校园业务里反复出现的概念固定成图标名（CampusStudent、CampusCard…），
 *    业务与后端只认这套名字，将来换图标库、替换单个图标都只改这里；
 * 2. **图标解析**：后端菜单、字典下发的是字符串图标名，用 resolveIcon() 统一解析，
 *    业务不再各自 `(icons as Record<string, unknown>)[name]`；
 * 3. **常用图标出口**：业务页面从本包取图标，不必每个项目都直接依赖 @lucide/vue。
 *
 * 组件库内部仍直接使用 @lucide/vue —— 那是组件的实现细节，不进公共契约。
 */
import {
  BedDouble,
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  DoorOpen,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  MonitorSmartphone,
  Package,
  Phone,
  ScanLine,
  School,
  ShieldCheck,
  Utensils,
  UsersRound,
  WalletCards,
  WashingMachine,
} from '@lucide/vue'
import type { Component } from 'vue'

/* ---------- 校园语义图标：业务与页面统一用这套名字 ---------- */

/** 学生 / 学生档案 */
export const CampusStudent = GraduationCap
/** 教职工 */
export const CampusTeacher = Briefcase
/** 考勤 */
export const CampusAttendance = ClipboardCheck
/** 课表 / 排课 */
export const CampusSchedule = CalendarDays
/** 成绩 */
export const CampusScore = BookOpen
/** 班级与年级 */
export const CampusClass = School
/** 校园一卡通 */
export const CampusCard = CreditCard
/** 智慧食堂 */
export const CampusCanteen = Utensils
/** 智能洗衣 */
export const CampusLaundry = WashingMachine
/** 智能柜 */
export const CampusLocker = Package
/** 宿舍 */
export const CampusDormitory = BedDouble
/** 门禁 */
export const CampusAccess = DoorOpen
/** 设备 / 终端 */
export const CampusDevice = MonitorSmartphone
/** 缴费 / 支付 */
export const CampusPayment = WalletCards
/** 充值 */
export const CampusRecharge = CircleDollarSign
/** 通知公告 */
export const CampusNotice = MessageSquareText
/** 校园安全 */
export const CampusSecurity = ShieldCheck
/** 设备巡检 */
export const CampusInspection = ScanLine
/** 审批 */
export const CampusApproval = FileCheck2
/** 文件 / 文档 */
export const CampusDocument = FileText
/** 工作台 / 首页 */
export const CampusDashboard = LayoutDashboard
/** 学校 / 校区 */
export const CampusBuilding = Building2
/** 通讯录 */
export const CampusDirectory = UsersRound
/** 校园电话 */
export const CampusCall = Phone
/** 考勤报表 */
export const CampusReport = CalendarCheck

/**
 * 图标注册表：名称 → 图标组件。
 *
 * 同时收录语义名与 lucide 原名，这样后端既可以下发 `CampusStudent`，
 * 也可以沿用历史数据里的 `GraduationCap`，两种写法都能解析出来。
 */
export const iconRegistry: Record<string, Component> = {
  // 语义名
  CampusStudent,
  CampusTeacher,
  CampusAttendance,
  CampusSchedule,
  CampusScore,
  CampusClass,
  CampusCard,
  CampusCanteen,
  CampusLaundry,
  CampusLocker,
  CampusDormitory,
  CampusAccess,
  CampusDevice,
  CampusPayment,
  CampusRecharge,
  CampusNotice,
  CampusSecurity,
  CampusInspection,
  CampusApproval,
  CampusDocument,
  CampusDashboard,
  CampusBuilding,
  CampusDirectory,
  CampusCall,
  CampusReport,
  // 兼容后端直接下发 lucide 名
  GraduationCap,
  Briefcase,
  ClipboardCheck,
  CalendarDays,
  BookOpen,
  School,
  CreditCard,
  Utensils,
  WashingMachine,
  Package,
  BedDouble,
  DoorOpen,
  MonitorSmartphone,
  WalletCards,
  CircleDollarSign,
  MessageSquareText,
  ShieldCheck,
  ScanLine,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Building2,
  UsersRound,
  Phone,
  CalendarCheck,
}

/** 注册表里全部图标名，便于做图标选择器或校验后端下发的名字 */
export const iconNames = Object.keys(iconRegistry)

/**
 * 按名字解析图标组件。
 * 名字为空或不在注册表里时返回 undefined，由调用方决定降级方式（例如不显示图标）。
 */
export function resolveIcon(name?: string | null): Component | undefined {
  if (!name) return undefined
  return iconRegistry[name]
}
