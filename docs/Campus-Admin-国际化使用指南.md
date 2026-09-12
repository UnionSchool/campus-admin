# Campus Admin 国际化使用指南

> 适用包：`@campus-admin/core`（含 `@campus-admin/ui` 全部组件）
> 可运行示例：`examples/admin/src/locale`（业务词条）、`examples/admin/src/composables/useLanguage.ts`（语言开关）
> 组件库实现：`packages/ui/src/locale`

## 1. 一分钟接入

### 1.1 写业务词条

一个语言一个文件，导出嵌套对象，键名不用带引号；带短横线的键（例如菜单 id）可以加引号。

```ts
// src/locale/zh-CN.ts
import type { LocaleMessages } from '@campus-admin/core'

const zhCN: LocaleMessages = {
  app: { name: '智慧校园' },
  page: { home: { count: '共 {total} 项' } },
  menu: { 'school-student': '学生管理' },
}

export default zhCN
```

```ts
// src/locale/en-US.ts —— 键必须与 zh-CN 完全一致
const enUS: LocaleMessages = {
  app: { name: 'Smart Campus' },
  page: { home: { count: '{total} items' } },
  menu: { 'school-student': 'Students' },
}
```

```ts
// src/locale/index.ts
import type { LocaleMessageMap } from '@campus-admin/core'
import zhCN from './zh-CN'
import enUS from './en-US'

export const businessMessages: LocaleMessageMap = { 'zh-CN': zhCN, 'en-US': enUS }
```

### 1.2 交给框架

业务词条与组件库内置词条会深合并到**同一个语言实例**，组件文案与业务文案共用一套语言包：

```ts
import { createCampusAdmin } from '@campus-admin/core'
import { businessMessages } from './src/locale'

app.use(createCampusAdmin({
  config: {
    locale: {
      locale: 'zh-CN',          // 当前语言，默认 zh-CN
      fallbackLocale: 'zh-CN',  // 兜底语言，默认 zh-CN
      messages: businessMessages,
    },
  },
}))
```

语言要在挂载前确定（比如读 `localStorage`），否则首屏会先显示默认语言再切换：

```ts
const language = localStorage.getItem('campus:locale') ?? 'zh-CN'
createCampusAdmin({ config: { locale: { locale: language, messages: businessMessages } } })
```

### 1.3 切换语言

```ts
import { setLocale } from '@campus-admin/core'

setLocale('en-US')   // 组件文案 + 业务文案一起变，不需要刷新
```

切换后需要同步 `<html lang>` 的，业务自己写一次（示例在开关里做了）：

```ts
document.documentElement.lang = 'en-US'
```

## 2. 词条约定

### 2.1 结构与插值

词条是嵌套对象，取词时用点号路径；结构与 vue-i18n 的 `messages` 完全一致，可以直接互相合并。

```ts
t('app.name')                              // 智慧校园
t('page.home.count', { total: 12 })        // 共 12 项
t('page.home.count', { total: 12 })        // 英文下：12 items
```

- 插值语法是 `{name}`，变量没传时保留占位符，便于发现漏传。
- 暂不支持复数（`one / other`）。真有复数需求时用 vue-i18n 接管（见第 6 节），或者把单复数拆成两条词条。

### 2.2 命名空间

| 命名空间 | 归属 | 说明 |
| --- | --- | --- |
| `ca.*` | 组件库保留 | 组件自身界面文案，见 `packages/ui/src/locale/lang` |
| `app.*` | 业务 | 应用外壳：顶栏、侧栏、面包屑、页脚（示例约定） |
| `menu.*` | 业务 | 后端菜单文案，键取菜单 id（示例约定） |
| `page.*` | 业务 | 页面文案，按页面分层（示例约定） |

业务用自己的根键就不会和组件文案撞车；`page.*` 下面的层级项目可以自由发挥。

### 2.3 想改组件自带的文案

两种方式，按范围选：

**单个组件**：用组件自己的 props 覆盖，优先级最高。

```vue
<CaSearchForm search-text="检索" reset-text="清空条件" />
<CaTable :empty-text="'还没有学生'" />
```

可覆盖的默认文案（都是这类 props）：`CaSearchForm` 的 `searchText` / `resetText`、`CaTable` 的 `emptyText`、`CaEmpty` 的 `title`、`CaModal` 的 `confirmText` / `cancelText`、`CaSelect` 与 `CaStudentPicker` 的 `placeholder`、`CaSideMenu` 的 `ariaLabel`。

**整个项目**：在业务语言包里覆盖 `ca.*` 的**叶子键**（深合并，同路径替换）。

```ts
// src/locale/zh-CN.ts
const zhCN = {
  ca: {
    searchForm: { search: '检索' },   // 只改这一条，其他组件文案不动
  },
}
```

