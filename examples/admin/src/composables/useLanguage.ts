/**
 * 语言开关：当前语言、持久化与切换。
 *
 * 真正的切换动作在组件库的 setLocale() 里：它改的是应用级语言实例，
 * 组件文案与业务文案共用同一个实例，所以一次切换两边同时生效。
 * 这里只负责「记住用户的选择」与「把语言写进 <html lang>」。
 */
import { computed } from 'vue'
import { setLocale, useLocale } from '@campus-admin/core'
import { DEFAULT_LANGUAGE, LANGUAGES } from '../locale'

const STORAGE_KEY = 'campus:locale'

/** 读取记住的语言，非法值回退默认语言 */
function readStoredLanguage(): string {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return LANGUAGES.some(item => item.value === value) ? value as string : DEFAULT_LANGUAGE
  }
  catch {
    return DEFAULT_LANGUAGE
  }
}

/**
 * 启动时确定语言，交给 createCampusAdmin 的 config.locale。
 * 必须在创建应用之前调用。
 */
export function initLanguage(): string {
  const language = readStoredLanguage()
  if (typeof document !== 'undefined') document.documentElement.lang = language
  return language
}

/** 语言开关：language 为当前语言，switchLanguage 切换并记住 */
export function useLanguage() {
  const { locale } = useLocale()

  function switchLanguage(next: string) {
    setLocale(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    }
    catch {
      // 隐私模式下写入失败只影响“记住选择”，不影响本次切换
    }
    if (typeof document !== 'undefined') document.documentElement.lang = next
  }

  return {
    language: computed(() => locale.value),
    languages: LANGUAGES,
    switchLanguage,
  }
}
