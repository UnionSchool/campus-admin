export interface PageItem {
  type: 'page' | 'prev' | 'next' | 'ellipsis'
  page: number
}

/**
 * 计算分页按钮序列。
 *
 * 始终保留首尾页，中间用省略号折叠，避免页数多时撑破布局。
 */
export function buildPages(current: number, totalPages: number, siblings = 1): PageItem[] {
  if (totalPages <= 1) return totalPages === 1 ? [{ type: 'page', page: 1 }] : []

  const pages: PageItem[] = []
  const windowStart = Math.max(2, current - siblings)
  const windowEnd = Math.min(totalPages - 1, current + siblings)

  pages.push({ type: 'page', page: 1 })
  if (windowStart > 2) pages.push({ type: 'ellipsis', page: windowStart - 1 })

  for (let page = windowStart; page <= windowEnd; page += 1) {
    pages.push({ type: 'page', page })
  }

  if (windowEnd < totalPages - 1) pages.push({ type: 'ellipsis', page: windowEnd + 1 })
  pages.push({ type: 'page', page: totalPages })

  return pages
}

export function totalPagesOf(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1
  return Math.max(1, Math.ceil(total / pageSize))
}
