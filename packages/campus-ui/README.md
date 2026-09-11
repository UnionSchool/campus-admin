# @unionschool/campus-ui

面向智慧校园后台管理场景的 Vue 3 组件库，共 27 个组件，分**原子 / 基础 / 功能**三层。

组件只负责渲染，**不访问接口、不读全局状态**：数据通过 Props 传入，
用户操作通过 Events 抛出。

主题支持**明暗两套配色**与**运行时品牌换色**：一行代码切换暗色，一行代码把主色换成学校品牌色。

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

**原子（`src/atom`）** —— 元素级，不占版面，多为其他组件的零件

| 组件 | 用途 |
| --- | --- |
| `CaButton` | 操作按钮 |
| `CaIcon` | 单色图标容器 |
| `CaTag` | 状态/分类标记 |
| `CaAvatar` | 用户/学生头像 |
| `CaInput` | 单行文本 |
| `CaTextarea` | 多行文本 |
| `CaSelect` | 下拉选择 |
| `CaCheckbox` | 勾选 / 半选 |
| `CaSwitch` | 开关 |
| `CaProgress` | 进度条 / 环形进度 |
| `CaAttendanceBadge` | 考勤状态标签 |

**基础（`src/base`）** —— 区域级，可直接放进页面布局，与业务无关

| 组件 | 用途 |
| --- | --- |
| `CaTable` | 数据表格（泛型 + 排序） |
| `CaPagination` | 分页 |
| `CaStatistic` | 指标数值 |
| `CaModal` | 对话框 |
| `CaDrawer` | 抽屉 |
| `CaEmpty` | 空状态 |
| `CaSkeleton` | 骨架屏 |
| `CaToastContainer` + `toast` | 轻提示（挂载式） |
| `CaBreadcrumb` | 面包屑 |
| `CaSideMenu` | 侧边多级菜单 |
| `CaPageHeader` | 页面标题栏 |
| `CaSearchForm` | 查询表单 |
| `CaClassTree` | 年级班级树 |

**功能（`src/feature`）** —— 多个组件组合起来完成一件事，不区分角色

| 组件 | 用途 |
| --- | --- |
| `CaStudentPicker` | 学生选择器 |
| `CaWeeklyTimetable` | 课程表 |
| `CaDailyAgenda` | 日程安排 |

每个组件的 `.vue` 文件顶部都有使用说明（用法、Props、事件、插槽），
各层的判据与目录约定见 `src/atom/README.md`、`src/base/README.md`、`src/feature/README.md`。

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

### 明暗主题

```ts
import { setTheme } from '@unionschool/campus-ui'

setTheme('dark')   // 暗色
setTheme('light')  // 亮色
setTheme('auto')   // 跟随系统，系统切换时自动更新
```

`setTheme` 只是在 `<html>` 上写 `data-ca-theme`，配色由 Token 决定，
组件样式不区分主题。也可以不用 JS，直接写 `<html data-ca-theme="dark">`。

### 品牌换色（运行时）

学校品牌色不是蓝色时，只给一个主色，其余色阶自动推导：

```ts
import { setPrimaryColor, resetPrimaryColor } from '@unionschool/campus-ui'

setPrimaryColor('#7c4dff')   // 紫色品牌
resetPrimaryColor()          // 恢复默认蓝色
```

会自动生成并写入以下变量：`--ca-color-primary`、`-hover`、`-active`、`-soft`、`-text`、`-contrast`。
推导规则是：

- 亮色下 hover / active 变深，暗色下变亮；
- `-soft` 浅底跟随当前主题（亮色混合白、暗色混合深色卡片底）；
- `-text` 用于浅底上的文字，品牌色过浅时自动加深（暗色下自动提亮）以满足对比度；
- `-contrast` 是主色实心背景上的文字色，浅色品牌（如黄色）自动切换成深色文字。

因此按钮、标签、菜单选中态、表格悬停、课表色块都会一起跟着变，不需要逐个组件配置。

### 覆盖 Token（更细粒度的换肤）

所有视觉都走 CSS 变量，改变量即可换肤，**不要写深层选择器覆盖**：

```css
:root {
  --ca-color-primary: #1f6fe0;    /* 主色（等价于 setPrimaryColor） */
  --ca-color-success: #2fae85;
  --ca-radius-md: 6px;
  --ca-control-height-md: 32px;   /* 控件高度，可用于调整信息密度 */
}
```

