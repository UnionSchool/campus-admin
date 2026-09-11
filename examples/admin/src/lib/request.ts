import axios from 'axios'
import type { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ApiError } from './error'
import type { ApiEnvelope, Query, RequestBody, RequestOptions, UploadOptions } from './types'
import { resolveMock } from './mock'

export interface RequestClientOptions {
  /** 接口前缀，通常由部署环境注入 */
  baseURL?: string
  /** 请求头，例如租户标识 */
  headers?: Record<string, string>
  /**
   * Token 提供者。
   * 用函数而不是直接存 token，便于接入 campus-auth 后自动跟随登录态变化。
   */
  tokenProvider?: () => string | undefined | null
  /** 业务成功码，默认 0 */
  successCode?: number
  /** 收到 401 时的处理，通常跳转登录 */
  onUnauthorized?: (error: ApiError) => void
  /** 是否输出请求日志，默认关闭 */
  debug?: boolean
  /**
   * 是否使用 mock 数据。
   * 默认跟随构建环境：开发环境走 mock，生产环境走真实接口。
   */
  mock?: boolean
}

/** 扩展 axios 配置，带上 mock 需要的元信息 */
interface CampusRequestConfig extends InternalAxiosRequestConfig {
  /** 业务侧声明的接口 uri，与 lib/mock 下的文件路径对应 */
  mockUri?: string
}

/**
 * 网络请求类（基于 axios）。
 *
 * 统一处理横切逻辑，业务接口只关心 url 与类型：
 * - 拼接 baseURL / query / token
 * - 超时、取消（AbortController）
 * - 按 `{ code, msg, data }` 拆包，直接返回 data
 * - 统一抛出 ApiError
 * - 开发环境按接口 uri 从 lib/mock 取演示数据，生产环境走真实接口
 */
export class RequestClient {
  private readonly http: AxiosInstance
  private readonly options: Required<Pick<RequestClientOptions, 'baseURL' | 'headers' | 'successCode' | 'debug' | 'mock'>> & RequestClientOptions

  /** 进行中的请求，用于主动取消 */
  private readonly pending = new Map<string, AbortController>()

  constructor(options: RequestClientOptions = {}) {
    this.options = {
      baseURL: options.baseURL ?? '',
      headers: options.headers ?? {},
      successCode: options.successCode ?? 0,
      debug: options.debug ?? false,
      // 默认按环境判断：开发环境走 mock，生产环境走真实接口
      mock: options.mock ?? import.meta.env.DEV,
      tokenProvider: options.tokenProvider,
      onUnauthorized: options.onUnauthorized,
    }

    this.http = axios.create({
      baseURL: this.options.baseURL,
      timeout: 15000,
      headers: this.options.headers,
    })

    this.setupInterceptors()
  }

  get baseURL() {
    return this.options.baseURL
  }