⚠️ 不要覆盖 `ca` 下的父级路径（例如 `{ ca: { searchForm: 'xxx' } }`）：那样整棵子树会被字符串替换掉，组件取不到词条，页面上会直接显示 `ca.searchForm.search` 这样的裸 key，而且不报错，只在开发环境打一条日志。

### 2.4 找不到词条时

查找顺序是：当前语言 → 当前语言的主语言（`zh-CN` → `zh`）→ 兜底语言 → 兜底语言的主语言。

都没找到时 `t()` **原样返回 key**（与 vue-i18n 行为一致），同时开发环境会打一次 `[@campus-admin/locale] 缺少词条：xxx`，便于定位漏翻。切到未注册的语言不会报错，会走 `fallbackLocale`。

## 3. 在代码里取词

### 3.1 组件内（setup）

```vue
<script setup lang="ts">
import { useLocale } from '@campus-admin/core'

const { t, te } = useLocale()
</script>

<template>
  <p>{{ t('page.home.count', { total: 12 }) }}</p>
  <!-- te 判断词条是否存在，常用于「有词条用词条，没有用后端下发的文案」 -->
  <p>{{ te('menu.school-student') ? t('menu.school-student') : menu.label }}</p>
</template>
```

`t` 读取的是响应式的语言变量，写在模板或 `computed` 里就会跟着语言变；如果只在 `setup` 顶层算成普通常量，语言切换后不会更新。

### 3.2 非 setup 场景

路由、请求拦截器、状态管理这类拿不到 setup 的地方用全局入口：

| API | 作用 |
| --- | --- |
| `setLocale(locale)` | 切换当前应用的语言 |
| `getLocale()` | 当前语言 |
| `useLocaleRef()` | 当前语言的 `Ref<string>`，需要响应式跟随语言时用 |
| `getCurrentLocale()` | 当前语言实例（`t` / `te` / `mergeMessages` 都在上面） |

```ts
import { getCurrentLocale, getLocale, setLocale } from '@campus-admin/core'

console.log(getLocale())                      // zh-CN
const { t, te, mergeMessages } = getCurrentLocale()

// 登录后拿到后端下发的词条，运行时补进来
mergeMessages('zh-CN', await fetchSchoolMessages())

setLocale('en-US')
```

### 3.3 完整 API

| 导出 | 说明 |
| --- | --- |
| `useLocale()` | setup 内取词，返回 `{ locale, fallbackLocale, t, te, setLocale, mergeMessages, getMessages }` |
| `createLocale(options)` | 自己建语言实例（`{ locale, fallbackLocale, messages }`） |
| `installLocale(app, locale)` | 把实例注入应用并设为当前实例，`@campus-admin/core` 安装时已自动调用 |
| `provideLocale(locale)` | 仅 setup 内可用，向子组件提供实例 |
| `CA_LOCALE_KEY` | 注入键，用于替换实现 |
| `caMessages` | 组件库内置词条 `{ 'zh-CN': {...}, 'en-US': {...} }`，用于合并进业务自己的 i18n |
| `DEFAULT_LOCALE` / `AVAILABLE_LOCALES` | 默认语言与内置支持的语言列表 |

## 4. 日期与数字

语言相关的格式统一走组件库导出的工具（底层是 `Intl`），不要在业务里拼「年 / 月 / 日」：

```ts
import { formatDay, formatMonth, formatNumber, weekdayLabels } from '@campus-admin/core'

formatMonth(new Date(2026, 8, 11), 'zh-CN')   // 2026年9月
formatMonth(new Date(2026, 8, 11), 'en-US')   // September 2026
formatDay(new Date(2026, 8, 11), 'zh-CN')     // 9月11日
formatDay(new Date(2026, 8, 11), 'en-US')     // September 11
weekdayLabels('zh-CN')                        // ['周一', ... , '周日']
weekdayLabels('en-US')                        // ['Mon', ... , 'Sun']
formatNumber(3286, 'en-US')                   // 3,286
formatNumber(1234.5, 'zh-CN', { style: 'currency', currency: 'CNY' })  // ¥1,234.50
```

传入无法识别的语言标记时会回退到运行环境默认语言，不抛异常。组件内部（课表的星期与周次、日程的月份、统计数值、表格排序）已经按当前语言处理。

## 5. 后端下发的文案

菜单、状态、字典这类文案来自接口，约定是：**后端返回稳定 id + 默认文案，可选返回 labelKey**。

```json
{ "id": "school-student", "label": "学生管理", "labelKey": "menu.school-student" }
```

前端按 `labelKey ?? 'menu.' + id` 取词条，取不到就用后端给的 label 兜底，这样后端没接多语言时页面也不会出现裸 key：

```ts
import { menuKeyOf, translateOr } from '../lib/translate'   // 示例里的工具

const { t, te } = useLocale()
const label = translateOr(t, te, menuKeyOf(node), node.label)
```

接口错误提示同理：建议返回 `code` + `i18nKey`，由前端取本地词条，不要让后端拼好中文再下发。

## 6. 已经用 vue-i18n 的项目

