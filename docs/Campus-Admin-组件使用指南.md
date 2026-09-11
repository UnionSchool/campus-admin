# Campus Admin 组件使用指南

> 适用包：`@unionschool/campus-admin`（含 `campus-ui` 全部组件）
> 示例代码可直接运行：`examples/admin/src/pages/school/students.vue`

## 1. 两种使用方式

### 方式一：插件全局注册（推荐用于后台项目）

在入口安装一次，所有页面直接写标签，无需在页面里 import。

```ts
// main.ts
import { createApp } from 'vue'
import { createCampusAdmin } from '@unionschool/campus-admin'
import '@unionschool/campus-admin/style.css'
import App from './App.vue'

const app = createApp(App)

// createCampusAdmin 返回的是 Vue 插件，已内置注册全部 Ca 组件
app.use(createCampusAdmin({
  name: '众校通智慧校园',
  version: '1.0.0',
  config: { request: { baseURL: '/api' } },
}))

app.mount('#app')
```

页面里直接用组件：

```vue
<template>
  <CaPageHeader title="学生管理">
    <CaButton type="primary">新增学生</CaButton>
  </CaPageHeader>

  <CaTable :columns="columns" :data="rows" />

  <!-- 消息提示是命令式的，必须在模板里挂一个容器 -->
  <CaToastContainer />
</template>
```

优点：不用逐个维护 import，模板干净。

### 方式二：按需 import（推荐用于组件数量少的页面或独立包）

```vue
<script setup lang="ts">
import { CaButton, CaTable, toast } from '@unionschool/campus-admin'
import type { TableColumn } from '@unionschool/campus-admin'
</script>
```

优点：类型提示精确，构建时可以只打包用到的组件。此时**不需要** `app.use`。

两种方式可以混用：全局注册后仍可显式 import，用于取 `toast`、`ns` 这类非组件导出。

## 2. 样式与主题

组件样式必须引入一次：

```ts
import '@unionschool/campus-admin/style.css'
```

### 明暗主题

```ts
import { setTheme } from '@unionschool/campus-admin'

setTheme('dark')   // 暗色
setTheme('light')  // 亮色
setTheme('auto')   // 跟随系统
```

`setTheme` 只在 `<html>` 上写 `data-ca-theme`，也可以直接写静态属性：

```html
<html data-ca-theme="dark">
```

要做成用户可切换的开关，还需要「记住选择」这一步，示例后台在顶栏右上角放了三态控件
（浅色 / 深色 / 自动），完整实现见 `examples/admin/src/composables/useTheme.ts`：

```ts
// 切换：存用户的选择本身，不要存解析后的明暗，否则下次无法跟随系统
setTheme('auto')                              // 'light' | 'dark' | 'auto'
localStorage.setItem('campus:theme', 'auto')
```

「自动」依赖系统偏好，只有等 JS 跑起来才知道结果，所以首屏要在样式生效前先定好，
否则暗色系统上会先闪一下亮色。放在 `index.html` 的 `<head>` 里同步执行：

```html
<script>
  ;(function () {
    try {
      var saved = localStorage.getItem('campus:theme') || 'auto'
      var dark = saved === 'dark'
        || (saved === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.setAttribute('data-ca-theme', dark ? 'dark' : 'light')
    }
    catch (error) {
      document.documentElement.setAttribute('data-ca-theme', 'light')
    }
  })()
</script>
```

注意两点：系统变化的监听只应由组件库持有（`setTheme('auto')` 会自动挂/摘），业务里不要再写一份
`matchMedia` 监听去调 `setTheme`；界面上想显示「当前实际是深色」用 `isDarkTheme()` 或自己的
`isDark` 派生值即可。

### 学校品牌色

学校品牌不是蓝色时，只给一个主色即可，其余色阶自动推导：

```ts
import { setPrimaryColor, resetPrimaryColor } from '@unionschool/campus-admin'

setPrimaryColor('#7c4dff')   // 紫色品牌
resetPrimaryColor()          // 恢复默认蓝色
```

自动推导的内容：hover / active、浅色底、浅底上的文字色、实心背景上的文字色。
品牌色过浅（例如黄色）时会自动加深文字、并把实心按钮的文字换成深色，
保证对比度达标。按钮、标签、菜单选中态、表格悬停、课表色块会一起生效。

### 国际化

组件库内置 zh-CN / en-US 两套词条，业务词条与内置词条合并到同一个语言实例：

```ts
import { createCampusAdmin } from '@unionschool/campus-admin'
import { businessMessages } from './src/locale'

createCampusAdmin({
  config: { locale: { locale: 'zh-CN', fallbackLocale: 'zh-CN', messages: businessMessages } },
})
```

取词与切换：

```ts
import { setLocale, useLocale } from '@unionschool/campus-admin'

const { t, te } = useLocale()   // setup 内取词；te 判断词条是否存在
t('ca.common.confirm')          // 组件库词条
t('page.home.count', { total }) // 业务词条，{total} 为插值

setLocale('en-US')              // 非 setup 场景：路由、请求拦截器等
```

三点必须记住：

- `ca.*` 是组件库保留的命名空间，业务词条用其他根键（示例是 `app.*` / `menu.*` / `page.*`）。
- 组件自带的默认文案可以改：单个组件用 `search-text` / `empty-text` 这类 props 覆盖，整个项目则在语言包里覆盖 `ca.*` 的叶子键，不要覆盖父级路径。
- 已经用 vue-i18n 的项目不要再装第二个 i18n 实例，把 `caMessages` 合并进自己的实例即可。

完整的词条约定、日期与数字格式化、后端文案对接、加一门语言以及排查清单，见
[Campus Admin 国际化使用指南](./Campus-Admin-国际化使用指南.md)。

