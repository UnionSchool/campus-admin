/**
 * 主题与品牌色运行时控制。
 *
 * 两件事：
 * 1. 明暗主题：`setTheme('dark' | 'light' | 'auto')` 在 <html> 上写 `data-ca-theme`，
 *    具体配色由 token.css 决定，组件样式不区分主题。
 * 2. 品牌换色：`setPrimaryColor('#7c4dff')` 只给一个主色，
 *    hover / active / soft / text / contrast 全部自动推导，
 *    暗色下按深色底重算，品牌色过浅时自动加深或提亮以保证可读性。
 *
 * 设计取舍：只在根元素上写 CSS 变量，不注入样式表、不依赖构建期变量，
 * 因此可以运行时动态切换（例如学校后台的"主题设置"面板）。
 *
 * 所有方法都是 SSR 安全的：没有 document 时只记录状态，不做 DOM 操作。
 */

/** light 亮色 / dark 暗色 / auto 跟随系统 */
export type CaTheme = 'light' | 'dark' | 'auto'

/** 主题属性名，写在 <html> 上：<html data-ca-theme="dark"> */
export const THEME_ATTRIBUTE = 'data-ca-theme'

/** setPrimaryColor() 会覆盖的变量，顺序固定便于排查 */
const PRIMARY_TOKENS = [
  '--ca-color-primary',
  '--ca-color-primary-hover',
  '--ca-color-primary-active',
  '--ca-color-primary-soft',
  '--ca-color-primary-text',
  '--ca-color-primary-contrast',
] as const

const WHITE = { r: 255, g: 255, b: 255 }
const BLACK = { r: 0, g: 0, b: 0 }
/** 暗色卡片底色，与 token.css 的 --ca-surface-card 保持一致，用于推导浅底 */
const DARK_SURFACE = { r: 0x16, g: 0x1b, b: 0x22 }

interface Rgb { r: number; g: number; b: number }

let currentTheme: CaTheme = 'light'
let currentPrimary = ''
let mediaQuery: MediaQueryList | null = null

/** 解析 #rgb / #rrggbb / rgb() / rgba()，其余返回 null */
function parseColor(input: string): Rgb | null {
  const value = input.trim()
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value)
  if (hex) {
    const raw = hex[1] as string
    const full = raw.length === 3 ? raw.split('').map(char => char + char).join('') : raw
    return {
      r: Number.parseInt(full.slice(0, 2), 16),
      g: Number.parseInt(full.slice(2, 4), 16),
      b: Number.parseInt(full.slice(4, 6), 16),
    }
  }
  const rgb = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/i.exec(value)
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) }
  }
  return null
}

