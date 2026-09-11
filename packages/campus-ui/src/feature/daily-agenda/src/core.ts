/**
 * DailyAgenda 的核心逻辑，纯 TypeScript，不依赖 Vue。
 * 升级 Vue 或更换渲染层时本文件无需改动。
 */

export interface AgendaItem {
  day: number
  time: string
  title: string
  location: string
  done: boolean
}

export interface AgendaDateCell {
  label: string
  date: Date
  hasEvent: boolean
}

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

/** 基准周首日：2026-09-07，避免依赖运行环境当前时间 */
export const AGENDA_WEEK_START = new Date(2026, 8, 7)

export function createWeekDates(offset: number, eventDays: number[] = [9, 10, 11]): AgendaDateCell[] {
  return Array.from({ length: 7 }, (_, index) => {
    const dayOfMonth = 7 + offset * 7 + index
    return {
      label: WEEK_LABELS[index] as string,
      date: new Date(2026, 8, dayOfMonth),
      hasEvent: eventDays.includes(dayOfMonth),
    }
  })
}

export function moveWeek(offset: number, direction: number): { day: number; offset: number } {
  const next = offset + direction
  return { day: 7 + next * 7, offset: next }
}

export function filterAgenda(items: AgendaItem[], day: number, keyword: string): AgendaItem[] {
  const trimmed = keyword.trim()
  return items.filter(item => item.day === day && item.title.includes(trimmed))
}

export function formatAgendaDate(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`
}

/** 详情文案，与组件展示口径保持一致 */
export function describeAgendaItem(item: AgendaItem, date: Date): string {
  const state = item.done ? '此日程已完成。' : '请按时参加并准备相关材料。'
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${item.time}，地点：${item.location}。${state}`
}
