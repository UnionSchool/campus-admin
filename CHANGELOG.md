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
- 示例后台的主题开关升级为三态：浅色 / 深色 / 自动（跟随系统），自动模式在标题里带出当前实际明暗；`index.html` 内联一段首屏脚本，在样式生效前先定好 `data-ca-theme`，避免自动模式下先亮后暗的闪屏。
- 示例构建产物改用相对路径（`base: './'`）：此前资源写死为 `/assets/...`，直接双击 `dist/index.html`（file://）会因为拿不到资源而白屏。
- 侧栏菜单文案按「后端返回稳定 id + 可选 labelKey」取词条（`menu.<id>`），取不到时用后端下发的 label 兜底，后端还没接入多语言时页面也不会出现裸 key。
- 新增顶栏语言开关：`中 / EN` 分段按钮，选择记在 `localStorage`，入口先定语言再挂载，避免首屏先中文再切英文。

### 组件

- 新增国际化：`packages/campus-ui/src/locale` 内置 zh-CN / en-US 词条，`useLocale()` 取词、`setLocale()` 切换、`te()` 判断词条是否存在，`caMessages` 可直接合并进业务已有的 vue-i18n 实例。
- 组件内置文案全部改为词条：操作按钮（查询 / 重置 / 展开 / 收起 / 清空 / 移除 / 返回 / 关闭）、空态与加载态、分页「共 N 条」、表格空态、弹窗与抽屉默认按钮、下拉「请选择 / 暂无选项」、考勤状态词典、课表与日程的全部界面文案，以及 21 处中文 `aria-label`。
- 语言相关格式统一改为 `Intl`：年月的「2026年9月 / September 2026」、星期标签、统计数值千分位、表格字符串排序的 locale，不再手工拼接中文。
- 组件库对 vue-i18n 保持零依赖：`useLocale()` 注入不到实例时回退到内置 zh-CN 默认实例，单独使用组件库也能正常工作。
- `campus-admin` 的 `createCampusAdmin` 支持 `config.locale`（locale / fallbackLocale / messages），业务词条与组件库内置词条深合并到同一个语言实例。
- 新增 `scripts/check-locale.mjs` 并纳入 `npm run check`：校验代码用到的词条键都存在、各语言词条数量一致。
- 修复 `pnpm run deploy` 本地发布：本地环境无法生成 npm provenance（会报 `Automatic provenance generation not supported for provider: null`），改为本地自动加 `--no-provenance`、CI 中保留；预发布版本自动带 `--tag next`；新增 `--skip-npm` 用于只推标签、交给 `release.yml` 在 CI 里发布。
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
- 亮色主题的主文字色改为中性黑 `#333333`（原 `#2f3d4c`），标题与正文更接近常见的后台观感；次级文字仍保留蓝调灰形成层级。
- 可读性调整：字号整体上调一档（xs/sm/md/lg/xl = 12/13/15/17/21px），次级文字加深到 ≥4.5:1（`--ca-text-secondary: #5c6d7e`）、占位/禁用加深到 ≥3:1（`--ca-text-placeholder: #72808d`）。
- 暗色主题主文字改为纯白 `#ffffff`，与深色底对比度 13:1 以上。
- 新增菜单文字色 Token：亮色一级 `#000000`、二级 `#222222`、三级及以下 `#333333`（暗色依次为 `#ffffff` / `#dddddd` / `#cccccc`），业务可单独覆盖。
- 侧栏菜单字号与行高整体调大并按层级递减：字号一级 18px、二级 17px、三级及以下 16px（`--ca-side-menu-font-size` / `--ca-side-menu-sub-font-size` / `--ca-side-menu-deep-font-size`），行高一级 50px、二级 48px、三级及以下 46px（`--ca-side-menu-item-height` / `--ca-side-menu-sub-item-height` / `--ca-side-menu-deep-item-height`）。
- `CaSideMenu` 去掉一级图标前的占位空列：`indent` 现在就是图标的左内边距（示例一级 20px，每级递进 20px），层级缩进公式为 `indent + level × indentStep + levelOffset[level]`。
- 示例站点去掉 `-webkit-font-smoothing: antialiased`：灰度抗锯齿会让中文笔画发虚，改回系统默认的次像素抗锯齿；同时把示例里 9–11px 的文字统一提到 12px 以上。
- 修复 `CaWeeklyTimetable` 左侧列被压扁的问题：列宽改由 `colgroup` 声明（分组 44px、节次 76px），此前表头首格 `colspan="2"` 让 `table-layout: fixed` 把两列挤成 22px，节次文案溢出、并且周一列被 `nth-child(2)` 误设为 62px 导致七个星期列不等宽。
- `CaWeeklyTimetable` 的「时段 / 节次」表头跨分组 + 节次两列，在左侧区域内左右居中。
- `CaWeeklyTimetable` 表格左右铺满面板，不再留 16px 内边距（工具栏、说明行与图例仍保留原有内边距）。
- `CaTable` 支持泛型列配置、自定义单元格插槽、受控与非受控排序。
- 新增组件使用文档：`docs/Campus-Admin-组件使用指南.md`。

### 工程

- 包管理器切换为 pnpm，CI 与发布流程改为 pnpm 工作区。
- 发布流程按 `campus-core → campus-framework → campus-ui → campus-admin` 顺序发布，并校验四个包版本一致。
- 移除 tsconfig 中已废弃的 `baseUrl`，改用相对 `paths`，兼容 TypeScript 7。
- 最低支持版本统一为 Vue 3.5.42：`campus-framework`、`campus-ui`、`campus-admin` 的
  `peerDependencies` 与 `devDependencies` 都写 `^3.5.42`，避免声明兼容 3.5 之前的版本。
- 补充 `@types/node`，构建脚本的 `node:url` 等导入可正常解析。
