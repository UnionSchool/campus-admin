export interface TableColumn<T = unknown> {
  /** 唯一标识，同时作为默认取值字段 */
  key: string
  title: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  /** 数字列默认右对齐，可用 align 覆盖 */
  numeric?: boolean
  /** 是否允许排序 */
  sortable?: boolean
  /** 单元格内容渲染函数，返回字符串 */
  render?: (row: T, index: number) => string
}

export type SortOrder = 'asc' | 'desc' | null

/** 取行数据的稳定 key，避免使用数组索引 */
export function resolveRowKey<T>(row: T, index: number, rowKey?: string | ((row: T) => string)): string {
  if (typeof rowKey === 'function') return rowKey(row)
  if (typeof rowKey === 'string') {
    const value = (row as Record<string, unknown>)[rowKey]
    if (value !== undefined && value !== null) return String(value)
  }
  const fallback = (row as Record<string, unknown>)?.id
  if (fallback !== undefined && fallback !== null) return String(fallback)
  return String(index)
}

export function columnAlign<T>(column: TableColumn<T>): 'left' | 'center' | 'right' {
  if (column.align) return column.align
  return column.numeric ? 'right' : 'left'
}

/**
 * 默认排序：数字按大小，字符串按本地化顺序。
 * locale 决定中英文的字符串比较规则，不传时保持原有的 zh-CN 行为。
 */
export function sortRows<T>(
  rows: T[],
  column: TableColumn<T>,
  order: Exclude<SortOrder, null>,
  locale = 'zh-CN',
): T[] {
  const sorted = [...rows]
  sorted.sort((a, b) => {
    const left = (a as Record<string, unknown>)[column.key]
    const right = (b as Record<string, unknown>)[column.key]
    if (typeof left === 'number' && typeof right === 'number') {
      return order === 'asc' ? left - right : right - left
    }
    return order === 'asc'
      ? String(left ?? '').localeCompare(String(right ?? ''), locale)
      : String(right ?? '').localeCompare(String(left ?? ''), locale)
  })
  return sorted
}

/** 客户端的下一页/上一页边界计算 */
export function paginate<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = Math.max(0, (page - 1) * pageSize)
  return rows.slice(start, start + pageSize)
}

export function cellValue<T>(row: T, column: TableColumn<T>, index: number): string {
  if (column.render) return column.render(row, index)
  const value = (row as Record<string, unknown>)[column.key]
  return value === undefined || value === null ? '' : String(value)
}
