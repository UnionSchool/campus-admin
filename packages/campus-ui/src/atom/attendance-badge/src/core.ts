/**
 * 考勤状态词典。
 * 状态值使用字符串联合类型，避免散落的魔法数字。
 */
export type AttendanceStatus = 'normal' | 'late' | 'leave' | 'absent' | 'early' | 'unknown'

export interface AttendanceMeta {
  label: string
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const META: Record<AttendanceStatus, AttendanceMeta> = {
  normal: { label: '正常', tone: 'success' },
  late: { label: '迟到', tone: 'warning' },
  leave: { label: '请假', tone: 'info' },
  absent: { label: '缺勤', tone: 'danger' },
  early: { label: '早退', tone: 'warning' },
  unknown: { label: '未打卡', tone: 'neutral' },
}

export function attendanceMeta(status: AttendanceStatus | string): AttendanceMeta {
  return META[status as AttendanceStatus] ?? META.unknown
}

/** 班级维度汇总：用于“今日到校率”这类统计展示 */
export function attendanceRate(counts: Partial<Record<AttendanceStatus, number>>, total: number): number {
  if (!total) return 0
  const normal = counts.normal ?? 0
  const leave = counts.leave ?? 0
  return Math.round(((normal + leave) / total) * 1000) / 10
}
