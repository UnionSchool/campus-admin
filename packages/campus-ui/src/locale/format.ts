/**
 * 与语言相关的格式化。
 *
 * 统一走浏览器内置的 Intl，不再自己拼“年 / 月 / 日”，也不引第三方日期库：
 * 同一份代码在 zh-CN 下输出「2026年9月」，在 en-US 下输出「September 2026」。
 *
 * 传入无法识别的语言标记时回退到运行环境默认语言，不抛异常。
 */

/** 2026-09-07 是周一，用它推出七个星期标签 */
const BASE_MONDAY = new Date(2026, 8, 7)

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function dateFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  const cached = formatterCache.get(key)
  if (cached) return cached
  let formatter: Intl.DateTimeFormat
  try {
    formatter = new Intl.DateTimeFormat(locale, options)
  }
  catch {
    formatter = new Intl.DateTimeFormat(undefined, options)
  }
  formatterCache.set(key, formatter)
  return formatter
}

/**
 * 星期标签，按周一到周日返回七个值。
 * style 为 short 时是「周一 / Mon」，narrow 时是「一 / M」。
 */
export function weekdayLabels(locale: string, style: 'short' | 'narrow' = 'short'): string[] {
  const formatter = dateFormatter(locale, { weekday: style })
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2026, 8, 7 + index)))
}

/** 年月：2026年9月 / September 2026 */
export function formatMonth(date: Date, locale: string): string {
  return dateFormatter(locale, { year: 'numeric', month: 'long' }).format(date)
}

/** 月日：9月11日 / September 11 */
export function formatDay(date: Date, locale: string): string {
  return dateFormatter(locale, { month: 'long', day: 'numeric' }).format(date)
}

/** 数字与货币：统一走 Intl.NumberFormat，保证千分位与货币符号跟随语言 */
export function formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value)
  }
  catch {
    return new Intl.NumberFormat(undefined, options).format(value)
  }
}

export { BASE_MONDAY }
