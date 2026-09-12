/**
 * 功能类组件。
 *
 * 判据：由多个原子/基础组件组成，完成一件完整的事，
 * 不区分用户角色（班主任、财务、校长看到的是同一套）。
 *
 * 这一层不追求数量，只在有真实页面需求时才新增。
 */
import { CaDailyAgenda } from './daily-agenda'
import { CaStudentPicker } from './student-picker'
import { CaWeeklyTimetable } from './weekly-timetable'

export { CaDailyAgenda, CaStudentPicker, CaWeeklyTimetable }

export type { AgendaDateCell, AgendaItem } from './daily-agenda'
export type { StudentOption, StudentValue } from './student-picker'
export type { Lesson, LessonPeriod, LessonTone, TimetableDay, TimetableMode } from './weekly-timetable'

/** 功能层注册表，由顶层 index.ts 合并成 builtInComponents */
export const featureComponents = {
  CaDailyAgenda,
  CaStudentPicker,
  CaWeeklyTimetable,
}
