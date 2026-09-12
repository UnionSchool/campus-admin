# Campus Admin

面向智慧校园后台管理场景的 Vue 3 前端框架。

- 演示站点：<https://campus.zhongxiaotong.com>
- GitHub：<https://github.com/UnionSchool/campus-admin>
- Gitee：<https://gitee.com/UnionSchool/campus-admin>

> 当前处于早期开发阶段（`0.1.0-alpha`），API 可能调整，暂不建议直接用于生产环境。

## 包结构

| 包 | 说明 | 依赖 |
| --- | --- | --- |
| [`@campus-admin/icon`](./packages/icon) | 校园语义图标（`CampusStudent`、`CampusCard`…）与后端图标名解析 | `@lucide/vue` |
| [`@campus-admin/locale`](./packages/locale) | 国际化运行时：词条、取词切换、`Intl` 日期数字格式化 | `vue` |
| [`@campus-admin/ui`](./packages/ui) | 后台组件库：27 个组件、设计 Token、主题 | `@campus-admin/locale`、`vue` |
| [`@campus-admin/core`](./packages/core) | 框架层 + 装配入口，业务项目通常只安装这一个包 | 上面三个包 |

```text
@campus-admin/core          框架层 + 装配入口（生命周期、容器、Vue 适配、ca API）
├── @campus-admin/ui        组件库（组件 / 设计 Token / 主题）
├── @campus-admin/locale    国际化运行时
└── @campus-admin/icon      校园语义图标
```

业务项目只需要：

```bash
pnpm add @campus-admin/core
```

## 示例应用

`examples/` 下的每个目录都是独立示例，按正式使用方式从 npm 包名引用框架，不配置 `src` 别名，保证“文档里写的用法”就是“示例里跑的用法”。详见 [examples/README.md](./examples/README.md)。

| 示例 | 包名 | 说明 |
| --- | --- | --- |
| `examples/admin/` | `@campus-admin/example-admin` | 学校管理后台示例，同时作为 `campus.zhongxiaotong.com` 演示站 |
| `examples/web/` | — | 预留目录，学校官方网站，暂不做 |

## 本地开发

要求 Node.js 20.19 或更高版本，包管理器统一使用 pnpm。

```bash
pnpm install
pnpm run build:packages
pnpm run dev:admin
```

示例通过 workspace 链接引用各包的 `dist` 产物，因此修改 `packages/**` 后需要重新执行 `pnpm run build:packages`。

## 常用命令

```bash
pnpm run check              # 分层边界检查 + 类型检查 + 构建各包与示例 + 打包检查
pnpm run check:boundaries   # 只做分层边界检查
pnpm run build:packages     # 按 core → framework → ui → admin 顺序构建
pnpm run build:example      # 构建全部示例
pnpm run up                 # 构建并上传 admin 演示站到 campus.zhongxiaotong.com
pnpm run deploy:dev         # 提交并推送 dev 到 GitHub / Gitee
pnpm run deploy:main        # 提交并推送 main（完整门禁）
pnpm run release            # 打标签并发布到 npm（统一版本号，CI 发布）
```

## 架构约定

```text
packages/core        纯 TypeScript：生命周期、容器、配置、契约
packages/icon    图标：校园语义别名 + 后端图标名解析
packages/locale  国际化：词条、取词、日期数字格式化
packages/ui      组件：只依赖 locale，不反向依赖 core
packages/core    框架与装配：容器、Vue 适配、命令式 API、组件注册
examples/*       示例：只从 npm 包名引用，不引用源码
```

依赖只能向上，`scripts/check-boundaries.mjs` 在 CI 中强制校验：`ui` 不得依赖 `core`，`locale` / `icon` 不得依赖 `ui` 与 `core`，源码里不得出现构建工具，也不得反向依赖 `examples`。

框架升级时只需检查 `@campus-admin/core`，业务组件与业务项目无需改动。完整规则见[框架分层与升级规范](./docs/Campus-Admin-框架分层与升级规范.md)。

## 全局命令式 API：ca

`createCampusAdmin()` 安装时会自动把 `ca` 挂到 `window`，业务页面直接使用，无需 import：

```js
// 加载动画
const loading = ca.loading('加载中')
loading.hide()

// 轻提示
ca.toast('保存成功')          // 对勾图标
ca.toast('保存失败', false)   // 叉号图标

// 提示框
ca.alert('提示')
ca.alert('标题', '提示内容')
ca.alert('标题', '提示内容', () => { /* 点确定后执行 */ })

// 确认框
if (await ca.confirm('删除后不可恢复', '确定删除？')) { ... }

// 通用弹层
ca.modal({ title: '详情', content: '...' })
```

| 方法 | 签名 | 返回 |
| --- | --- | --- |
| `ca.loading` | `(text?: string)` | `{ hide(): void }`，不支持并发 |
| `ca.toast` | `(text: string, success?: boolean)` | `void` |
| `ca.alert` | `(first, second?, third?)` | `void` |
| `ca.confirm` | `(first, second?)` | `Promise<boolean>` |
| `ca.modal` | `({ title?, content, onConfirm? })` | `void` |

需要类型提示时按需 import：

```ts
import { ca } from '@campus-admin/core'
```

## 统一接口返回格式

后端固定返回 `{ code, msg, data, count?, extra? }`，`code === 0` 表示成功。
`count` 仅分页接口返回；`extra` 放筛选回显、字典等附加数据。

request 不做拆包，页面自行判断：

```ts
const res = await getStudentPage({ page: 1 })
if (res.code === 0) {
  list.value = res.data ?? []
  total.value = res.count ?? 0
} else {
  ca.toast(res.msg, false)
}
```

## 发布

仓库采用统一版本号，根 `package.json` 的 `version` 是唯一版本来源，发布脚本会校验每个子包版本是否一致。

完整的 npm、GitHub 和 Gitee 发布方法见[仓库管理规范](./docs/Campus-Admin-仓库管理规范.md#7-发布流程)。

## 文档

- [组件使用指南](./docs/Campus-Admin-组件使用指南.md)：安装方式、主题与品牌色、Table 用法、完整页面写法、组件清单
- [国际化使用指南](./docs/Campus-Admin-国际化使用指南.md)：词条约定、取词与切换、日期与数字格式化、后端文案对接、与 vue-i18n 共存、排查清单
- [框架分层与升级规范](./docs/Campus-Admin-框架分层与升级规范.md)：四层包职责、组件目录约定、升级检查清单
- [仓库管理规范](./docs/Campus-Admin-仓库管理规范.md)：版本、发布流程与仓库约定

## 许可证

[MIT](./LICENSE)

**使用时请保留版权信息**（MIT 许可要求随副本保留版权声明）：

- 保留仓库与各包内的 `LICENSE` 文件与版权声明；
- 保留页面页脚中的「Powered By 众校通 ®」署名；
- 二次分发或修改后的版本，请在显著位置保留同样的版权声明。

## 联系

- 官网：<https://campus.zhongxiaotong.com>

---

Powered By 众校通 ®
