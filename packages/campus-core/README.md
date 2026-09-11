# @unionschool/campus-core

智慧校园框架的内核：应用生命周期、服务容器、配置与契约。

**这个包不依赖 Vue、Vite 或任何 UI 库**，可以在浏览器、Node、小程序等任意环境使用。
需要与 Vue 集成时用 [`@unionschool/campus-framework`](../campus-framework)。

## 安装

```bash
pnpm add @unionschool/campus-core
```

## 何时使用

- 需要一套统一的应用启动流程（注册服务 → 启动 → 使用）
- 需要在不引入框架的前提下共享业务能力（请求、鉴权、权限）
- 做非 Vue 终端（小程序、Node 脚本、Electron 主进程）时复用同一套装配方式

只写 Vue 页面的话，直接用 [`@unionschool/campus-admin`](../campus-admin) 即可。

## 快速开始

```ts
import { createCampus, defineProvider } from '@unionschool/campus-core'

/** 服务提供者：register 只做绑定，boot 才能依赖其他服务 */
const requestProvider = defineProvider({
  name: 'request',
  register(context) {
    context.bind('request', () => createRequestClient(context.get('request.baseURL', '/api')))
  },
  boot(context) {
    // 此时所有 register 都已执行，可以安全解析其他服务
    context.resolve<RequestClient>('request')
  },
})

const campus = createCampus({
  name: '众校通智慧校园',
  version: '1.0.0',
  config: { request: { baseURL: '/api' } },
  providers: [requestProvider],
})

campus.start()

// 用 Facade 取服务，而不是 import 具体实现
const request = campus<RequestClient>('request')
```

## 生命周期

```text
created → register（所有 Provider 绑定服务）→ boot（初始化，可依赖其他服务）→ start（触发启动回调）
```

与 Laravel 的 Service Provider 一致：**register 阶段不要调用别的服务**，
因为无法保证对方已经注册完成；需要跨服务协作时放到 `boot`。

## API

### createCampus(options)

创建应用实例，等价于 `new CampusApplication(options)`。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | `'Campus Admin'` | 应用名称 |
| `version` | `string` | `'0.0.0'` | 应用版本 |
| `config` | `object` | — | 业务配置，可自由扩展 |
| `providers` | `CampusProvider[]` | — | 启动时注册的服务提供者 |
| `plugins` | `CampusPlugin[]` | — | 启动时装载的插件 |

### CampusApplication

| 成员 | 说明 |
| --- | --- |
| `container` | 服务容器 |
| `context` | 应用上下文，读写配置与解析服务 |
| `providers` / `plugins` | 已注册的提供者与插件 |
| `lifecycle` | 当前阶段：`created` / `registered` / `booted` / `started` |
| `register(provider)` | 注册服务提供者，立即执行 `register` |
| `use(plugin)` | 装载插件 |
| `start()` | 执行所有 `boot` 并触发启动回调 |
| `started(callback)` | 注册启动回调，等价于 Laravel 的 `booted` |

### CampusContainer

| 方法 | 说明 |
| --- | --- |
| `bind(key, value \| factory)` | 绑定实例或工厂函数，单例语义 |
| `singleton(key, value)` | 同 `bind`，保留 Laravel 命名习惯 |
| `make<T>(key)` | 解析服务，未注册返回 `undefined` |
| `resolve<T>(key)` | 解析服务，未注册抛错 |
| `has(key)` / `forget(key)` | 判断存在 / 移除绑定（测试用） |

工厂函数只在首次解析时执行，结果会被缓存——`bind('request', () => create())`
不会每次都新建实例。

### CampusContext

在 Provider 的 `register` / `boot` 中拿到，用于读写配置与解析服务。

```ts
context.get<string>('request.baseURL', '/api')   // 支持点号路径与默认值
context.set('request.timeout', 15000)            // 写运行时配置
context.bind('user', currentUser)
context.resolve<User>('user')
```

### campus()

Facade，业务代码用它取服务，而不是直接 import 实现。

```ts
import { campus } from '@unionschool/campus-core'

const request = campus<RequestClient>('request')   // 取服务
const app = campus()                                // 不传参返回应用实例
```

使用前需要先 `setCurrentCampus(application)`，`campus-admin` 会自动调用。

## 契约

```ts
interface CampusProvider {
  readonly name: string
  register?(context: CampusContext): void
  boot?(context: CampusContext): void
}

interface CampusPlugin {
  readonly name: string
  install(context: CampusContext): void
}

interface CampusConfig {
  name: string
  version: string
  [key: string]: unknown    // 业务配置自由扩展
}
```

Provider 的 `name` 用于去重：同名提供者重复注册会被忽略。

## 设计约束（改代码前必读）

1. **不得导入 Vue、Vite、UI 库或任何 `.vue` 文件**。
   `scripts/check-boundaries.mjs` 在 CI 中强制校验，违反直接构建失败。
2. **不得依赖其他 `@unionschool/*` 包**，保证它永远是最底层。
3. 业务代码通过服务键（字符串）解析服务，不要直接 import 具体实现——
   这样替换实现时调用方不用改。

## 相关包

| 包 | 关系 |
| --- | --- |
| [`campus-framework`](../campus-framework) | 依赖本包，提供 Vue 适配与全局 `ca` API |
| [`campus-ui`](../campus-ui) | 通过 framework 间接使用本包 |
| [`campus-admin`](../campus-admin) | 装配全部包，业务项目通常只装它 |
