/**
 * 全局命令式 API 的类型声明。
 *
 * 运行时由 createCampusAdmin() 把 ca 挂到 window 上（见 src/plugin.ts 的 exposeGlobalCa），
 * 这里补上类型，业务项目只要 import 过 @campus-admin/core，
 * 就能直接写 `ca.toast('...')`，不需要额外声明，也不必写成 window.ca。
 *
 * 若业务项目的 tsconfig 指定了 `"types"` 白名单（例如 ["vite/client"]），
 * 需要在数组里加上 "@campus-admin/core"。
 */
import type { ca as CaInstance } from '../dist/index'

declare global {
  /** 全局命令式 API */
  const ca: typeof CaInstance

  interface Window {
    ca?: typeof CaInstance
  }
}

export {}
