/**
 * 业务语言包入口。
 *
 * 这里只做一件事：把业务词条按语言整理好，交给框架（createCampusAdmin 的 config.locale），
 * 由框架与组件库内置的 ca.* 词条深合并到同一个语言实例里。
 *
 * 为什么不是自己再建一个 i18n 实例：vue-i18n 安装时用同一个注入键，
 * 后安装的实例会把先安装的整个顶掉，组件里 useI18n() 只会拿到最后一个实例。
 * 两套词库、一个实例，是唯一不冲突的形态。
 */
import type { LocaleMessageMap } from '@campus-admin/core'
import zhCN from './zh-CN'
import enUS from './en-US'

export const businessMessages: LocaleMessageMap = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

/** 语言切换器使用的语言列表 */
export const LANGUAGES = [
  { value: 'zh-CN', label: '中文', short: '中' },
  { value: 'en-US', label: 'English', short: 'EN' },
] as const

export const DEFAULT_LANGUAGE = 'zh-CN'
