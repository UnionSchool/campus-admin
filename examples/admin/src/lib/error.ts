/**
 * 统一的请求异常。
 * 业务代码只需要判断 instance of ApiError 并读取 code，不必解析各种错误结构。
 */
export class ApiError extends Error {
  /** HTTP 状态码，网络异常时为 0 */
  readonly status: number
  /** 业务码，对应返回结构的 code */
  readonly code: number
  /** 原始响应数据，便于排查 */
  readonly payload?: unknown

  constructor(message: string, options: { status?: number; code?: number; payload?: unknown } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? 0
    this.code = options.code ?? -1
    this.payload = options.payload
  }

  /** 常见错误判断 */
  get isUnauthorized() {
    return this.status === 401 || this.code === 401
  }

  get isForbidden() {
    return this.status === 403 || this.code === 403
  }

  get isTimeout() {
    return this.code === -2
  }

  get isNetworkError() {
    return this.status === 0 && this.code === -1
  }
}
