/**
 * WeeklyTimetable 的核心逻辑，纯 TypeScript，不依赖 Vue。
 */

export type TimetableMode = 'personal' | 'class'
export type LessonTone = 'blue' | 'green' | 'orange'

export interface LessonPeriod {
  group: string
  label: string
  time: string
}

export interface Lesson {
  day: number
  row: number
  subject: string
  className: string
  tone: LessonTone
}

export interface TimetableDay {
  label: string
  date: Date
  today: boolean
}

const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const TONES: LessonTone[] = ['blue', 'green', 'orange']

export const CLASS_OPTIONS = ['高一（1）班', '高一（2）班', '高一（3）班']

/** 基准周：2026-09-07 起，今天固定为 2026-09-11 */
export function createDays(weekOffset: number, today = new Date(2026, 8, 11)): TimetableDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2026, 8, 7 + weekOffset * 7 + index)
    return {
      label: DAY_LABELS[index] as string,
      date,
      today: date.getTime() === today.getTime(),
    }
  })
}

export function formatWeekRange(days: TimetableDay[]): string {
  const first = days[0]?.date
  const last = days[6]?.date
  if (!first || !last) return ''
  return `${first.getMonth() + 1}.${first.getDate()} — ${last.getMonth() + 1}.${last.getDate()}`
}

/** 班级课表按“节次 + 星期”生成稳定的演示课程 */
export function lessonForClass(row: number, day: number, className: string): Lesson {
  const subjects = ['语文', '数学', '英语', '物理', '化学', '历史', '体育', '班会']
  return {
    day,
    row,
    subject: subjects[(row + day) % subjects.length] as string,
    className,
    tone: TONES[(row + day) % 3] as LessonTone,
  }
}

export function findLesson(lessons: Lesson[], row: number, day: number): Lesson | undefined {
  return lessons.find(item => item.row === row && item.day === day)
}

export function describeLesson(lesson: Lesson, date: Date, period: LessonPeriod): string {
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${period.time}，授课教师：林老师。请提前准备教学资料。`
}

export const timetablePeriods: LessonPeriod[] = [
  { group: '早自习', label: '早读', time: '07:30–08:00' },
  { group: '上午', label: '第 1 节', time: '08:10–08:55' },
  { group: '', label: '第 2 节', time: '09:05–09:50' },
  { group: '', label: '第 3 节', time: '10:10–10:55' },
  { group: '', label: '第 4 节', time: '11:05–11:50' },
  { group: '下午', label: '第 5 节', time: '14:00–14:45' },
  { group: '', label: '第 6 节', time: '14:55–15:40' },
  { group: '', label: '第 7 节', time: '15:50–16:35' },
]
