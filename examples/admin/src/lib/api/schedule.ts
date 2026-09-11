import { useRequest } from '../request-helper'
import type { ApiEnvelope } from '../types'

/**
 * 课程表接口。
 * 结构约定见 ./card.ts 顶部说明。
 */

/** 节次定义：时段分组、节次名、上课时间 */
export interface SchedulePeriod {
  /** 分组名，例如早自习 / 上午 / 下午，空串表示延续上一组 */
  group: string
  label: string
  time: string
}

/** 一节课 */
export interface ScheduleLesson {
  /** 星期，0 为周一 */
  day: number
  /** 第几节，对应 periods 的下标 */
  row: number
  subject: string
  className: string
  teacher: string
  /** 展示色调，与 campus-ui 的课程表一致 */
  tone: 'blue' | 'green' | 'orange'
}

export interface ScheduleData {
  /** 学年学期说明 */
  term: string
  periods: SchedulePeriod[]
  lessons: ScheduleLesson[]
}

export interface ScheduleQuery {
  /** 班级 ID，查班级课表时传 */
  classId?: string
  /** 教师 ID，查个人课表时传 */
  teacherId?: string
  /** 周次 */
  week?: number
}

/**
 * 查询课程表
 * uri：GET /course/schedule
 * mock：lib/mock/course/schedule.json
 */
export function getCourseSchedule(query: ScheduleQuery = {}): Promise<ApiEnvelope<ScheduleData>> {
  // 显式组装查询参数：Query 要求索引签名，直接传接口对象不兼容
  const params = {
    classId: query.classId,
    teacherId: query.teacherId,
    week: query.week,
  }
  return useRequest().get<ApiEnvelope<ScheduleData>>('/course/schedule', { query: params })
}
