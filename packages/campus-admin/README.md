# @unionschool/campus-admin

智慧校园后台管理框架的完整入口。**业务项目通常只需要安装这一个包。**

它把下面三个包装配成可直接使用的 Vue 插件，并统一对外导出：

```text
@unionschool/campus-admin
├── @unionschool/campus-core        框架内核：容器、生命周期、契约（无框架依赖）
├── @unionschool/campus-framework   Vue 适配层 + 全局命令式 API
└── @unionschool/campus-ui          组件库（26 个组件）
```

## 安装

```bash
pnpm add @unionschool/campus-admin
```

peerDependencies：`vue@^3.5.42`、`@lucide/vue@^1.44.0`。

## 快速开始

```ts
// main.ts
import { createApp } from 'vue'
import { createCampusAdmin } from '@unionschool/campus-admin'
import '@unionschool/campus-admin/style.css'
import App from './App.vue'

const app = createApp(App)

const campus = createCampusAdmin({
  name: '众校通智慧校园',
  version: '1.0.0',
  config: {
    request: { baseURL: '/api' },
  },
  providers: [requestProvider],   // 你的服务提供者，见下方"接入业务能力"
})

app.use(campus)
app.mount('#app')
```

安装插件时会自动完成四件事：

1. 创建 Campus 应用并启动生命周期
2. 把 26 个组件注册为全局组件（模板里直接写 `<CaTable>`）
3. 挂载命令式 API 的渲染宿主到 `document.body`
4. 把 `ca` 挂到 `window`（已有同名全局对象时不覆盖）

## 全局命令式 API：ca

挂在 window 上，业务页面直接使用，不需要 import：

```js
// 加载动画：不支持并发，任意句柄 hide() 都会关闭
const loading = ca.loading('加载中')
loading.hide()

// 轻提示
ca.toast('保存成功')          // 成功，对勾图标
ca.toast('保存失败', false)   // 错误，叉号图标

// 提示框
ca.alert('提示')
ca.alert('标题', '提示内容')
ca.alert('标题', '提示内容', () => { /* 点确定后执行 */ })

// 确认框
if (await ca.confirm('删除后不可恢复', '确定删除该学生？')) { ... }

// 通用弹层
ca.modal({ title: '详情', content: '...', onConfirm: () => {} })
```

| 方法 | 签名 | 返回 |
| --- | --- | --- |
| `ca.loading` | `(text?: string)` | `{ hide(): void }` |
| `ca.toast` | `(text: string, success?: boolean)` | `void` |
| `ca.alert` | `(first, second?, third?)` | `void` |
| `ca.confirm` | `(first, second?)` | `Promise<boolean>` |
| `ca.modal` | `({ title?, content, onConfirm? })` | `void` |
| `ca.hideLoading` | `()` | `void` |

`alert` / `confirm` 的参数解析：**最后一个参数是函数时视为回调**。

需要类型提示时按需 import：

```ts
import { ca } from '@unionschool/campus-admin'
```

### 让 `ca` 在页面里直接可用

本包自带全局声明，业务项目只要 import 过 `@unionschool/campus-admin`，
就能在页面里直接写 `ca.toast('...')`，不需要自己声明：

```vue
<script setup lang="ts">
// 无需 import，ca 是全局的
function save() {
  const loading = ca.loading('保存中')
  // ...
  loading.hide()
  ca.toast('保存成功')
}
</script>
```

**注意**：如果项目的 tsconfig 指定了 `"types"` 白名单（Vite 模板默认是 `["vite/client"]`），
需要把本包加进去，否则声明文件不会被加载：

```json
{
  "compilerOptions": {
    "types": ["vite/client", "@unionschool/campus-admin"]
  }
}
```

另一种做法是在项目里建一个 `src/types/global.d.ts`，并确保它在 tsconfig 的 `include` 范围内：

```ts
import type { ca as CaInstance } from '@unionschool/campus-admin'

declare global {
  const ca: typeof CaInstance
  interface Window { ca?: typeof CaInstance }
}

export {}
```

## 接入业务能力（Provider）

框架只提供"怎么装配"，不规定"装什么"。请求、鉴权、权限等能力由业务侧实现，
通过 Provider 注册进容器：

```ts
// src/lib/provider.ts
import { defineProvider } from '@unionschool/campus-admin'

export const REQUEST_KEY = 'request'

export const requestProvider = defineProvider({
  name: 'my:request',
  register(context) {
    context.bind(REQUEST_KEY, () => createRequestClient({
      baseURL: context.get<string>('request.baseURL', '/api'),
    }))
  },
})
```

业务代码通过 Facade 取服务，而不是 import 具体实现：

```ts
import { campus } from '@unionschool/campus-admin'

const request = campus<RequestClient>('request')
```

好处：将来把实现换成独立包时，所有调用方都不用改。

## 从主包能 import 什么

```ts
// 组件（26 个）
import { CaButton, CaTable, CaSideMenu, toast } from '@unionschool/campus-admin'
import type { TableColumn, SideMenuItem } from '@unionschool/campus-admin'

// 框架内核：容器、生命周期、Facade、契约
import { CampusApplication, createCampus, defineProvider, definePlugin, campus } from '@unionschool/campus-admin'
import type { CampusProvider, CampusPlugin, CampusApplicationOptions } from '@unionschool/campus-admin'

// Vue 适配层：响应式 API、useCampus、ca
import { ref, computed, useCampus, CaOverlayHost } from '@unionschool/campus-admin'

// 全局命令式 API
import { ca } from '@unionschool/campus-admin'
```

## 新建一个业务页面

示例项目里的约定流程（`examples/admin`）：

```text
1. 定路径            页面路径 = 菜单层级，例如 /teach/course/textbook
2. lib/api/xxx.ts    声明 url 与返回类型
3. lib/mock/...      按接口 uri 建演示数据（可选）
4. pages/...vue      写页面，组件从 campus-admin 拿
5. 菜单接口           后端下发 path，前端不写路由表
```

页面骨架：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { CaPageHeader, CaTable, toast } from '@unionschool/campus-admin'

const loading = ref(true)
const list = ref([])

async function load() {
  loading.value = true
  try {
    const res = await getTextbookPage({ page: 1 })
    if (res.code === 0) {
      list.value = res.data ?? []
      return
    }
    toast.error(res.msg || '加载失败')
  } catch {
    toast.error('网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}

void load()
</script>
```

## 统一返回格式约定

后端接口固定返回这个结构，**request 不做拆包，页面自己判断 `code`**：

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
| `msg` | 是 | 提示文案；失败时为给用户看的信息 |
| `count` | 否 | **仅分页接口返回**的总数 |
| `extra` | 否 | 附加数据，例如筛选回显、字典、统计 |

页面判断方式固定为：

```ts
if (res.code === 0) {
  list.value = res.data ?? []
  total.value = res.count ?? res.data?.length ?? 0
} else {
  toast.error(res.msg)
}
```

## 相关包

| 包 | 说明 |
| --- | --- |
| [`campus-core`](../campus-core) | 内核，无框架依赖 |
| [`campus-framework`](../campus-framework) | Vue 适配层与 `ca` |
| [`campus-ui`](../campus-ui) | 组件库与主题 Token |
