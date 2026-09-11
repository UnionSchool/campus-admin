export interface StudentOption {
  /** 学生 ID 统一使用字符串，避免后端大整数精度丢失 */
  id: string
  name: string
  studentNo?: string
  grade?: string
  className?: string
  /** 可选的头像地址 */
  avatar?: string
}

export type StudentValue = string | string[] | undefined

/** 按姓名、学号、班级模糊匹配，关键词为空时返回全部 */
export function filterStudents(students: StudentOption[], keyword: string): StudentOption[] {
  const trimmed = keyword.trim().toLowerCase()
  if (!trimmed) return students
  return students.filter((student) => {
    const haystack = [student.name, student.studentNo, student.className, student.grade]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(trimmed)
  })
}

/** 把 props 传入的 value 统一收敛为 id 数组 */
export function toIdList(value: StudentValue): string[] {
  if (value === undefined || value === '') return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

export function isSelected(value: StudentValue, id: string): boolean {
  return toIdList(value).includes(id)
}

/** 单选切换：再次点击同一项表示取消选择 */
export function toggleSingle(value: StudentValue, id: string): string | undefined {
  return toIdList(value)[0] === id ? undefined : id
}

export function toggleMultiple(value: StudentValue, id: string): string[] {
  const list = toIdList(value)
  return list.includes(id) ? list.filter(item => item !== id) : [...list, id]
}
