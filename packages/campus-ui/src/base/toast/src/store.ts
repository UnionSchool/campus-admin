import { ref } from '@unionschool/campus-framework'
import { closeToast as closeFrameworkToast, toastStore } from '@unionschool/campus-framework'
import type { ToastItem, ToastTone } from '@unionschool/campus-framework'

export type { ToastItem, ToastTone }

export interface ToastOptions {
  title: string
  description?: string
  tone?: ToastTone
  /** 毫秒，<=0 表示不自动关闭 */
  duration?: number
}

/**
 * 组件库的 toast 列表。
 *
 * 数据源统一在 campus-framework 的 toastStore —— 也就是 ca.toast 用的那一份，
 * 这里只做订阅与转换，保证两套 API 不会各弹各的。
 */
export const toasts = ref<ToastItem[]>([])

// 初始化时同步一次，之后跟随 store 变化
toasts.value = toastStore.get().list
toastStore.subscribe((state) => {
  toasts.value = state.list
})

/** 推入一条消息，返回 id 可用于提前关闭 */
export function push(options: ToastOptions): number {
  const id = Date.now() + Math.floor(Math.random() * 1000)
  const item: ToastItem = {
    id,
    text: options.title,
    description: options.description,
    tone: options.tone ?? 'primary',
    duration: options.duration ?? 3000,
  }
  // 直接改 store，保证与 ca.toast 共用同一份消息队列
  toastStore.set(prev => ({ list: [...prev.list, item] }))
  if (item.duration > 0) {
    setTimeout(() => closeFrameworkToast(id), item.duration)
  }
  return id
}

export function close(id: number): void {
  closeFrameworkToast(id)
}

export function clear(): void {
  toastStore.set({ list: [] })
}

/** 命令式消息，业务代码无需在模板中声明组件 */
export const toast = {
  show: push,
  success: (title: string, description?: string) => push({ title, description, tone: 'success' }),
  warning: (title: string, description?: string) => push({ title, description, tone: 'warning' }),
  error: (title: string, description?: string) => push({ title, description, tone: 'danger' }),
  info: (title: string, description?: string) => push({ title, description, tone: 'primary' }),
  close,
  clear,
}
