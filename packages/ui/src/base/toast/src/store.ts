import { ref } from 'vue'

/**
 * 轻提示的队列与语气。
 *
 * 队列归组件库所有（它是 UI 状态，由 CaToastContainer 渲染），
 * 框架层的 ca.toast 通过本文件导出的 API 入队，两边共用同一份队列。
 */
export type ToastTone = 'primary' | 'success' | 'warning' | 'danger'

export interface ToastItem {
  id: number
  text: string
  tone: ToastTone
  description?: string
  /** 毫秒，<=0 表示不自动关闭 */
  duration: number
}

export interface ToastOptions {
  title: string
  description?: string
  tone?: ToastTone
  /** 毫秒，<=0 表示不自动关闭 */
  duration?: number
}

/** 当前消息列表，容器组件与框架层的宿主都读这一份 */
export const toasts = ref<ToastItem[]>([])

/** 直接替换列表，供框架层适配（ca.toast 的 close / clear）使用 */
export function setToasts(next: ToastItem[]): void {
  toasts.value = next
}

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
  toasts.value = [...toasts.value, item]
  if (item.duration > 0) {
    setTimeout(() => close(id), item.duration)
  }
  return id
}

export function close(id: number): void {
  toasts.value = toasts.value.filter(item => item.id !== id)
}

export function clear(): void {
  toasts.value = []
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
