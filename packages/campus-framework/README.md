# @unionschool/campus-framework

Campus 框架与 Vue 之间的适配层。

**这是整个项目里唯一允许 `import 'vue'` 的包。** 升级 Vue 时只需要检查这里，
`campus-core`、`campus-ui` 和所有业务代码都不用动。

## 安装

```bash
pnpm add @unionschool/campus-framework
```

通常不需要单独安装——[`@unionschool/campus-admin`](../campus-admin) 已经包含它。

## 它提供什么

| 能力 | 用途 |
| --- | --- |
| Vue API 统一出口 | 组件和库代码从这里取 `ref`、`computed`、生命周期，不直接依赖 vue |
| 命令式 API（`ca`） | `ca.toast()`、`ca.alert()`、`ca.loading()` 等全局方法 |
| 弹层渲染宿主 | `CaOverlayHost`，由 `campus-admin` 自动挂载，业务方无需关心 |
| 应用桥接 | 把 core 的生命周期接成 Vue 插件 |
| `useCampus()` | 在组件里取 Campus 应用实例 |

## 用法一：Vue API 出口（库/组件代码）

组件里不写 `import { ref } from 'vue'`，而是：

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from '@unionschool/campus-framework'

const count = ref(0)
const double = computed(() => count.value * 2)
</script>
```

这样 Vue 大版本升级时，改动面收敛到本包的一个文件。

可用的导出（全部转发自 vue）：

```text
computed, createApp, defineAsyncComponent, defineComponent, inject, nextTick,
onBeforeUnmount, onMounted, onScopeDispose, onUnmounted, provide, readonly,
ref, shallowRef, toRef, toRefs, watch, watchEffect

类型：App, Component, ComputedRef, PropType, Ref, ShallowRef, VNode, WritableComputedRef
```

## 用法二：全局命令式 API

`campus-admin` 安装插件时会自动把 `ca` 挂到 `window`，业务页面直接使用，
无需 import：

```js
// 加载动画（不支持并发，任意句柄 hide() 都会关闭）
const loading = ca.loading('加载中')
loading.hide()

// 轻提示
ca.toast('保存成功')          // 成功，对勾图标
ca.toast('保存失败', false)   // 错误，叉号图标

// 提示框：三种签名
ca.alert('提示')
ca.alert('标题', '提示内容')
ca.alert('标题', '提示内容', () => { /* 点确定后执行 */ })

// 确认框：返回 Promise<boolean>
if (await ca.confirm('删除后不可恢复', '确定删除该学生？')) {
  await removeStudent(id)
}

// 通用弹层
ca.modal({ title: '详情', content: '...', onConfirm: () => {} })
```

需要类型提示时按需 import：

```ts
import { ca } from '@unionschool/campus-admin'
```

### ca API 表

| 方法 | 签名 | 返回 | 说明 |
| --- | --- | --- | --- |
| `ca.loading` | `(text?: string)` | `{ hide(): void }` | 全局加载动画 |
| `ca.toast` | `(text: string, success?: boolean)` | `void` | 轻提示，2 秒自动关闭 |
| `ca.alert` | `(first, second?, third?)` | `void` | 单按钮提示框 |
| `ca.confirm` | `(first, second?)` | `Promise<boolean>` | 确定/取消 |
| `ca.modal` | `({ title?, content, onConfirm? })` | `void` | 通用弹层 |
| `ca.hideLoading` | `()` | `void` | 兜底关闭加载动画（请求拦截器里常用） |

`ca.alert` / `ca.confirm` 的参数解析规则：
**最后一个参数是函数时视为回调**，其余按「标题 + 内容」处理。

```js
ca.alert('标题', () => {})        // 只有标题 + 回调
ca.alert('提示')                  // 只有内容
ca.alert('标题', '内容', () => {}) // 全都有
```

## 用法三：在组件里取应用实例

```vue
<script setup lang="ts">
import { useCampus } from '@unionschool/campus-framework'

const campus = useCampus()
const request = campus.context.resolve('request')
</script>
```

## 低级 API（一般不需要直接用）

```ts
import { createVueApplication } from '@unionschool/campus-framework'

const bridge = createVueApplication(campusApplication)
bridge.component('CaFoo', Foo)     // 注册全局组件
bridge.register(provider)          // 注册服务提供者
bridge.use(plugin)                 // 装载插件
bridge.start()                     // 启动
app.use(bridge)                    // 作为 Vue 插件安装
```

### Store 与渲染桥接

命令式 API 内部用订阅式 store 保存状态，再用 `useStore` 接到 Vue 响应式。
自定义弹层时可以用同一套机制：

```ts
import { CampusStore, useStore } from '@unionschool/campus-framework'

export const myStore = new CampusStore({ visible: false })

// 组件里
const state = useStore(myStore)   // 自动订阅，组件卸载时自动取消
```

`CampusStore` 的方法：`get()`、`set(patch)`、`subscribe(listener)`。

## 导出的弹层组件

一般不需要手动使用，`campus-admin` 会自动挂载宿主。

```ts
import { CaLoadingOverlay, CaOverlayHost, CaOverlayList, CaToastList } from '@unionschool/campus-framework'
```

## 相关包

| 包 | 关系 |
| --- | --- |
| [`campus-core`](../campus-core) | 被本包依赖，提供容器与生命周期 |
| [`campus-ui`](../campus-ui) | 依赖本包，组件通过它使用 Vue API |
| [`campus-admin`](../campus-admin) | 依赖本包，负责挂载弹层宿主与 `ca` |
