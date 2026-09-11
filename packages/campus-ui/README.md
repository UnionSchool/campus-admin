# @unionschool/campus-ui

面向智慧校园后台管理场景的 Vue 3 组件库，共 26 个组件。

组件只负责渲染，**不访问接口、不读全局状态**：数据通过 Props 传入，
用户操作通过 Events 抛出。

## 安装

```bash
pnpm add @unionschool/campus-ui
```

通常不需要单独安装——[`@unionschool/campus-admin`](../campus-admin) 已包含它。

依赖：`vue@^3.5.42`、`@lucide/vue@^1.44.0`（均为 peerDependency）。

## 两种引入方式

### 按需引入（推荐）

```vue
<script setup lang="ts">
import { CaButton, CaTable, toast } from '@unionschool/campus-ui'
import type { TableColumn } from '@unionschool/campus-ui'
import '@unionschool/campus-ui/style.css'
</script>
```

### 全局注册

```ts
import { createApp } from 'vue'
import CampusUI from '@unionschool/campus-ui'
import '@unionschool/campus-ui/style.css'

createApp(App).use(CampusUI).mount('#app')
```

注册后模板里直接写 `<CaButton>`，无需 import。

## 组件清单

| 分类 | 组件 | 用途 |
| --- | --- | --- |
| 基础 | `CaButton` | 操作按钮 |
| | `CaIcon` | 单色图标容器 |
| | `CaTag` | 状态/分类标记 |
| | `CaAvatar` | 用户/学生头像 |
| 表单 | `CaInput` | 单行文本 |
| | `CaTextarea` | 多行文本 |
| | `CaSelect` | 下拉选择 |
| | `CaCheckbox` | 勾选 / 半选 |
| | `CaSwitch` | 开关 |
| 数据 | `CaTable` | 数据表格（泛型 + 排序） |
| | `CaPagination` | 分页 |
| | `CaStatistic` | 指标数值 |
| 反馈 | `CaModal` | 对话框 |
| | `CaDrawer` | 抽屉 |
| | `CaEmpty` | 空状态 |
| | `CaSkeleton` | 骨架屏 |
| | `CaProgress` | 进度条 |
| | `CaToastContainer` + `toast` | 轻提示（挂载式） |
| 导航 | `CaBreadcrumb` | 面包屑 |
| | `CaSideMenu` | 侧边多级菜单 |
| 布局 | `CaPageHeader` | 页面标题栏 |
| | `CaSearchForm` | 查询表单 |
| 校园业务 | `CaStudentPicker` | 学生选择器 |
| | `CaClassTree` | 年级班级树 |
| | `CaAttendanceBadge` | 考勤状态标签 |
| 课表日程 | `CaWeeklyTimetable` | 课程表 |
| | `CaDailyAgenda` | 日程安排 |

每个组件的 `.vue` 文件顶部都有使用说明（用法、Props、事件、插槽），
分类目录下另有详细文档：`src/components/<分类>/README.md`。

## 快速示例

### 数据表格

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { CaPagination, CaTable } from '@unionschool/campus-ui'
import type { TableColumn } from '@unionschool/campus-ui'

interface StudentRow {
  id: string
  name: string
  className: string
  balance: number
}

const columns: TableColumn<StudentRow>[] = [
  { key: 'name', title: '姓名' },
  { key: 'className', title: '班级' },
  { key: 'balance', title: '余额', numeric: true, sortable: true },
]

const rows = ref<StudentRow[]>([])
const total = ref(0)
const page = ref(1)
</script>

<template>
  <CaTable :columns="columns" :data="rows" row-key="id" stripe>
    <!-- 单元格插槽命名为 cell-<列 key>，参数是 row / index / column -->
    <template #cell-name="{ row }">
      <CaAvatar :name="row.name" size="small" />
      <b>{{ row.name }}</b>
    </template>
  </CaTable>

  <CaPagination v-model:current="page" :total="total" />
