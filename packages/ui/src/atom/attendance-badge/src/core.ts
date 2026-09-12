/**
 * 考勤状态词典。
 * 状态值使用字符串联合类型，避免散落的魔法数字。
 *
 * 文案不写死在这里：组件按 labelKey 通过 useLocale() 取当前语言的文案；
 * label 保留默认语言（zh-CN）的文案，供不接入国际化的调用方直接使用。
 */
import { defaultMessage } from '@campus-admin/locale'

export type AttendanceStatus = 'normal' | 'late' | 'leave' | 'absent' | 'early' | 'unknown'

export interface AttendanceMeta {
  /** 默认语言文案，组件不用它渲染，只作兜底 */
  label: string
  /** 词条键：ca.attendance.<status> */
  labelKey: string
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const TONES: Record<AttendanceStatus, AttendanceMeta['tone']> = {
  normal: 'success',
  late: 'warning',
  leave: 'info',
  absent: 'danger',
  early: 'warning',
  unknown: 'neutral',
}

/** 词条键写成完整字面量，便于脚本与翻译工具直接 grep 到 */
const LABEL_KEYS: Record<AttendanceStatus, string> = {
  normal: 'ca.attendance.normal',
  late: 'ca.attendance.late',
  leave: 'ca.attendance.leave',
  absent: 'ca.attendance.absent',
  early: 'ca.attendance.early',
  unknown: 'ca.attendance.unknown',
}

export function attendanceMeta(status: AttendanceStatus | string): AttendanceMeta {
  const known = Object.prototype.hasOwnProperty.call(TONES, status) ? status as AttendanceStatus : 'unknown'
  const labelKey = LABEL_KEYS[known]
  return {
    labelKey,
    tone: TONES[known],
    label: defaultMessage(labelKey) ?? labelKey,
  }
}

/** 班级维度汇总：用于“今日到校率”这类统计展示 */
export function attendanceRate(counts: Partial<Record<AttendanceStatus, number>>, total: number): number {
  if (!total) return 0
  const normal = counts.normal ?? 0
  const leave = counts.leave ?? 0
  return Math.round(((normal + leave) / total) * 1000) / 10
}