### 覆盖 Token

换肤只覆盖 CSS 变量，不改组件样式：

```css
:root {
  --ca-color-primary: #1f6fe0;
  --ca-radius-md: 6px;
  --ca-control-height-md: 32px;
}
```

完整变量清单见 `packages/campus-ui/src/styles/token.css`。

## 3. Table 用法

### 3.1 最小可用

```vue
<script setup lang="ts">
import type { TableColumn } from '@unionschool/campus-admin'

interface StudentRow {
  id: string
  name: string
  className: string
}

const columns: TableColumn<StudentRow>[] = [
  { key: 'name', title: '姓名' },
  { key: 'className', title: '班级' },
]

const rows: StudentRow[] = [
  { id: '20260301', name: '李思远', className: '高二（3）班' },
]
</script>

<template>
  <CaTable :columns="columns" :data="rows" row-key="id" />
</template>
```

要点：

- `columns` 是普通数组，可以来自配置中心或后端下发。
- `rowKey` 必填字符串字段或函数，不要用数组索引。
- 未声明 `render` 时按 `key` 直接取字段值。

### 3.2 列配置字段

```ts
interface TableColumn<T = unknown> {
  key: string
  title: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  numeric?: boolean          // 数字列自动右对齐
  sortable?: boolean         // 显示排序按钮
  render?: (row: T, index: number) => string
}
```

### 3.3 自定义单元格

插槽名统一为 `cell-<列 key>`，参数是 `row / index / column`：

```vue
<CaTable :columns="columns" :data="rows" row-key="id">
  <template #cell-name="{ row }">
    <CaAvatar :name="row.name" size="small" />
    <b>{{ row.name }}</b>
  </template>

  <template #cell-status="{ row }">
    <CaAttendanceBadge :status="row.status" size="small" />
  </template>

  <template #cell-balance="{ row }">
    ¥ {{ row.balance.toFixed(2) }}
  </template>
</CaTable>
```

泛型会跟着 `columns` 的类型推导，`row` 自动获得具体字段，无需类型断言。

### 3.4 排序

默认非受控：点表头即在组件内部排序，按 `asc → desc → 取消` 循环。

需要服务端排序时改为受控：

```vue
<CaTable
  :columns="columns"
  :data="rows"
  :sort-key="sortKey"
  :sort-order="sortOrder"
  @sort="(key, order) => { sortKey = key; sortOrder = order; load() }"
/>
```

### 3.5 加载、空态与点击行

```vue
<CaTable
  :columns="columns"
  :data="rows"
  row-key="id"
  stripe
  compact
  :loading="loading"
  empty-text="没有符合条件的学生"
  @row-click="handleRowClick"
>
  <template #empty>自定义空态内容</template>
</CaTable>
```

### 3.6 配合分页

```vue
<CaPagination
  v-model:current="page"
  v-model:page-size="pageSize"
  :total="total"
  @change="load"
/>
```

## 4. 一个完整页面的写法

`examples/admin/src/pages/school/students.vue` 是最接近真实业务的参考，结构是：

```text
页面组件（只负责渲染）
├── CaPageHeader      标题 + 操作按钮
├── CaSearchForm      查询条件
├── CaTable           列表 + 自定义单元格
└── CaPagination      分页

useStudentList()（负责逻辑）
├── query / page / pageSize 状态
├── queryStudents()         纯函数过滤，可单测
└── search() / reset() / load()  数据加载，可替换为接口调用
```

这样拆分的好处：查询逻辑不依赖 Vue，能直接单测；换成真实接口只改 `load()`。

## 5. 组件清单

组件按 **原子 / 基础 / 功能** 三层组织：

| 层 | 组件 |
| --- | --- |
| 原子 `src/atom` | CaButton、CaIcon、CaTag、CaAvatar、CaInput、CaTextarea、CaSelect、CaCheckbox、CaSwitch、CaProgress、CaAttendanceBadge |
| 基础 `src/base` | CaTable、CaPagination、CaStatistic、CaModal、CaDrawer、CaEmpty、CaSkeleton、CaToastContainer + toast、CaBreadcrumb、CaSideMenu、CaPageHeader、CaSearchForm、CaClassTree |
| 功能 `src/feature` | CaStudentPicker、CaWeeklyTimetable、CaDailyAgenda |

判据：元素级是原子；区域级、能直接布局的是基础；多个组件组合起来完成一件事、且不区分角色的是功能。

全部组件在 `examples/admin` 的「组件总览」页有可交互演示。

## 6. 常用 Props 速查

```text
CaButton        type / variant(solid|outline|text) / size / loading / disabled / block / iconOnly
CaTable         columns / data / rowKey / loading / stripe / compact / sortKey / sortOrder
CaPagination    current / pageSize / total / showTotal
CaSearchForm    columns / visibleCount / loading，事件 search / reset
CaModal         v-model / title / width / maskClosable / escClosable / showFooter
CaDrawer        v-model / title / placement(right|left|bottom) / size
CaStudentPicker v-model / students / multiple / loading
CaClassTree     v-model / grades / searchable
CaAttendanceBadge status(normal|late|leave|absent|early|unknown) / time / size
```

## 7. 注意事项

- `toast` 是命令式 API，需要页面挂载 `<CaToastContainer />` 才能看到消息。
- 组件不访问接口。数据通过 Props 传入、事件抛出，接口层由业务或后续 `request` 模块负责。
- 所有 ID 使用字符串，避免后端大整数在 JavaScript 中丢失精度。
- 组件样式使用 `ca-` 前缀与 CSS 变量，业务侧覆盖请用变量，不要写深层选择器。