  get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({ ...options, method: 'GET', url })
  }

  post<T>(url: string, body?: RequestBody, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({ ...options, method: 'POST', url, data: body })
  }

  put<T>(url: string, body?: RequestBody, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({ ...options, method: 'PUT', url, data: body })
  }

  patch<T>(url: string, body?: RequestBody, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({ ...options, method: 'PATCH', url, data: body })
  }

  delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({ ...options, method: 'DELETE', url })
  }

  /**
   * 文件上传。
   *
   * 自动组装 FormData 并交给浏览器设置 multipart 边界；
   * 可通过 onProgress 展示上传进度，返回结构与其他接口一致。
   */
  upload<T>(url: string, options: UploadOptions): Promise<T> {
    const form = new FormData()
    const appendValue = (key: string, value: unknown) => {
      // 文件、Blob 直接 append；其余值统一转字符串，避免后端解析类型不一致
      if (value instanceof Blob) form.append(key, value, options.fileName)
      else if (value !== undefined && value !== null) form.append(key, String(value))
    }

    if (options.files?.length) {
      options.files.forEach((file, index) => {
        form.append(options.fileField ?? 'file', file, options.fileNames?.[index])
      })
    } else if (options.file) {
      form.append(options.fileField ?? 'file', options.file, options.fileName)
    }

    Object.entries(options.data ?? {}).forEach(([key, value]) => appendValue(key, value))

    return this.request<T>({
      ...options,
      method: 'POST',
      url,
      data: form,
      onUploadProgress: options.onProgress
        ? (event) => {
            if (event.total) options.onProgress?.({ loaded: event.loaded, total: event.total, percent: Math.round((event.loaded / event.total) * 100) })
          }
        : undefined,
    })
  }

  /** 取原始响应，用于下载文件或自定义解析 */
  requestRaw<T = unknown>(config: RequestOptions & { url: string; method?: string; data?: RequestBody }): Promise<AxiosResponse<T>> {
    return this.http.request<T>(this.toAxiosConfig(config))
  }

  /** 主动取消某个请求 */
  abort(method: string, url: string): void {
    this.pending.get(`${method.toUpperCase()} ${url}`)?.abort()
  }

  /** 取消所有进行中的请求，通常在路由切换或登出时调用 */
  abortAll(): void {
    this.pending.forEach(controller => controller.abort())
    this.pending.clear()
  }

  private async request<T>(config: RequestOptions & { method: string; url: string; data?: RequestBody }): Promise<T> {
    /**
     * 开发环境且存在同名 mock 文件时直接返回演示数据，不产生真实请求；
     * 生产环境（或没有对应 mock）走 axios 真实请求。
     * 判断集中在 request 内部，业务代码里的 url 始终只有一份。
     */
    if (this.options.mock) {
      const mocked = resolveMock(config.url)
      if (mocked !== undefined) {
        if (this.options.debug) console.log(`[request] ${config.method} ${config.url} -> mock`)
        return mocked as T
      }
    }

    const key = `${config.method.toUpperCase()} ${config.url}`
    const controller = new AbortController()
    this.pending.set(key, controller)

    try {
      const response = await this.http.request<ApiEnvelope<T> | T>({
        ...this.toAxiosConfig(config),
        signal: controller.signal,
      })
      return response.data as T
    } finally {
      this.pending.delete(key)
    }
  }

  /** 组装 axios 配置：query、headers、超时等 */
  private toAxiosConfig(config: RequestOptions & { method?: string; url: string; data?: RequestBody }): CampusRequestConfig {
    return {
      method: (config.method ?? 'GET') as AxiosRequestConfig['method'],
      url: config.url,
      data: config.data,
      params: config.query as Query,
      headers: { ...config.headers } as CampusRequestConfig['headers'],
      timeout: config.timeout,
      baseURL: config.baseURL,
      mockUri: config.url,
    } as CampusRequestConfig
  }

  /** 注入 token，并在开发环境打印请求日志 */
  private setupInterceptors(): void {
    this.http.interceptors.request.use((config) => {
      const token = this.options.tokenProvider?.()
      if (token) config.headers.Authorization = `Bearer ${token}`
      if (this.options.debug) {
        console.log(`[request] ${config.method?.toUpperCase()} ${config.url}`)
      }
      return config
    })

    this.http.interceptors.response.use(
      response => response,
      (error: AxiosError) => Promise.reject(this.toApiError(error)),
    )
  }

  /** 把 axios 错误统一成 ApiError，业务侧只需要判断一种错误类型 */
  private toApiError(error: AxiosError): ApiError {
    const payload = error.response?.data

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('请求超时，请稍后重试', { code: -2 })
    }
    if (!error.response) {
      return new ApiError('网络异常，请检查网络后重试', { code: -1 })
    }

    const status = error.response.status
    const apiError = new ApiError(this.messageOf(payload) ?? `请求失败（${status}）`, {
      status,
      code: this.codeOf(payload) ?? status,
      payload,
    })
    if (apiError.isUnauthorized) this.options.onUnauthorized?.(apiError)
    return apiError
  }

  private codeOf(payload: unknown): number | undefined {
    const code = (payload as ApiEnvelope<unknown> | undefined)?.code
    return typeof code === 'number' ? code : undefined
  }

  private messageOf(payload: unknown): string | undefined {
    if (typeof payload === 'string') return payload
    const msg = (payload as ApiEnvelope<unknown> | undefined)?.msg
    return typeof msg === 'string' ? msg : undefined
  }
}

/** 创建请求实例，配合 Provider 注册到容器 */
export function createRequestClient(options: RequestClientOptions = {}): RequestClient {
  return new RequestClient(options)
}
