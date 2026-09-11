# 更新日志

本项目版本号遵循 Semantic Versioning。Monorepo 采用统一版本号，根 `package.json` 的 `version` 是唯一版本来源。

## [Unreleased]

### 架构

- 从单包拆分为 pnpm Monorepo，包含 `@unionschool/campus-core`、`@unionschool/campus-framework`、`@unionschool/campus-ui`、`@unionschool/campus-admin` 四个包。
- `campus-core` 提供 Laravel 风格的应用生命周期（`register → boot → start`）、服务容器、上下文、配置契约与 Facade。
- `campus-framework` 成为全项目唯一直接依赖 `vue` 的包，统一导出响应式 API 并提供 `useCampus`。
- `campus-admin` 负责装配三个包并注册内置组件，业务项目只需要安装这一个包。
- 新增 `scripts/check-boundaries.mjs` 分层边界检查，纳入 `pnpm run check` 门禁。
- 新增 `scripts/verify-pack.mjs` 发布产物校验，检查各包 tarball 白名单。

### 示例

- 新增 `examples/` 目录，`examples/admin` 作为学校管理后台示例与 `campus.zhongxiaotong.com` 演示站。
- 示例与业务项目一致，只从 npm 包名引用框架，不配置 `src` 别名，保证文档示例与真实用法一致。
- 预留 `examples/web` 目录，用于后续学校官方网站，暂不实现。

### 组件

- 组件导出统一 `Ca` 前缀：`CaDailyAgenda`、`CaWeeklyTimetable`。
- 组件逻辑与渲染分离，日期计算、过滤与文案抽到纯 TypeScript 的 `core.ts`。
- 组件样式按组件目录拆分，`campus-ui` 与 `campus-admin` 均输出 `style.css` 入口。
- 组件层重组为 `atom`（原子，元素级）/ `base`（基础，区域级）/ `feature`（功能，多组件组合完成一件事）三层，判据与目录约定写在每层 README。
- `campus-ui` 共 27 个组件：原子层 Button、Icon、Tag、Avatar、Input、Textarea、Select、Checkbox、Switch、Progress、AttendanceBadge；基础层 Table、Pagination、Statistic、Modal、Drawer、Empty、Skeleton、Toast、Breadcrumb、SideMenu、PageHeader、SearchForm、ClassTree；功能层 StudentPicker、WeeklyTimetable、DailyAgenda。
- 组件样式统一迁移到 `<组件>/style/index.css`，由 `.vue` 通过 `<style src>` 引入，不再写在 `.vue` 的 `<style scoped>` 里。
- 新增暗色主题：`setTheme('dark' | 'light' | 'auto')` 写 `<html data-ca-theme>`，Token 层统一覆盖语义与中性色，组件样式不分主题；`auto` 跟随系统并监听切换。
- 新增运行时品牌换色：`setPrimaryColor('#7c4dff')` 只需一个主色，hover / active / 浅底 / 前景文字 / 实心背景文字色全部自动推导，浅色品牌自动改用深色文字，暗色主题下按深色底重算。
- 组件颜色全部改为 Token 引用，移除 27 个组件内的硬编码色值；课表与日程两块样式重写为 `ca-` 前缀并支持主题。
- 组件导出收敛为「组件目录 + 所属层 index.ts」两处修改，顶层 `builtInComponents` 由三层注册表合并。
- 修复 `CaPageHeader` 的 `bordered` 分隔线不生效：`defineProps` 声明的 prop 不会落到根元素，改为类名修饰符控制。
- 新增设计 Token 层（`--ca-*` 三层变量）与 `ns()` BEM 类名工具。
- `CaTable` 支持泛型列配置、自定义单元格插槽、受控与非受控排序。
- 新增组件使用文档：`docs/Campus-Admin-组件使用指南.md`。

### 工程

- 包管理器切换为 pnpm，CI 与发布流程改为 pnpm 工作区。
- 发布流程按 `campus-core → campus-framework → campus-ui → campus-admin` 顺序发布，并校验四个包版本一致。
- 移除 tsconfig 中已废弃的 `baseUrl`，改用相对 `paths`，兼容 TypeScript 7。
- 最低支持版本统一为 Vue 3.5.42：`campus-framework`、`campus-ui`、`campus-admin` 的
  `peerDependencies` 与 `devDependencies` 都写 `^3.5.42`，避免声明兼容 3.5 之前的版本。
- 补充 `@types/node`，构建脚本的 `node:url` 等导入可正常解析。
