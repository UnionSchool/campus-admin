import { CampusStore } from './store'

export type OverlayVariant = 'alert' | 'confirm'

export interface OverlayButton {
  text: string
  /** 主题色，取消按钮用 neutral */
  tone?: 'primary' | 'neutral'
  /** 点击后是否关闭弹层，默认 true */
  closeOnClick?: boolean
}

export interface OverlayItem {
  id: number
  variant: OverlayVariant
  title?: string
  content: string
  confirmText: string
  cancelText?: string
  /** 确认回调，异步时按钮会进入 loading */
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

export interface OverlayState {
  list: OverlayItem[]
}

export const overlayStore = new CampusStore<OverlayState>({ list: [] })

let seed = 0

function push(item: Omit<OverlayItem, 'id'>): number {
  const id = ++seed
  overlayStore.set(prev => ({ list: [...prev.list, { ...item, id }] }))
  return id
}

export function closeOverlay(id: number): void {
  overlayStore.set(prev => ({ list: prev.list.filter(item => item.id !== id) }))
}

export function clearOverlays(): void {
  overlayStore.set({ list: [] })
}

/**
 * 支持三种调用方式，最后一个参数是函数时视为确认回调：
 *
 *   ca.alert('提示')
 *   ca.alert('标题', '提示内容')
 *   ca.alert('标题', '提示内容', () => {})
 *   ca.alert('标题', () => {})          // 省略内容
 */
export function parseArguments(
  first: string,
  second?: string | (() => void | Promise<void>),
  third?: () => void | Promise<void>,
): { title?: string; content: string; onConfirm?: () => void | Promise<void> } {
  if (typeof second === 'function') {
    return { title: first, content: '', onConfirm: second }
  }
  if (second === undefined) {
    return { content: first }
  }
  return { title: first, content: second, onConfirm: third }
}

/** 提示框：只有确定按钮 */
export function alert(
  first: string,
  second?: string | (() => void | Promise<void>),
  third?: () => void | Promise<void>,
): void {
  const { title, content, onConfirm } = parseArguments(first, second, third)
  push({ variant: 'alert', title, content, confirmText: '确定', onConfirm })
}

/**
 * 确认框：确定 + 取消，返回 Promise<boolean>，适合删除确认这类场景。
 *
 *   if (await ca.confirm('删除后不可恢复', '确定删除该学生？')) { ... }
 */
export function confirm(
  first: string,
  second?: string | (() => void | Promise<void>),
  third?: () => void | Promise<void>,
): Promise<boolean> {
  const { title, content } = parseArguments(first, second, third)
  return new Promise<boolean>((resolve) => {
    push({
      variant: 'confirm',
      title: title ?? '提示',
      content,
      confirmText: '确定',
      cancelText: '取消',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    })
  })
}
