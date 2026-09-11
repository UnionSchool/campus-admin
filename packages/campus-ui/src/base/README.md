# base —— 基础类

## 判据

**区域级组件：给一个宽度就能自己撑满并正常运作，可以直接放进页面布局。**

与业务无关，不含校园数据模型。归类时的仲裁规则是：
**价值在于"渲染结构"的放这里，价值在于"完成一件事"的放到 `feature`。**

## 组件

| 组件 | 说明 |
| --- | --- |
| `CaTable` | 数据表格，泛型列配置、自定义单元格、受控/非受控排序 |
| `CaPagination` | 分页器 |
| `CaStatistic` | 指标数值 |
| `CaEmpty` | 空状态 |
| `CaSkeleton` | 骨架屏 |
| `CaModal` | 对话框（遮罩、滚动锁、Esc、焦点循环） |
| `CaDrawer` | 抽屉（右 / 左 / 底部） |
| `CaToastContainer` | 轻提示挂载点，配合 `toast` 命令式 API |
| `CaBreadcrumb` | 面包屑 |
| `CaPageHeader` | 页面标题栏 |
| `CaSearchForm` | 查询条件区域 |
| `CaClassTree` | 年级班级树 |
| `CaSideMenu` | 多级侧边菜单 |

## 目录约定

```text
base/table/
├── src/table.vue
├── src/core.ts             # 纯逻辑（排序、取值、分页），可单测
├── style/index.css
├── index.ts
└── README.md
```

`base/menu/` 是一个**子分类**：菜单类组件会持续增加（下拉菜单、右键菜单、水平导航），
它们共用 `base/menu/core.ts` 里的树拍平与 key 解析，所以在这一层下面单独留了一个目录。

## 新增组件

1. 在 `base/<kebab-name>/` 建目录放文件。
2. 在 `base/index.ts` 里加上命名导出，并加入 `baseComponents` 注册表。

## 样式要求

与 `atom` 相同：只用 `--ca-*` Token，不写死颜色，主色实心背景用 `--ca-color-primary-contrast`。
区域容器要自带 `--ca-surface-card` 底色和边框，不要假设父级会给背景。
