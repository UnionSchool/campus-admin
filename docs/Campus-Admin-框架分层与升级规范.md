# Campus Admin 框架分层与升级规范

> 适用范围：`campus-core`、`campus-framework`、`campus-ui`、`campus-admin` 四个包
> 状态：已实施（v0.1.0-alpha 阶段，Monorepo）
> 目标：框架升级不触碰业务代码，业务代码不依赖框架实现

## 1. 要解决的问题

Vue、Vite、UI 组件库升级时，最容易出问题的不是版本号，而是**依赖边界不清**：

- 组件里直接 `import { ref } from 'vue'`，Vue 4 一旦调整响应式 API，所有组件都要改。
- 业务逻辑和渲染写在一个 `.vue` 文件里，无法单独测试，也无法移植到小程序或 Node。
- 应用没有统一入口，插件、权限、请求各写各的，替换实现时全项目搜索。

Laravel 之所以“升级框架不影响业务”，关键不是目录好看，而是三条硬约束：

1. 业务只依赖稳定的**契约**（Controller 约定、契约接口、Facade），不依赖框架内部实现。
2. 框架相关代码集中在**可替换的外壳**里，例如 `bootstrap/` 和 `config/`。
3. 服务通过**容器 + 服务提供者 + 插件**装配，业务代码主动 `new` 依赖的情况很少。

Campus Admin 按同样思路分层，区别只是渲染层从 PHP 换成了 Vue。

## 2. 包与目录分层

```text
packages/
├── campus-core/               # 核心层：不依赖任何框架，最稳定
│   └── src/
│       ├── contracts/         # 契约：config.ts、provider.ts
│       ├── container.ts       # 服务容器 (bind / singleton / make / resolve)
│       ├── context.ts         # 应用上下文：配置读写与服务解析
│       ├── application.ts     # 生命周期：register → boot → start
│       ├── facade.ts          # campus('request') 形式取服务
│       └── index.ts
├── campus-framework/          # 框架适配层：唯一允许 import 'vue' 的包
│   └── src/
│       ├── vue.ts             # 响应式与生命周期 API 的统一出口
│       ├── application.ts     # Campus 生命周期 ↔ Vue 插件桥接
│       ├── campus.ts          # useCampus / CAMPUS_KEY
│       └── index.ts
├── campus-ui/                 # 组件层：每个组件独立目录
│   └── src/
│       ├── components/
│       │   ├── daily-agenda/
│       │   │   ├── src/core.ts    # 纯逻辑：日期、过滤、文案
│       │   │   ├── src/data.ts    # 演示数据，真实项目由 Props 注入
│       │   │   ├── src/daily-agenda.vue
│       │   │   ├── style/index.css
│       │   │   └── index.ts
│       │   └── weekly-timetable/
│       ├── styles/               # Token、基础类，后续迁移到主题包
│       └── index.ts
└── campus-admin/              # 装配层
    └── src/
        ├── plugin.ts          # createCampusAdmin、内置组件注册表
        └── index.ts           # 统一出口，转发 core / framework / ui

examples/
├── admin/                     # 学校管理后台示例，同时是演示站
│   └── @unionschool/example-admin
└── web/                       # 预留：学校官方网站，暂不做
```

依赖方向必须单向，不允许反向引用：

```text
campus-core（纯 TypeScript）
   ↓
campus-framework（框架适配）
   ↓
campus-ui（具体组件）
   ↓
campus-admin（装配）
   ↓
examples/*（只从包名引用，不引用源码）
```

## 3. 各包职责

| 包 | 允许依赖 | 职责 | 升级时是否需要改 |
| --- | --- | --- | --- |
| `campus-core` | 只依赖 TypeScript | 应用生命周期、容器、配置、契约、Facade | 基本不需要 |
| `campus-framework` | 可依赖 `vue` | 响应式出口、Vue 插件桥接、`useCampus` | 需要，但只在这一层 |
| `campus-ui` | 只依赖 `campus-framework` 与图标库 | 组件模板、交互、样式 | 只在模板语法变化时微调 |
| `campus-admin` | 依赖以上三个包 | 装配、内置组件注册、统一出口 | 装配关系变化时 |

