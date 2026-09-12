# lib 目录说明

与页面无关的基础能力与业务接口封装。

```text
lib/
├── types.ts            # 后端统一返回结构 { code, msg, data } 与请求参数类型
├── error.ts            # ApiError：携带 HTTP 状态码与业务码
├── request.ts          # RequestClient 网络请求类
├── provider.ts         # 把请求实例注册进 campus 容器，并提供 token 存储
├── request-helper.ts   # useRequest()：从容器取请求实例
└── api/                # 按业务场景拆分的接口定义
    ├── card.ts         # 校园一卡通
    ├── student.ts      # 学生管理
    └── notice.ts       # 通知公告
```

## 分层关系

```text
页面 / 组件
    ↓  只依赖接口函数的类型
lib/api/*.ts          按场景定义的接口函数
    ↓  useRequest()
lib/request.ts        统一处理 URL、token、超时、拆包、错误
    ↓  fetch
后端 API
```

组件不直接调用 `lib/api`，而是通过 Provider 装配（`src/services/*.ts`），
这样可以替换实现而不影响页面。

## RequestClient 负责什么

底层用 axios，统一处理这些横切逻辑：

| 能力 | 说明 |
| --- | --- |
| baseURL | 由配置注入，`config.request.baseURL` |
| token | 请求拦截器通过 `tokenProvider` 动态获取，登录态变化自动生效 |
| 查询参数 | `query` 交给 axios `params`，空值自动跳过 |
| 超时 | 默认 15 秒，可用 `timeout` 覆盖 |
| 取消 | 基于 AbortController，`abort(method, url)` / `abortAll()` |
| 返回结构 | 原样返回 `{ code, msg, data, count?, extra? }`，由业务页面判断 `code` |
| 错误 | 响应拦截器把 axios 错误统一转成 `ApiError`（含 status 与 code） |
| 401 | 触发 `onUnauthorized`，统一跳登录 |
| mock | 开发环境按接口 uri 从 `lib/mock` 取演示数据，生产环境走真实接口 |

## 统一返回格式

```json
{
  "code": 0,
  "msg": "success",
  "data": {},
  "count": 12,
  "extra": {}
}
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `code` | 是 | `0` 成功，其他为业务错误码 |
| `msg` | 是 | 提示文案；失败时为给用户看的错误信息 |
| `data` | 否 | 业务数据，对象或数组 |
| `count` | 否 | **仅分页接口返回**的总数 |
| `extra` | 否 | 附加数据，例如筛选回显、字典、统计 |

## 业务页面怎么用

request **不做拆包**，接口函数返回的就是完整外壳，页面自己判断：

```ts
import { getStudentPage } from '@/lib/api/student'
import { toast } from '@campus-admin/core'

async function load() {
  const res = await getStudentPage({ page: 1, pageSize: 10 })

  // 统一用 code === 0 判断是否有数据
  if (res.code === 0) {
    list.value = res.data ?? []
    total.value = res.count ?? 0   // count 只有分页接口才有
    return
  }

  // 失败时直接用后端返回的 msg 提示
  toast.error(res.msg || '加载失败')
}
```

```ts
// 参考实现：examples/admin/src/composables/useStudentList.ts
const res = await getStudentPage(query)
if (res.code === 0) {
  list.value = res.data ?? []
  total.value = res.count ?? res.data?.length ?? 0
} else {
  toast.error(res.msg)
}
```

只有**连响应体都拿不到**的异常才会抛错——网络错误、超时、HTTP 非 2xx，
统一是 `ApiError`，可结合 `error.isTimeout` / `error.isNetworkError` 做重试或提示。

## 方法与签名

```ts
request.get<T>(url, { query?, headers?, timeout? })
request.post<T>(url, body?, options?)
request.put<T>(url, body?, options?)
request.patch<T>(url, body?, options?)
request.delete<T>(url, options?)
request.upload<T>(url, { file | files, fileField?, data?, onProgress? })
request.requestRaw<T>({ url, method?, data?, query? })   // 取原始响应，用于下载
request.abort(method, url) / request.abortAll()
```

上传示例：

```ts
await request.upload<{ url: string }>('/file/upload', {
  file: fileInput.files[0],
  fileField: 'file',
  data: { bizType: 'student-import' },
  onProgress: ({ percent }) => { progress.value = percent },
})
```

## 用法

```ts
import { fetchCardBalance, fetchCardRecords } from '@/lib/api/card'

const balance = await fetchCardBalance(studentId)
const page = await fetchCardRecords({ studentId, type: 'consume', page: 1, pageSize: 20 })
```

错误处理：

```ts
import { ApiError } from '@/lib/error'

try {
  await rechargeCard({ studentId, amount: 200, channel: 'wechat' })
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isUnauthorized) return
    toast.error(error.message)
  }
}
```

需要拿原始 Response（下载文件等）时用 `requestRaw`。

## 新增一个业务场景

1. 在 `lib/api/` 新建文件，例如 `attendance.ts`
2. 定义该场景的类型与接口函数
3. 页面或 `services/` 里通过 `useRequest()` 调用

一个业务域一个文件，不要把所有接口堆进同一个文件。

## 接入真实后端

各接口文件里已经写好了真实调用写法，与 mock 一一对应。
接入时把注释掉的 `useRequest().get(...)` 替换掉 mock 返回值即可，**函数签名不变**，页面无需改动。

充值、缴费这类资金接口要注意：

- 后端按流水号做幂等，前端不要自己生成唯一约束
- 提交按钮必须带 loading 防重复点击
- 失败后要能查到订单状态，不能只依赖前端提示
