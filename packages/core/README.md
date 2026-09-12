# @campus-admin/core

Campus Admin 的框架层与装配入口：应用生命周期、服务容器、Vue 适配、全局命令式 API（`ca`）与组件装配。业务项目只装这一个包，就能拿到组件库、样式与国际化。

## 安装

```bash
pnpm add @campus-admin/core vue @lucide/vue
```

## 包结构

| 包 | 职责 | 依赖 |
| --- | --- | --- |
| `@campus-admin/icon` | 校园语义图标与后端图标名解析 | `@lucide/vue` |
| `@campus-admin/locale` | 国际化运行时：词条、取词、日期数字格式化 | `vue` |
| `@campus-admin/ui` | 组件库：27 个组件、设计 Token、主题 | `@campus-admin/locale`、`vue` |
| `@campus-admin/core` | 框架层 + 装配入口（本包） | 上面三个包 |

依赖只能向上，`ui` 不会反向依赖 `core`；这条约束由 `pnpm run check:boundaries` 强制。

## 快速开始

```ts
// main.ts
import { createApp } from 'vue'
import { createCampusAdmin } from '@campus-admin/core'
import '@campus-admin/core/style.css'
import App from './App.vue'

const app = createApp(App)

app.use(createCampusAdmin({
  name: '智慧校园',
  version: '1.0.0',
  config: {
    request: { baseURL: '/api' },
    locale: { locale: 'zh-CN', messages: { 'zh-CN': zhCN, 'en-US': enUS } },
  },
  providers: [requestProvider],
}))

app.mount('#app')
```

安装时框架自动完成：注册全部内置组件、注入应用实例、装载语言实例、挂载命令式 API 的弹层宿主，并把 `ca` 挂到 `window`。

## 全局命令式 API：ca

无需 import，页面里直接使用（需要类型提示时 `import { ca } from '@campus-admin/core'`）：

```ts
const loading = ca.loading('加载中')
loading.hide()

ca.toast('保存成功')          // 对勾
ca.toast('保存失败', false)   // 叉号

ca.alert('提示')
ca.alert('标题', '内容', () => { /* 点确定后执行 */ })

if (await ca.confirm('删除后不可恢复', '确定删除？')) { /* ... */ }
```

| API | 说明 |
| --- | --- |
| `ca.loading(text?)` | 加载动画，返回 `{ hide() }` |
| `ca.toast(text, success?)` | 轻提示，`success=false` 显示叉号；与组件库的 `toast.success()` 共用同一份队列 |
| `ca.alert(title, content?, onConfirm?)` | 提示框，单个确定按钮 |
| `ca.confirm(title, content?)` | 确认框，返回 `Promise<boolean>` |
| `ca.modal({ title, content, onConfirm })` | 通用弹层 |
| `ca.hideLoading()` | 兜底关闭加载动画（请求拦截器等场景） |

## 在组件里取应用实例

```vue
<script setup lang="ts">
import { useCampus } from '@campus-admin/core'

const campus = useCampus()
campus.config.get('request.baseURL')
</script>
```

## 接入业务能力（Provider）

能力以 Provider 形式装配进容器，业务通过 Facade 解析，不直接依赖实现：

```ts
import { defineProvider } from '@campus-admin/core'
import type { CampusContext } from '@campus-admin/core'

export const requestProvider = defineProvider({
  name: 'app:request',
  register(context: CampusContext) {
    context.bind('request', () => createRequestClient({
      baseURL: context.get<string>('request.baseURL', '/api'),
    }))
  },
})
```

```ts
import { campus } from '@campus-admin/core'

const request = campus<RequestClient>('request')   // 换实现时调用方不用改
```

## 从本包能 import 什么

- **内核**：`CampusApplication`、`createCampus`、`CampusContainer`、`CampusContext`、`defineProvider`、`definePlugin`、`campus()`、`CampusConfig` 等契约类型
- **Vue 适配**：`computed` / `ref` / `watch` / `inject` / `provide` 等响应式 API 出口、`useCampus()`、`CAMPUS_KEY`、`createVueApplication()`
- **命令式 API**：`ca`、`CaOverlayHost`、`showLoading` / `showToast` / `alert` / `confirm`
- **组件库**：全部 `CaXxx` 组件、`builtInComponents`、`ns` / `cx`、`setTheme` / `setPrimaryColor`
- **国际化**：`useLocale` / `setLocale` / `createLocale` / `caMessages`、`formatDay` / `formatMonth` / `weekdayLabels` / `formatNumber`
- **图标**：`Campus*` 语义图标、`resolveIcon()`、`iconRegistry`

## 生命周期

```text
created → register（所有 Provider 绑定服务）→ boot（初始化，可依赖其他服务）→ start（触发启动回调）
```

约定：**register 阶段不要调用别的服务**，因为无法保证对方已经注册完成；需要跨服务协作时放到 `boot`。

## 内核 API 速查

### createCampus(options)

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `name` / `version` | `string` | 应用名称与版本 |
| `config` | `object` | 业务配置，可自由扩展（`request`、`locale` 等） |
| `providers` | `CampusProvider[]` | 启动时注册的服务提供者 |
| `plugins` | `CampusPlugin[]` | 启动时装载的插件 |

### CampusContainer

| 方法 | 说明 |
| --- | --- |
| `bind(key, value \| factory)` | 绑定实例或工厂函数，单例语义 |
| `singleton(key, value)` | 同 `bind`，语义更明确的别名 |
| `make<T>(key)` | 解析服务，未注册返回 `undefined` |
| `resolve<T>(key)` | 解析服务，未注册抛错 |

## 设计约束（改代码前必读）

1. **依赖只能向上**：`icon`、`locale` 是底座，`ui` 只依赖 `locale`，`core` 依赖 `ui` / `locale` / `icon`；
2. **包源码不得反向依赖 `examples`**；
3. **源码里不出现构建工具**（Vite 配置只放包根目录）；
4. **契约优先**：业务依赖契约与 Facade，不依赖具体实现，替换实现时不改调用方。

以上 1–3 由 `pnpm run check:boundaries` 在门禁里强制。

## 相关包

- [`@campus-admin/ui`](../ui/README.md)：组件库
- [`@campus-admin/locale`](../locale/README.md)：国际化
- [`@campus-admin/icon`](../icon/README.md)：图标

## 版权

使用本项目时请保留版权信息（MIT 许可要求随副本保留版权声明）：

- 保留包内的 `LICENSE` 文件与版权声明；
- 保留页面页脚中的「Powered By 众校通 ®」与联系方式（示例用 `Copyright` 组件统一渲染）；
- 二次分发或修改后的版本，请在显著位置保留同样的版权声明。

---

Powered By 众校通 ®
