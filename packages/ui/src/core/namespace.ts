/** CSS 类名前缀，遵循技术规范的 ca- 约定 */
export const COMPONENT_PREFIX = 'ca'

/**
 * 生成 BEM 风格类名。
 *
 * ns('button')                 → 'ca-button'
 * ns('button', 'icon')         → 'ca-button__icon'
 * ns('button', 'primary', true) → 'ca-button--primary'
 */
export function ns(block: string, element?: string, modifier?: string | boolean): string {
  const base = `${COMPONENT_PREFIX}-${block}`
  const withElement = element ? `${base}__${element}` : base
  if (!modifier) return withElement
  return typeof modifier === 'string' ? `${withElement}--${modifier}` : withElement
}

/** 按条件拼接类名，过滤掉假值 */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/** 尺寸联合类型，供所有基础组件复用 */
export type ComponentSize = 'small' | 'medium' | 'large'

/** 语义色调，用于按钮、标签、状态等 */
export type ComponentTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
