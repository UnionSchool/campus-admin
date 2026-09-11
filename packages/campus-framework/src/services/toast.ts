import { CampusStore } from './store'

/**
 * 提示语气。
 * success / error 对应 ca.toast 的对勾与叉号；
 * primary / warning 供组件库的详细用法保留。
 */
export type ToastTone = 'primary' | 'success' | 'warning' | 'danger'

export interface ToastItem {
  id: number
  text: string
  tone: ToastTone
  /** 补充说明，可选 */
  description?: string
  /** 毫秒，<=0 表示不自动关闭 */
  duration: number
}

export interface ToastState {
  list: ToastItem[]
}

export const toastStore = new CampusStore<ToastState>({ list: [] })

let seed = 0

/**
 * 轻提示。
 *
 *   ca.toast('保存成功')         成功，对勾图标
 *   ca.toast('保存失败', false)  错误，叉号图标
 */
export function showToast(text: string, success = true, duration = 2000, description?: string): number {
  const id = ++seed
  const item: ToastItem = { id, text, tone: success ? 'success' : 'danger', duration, description }
  toastStore.set(prev => ({ list: [...prev.list, item] }))

  if (duration > 0) {
    setTimeout(() => closeToast(id), duration)
  }
  return id
}

export function closeToast(id: number): void {
  toastStore.set(prev => ({ list: prev.list.filter(item => item.id !== id) }))
}

export function clearToasts(): void {
  toastStore.set({ list: [] })
}
