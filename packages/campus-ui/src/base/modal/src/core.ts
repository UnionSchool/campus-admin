/** 需要锁定滚动时记录的原始 overflow，用于还原 */
let scrollLockCount = 0
let previousOverflow = ''

/**
 * 弹层滚动锁。
 * 使用计数而非布尔值，避免多个弹层同时打开时提前解锁。
 */
export function lockScroll(): void {
  if (typeof document === 'undefined') return
  if (scrollLockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLockCount += 1
}

export function unlockScroll(): void {
  if (typeof document === 'undefined') return
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) {
    document.body.style.overflow = previousOverflow
  }
}

/** 在容器内查找可聚焦元素，用于打开时移动焦点 */
export function focusableElements(container: HTMLElement | undefined): HTMLElement[] {
  if (!container) return []
  const selector = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}
