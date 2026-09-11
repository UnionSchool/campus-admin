/**
 * 组件库国际化。
 *
 * 设计要点（与框架分层规范一致）：
 * 1. 不依赖 vue-i18n：组件库的 peerDependencies 只有 vue 与 @lucide/vue，
 *    引入 i18n 运行时会让所有使用方被迫接受一个额外依赖；
 * 2. 但公共接口按 vue-i18n 的形状设计：嵌套词条、{name} 插值、找不到返回 key、
 *    ca 命名空间。业务想用 vue-i18n 时，把 caMessages 合并进自己的实例即可：
 *
 *      import { caMessages } from '@unionschool/campus-admin'
 *      i18n.global.mergeLocaleMessage('zh-CN', caMessages['zh-CN'])
 *
 * 3. 组件通过 useLocale() 取词，注入不到实例时回退到内置的 zh-CN 默认实例，
 *    因此单独使用组件库（不装 campus-admin、不装 vue-i18n）也能正常工作。
 *
 * ca 是组件库保留的命名空间，业务词条请放在其他根键下（例如 app.、menu.）。
 */
import { inject, provide, ref } from '@unionschool/campus-framework'
import type { App, InjectionKey, Ref } from '@unionschool/campus-framework'
import zhCN from './lang/zh-CN'
import enUS from './lang/en-US'
import type { CaLocale, CaLocaleOptions, LocaleMessages, LocaleMessageMap, TranslateFn } from './types'

export * from './format'
export type { CaLocale, CaLocaleConfig, CaLocaleOptions, LocaleMessages, LocaleMessageMap, TranslateFn } from './types'

/** 默认语言 */
export const DEFAULT_LOCALE = 'zh-CN'

/** 内置支持的语言，业务可以在此基础上追加 */
export const AVAILABLE_LOCALES = ['zh-CN', 'en-US'] as const

/**
 * 组件库内置词条，按语言分组。
 * 结构与 vue-i18n 的 messages 一致，业务可以直接 mergeLocaleMessage 合并。
 */
export const caMessages: LocaleMessageMap = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

/** 语言实例的注入键，业务替换实现时使用 */
export const CA_LOCALE_KEY: InjectionKey<CaLocale> = Symbol('ca-locale')

/** 开发环境下提示漏翻的键，同一个键只提示一次 */
const warnedKeys = new Set<string>()

const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true

function warnMissing(key: string): void {
  if (!isDev || warnedKeys.has(key)) return
  warnedKeys.add(key)
  console.warn(`[campus-ui] 缺少词条：${key}`)
}

/** 深拷贝词条树，避免运行时写入污染内置语言包 */
function cloneMessages(messages: LocaleMessages): LocaleMessages {
  const result: LocaleMessages = {}
  Object.entries(messages).forEach(([key, value]) => {
    result[key] = typeof value === 'string' ? value : cloneMessages(value)
  })
  return result
}

/** 深合并：只在同路径的叶子词条上覆盖，兄弟键保留 */
function mergeMessages(target: LocaleMessages, source: LocaleMessages): LocaleMessages {
  const result = cloneMessages(target)
  Object.entries(source).forEach(([key, value]) => {
    const current = result[key]
    result[key] = typeof value === 'string' || typeof current !== 'object'
      ? value
      : mergeMessages(current, value)
  })
  return result
}

/**
 * 按 'a.b.c' 取词条，取到非字符串节点时视为未命中。
 * 包内需要“取默认语言文案”的地方（例如考勤状态词典的兜底 label）也用它。
 */
export function lookupMessage(messages: LocaleMessages, key: string): string | undefined {
  let node: string | LocaleMessages | undefined = messages
  for (const part of key.split('.')) {
    if (typeof node !== 'object') return undefined
    node = node[part]
  }
  return typeof node === 'string' ? node : undefined
}

