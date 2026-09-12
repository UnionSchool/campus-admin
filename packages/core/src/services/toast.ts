import { closeToast as closeUiToast, clearToasts as clearUiToasts, toast as uiToast, toasts } from '@campus-admin/ui'
import type { ToastItem, ToastTone } from '@campus-admin/ui'
import { watch } from 'vue'
import { CampusStore } from './store'

export interface ToastState {
  list: ToastItem[]
}

/**
 * 消息队列由组件库持有（见 @campus-admin/ui 的 base/toast），
 * 这里只把它接到框架的 store 形状上，ca.toast 与 toast.success 共用同一份队列。
 */
export const toastStore = new CampusStore<ToastState>({ list: [] })

// 组件库的队列是响应式的，这里跟随它同步一份给宿主渲染
watch(toasts, (list) => {
  toastStore.set({ list: [...list] })
}, { immediate: true })

/**
 * 轻提示。
 *
 *   ca.toast('保存成功')         成功，对勾图标
 *   ca.toast('保存失败', false)  错误，叉号图标
 */
export function showToast(text: string, success = true, duration = 2000, description?: string): number {
  return uiToast.show({
    title: text,
    tone: success ? 'success' : 'danger',
    duration,
    description,
  })
}

export function closeToast(id: number): void {
  closeUiToast(id)
}

export function clearToasts(): void {
  clearUiToasts()
}