function toHex({ r, g, b }: Rgb): string {
  const part = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`
}

/** 按权重混合两个颜色，weight 为后者占比（0–1） */
function mix(from: Rgb, to: Rgb, weight: number): Rgb {
  const ratio = Math.max(0, Math.min(1, weight))
  return {
    r: from.r + (to.r - from.r) * ratio,
    g: from.g + (to.g - from.g) * ratio,
    b: from.b + (to.b - from.b) * ratio,
  }
}

function channel(value: number): number {
  const scaled = value / 255
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
}

function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG 对比度，1–21 */
function contrastRatio(a: Rgb, b: Rgb): number {
  const lighter = Math.max(luminance(a), luminance(b))
  const darker = Math.min(luminance(a), luminance(b))
  return (lighter + 0.05) / (darker + 0.05)
}

/** 逐步加深，直到在给定底色上达到可读对比度 */
function darkenUntilReadable(color: Rgb, background: Rgb, target = 4.5): Rgb {
  let result = color
  for (let step = 0; step < 10; step += 1) {
    if (contrastRatio(result, background) >= target) break
    result = mix(result, BLACK, 0.14)
  }
  return result
}

/** 逐步提亮，直到在给定底色上达到可读对比度 */
function lightenUntilReadable(color: Rgb, background: Rgb, target = 4.5): Rgb {
  let result = color
  for (let step = 0; step < 10; step += 1) {
    if (contrastRatio(result, background) >= target) break
    result = mix(result, WHITE, 0.16)
  }
  return result
}

/**
 * 实心品牌色背景上的文字色。
 *
 * 默认白字，只有白字实在看不清时（对比度低于 3，例如浅黄、浅粉品牌色）才改用深色字。
 * 用 3 而不是 4.5 是有意的：默认蓝色主色的白字对比度约 4.1，
 * 若按 4.5 判定，给主色传一次相同色值反而会改变原有观感。
 */
function readableOn(color: Rgb): string {
  const white = contrastRatio(WHITE, color)
  if (white >= 3) return '#ffffff'
  return toHex(mix(BLACK, WHITE, 0.24))
}

/** 由主色推导整套品牌变量，浅底跟随当前主题的表面色 */
function derivePrimaryTokens(color: Rgb, theme: 'light' | 'dark'): Record<string, string> {
  if (theme === 'dark') {
    const soft = mix(color, DARK_SURFACE, 0.84)
    return {
      '--ca-color-primary': toHex(color),
      '--ca-color-primary-hover': toHex(mix(color, WHITE, 0.18)),
      '--ca-color-primary-active': toHex(mix(color, WHITE, 0.3)),
      '--ca-color-primary-soft': toHex(soft),
      '--ca-color-primary-text': toHex(lightenUntilReadable(color, soft)),
      '--ca-color-primary-contrast': readableOn(color),
    }
  }
  const soft = mix(color, WHITE, 0.9)
  return {
    '--ca-color-primary': toHex(color),
    '--ca-color-primary-hover': toHex(mix(color, BLACK, 0.14)),
    '--ca-color-primary-active': toHex(mix(color, BLACK, 0.28)),
    '--ca-color-primary-soft': toHex(soft),
    '--ca-color-primary-text': toHex(darkenUntilReadable(color, soft)),
    '--ca-color-primary-contrast': readableOn(color),
  }
}

function resolvedTheme(): 'light' | 'dark' {
  if (currentTheme !== 'auto') return currentTheme
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyPrimaryTokens(): void {
  if (typeof document === 'undefined') return
  const style = document.documentElement.style
  if (!currentPrimary) {
    PRIMARY_TOKENS.forEach(token => style.removeProperty(token))
    return
  }
  const parsed = parseColor(currentPrimary)
  if (!parsed) return
  const tokens = derivePrimaryTokens(parsed, resolvedTheme())
  Object.entries(tokens).forEach(([token, value]) => style.setProperty(token, value))
}

/** auto 模式下跟随系统切换，只绑定一次 */
function watchSystemTheme(): void {
  if (currentTheme !== 'auto' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    mediaQuery?.removeEventListener('change', handleSystemThemeChange)
    mediaQuery = null
    return
  }
  if (mediaQuery) return
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', handleSystemThemeChange)
}

function handleSystemThemeChange(): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute(THEME_ATTRIBUTE, resolvedTheme())
  applyPrimaryTokens()
}

/**
 * 切换明暗主题。
 *
 * @param theme light 亮色、dark 暗色、auto 跟随系统（系统切换时自动更新）
 */
export function setTheme(theme: CaTheme): void {
  currentTheme = theme
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, resolvedTheme())
  }
  watchSystemTheme()
  // 品牌色的浅底与前景依赖当前主题，换主题后需要重算
  applyPrimaryTokens()
}

/** 当前设置的主题（auto 原样返回，不解析成实际明暗） */
export function getTheme(): CaTheme {
  return currentTheme
}

/** 当前实际生效的明暗：auto 会解析系统偏好 */
export function isDarkTheme(): boolean {
  return resolvedTheme() === 'dark'
}

/**
 * 设置品牌主色。
 *
 * 支持 `#rgb`、`#rrggbb`、`rgb()`/`rgba()`。只给一个色值即可，
 * hover、active、浅底、前景文字和实心背景上的文字色都会自动推导；
 * 传入无法解析的值时保持现状，不抛异常。
 */
export function setPrimaryColor(color: string): void {
  if (!parseColor(color)) return
  currentPrimary = color.trim()
  applyPrimaryTokens()
}

/** 当前品牌主色，未设置时返回空字符串（表示使用默认蓝色） */
export function getPrimaryColor(): string {
  return currentPrimary
}

/** 恢复默认品牌色 */
export function resetPrimaryColor(): void {
  currentPrimary = ''
  applyPrimaryTokens()
}

/**
 * 一次性初始化主题与品牌色，适合在应用入口调用。
 * 等价于依次调用 setTheme 与 setPrimaryColor。
 */
export function setupTheme(options: { theme?: CaTheme; primaryColor?: string } = {}): void {
  setTheme(options.theme ?? 'light')
  if (options.primaryColor) setPrimaryColor(options.primaryColor)
}
