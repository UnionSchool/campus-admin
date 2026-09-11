import { useRequest } from '../request-helper'
import type { ApiEnvelope } from '../types'

/**
 * 通知公告接口。
 * 结构约定见 ./card.ts 顶部说明。
 */

export interface NoticeItem {
  id: string
  title: string
  source: string
  /** 发布日期，YYYY-MM-DD */
  date: string
  unread: boolean
  tag: '通知' | '作业' | '班级'
}

/**
 * 通知列表（分页）
 * uri：GET /notice/page
 * mock：lib/mock/notice/page.json
 */
export function getNoticePage(params: { page?: number; pageSize?: number } = {}): Promise<ApiEnvelope<NoticeItem[]>> {
  return useRequest().get<ApiEnvelope<NoticeItem[]>>('/notice/page', { query: params })
}

/** 标记已读：PUT /notice/read */
export function markNoticeRead(id: string): Promise<ApiEnvelope<null>> {
  return useRequest().put<ApiEnvelope<null>>('/notice/read', { id })
}
