import { useRequest } from '../request-helper'
import type { ApiEnvelope } from '../types'

/**
 * 学生管理接口。
 * 结构约定见 ./card.ts 顶部说明。
 */

export interface StudentItem {
  /** 学生 ID 统一字符串，避免后端大整数精度丢失 */
  id: string
  name: string
  studentNo: string
  grade: string
  className: string
  /** 考勤状态：与 CaAttendanceBadge 的状态词典一致 */
  status: 'normal' | 'late' | 'leave' | 'absent'
  /** 今日打卡时间，未打卡为空 */
  checkIn?: string
  /** 一卡通余额（元） */
  balance: number
}

export interface StudentQuery {
  keyword?: string
  grade?: string
  status?: StudentItem['status'] | ''
  page?: number
  pageSize?: number
}

/**
 * 分页查询学生
 * uri：GET /student/page
 * mock：lib/mock/student/page.json
 *
 * 返回完整结构：data 是列表，count 是总数，页面用 code === 0 判断成功。
 */
export function getStudentPage(query: StudentQuery = {}): Promise<ApiEnvelope<StudentItem[]>> {
  const { keyword = '', grade = '', status = '', page = 1, pageSize = 10 } = query
  return useRequest().get<ApiEnvelope<StudentItem[]>>('/student/page', {
    query: { keyword, grade, status, page, pageSize },
  })
}

/** 学生详情：GET /student/detail */
export function getStudentDetail(id: string): Promise<ApiEnvelope<StudentItem>> {
  return useRequest().get<ApiEnvelope<StudentItem>>('/student/detail', { query: { id } })
}