判断标准很简单：**在 `campus-core` 里写不出来的东西，都属于 framework 或更高层。**

## 4. 对 Laravel 概念的对应关系

| Laravel | Campus Admin | 位置 |
| --- | --- | --- |
| Application | `CampusApplication` | `packages/campus-core/src/application.ts` |
| Service Container | `CampusContainer` | `packages/campus-core/src/container.ts` |
| Service Provider | `CampusProvider` 契约 + `defineProvider` | `packages/campus-core/src/contracts/provider.ts` |
| Package / Plugin | `CampusPlugin` 契约 + `definePlugin` | `packages/campus-core/src/contracts/provider.ts` |
| Facade | `campus('service')` | `packages/campus-core/src/facade.ts` |
| config/*.php | `CampusConfig` 对象 | `packages/campus-core/src/contracts/config.ts` |
| bootstrap/app.php | `createCampusAdmin()` | `packages/campus-admin/src/plugin.ts` |
| Blade 视图 | `.vue` 组件 | `packages/campus-ui/src/components/*` |

生命周期与 Laravel 一致：**register 只做绑定，boot 才允许依赖其他提供者**。

```ts
import { createCampusAdmin, defineProvider } from '@unionschool/campus-admin'

const requestProvider = defineProvider({
  name: 'request',
  register(context) {
    // 只绑定，不调用其他服务
    context.bind('request', () => createRequestClient(context.get('request.baseURL')))
  },
  boot(context) {
    // 此时 auth 等提供者已注册完成
    const request = context.resolve('request')
    request.useTokenProvider(() => context.resolve('auth').token)
  },
})

const campus = createCampusAdmin({
  name: '众校通智慧校园',
  version: '1.0.0',
  config: { request: { baseURL: '/api' } },
  providers: [requestProvider],
})

app.use(campus)
```

## 5. “框架更新不影响项目”的四道防线

### 第一道：唯一框架出口

组件不再直接写 `import { ref } from 'vue'`，而是：

```ts
import { computed, ref } from '@unionschool/campus-framework'
```

升级 Vue 时只检查 `packages/campus-framework/src/vue.ts`。该文件只是转发 Vue 的稳定 API，
即使将来替换成别的响应式实现，改动也集中在一个文件。

### 第二道：业务逻辑与渲染分离

日期计算、过滤、文案拼装放在 `packages/campus-ui/src/components/<name>/src/core.ts`，
纯 TypeScript，不依赖 Vue，可以：

- 直接用 `tsx` / Node 跑单测，不需要挂载组件。
- 复用到小程序、Electron、SSR 等其他终端。
- 在 Vue 大版本升级时完全不改。

`.vue` 文件只做三件事：接收 Props、调用 core、渲染模板。

### 第三道：机械化的边界门禁

`scripts/check-boundaries.mjs` 在 CI 中强制以下规则：

```text
1. packages/campus-core 不得依赖 vue、vite、@vue/*、@lucide/vue、任何 .vue 文件
   以及其他 @unionschool/* 包
2. 只有 packages/campus-framework 可以直接 import 'vue'
```

违反时 `pnpm run check` 直接失败，避免“约定只写在文档里，代码里慢慢失效”。

### 第四道：约束版本范围

- `vue` 保持在 `peerDependencies`，不打入产物，由使用方决定版本。
- 最低支持版本为 **Vue 3.5.42**：组件使用了 `defineOptions`、`defineModel` 等 3.4+ 能力，
  3.5 之前的版本不保证可用，因此 `peerDependencies` 与 `devDependencies` 统一写 `^3.5.42`。
- `package.json` 的 `engines.node` 与 `devDependencies` 锁定已验证范围。
- 升级 Vue / Vite / TypeScript 视为兼容性变更，必须走 PR 并记录到 Changelog。

## 6. 日常开发约定

### 新增组件

```text
packages/campus-ui/src/components/<kebab-name>/
├── src/core.ts             # 纯逻辑，必须有
├── src/data.ts             # 演示数据，可省略
├── src/<kebab-name>.vue    # 只做渲染
├── style/index.css         # 组件样式
└── index.ts                # 导出 Ca 前缀组件与公开类型
```

然后在 `packages/campus-admin/src/plugin.ts` 的 `builtInComponents` 登记一行即可全局可用。

### 新增能力（请求、权限、国际化）

优先以 Provider 形式提供，而不是在组件里直接调用：

```ts
export const permissionProvider = defineProvider({
  name: 'permission',
  register(context) {
    context.bind('permission', () => createPermissionChecker(context.get('permission.rules')))
  },
})
```

业务代码通过 `campus('permission')` 获取，替换实现不改调用方。

### 命名

- Vue 组件导出统一 `Ca` 前缀，例如 `CaDailyAgenda`。
- 旧的 `DailyAgenda`、`WeeklyTimetable` 保留为兼容别名，后续 Minor 版本标记弃用。
- 纯函数与类型使用业务语义命名，不出现 `Common`、`Base`、`Util` 之类的兜底命名。

## 7. 升级框架时的检查清单

```text
1. pnpm run check:boundaries              # 确认分层没有被破坏
2. pnpm run typecheck                     # 各包与示例类型检查
3. pnpm run build:packages                # 按依赖顺序构建并输出类型声明
4. pnpm run build:example                 # 示例站点按包名引用并通过构建
5. 检查 packages/campus-framework/src/vue.ts 是否有被移除或改签名的 API
6. 运行 examples/admin，验证课表与日程交互
7. 更新 CHANGELOG 与最低版本说明
```

如果 1–6 全部通过，说明升级只影响了适配层，业务项目和业务组件无需改动。

## 8. 示例与应用的关系

- 示例与业务项目一样，只能从包名引用：`import { createCampusAdmin } from '@unionschool/campus-admin'`。
- 示例不得通过 Vite `alias` 或 `tsconfig.paths` 指向 `packages/*/src`，否则无法验证真实发布产物。
- 新增示例统一放在 `examples/<name>/`，包名 `@unionschool/example-<name>`，构建产物输出到各自的 `dist/`。
- `campus.zhongxiaotong.com` 对应 `examples/admin`，上传脚本只同步该示例的 `dist/`。

## 9. 后续可选演进

- 引入 Vitest，为 `packages/campus-ui/src/components/*/src/core.ts` 补纯函数测试。
- 引入 ESLint `no-restricted-imports`，把边界规则前移到编辑器。
- 抽出独立主题包，把 `packages/campus-ui/src/styles` 迁出为 `campus-theme`。
- 按需从 `campus-core` 拆分 `campus-request`、`campus-auth`、`campus-permission`。

## 10. 构建脚本的类型配置

各包的 `vite.config.ts` 使用了 `node:url` 等 Node 内置模块，需要 `@types/node`。
它声明在**仓库根**的 `devDependencies`，原因有两个：

- pnpm 只把依赖安装到声明它的包下面，根目录声明才能让所有包的构建脚本共享同一份类型。
- `tsconfig.base.json` 不设置 `types` 字段（省略即包含 `node_modules/@types` 下全部类型），
  而 `packages/campus-ui`、`packages/campus-admin` 显式写了 `"types": ["vite/client"]`，
  因此 Node 类型不会进入浏览器产物的类型环境。

构建脚本的类型检查由根目录 `tsconfig.node.json` 负责，它只包含 `vite.config.ts` 与 `scripts/**/*.mjs`，
并显式声明 `"types": ["node"]`。业务源码与构建脚本的类型环境因此互不干扰。
