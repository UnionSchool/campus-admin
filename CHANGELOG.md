# 更新日志

本项目版本号遵循 Semantic Versioning。Monorepo 采用统一版本号，根 `package.json` 的 `version` 是唯一版本来源。

## [Unreleased]

### 架构

- 从单包拆分为 pnpm Monorepo，包含 `@unionschool/campus-core`、`@unionschool/campus-framework`、`@unionschool/campus-ui`、`@unionschool/campus-admin` 四个包。
- `campus-core` 提供应用生命周期（`register → boot → start`）、服务容器、上下文、配置契约与 Facade。
- `campus-framework` 成为全项目唯一直接依赖 `vue` 的包，统一导出响应式 API 并提供 `useCampus`。
- `campus-admin` 负责装配三个包并注册内置组件，业务项目只需要安装这一个包。
- 新增 `scripts/check-boundaries.mjs` 分层边界检查，纳入 `pnpm run check` 门禁。
- 新增 `scripts/verify-pack.mjs` 发布产物校验，检查各包 tarball 白名单。

### 示例

- 新增 `examples/` 目录，`examples/admin` 作为学校管理后台示例与 `campus.zhongxiaotong.com` 演示站。
- 示例与业务项目一致，只从 npm 包名引用框架，不配置 `src` 别名，保证文档示例与真实用法一致。
- 预留 `examples/web` 目录，用于后续学校官方网站，暂不实现。
- 示例后台顶栏右上角新增明暗主题开关：切换调用 `setTheme()`，选择记在 `localStorage`，未选择时跟随系统偏好；入口先落主题再挂载，避免首屏闪一下亮色。
- 示例自身的样式（外壳、首页、学生管理、课程表、组件总览）全部改为引用 `--ca-*` Token，暗色下不再残留硬编码浅色；首页彩色图标底在暗色下改用固定 palette 色，避免白图标对比度不足。
- 示例后台新增业务语言包（`examples/admin/src/locale`，app / menu / page 三个命名空间），通过 `createCampusAdmin` 的 `config.locale` 交给框架；顶栏语言开关切换并记住选择，组件文案与业务文案一起切换。
- 侧栏菜单文案按「后端返回稳定 id + 可选 labelKey」取词条（`menu.<id>`），取不到时用后端下发的 label 兜底，后端还没接入多语言时页面也不会出现裸 key。
- 新增顶栏语言开关：`中 / EN` 分段按钮，选择记在 `localStorage`，入口先定语言再挂载，避免首屏先中文再切英文。

### 组件

- 新增国际化：`packages/campus-ui/src/locale` 内置 zh-CN / en-US 词条，`useLocale()` 取词、`setLocale()` 切换、`te()` 判断词条是否存在，`caMessages` 可直接合并进业务已有的 vue-i18n 实例。
- 组件内置文案全部改为词条：操作按钮（查询 / 重置 / 展开 / 收起 / 清空 / 移除 / 返回 / 关闭）、空态与加载态、分页「共 N 条」、表格空态、弹窗与抽屉默认按钮、下拉「请选择 / 暂无选项」、考勤状态词典、课表与日程的全部界面文案，以及 21 处中文 `aria-label`。
- 语言相关格式统一改为 `Intl`：年月的「2026年9月 / September 2026」、星期标签、统计数值千分位、表格字符串排序的 locale，不再手工拼接中文。
- 组件库对 vue-i18n 保持零依赖：`useLocale()` 注入不到实例时回退到内置 zh-CN 默认实例，单独使用组件库也能正常工作。
- `campus-admin` 的 `createCampusAdmin` 支持 `config.locale`（locale / fallbackLocale / messages），业务词条与组件库内置词条深合并到同一个语言实例。
- 新增 `scripts/check-locale.mjs` 并纳入 `npm run check`：校验代码用到的词条键都存在、各语言词条数量一致。
- 新增《Campus Admin 国际化使用指南》（`docs/Campus-Admin-国际化使用指南.md`）：一分钟接入、词条与命名空间约定、取词切换到日期数字格式化、后端文案对接、与 vue-i18n 共存、加语言与排查清单；组件使用指南、根 README、组件库 README 与示例 README 均已加入入口。
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
