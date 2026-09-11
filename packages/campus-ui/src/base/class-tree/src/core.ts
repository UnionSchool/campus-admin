export interface ClassNode {
  id: string
  label: string
  /** 年级下的班级数量等辅助信息 */
  count?: number
  disabled?: boolean
}

export interface GradeNode {
  id: string
  label: string
  children: ClassNode[]
  disabled?: boolean
}

export interface FlatClassNode {
  id: string
  label: string
  level: number
  isLeaf: boolean
  parentId?: string
  disabled?: boolean
}

/**
 * 把年级 / 班级两级数据按展开状态拍平，便于渲染与键盘遍历。
 * 展开状态用 Set 记录，避免深层对象 diff。
 */
export function flattenTree(grades: GradeNode[], expanded: Set<string>): FlatClassNode[] {
  const rows: FlatClassNode[] = []
  grades.forEach((grade) => {
    rows.push({ id: grade.id, label: grade.label, level: 0, isLeaf: false, disabled: grade.disabled })
    if (!expanded.has(grade.id)) return
    grade.children.forEach((child) => {
      rows.push({ id: child.id, label: child.label, level: 1, isLeaf: true, parentId: grade.id, disabled: child.disabled })
    })
  })
  return rows
}

/** 默认展开全部年级，符合后台“先看全貌”的使用习惯 */
export function defaultExpanded(grades: GradeNode[]): Set<string> {
  return new Set(grades.map(grade => grade.id))
}

/** 搜索命中：年级或班级名包含关键词时保留该分支 */
export function filterTree(grades: GradeNode[], keyword: string): GradeNode[] {
  const trimmed = keyword.trim().toLowerCase()
  if (!trimmed) return grades
  return grades
    .map((grade) => {
      const gradeHit = grade.label.toLowerCase().includes(trimmed)
      const children = grade.children.filter(child => child.label.toLowerCase().includes(trimmed))
      if (gradeHit) return { ...grade, children: grade.children }
      if (children.length) return { ...grade, children }
      return null
    })
    .filter((item): item is GradeNode => item !== null)
}
