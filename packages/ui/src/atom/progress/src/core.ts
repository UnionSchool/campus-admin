/** 把任意数值收敛到 0–100，避免外部传入越界值破坏布局 */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

/** 按总数计算百分比，总数为 0 时返回 0 */
export function percentOf(value: number, total: number): number {
  if (!total) return 0
  return clampPercent((value / total) * 100)
}

/** 进度语义色：低于阈值提示异常 */
export function progressTone(percent: number, thresholds = { warning: 30, danger: 10 }): 'primary' | 'warning' | 'danger' {
  if (percent <= thresholds.danger) return 'danger'
  if (percent <= thresholds.warning) return 'warning'
  return 'primary'
}
