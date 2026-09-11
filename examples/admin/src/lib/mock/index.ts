/**
 * mock 数据。
 *
 * 约定：文件路径 = 业务定义的接口 uri，request 内部按 uri 查找，
 * 业务代码里的 url 始终只有一份，不写环境判断。
 *
 *   lib/mock/card/account/record/page.json  →  请求 /card/account/record/page
 *   lib/mock/student/page.json              →  请求 /student/page
 *
 * json 里只写 data 的内容，不需要包一层 { code, msg, data }。
 *
 * 注意：mock 文件是极少数允许使用非全局注册导入类名的地方——
 * 带连字符或全小写的文件名无法作为合法的 JS 标识符，因此这里统一用
 * 作用域变量配合 glob 自动收集，不逐个手写 import。
 */

/** 收集所有 mock 数据，key 由文件路径转成接口 uri */
const files = import.meta.glob<{ default: unknown }>('./**/*.json', { eager: true })

/** 文件路径 → 接口 uri：./card/account/record/page.json → card/account/record/page */
function toUri(key: string): string {
  return key
    .replace(/^\.\//, '')
    .replace(/\.json$/, '')
}

/** uri → 演示数据 */
export const mockData: Record<string, unknown> = Object.fromEntries(
  Object.entries(files).map(([key, mod]) => [toUri(key), mod.default]),
)

/** 去掉 query 与首尾斜杠，保证 /card/... 与 card/... 都能命中 */
function normalizeUri(uri: string): string {
  return uri.split('?')[0]!.replace(/^\/+/, '').replace(/\/+$/, '')
}

/** 按接口 uri 取演示数据，没有配置时返回 undefined */
export function resolveMock(uri: string): unknown {
  return mockData[normalizeUri(uri)]
}
