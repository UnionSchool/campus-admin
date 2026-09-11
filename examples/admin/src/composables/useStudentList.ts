import { computed, ref } from 'vue'
import { getStudentPage } from '../lib/api/student'

/** 与 CaAttendanceBadge 的状态词典保持一致 */
export type StudentStatus = 'normal' | 'late' | 'leave' | 'absent'

export interface StudentRow {
  id: string
  name: string
  studentNo: string
  grade: string
  className: string
  status: StudentStatus
  checkIn: string
  balance: number
}

export interface StudentQuery {
  keyword: string
  grade: string
  status: '' | StudentStatus
}

/** 演示数据，真实项目替换 load 中的实现即可 */
const ALL_STUDENTS: StudentRow[] = [
  { id: '20260301', name: '李思远', studentNo: '20260301', grade: '高二', className: '高二（3）班', status: 'normal', checkIn: '07:52', balance: 86.4 },
  { id: '20260302', name: '王雨桐', studentNo: '20260302', grade: '高二', className: '高二（3）班', status: 'normal', checkIn: '07:48', balance: 132.0 },
  { id: '20260303', name: '陈昊然', studentNo: '20260303', grade: '高二', className: '高二（1）班', status: 'leave', checkIn: '—', balance: 24.5 },
  { id: '20260304', name: '赵一诺', studentNo: '20260304', grade: '高二', className: '高二（2）班', status: 'normal', checkIn: '07:55', balance: 210.8 },
  { id: '20260305', name: '孙梓涵', studentNo: '20260305', grade: '高二', className: '高二（1）班', status: 'absent', checkIn: '—', balance: 58.0 },
  { id: '20260306', name: '周子墨', studentNo: '20260306', grade: '高二', className: '高二（3）班', status: 'normal', checkIn: '08:14', balance: 176.2 },
  { id: '20260201', name: '吴清和', studentNo: '20260201', grade: '高一', className: '高一（1）班', status: 'normal', checkIn: '07:41', balance: 99.9 },
  { id: '20260202', name: '郑亦辰', studentNo: '20260202', grade: '高一', className: '高一（2）班', status: 'normal', checkIn: '07:46', balance: 45.3 },
  { id: '20260203', name: '何书宁', studentNo: '20260203', grade: '高一', className: '高一（1）班', status: 'leave', checkIn: '—', balance: 301.5 },
  { id: '20260204', name: '林知夏', studentNo: '20260204', grade: '高一', className: '高一（2）班', status: 'normal', checkIn: '07:50', balance: 12.8 },
  { id: '20260205', name: '黄予安', studentNo: '20260205', grade: '高一', className: '高一（1）班', status: 'normal', checkIn: '07:58', balance: 88.0 },
  { id: '20260206', name: '许星辰', studentNo: '20260206', grade: '高一', className: '高一（2）班', status: 'absent', checkIn: '—', balance: 66.6 },
]

const STATUS_LABEL: Record<StudentStatus, string> = { normal: '正常', late: '迟到', leave: '请假', absent: '缺勤' }

/** 查询与分页逻辑与组件解耦，可直接单测 */
export function queryStudents(students: StudentRow[], query: StudentQuery): StudentRow[] {
  const keyword = query.keyword.trim().toLowerCase()
  return students.filter((student) => {
    if (query.status && student.status !== query.status) return false
    if (query.grade && student.grade !== query.grade) return false
    if (!keyword) return true
    return [student.name, student.studentNo, student.className]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })
}

export function statusLabel(status: StudentStatus): string {
  return STATUS_LABEL[status]
}

/**
 * 学生列表的页面逻辑：查询、分页、选中。
 * 组件只负责渲染，这里可以替换为真实接口调用。
 */
export function useStudentList() {
  const query = ref<StudentQuery>({ keyword: '', grade: '', status: '' })
  const page = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const selectedIds = ref<string[]>([])
  const list = ref<StudentRow[]>([])
  const total = ref(0)

  /** 当前页数据；接口一次取全量，分页在客户端切片，便于演示翻页 */
  const rows = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return list.value.slice(start, start + pageSize.value)
  })

  async function search() {
    page.value = 1
    await load()
  }

  async function reset() {
    query.value = { keyword: '', grade: '', status: '' }
    page.value = 1
    await load()
  }

  /**
   * 数据加载走上层封装的接口层，页面只关心结果。
   * 接口不可用时回退到本地演示数据，保证示例站点始终可浏览。
   */
  async function load() {
    loading.value = true
    try {
      const res = await getStudentPage({
        keyword: query.value.keyword,
        grade: query.value.grade,
        status: query.value.status,
        page: 1,
        pageSize: 100,
      })
      // 业务页面按 code 判断成功与否，失败时用 msg 提示
      if (res.code === 0) {
        list.value = (res.data ?? []).map(item => ({ ...item, checkIn: item.checkIn ?? '—' }))
        // count 只有分页接口才有
        total.value = res.count ?? (res.data?.length ?? 0)
      } else {
        throw new Error(res.msg || '加载学生列表失败')
      }
    } catch {
      const fallback = queryStudents(ALL_STUDENTS, query.value)
      total.value = fallback.length
      list.value = fallback
    } finally {
      loading.value = false
    }
  }

  void load()

  return { query, page, pageSize, loading, selectedIds, rows, total, search, reset, load }
}
