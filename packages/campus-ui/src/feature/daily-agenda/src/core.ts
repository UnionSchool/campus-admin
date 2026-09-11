/**
 * DailyAgenda 的核心逻辑，纯 TypeScript，不依赖 Vue。
 * 升级 Vue 或更换渲染层时本文件无需改动。
 * 文案与日期格式通过参数传入，不在这里写死，日期格式统一走 Intl。
 */
import { formatDay, formatMonth, weekdayLabels } from '@/locale/format'
import type { TranslateFn } from '@/locale/types'

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

/** 基准周首日：2026-09-07，避免依赖运行环境当前时间 */
export const AGENDA_WEEK_START = new Date(2026, 8, 7)

export function createWeekDates(offset: number, locale: string, eventDays: number[] = [9, 10, 11]): AgendaDateCell[] {
  const labels = weekdayLabels(locale, 'narrow')
  return Array.from({ length: 7 }, (_, index) => {
    const dayOfMonth = 7 + offset * 7 + index
    return {
      label: labels[index] as string,
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

/** 月份标题：2026年9月 / September 2026 */
export function formatAgendaDate(date: Date, locale: string): string {
  return formatMonth(date, locale)
}

/** 详情文案，与组件展示口径保持一致 */
export function describeAgendaItem(item: AgendaItem, date: Date, locale: string, t: TranslateFn): string {
  const state = t(item.done ? 'ca.agenda.doneState' : 'ca.agenda.todoState')
  return t('ca.agenda.describe', {
    date: formatDay(date, locale),
    time: item.time,
    location: item.location,
    state,
  })
}