Token 分三层，完整清单见 `src/styles/token.css`：

```text
基础色 palette   --ca-color-blue-500、--ca-space-4、--ca-radius-md
品牌与语义色     --ca-color-primary-soft、--ca-color-success-text、--ca-text-secondary、--ca-surface-card
文字层级         --ca-text-primary、--ca-text-regular、--ca-text-secondary、--ca-text-placeholder、--ca-text-menu
主题覆盖         :root[data-ca-theme='dark'] 覆盖语义与中性色
```

层级 Token 同样可覆盖：`--ca-z-index-modal`、`--ca-z-index-message`。

### 国际化

组件库内置 zh-CN / en-US 两套词条，不需要额外安装 i18n 库。单独使用 `campus-ui` 时，
在入口建一个语言实例并注入应用：

```ts
import { CampusUI, createLocale, installLocale } from '@unionschool/campus-ui'
import { createApp } from 'vue'

const app = createApp(App)
const locale = createLocale({
  locale: 'zh-CN',
  // 业务词条放在自己的根键下，ca 是组件库保留的命名空间
  messages: { 'zh-CN': zhCN, 'en-US': enUS },
})

app.use(CampusUI)          // 已自带一份默认语言实例，可省略下一行
installLocale(app, locale)
```

取词与切换：

```ts
import { setLocale, useLocale } from '@unionschool/campus-ui'

const { t, te } = useLocale()    // 组件内取词
t('ca.pagination.total', { total: 12 })   // 共 12 条

setLocale('en-US')               // 非 setup 场景
```

日期与数字格式化走内置的 `Intl` 封装，不要自己拼中文：

```ts
import { formatDay, formatMonth, formatNumber, weekdayLabels } from '@unionschool/campus-ui'

formatMonth(new Date(2026, 8, 11), 'en-US')   // September 2026
weekdayLabels('zh-CN')                        // ['周一', ...]
formatNumber(3286, 'en-US')                   // 3,286
```

已经用 vue-i18n 的项目不要再装第二个实例，把内置词条合并进自己的实例即可：

```ts
import { caMessages } from '@unionschool/campus-ui'

i18n.global.mergeLocaleMessage('zh-CN', caMessages['zh-CN'])
i18n.global.mergeLocaleMessage('en-US', caMessages['en-US'])
```

完整约定（命名空间、覆盖组件文案、后端文案对接、加语言）见
[Campus Admin 国际化使用指南](../../docs/Campus-Admin-国际化使用指南.md)。

### 类名约定

```text
块        .ca-button
元素      .ca-button__icon
修饰符    .ca-button--primary
```

组件样式是统一 `ca-` 前缀的 BEM 类名，**只有 Token 是稳定的公共契约**，类名不作为 API。
业务侧换肤请覆盖变量，不要写深层选择器。

## 开发约定

三层目录结构（`atom` / `base` / `feature`），每个组件目录结构统一：

```text
src/<层>/<组件名>/
├── src/core.ts           纯逻辑，不依赖 Vue（可单测）
├── src/data.ts           演示数据（可选）
├── src/<组件名>.vue      只做渲染
├── style/index.css       样式，由 .vue 通过 `<style src="../style/index.css">` 引入
└── index.ts              导出 Ca 前缀组件与公开类型
```

新增组件只需要改两处：组件自己的目录 + 所属层的 `index.ts`（加入命名导出与注册表）。
顶层 `builtInComponents` 由三层合并，`campus-admin` 会自动纳入全局注册表。

## 设计要求

- **组件不访问接口**。数据用 Props 传入，操作通过 Events 抛出。
- **不写死颜色**。任何颜色都必须来自 `--ca-*` Token，否则暗色主题与品牌换色会失效。
- 主色实心背景上的文字用 `--ca-color-primary-contrast`，保证浅色品牌色下仍可读。
- 所有 ID 使用字符串，避免后端大整数在 JavaScript 中丢失精度。
- 覆盖默认、Hover、Focus、Disabled、Loading、Empty、Error 等状态。
- 弹层类组件需处理 Esc 关闭、焦点锁定、关闭后焦点恢复。
- 组件卸载时清理事件、计时器、Observer。

## 相关包

| 包 | 关系 |
| --- | --- |
| [`campus-framework`](../campus-framework) | 被本包依赖，组件通过它使用 Vue API |
| [`campus-admin`](../campus-admin) | 依赖本包并统一出口 |
