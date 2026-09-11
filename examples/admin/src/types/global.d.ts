import type { ca as CaInstance } from '@unionschool/campus-admin'

/**
 * 全局命令式 API 的类型声明。
 *
 * ca 在运行时由 createCampusAdmin() 挂到 window 上，
 * 这里补上类型，页面里就能直接写 `ca.toast('...')` 而不用 import，
 * 也不必写成 window.ca（两种写法都支持）。
 */
declare global {
  /** 全局命令式 API，见 @unionschool/campus-admin 的 README */
  const ca: typeof CaInstance

  interface Window {
    ca?: typeof CaInstance
  }
}

export {}