**不要**给同一个应用装两个 i18n 实例。vue-i18n 安装时用同一个注入键，后安装的会把先安装的整个顶掉，组件里 `useI18n()` 只会拿到最后一个实例，另一套词库静默失效（同时会有一堆「组件/指令已注册」的警告）。

正确做法是把组件库词条合并进你自己的实例，之后一个语言包同时服务组件与业务：

```ts
import { createI18n } from 'vue-i18n'
import { caMessages } from '@campus-admin/core'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: { 'zh-CN': zhCN, 'en-US': enUS },
})

// 组件库词条挂到 ca 命名空间下，不会覆盖业务键
i18n.global.mergeLocaleMessage('zh-CN', caMessages['zh-CN'])
i18n.global.mergeLocaleMessage('en-US', caMessages['en-US'])

app.use(i18n)
```

合并之后组件仍按自己的 `useLocale()` 取词，只要两边词条一致，语言切换就同步。想让组件跟着 vue-i18n 的 locale 走，在切换处同时调用一次：

```ts
function switchLanguage(next: string) {
  i18n.global.locale.value = next
  setLocale(next)     // 让组件库也用同一个语言
}
```

组件级的局部作用域（`useI18n({ messages })`）也能做到隔离，但局部找不到键时会回退全局，开发环境会打 `Fall back to translate ...` 日志，键一多就刷屏，不建议作为主方案。

## 7. 加一门语言

1. 在业务侧加一个词条文件（例如 `src/locale/ja-JP.ts`），键与 `zh-CN` 完全一致；
2. 加进 `businessMessages`，并在语言开关的语言列表里加一项；
3. 组件库内置文案要出日语时，在业务语言包里补 `ca.*`，没补到的键会按 `fallbackLocale` 回退：

```ts
// src/locale/ja-JP.ts
const jaJP = {
  app: { name: 'キャンパス' },          // 业务词条
  ca: {
    common: { confirm: 'OK' },          // 组件词条，只补叶子键；没补的走 fallbackLocale
  },
}
```

也可以直接复用内置的 `caMessages` 作为起点，再覆盖需要翻译的叶子键。

当前 `zh-CN` / `en-US` 两套内置词条随包静态输出（gzip 后不到 1KB）。语言数量变多时再拆成 `@campus-admin/ui/locale/<locale>` 子路径动态加载，并同步 `package.json` 的 `exports` 与 `scripts/verify-pack.mjs` 白名单。

## 8. 给组件库加一条文案

```text
1. packages/ui/src/locale/lang/zh-CN.ts   加 ca.<组件>.<语义>
2. packages/ui/src/locale/lang/en-US.ts   补同一条（少一条会被门禁拦下）
3. 组件里用 const { t } = useLocale() + t('ca.<组件>.<语义>')
4. 默认值型 props 不要写死中文：删掉 withDefaults 里的默认值，
   改成 computed(() => props.xxx ?? t('ca.xxx'))
5. npm run check:locale
```

`check:locale` 会校验：代码里出现的 `ca.*` 键都在语言包里、两种语言的词条数量一致，并提示暂时没被引用的预留词条。该检查已纳入 `npm run check`。

纯业务数据（班级名、科目、节次、日程条目）不进语言包，由接口下发。

## 9. 排查

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 页面出现 `ca.table.empty` 这样的裸 key | 词条缺失，或业务语言包没通过 `config.locale` 交进框架 | 补词条 / 检查 `config.locale.messages` |
| 英文界面里夹着中文 | `en-US` 缺这条词条 | 跑 `npm run check:locale` |
| 切换语言后组件文案没变 | 取词结果被算成了普通常量，或用了第二个 i18n 实例 | 把 `t()` 放进模板 / `computed`；只保留一个实例 |
| 菜单、状态还是中文 | 后端文案没按 `menu.<id>` 约定接词条 | 用 `translateOr(t, te, key, node.label)` 兜底 |
| 某块组件文案整段变成 key | 覆盖了 `ca` 的父级路径 | 只覆盖叶子键（第 2.3 节） |
| `<html lang>` 不跟着变 | 组件库不主动改 DOM | 业务在切换处写 `document.documentElement.lang` |
| 首屏闪一下默认语言 | 语言在 mount 之后才设置 | 在创建应用前先确定语言（第 1.2 节） |

## 10. 老项目改造清单

```text
1. 建 src/locale/{zh-CN,en-US}.ts，先放骨架（app / page 两个命名空间）
2. main.ts 把词条交给 createCampusAdmin 的 config.locale，语言先读 localStorage
3. 顶栏加语言开关，切换时 setLocale + 写 localStorage + 写 <html lang>
4. 页面文案按「一页一个 page.<页面> 命名空间」逐步下沉，先用中文兜底
5. 后端菜单/字典按 id 接 menu.<id>，用 te() 兜底，后端不改也能上线
6. 每次下沉完跑 npm run check:locale，确保两种语言同步
```
