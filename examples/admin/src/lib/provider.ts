import { defineProvider } from '@unionschool/campus-admin'
import type { CampusContext } from '@unionschool/campus-admin'
import { createRequestClient } from './request'

/** 服务键：业务通过 campus('request') 取实例 */
export const REQUEST_KEY = 'request'

/**
 * 请求层 Provider。
 *
 * register 只做绑定，读取配置、注入 token、注册 401 处理；
 * 业务代码用 campus('request') 获取实例，而不是直接 import 具体实现，
 * 将来换成 campus-request 包时调用方无需改动。
 */
export const requestProvider = defineProvider({
  name: 'example:request',
  register(context: CampusContext) {
    context.bind(REQUEST_KEY, () => createRequestClient({
      baseURL: context.get<string>('request.baseURL', '/api'),
      tokenProvider: () => tokenStore.get(),
      mock: context.get<boolean>('request.mock', false),
      onUnauthorized: () => {
        // 演示环境只提示，真实项目在这里跳转登录并清理本地状态
        console.warn('[request] 未登录或登录已过期')
      },
      debug: context.get<boolean>('request.debug', false),
    }))
  },
})

/**
 * 简易 token 存储。
 * 后续接入 campus-auth 时替换为 auth 模块的实现即可，RequestClient 不需要改。
 */
export const tokenStore = {
  get(): string | undefined {
    return typeof localStorage === 'undefined' ? undefined : localStorage.getItem('campus_token') ?? undefined
  },
  set(token: string): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem('campus_token', token)
  },
  clear(): void {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('campus_token')
  },
}
