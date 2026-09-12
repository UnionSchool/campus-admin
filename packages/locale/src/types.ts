/**
 * 国际化类型契约。
 *
 * 结构与 vue-i18n 的 messages 保持一致（嵌套对象、{name} 插值），
 * 因此内置词条可以直接交给业务侧 mergeLocaleMessage，不需要转换格式。
 */
import type { Ref } from 'vue'

/** 词条树：键为语义名，值为字符串或下一层节点 */
export interface LocaleMessages {
  [key: string]: string | LocaleMessages
}

/** 词条集合：按语言标记分组，例如 { 'zh-CN': {...}, 'en-US': {...} } */
export type LocaleMessageMap = Record<string, LocaleMessages>

/**
 * 取词函数。
 * 签名与 vue-i18n 的 t() 对齐：第二个参数是插值变量；
 * 找不到词条时原样返回 key，便于在页面上直接看出漏翻。
 */
export type TranslateFn = (key: string, params?: Record<string, string | number>) => string

export interface CaLocaleOptions {
  /** 当前语言，默认 zh-CN */
  locale?: string
  /** 兜底语言，当前语言缺词条时使用，默认 zh-CN */
  fallbackLocale?: string
  /** 业务词条，按语言分组追加到内置词条之上（深合并） */
  messages?: LocaleMessageMap
}

/** 语言实例：组件与业务都通过它取词 */
export interface CaLocale {
  /** 当前语言，可写，写入即切换 */
  locale: Ref<string>
  /** 兜底语言 */
  fallbackLocale: Ref<string>
  /** 取词 */
  t: TranslateFn
  /**
   * 词条是否存在，签名与 vue-i18n 的 te() 一致。
   * 用于「有词条就用词条，没有就用后端下发的默认文案」这类场景。
   */
  te: (key: string) => boolean
  /** 切换语言 */
  setLocale: (locale: string) => void
  /** 追加词条（深合并，同路径覆盖），用于登录后下发业务词条 */
  mergeMessages: (locale: string, messages: LocaleMessages) => void
  /** 读取某语言的原始词条，便于业务侧合并进 vue-i18n */
  getMessages: (locale: string) => LocaleMessages
}

/**
 * 组件库在应用配置里的国际化字段。
 * 业务这样交给框架（见 examples/admin）：
 * createCampusAdmin({ config: { locale: { locale: 'zh-CN', messages: {...} } } })
 */
export interface CaLocaleConfig extends CaLocaleOptions {}
