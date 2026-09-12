import { campus } from '@campus-admin/core'
import type { RequestClient } from './request'
import { REQUEST_KEY } from './provider'

/**
 * 取请求实例。
 *
 * 用 Facade 从容器解析而不是直接 import 单例，
 * 这样将来把实现换成 campus-request 包时，各业务接口文件不需要改。
 */
export function useRequest(): RequestClient {
  return campus<RequestClient>(REQUEST_KEY)
}

/** 业务码约定：与后端保持一致，集中在这里便于对照 */
export const API_CODE = {
  success: 0,
  unauthorized: 401,
  forbidden: 403,
} as const