</template>
```

要点：

- `columns` 是普通数组，可来自后端下发
- `rowKey` 必须是稳定字段或函数，不要用数组下标
- 单元格插槽名为 `cell-<列 key>`；泛型会跟着 `columns` 推导，`row` 自动获得具体字段类型
- **排序有两种模式**：不传 `sort-key` / `sort-order` 时组件内部排序（点击表头按 升序 → 降序 → 取消 循环）；
  传入这两个 prop 且监听 `sort` 事件时用于服务端排序

### 多级侧边菜单

```vue
<script setup lang="ts">
import { CaSideMenu } from '@unionschool/campus-ui'
import type { SideMenuItem } from '@unionschool/campus-ui'

const items: SideMenuItem[] = [
  { label: '学校概况', icon: LayoutDashboard, children: [
    { label: '我的首页', value: '/home' },
    { label: '学生管理', value: '/students' },
  ] },
  { label: '教学教务', icon: BookOpen, children: [
    { label: '课程管理', children: [
      { label: '课程表', value: '/teach/course/schedule' },
    ] },
  ] },
]

function go(item: SideMenuItem) {
  if (item.value) router.push(item.value)
}
</script>

<template>
  <CaSideMenu :items="items" :model-value="route.path" :indent="2" :indent-step="32" @select="go" />
</template>
```

**菜单组件不认识路由**：`value` 是业务数据，跳转由使用方决定。
这样同一组件也能用于小程序或纯链接场景。

### 轻提示

```ts
import { toast } from '@unionschool/campus-ui'

toast.success('保存成功')
toast.error('保存失败', '请检查网络')
```

挂载式用法：在模板里放一个 `<CaToastContainer />`。
如果用 `campus-admin`，推荐改用全局的 `ca.toast()`（见下方"与 ca 的关系"）。

## 与 ca 的关系

`campus-admin` 提供全局命令式 API `ca`，与本库的 `toast` **共用同一份消息队列**：

```js
ca.toast('保存成功')        // 与 toast.success('保存成功') 等效
```

本库的 `toast` 保留了描述文案等扩展能力；`ca.toast` 更简洁，适合在任意 JS 里调用。

## 主题与样式

### 引入样式

```ts
import '@unionschool/campus-ui/style.css'
```

### 覆盖 Token（推荐换肤方式）

所有视觉都走 CSS 变量，改变量即可换肤，**不要写深层选择器覆盖**：

```css
:root {
  --ca-color-primary: #1f6fe0;    /* 主题色 */
  --ca-color-success: #2fae85;
  --ca-radius-md: 6px;
  --ca-control-height-md: 32px;   /* 控件高度，可用于调整信息密度 */
}
```

Token 分三层，完整清单见 `src/styles/token.css`：

```text
基础 Token      --ca-color-blue-500、--ca-space-4、--ca-radius-md
语义 Token      --ca-color-primary、--ca-text-secondary、--ca-surface-card
组件 Token      --ca-button-primary-bg 等（按需补充）
```

层级 Token 同样可覆盖：`--ca-z-index-modal`、`--ca-z-index-message`。

### 类名约定

```text
块        .ca-button
元素      .ca-button__icon
修饰符    .ca-button--primary
```

业务侧覆盖样式时优先用 CSS 变量；确实需要覆盖类名时，注意组件样式是 scoped。

## 开发约定

每个组件目录的结构：

```text
src/components/<分类>/<组件名>/
├── src/core.ts           纯逻辑，不依赖 Vue（可单测）
├── src/data.ts           演示数据（可选）
├── src/<组件名>.vue      只做渲染
├── style/index.css       样式（可选，简单组件写在 .vue 里）
└── index.ts              导出 Ca 前缀组件与公开类型
```

新增组件后需要在 `src/index.ts` 登记，`campus-admin` 会自动纳入全局注册表。

## 设计要求

- **组件不访问接口**。数据用 Props 传入，操作通过 Events 抛出。
- 所有 ID 使用字符串，避免后端大整数在 JavaScript 中丢失精度。
- 覆盖默认、Hover、Focus、Disabled、Loading、Empty、Error 等状态。
- 弹层类组件需处理 Esc 关闭、焦点锁定、关闭后焦点恢复。
- 组件卸载时清理事件、计时器、Observer。

## 相关包

| 包 | 关系 |
| --- | --- |
| [`campus-framework`](../campus-framework) | 被本包依赖，组件通过它使用 Vue API |
| [`campus-admin`](../campus-admin) | 依赖本包并统一出口 |
