/**
 * 后端统一返回结构。
 *
 * 所有接口固定返回这个外壳，**原样交给业务页面**：
 * - code：0 表示成功，其他值为业务错误码
 * - msg：提示文案，成功时通常为 success，失败时是给用户看的错误信息
 * - data：业务数据，可能是对象、数组，也可能为空
 * - count：分页总数，列表接口才有
 * - extra：附加数据，例如筛选条件回显、字典、统计等
 *
 * 页面里的判断方式固定为 `if (res.code === 0)`。
 */
export interface ApiEnvelope<T = unknown> {
  code: number
  msg: string
  data?: T
  /** 分页总数，列表接口使用 */
  count?: number
  /** 附加数据 */
  extra?: unknown
}

/** 查询参数值，数组会展开成重复键 */
export type QueryValue = string | number | boolean | null | undefined | Array<string | number>

export type Query = Record<string, QueryValue>

export interface RequestOptions {
  /** 覆盖默认 baseURL */
  baseURL?: string
  /** 查询参数，自动拼接到 URL 上 */
  query?: Query
  /** 请求头 */
  headers?: Record<string, string>
  /** 超时时间（毫秒） */
  timeout?: number
  /** 业务码校验，默认按 code !== 0 抛错 */
  skipEnvelopeCheck?: boolean
  /** 上传进度回调，仅 upload 使用 */
  onUploadProgress?: (event: { loaded: number; total?: number }) => void
}

/** 请求体：对象会由 axios 序列化成 JSON，FormData 原样发送 */
export type RequestBody = unknown

/** 上传参数 */
export interface UploadOptions extends Omit<RequestOptions, 'query'> {
  /** 单文件上传 */
  file?: Blob
  /** 多文件上传 */
  files?: Blob[]
  /** 文件字段名，默认 file */
  fileField?: string
  /** 单文件文件名 */
  fileName?: string
  /** 多文件文件名，与 files 顺序对应 */
  fileNames?: string[]
  /** 随文件一起提交的附加字段 */
  data?: Record<string, string | number | boolean>
  /** 上传进度，percent 为 0–100 */
  onProgress?: (progress: { loaded: number; total: number; percent: number }) => void
}