/** {name} 插值，未提供对应变量时保留占位符，便于发现漏传 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => (
    name in params ? String(params[name]) : placeholder
  ))
}

/**
 * 查找顺序：当前语言 → 当前语言的主语言（zh-CN → zh）→ 兜底语言 → 兜底语言的主语言。
 * 与 vue-i18n 的回退行为保持一致。
 */
function resolve(
  messages: LocaleMessageMap,
  locale: string,
  fallbackLocale: string,
  key: string,
): string | undefined {
  const chain = [locale, locale.split('-')[0], fallbackLocale, fallbackLocale.split('-')[0]]
  for (const item of chain) {
    if (!item) continue
    const found = lookupMessage(messages[item] ?? {}, key)
    if (found !== undefined) return found
  }
  return undefined
}

/**
 * 创建语言实例。
 * 内置 zh-CN / en-US 词条，options.messages 里的业务词条深合并在其上。
 */
export function createLocale(options: CaLocaleOptions = {}): CaLocale {
  const locale = ref(options.locale ?? DEFAULT_LOCALE)
  const fallbackLocale = ref(options.fallbackLocale ?? DEFAULT_LOCALE)
  const messages = ref<LocaleMessageMap>(cloneAll(caMessages, options.messages))

  const t: TranslateFn = (key, params) => {
    const value = resolve(messages.value, locale.value, fallbackLocale.value, key)
    if (value === undefined) {
      warnMissing(key)
      return key
    }
    return interpolate(value, params)
  }

  return {
    locale,
    fallbackLocale,
    t,
    te(key: string) {
      return resolve(messages.value, locale.value, fallbackLocale.value, key) !== undefined
    },
    setLocale(next: string) {
      locale.value = next
    },
    mergeMessages(target, next) {
      messages.value = { ...messages.value, [target]: mergeMessages(messages.value[target] ?? {}, next) }
    },
    getMessages(target) {
      return cloneMessages(messages.value[target] ?? {})
    },
  }
}

/** 合并内置词条与业务词条，逐语言深合并 */
function cloneAll(builtin: LocaleMessageMap, custom?: LocaleMessageMap): LocaleMessageMap {
  const result: LocaleMessageMap = {}
  Object.keys(builtin).forEach((key) => {
    result[key] = cloneMessages(builtin[key] as LocaleMessages)
  })
  Object.entries(custom ?? {}).forEach(([key, value]) => {
    result[key] = mergeMessages(result[key] ?? {}, value)
  })
  return result
}

/**
 * 当前生效的语言实例。
 * 默认是内置实例，应用安装（campus-admin / CampusUI）后指向应用实例，
 * 这样 setLocale / getLocale 这类非 setup 场景的入口也能拿到正确的对象。
 */
let currentLocale: CaLocale = createLocale()

/**
 * 把语言实例注入到应用，并设为当前实例。
 * campus-admin 与 CampusUI 插件在 install 时调用。
 */
export function installLocale(app: App, locale: CaLocale): void {
  app.provide(CA_LOCALE_KEY, locale)
  currentLocale = locale
}

/** 当前语言实例，非 setup 场景（路由、请求拦截器）使用 */
export function getCurrentLocale(): CaLocale {
  return currentLocale
}

/** 切换当前实例的语言 */
export function setLocale(locale: string): void {
  currentLocale.setLocale(locale)
}

/** 当前语言 */
export function getLocale(): string {
  return currentLocale.locale.value
}

/** 当前语言的响应式引用，需要跟随语言变化时使用 */
export function useLocaleRef(): Ref<string> {
  return currentLocale.locale
}

/**
 * 组件内取词。返回当前应用的语言实例，注入不到时回退到内置实例。
 * 必须在 setup 中调用（内部使用 inject）。
 */
export function useLocale(): CaLocale {
  return inject(CA_LOCALE_KEY, currentLocale)
}

/** 仅 setup 中可用：向子组件提供语言实例（一般由应用安装时统一处理） */
export function provideLocale(locale: CaLocale): void {
  provide(CA_LOCALE_KEY, locale)
}
