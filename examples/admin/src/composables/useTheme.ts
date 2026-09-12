/**
 * 明暗主题开关。
 *
 * 真正的换肤动作在 campus-ui 的 setTheme() 里：它只往 <html> 写一个
 * `data-ca-theme` 属性，配色全部由 Token 决定，所以这里不需要维护任何样式。
 *
 * 本文件只负责三件事：
 * 1. 记住用户的选择（localStorage），刷新与下次访问都保持
 * 2. 把「当前是否暗色」暴露成响应式的 boolean，供开关组件绑定
 * 3. 首次访问没有本地记录时跟随系统偏好（prefers-color-scheme）
 */
import { computed, readonly, ref } from 'vue'
import { setTheme } from '@campus-admin/core'
import type { CaTheme } from '@campus-admin/core'

const STORAGE_KEY = 'campus:theme'

const MEDIA_QUERY = '(prefers-color-scheme: dark)'

/** 读取本地记录，值非法或浏览器禁用存储时返回 null */
function readStoredTheme(): CaTheme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' || value === 'auto' ? value : null
  }
  catch {
    return null
  }
}

function writeStoredTheme(theme: CaTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  }
  catch {
    // 隐私模式下写入会抛异常，此时只影响"记住选择"，不影响本次切换
  }
}

/** 系统是否偏好暗色，SSR 或浏览器不支持 matchMedia 时按亮色处理 */
function systemPrefersDark(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MEDIA_QUERY).matches
}

const theme = ref<CaTheme>(readStoredTheme() ?? 'auto')
const systemDark = ref(systemPrefersDark())

// auto 模式下由系统决定明暗，需要监听系统切换才能让开关状态跟着变
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window.matchMedia(MEDIA_QUERY).addEventListener('change', (event) => {
    systemDark.value = event.matches
  })
}

/** 当前实际生效的是不是暗色 */
const isDark = computed(() => theme.value === 'dark' || (theme.value === 'auto' && systemDark.value))

/** 切换主题并记住选择；传 'auto' 表示交还给系统偏好 */
function changeTheme(next: CaTheme): void {
  theme.value = next
  setTheme(next)
  writeStoredTheme(next)
}

/**
 * 应用启动时调用一次，把记住的主题写到 <html> 上。
 * 越早调用越好：放到 mount 之前可以避免首屏先亮色再变暗。
 */
export function initTheme(): void {
  setTheme(theme.value)
}

/** 主题开关：theme 只读，切换统一走 setTheme / toggleDark */
export function useTheme() {
  return {
    /** 当前设置：light / dark / auto（auto 原样返回，不代表实际明暗） */
    theme: readonly(theme),
    /** 当前实际是否暗色 */
    isDark,
    setTheme: changeTheme,
    /** 供开关组件使用：true 切暗色、false 切亮色 */
    toggleDark: (value: boolean) => changeTheme(value ? 'dark' : 'light'),
  }
}
