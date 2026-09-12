# examples

示例应用目录。每个示例都是独立的 pnpm workspace 包，**按 npm 包名引用框架，不配置 src 别名**，
保证"文档里写的用法"就是"示例里跑的用法"。

依赖顺序：先在仓库根执行 `pnpm run build:packages` 构建各包，再运行示例。

## 当前示例

| 目录 | 包名 | 说明 | 部署地址 |
| --- | --- | --- | --- |
| `admin/` | `@campus-admin/example-admin` | 学校管理后台完整示例，同时也是演示站 | <https://campus.zhongxiaotong.com> |

## 预留目录

| 目录 | 计划内容 | 状态 |
| --- | --- | --- |
| `web/` | 学校官方网站 | 暂不做，目录预留 |

预留目录不属于 workspace，不参与构建、类型检查与发布。

## admin 示例的项目结构

```text
examples/admin/
├── main.ts                   应用入口：装配 campus、挂载 ca、初始化菜单
├── App.vue                   外壳：顶栏（含明暗主题开关）、侧栏、面包屑、RouterView
├── src/
│   ├── router/
│   │   ├── pages.ts          扫描 pages 目录生成路由地址
│   │   └── index.ts          注册路由、加载菜单、解析面包屑标题
│   ├── pages/                页面，目录层级 = 菜单层级
│   │   ├── home.vue                     → /home
│   │   ├── school/students.vue          → /school/students
│   │   └── teach/course/schedule.vue    → /teach/course/schedule
│   ├── lib/
│   │   ├── request.ts        网络请求类（axios）
│   │   ├── error.ts          ApiError
│   │   ├── types.ts          ApiEnvelope 等类型
│   │   ├── provider.ts       把请求实例注册进 campus 容器
│   │   ├── request-helper.ts useRequest()
│   │   ├── api/              按业务场景定义的接口
│   │   └── mock/             按接口 uri 存的演示数据
│   ├── composables/          页面逻辑与主题（useStudentList、useTheme）
│   ├── components/           示例内部组件
│   ├── locale/               业务语言包（app / menu / page）
│   └── services/             跨页面共享的轻量状态
└── style/app.css             示例专属样式（布局、首页）
```

## 新建一个业务页面

```text
1. 定路径             页面路径 = 菜单层级，例如 /teach/course/textbook
2. lib/api/xxx.ts     声明 uri 与返回类型
3. lib/mock/...       按接口 uri 建演示数据（可选）
4. pages/...vue       写页面，组件从 @campus-admin/core 拿
5. 菜单数据           后端下发 path，本地开发改 lib/mock/menu/main.json
```

不需要做：注册路由、写面包屑、设置页面标题、配置 baseURL / token、判断开发生产环境。
这些都是自动的。

## 接口与 mock 约定

### 统一返回格式

```text
{
  "code": 0,
  "msg": "success",
  "data": {},
  "count": 12,
  "extra": {}
}
```

`code === 0` 表示成功；`count` 只有分页接口才有；`extra` 放筛选回显、字典等附加数据。

### mock 数据按接口 uri 存放

```text
lib/mock/card/account/record/page.json   ←  GET /card/account/record/page
lib/mock/student/page.json               ←  GET /student/page
lib/mock/menu/main.json                  ←  GET /menu/main
```

request 内部按环境判断：

- 开发环境且存在同名 mock 文件 → 直接返回演示数据，不发请求
- 生产环境，或开发环境没有对应 mock → 走真实接口

所以**接入后端时删掉对应 mock 文件即可**，`lib/api/*.ts` 一行都不用改。

### 接口文件写法

```ts
import { useRequest } from '../request-helper'
import type { ApiEnvelope } from '../types'

/**
 * 分页查询学生
 * uri：GET /student/page
 * mock：lib/mock/student/page.json
 */
export function getStudentPage(query: StudentQuery = {}): Promise<ApiEnvelope<StudentItem[]>> {
  return useRequest().get<ApiEnvelope<StudentItem[]>>('/student/page', { query })
}
```

一个业务场景一个文件，url 只写一份。

## 语言包

业务词条放在 `src/locale/`，按语言一个文件，通过 `createCampusAdmin` 的 `config.locale` 交给框架，
与组件库内置的 `ca.*` 词条合并到同一个语言实例：

```text
src/locale/
├── index.ts       businessMessages（按语言分组）+ 语言开关用的语言列表
├── zh-CN.ts       app.*（外壳）/ menu.*（菜单）/ page.*（页面）
└── en-US.ts       键与 zh-CN 完全一致
```

```ts
// main.ts
createCampusAdmin({
  config: { locale: { locale: language, fallbackLocale: 'zh-CN', messages: businessMessages } },
})
```

页面里取词：

```vue
<script setup lang="ts">
import { useLocale } from '@campus-admin/core'
const { t } = useLocale()
</script>

<template><h1>{{ t('page.home.greeting') }}</h1></template>
```

约定：

- `ca.*` 是组件库保留的命名空间，业务只用 `app.*` / `menu.*` / `page.*`；
- 顶栏语言开关在 `src/composables/useLanguage.ts`，选择记在 `localStorage`，入口先定语言再挂载；
- 侧栏菜单按 `menu.<菜单 id>` 取词条（`src/lib/translate.ts`），取不到用后端下发的 label 兜底；
- 演示数据（学生姓名、课程名、通知标题）不参与国际化，真实项目由接口下发；
- 改完词条跑 `pnpm run check:locale`，会校验两种语言的词条数量一致。

完整说明见 [Campus Admin 国际化使用指南](../docs/Campus-Admin-国际化使用指南.md)。

## 常用命令

```bash
pnpm run build:packages     # 先构建各包
pnpm run dev:admin          # 开发 admin 示例（固定 http://localhost:8091，自动打开浏览器）
pnpm run build:example      # 构建全部示例
pnpm run preview:admin      # 预览构建产物（http://localhost:4173）
pnpm run up                 # 构建并上传 admin 演示站
```

## 新增示例的约定

1. 目录名使用小写单词，例如 `teacher`、`parent`。
2. 包名统一为 `@campus-admin/example-<name>`，`package.json` 中声明 `"private": true`。
3. 依赖通过 `workspace:*` 引用 `@campus-admin/core` 等包，禁止直接引用 `packages/*/src`。
4. 构建产物输出到各自的 `dist/`，互不覆盖；新增示例后同步更新 `scripts/clean.mjs`。
5. 部署脚本按示例单独维护，`up` 只负责 `admin` 示例对应的演示站。
