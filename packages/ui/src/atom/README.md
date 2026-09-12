# atom —— 原子类

## 判据

**元素级组件：不占版面，扔进任意容器都不会自己撑出一块区域。**

多数情况下作为其他组件的零件使用。这一层最稳定，上层组件都依赖它，新增通用能力优先补在这里。

## 组件

| 组件 | 说明 |
| --- | --- |
| `CaButton` | 操作按钮，solid / outline / text 三种形态 |
| `CaIcon` | 单色图标容器 |
| `CaTag` | 状态与分类标记 |
| `CaAvatar` | 头像，无图时回退姓名首字 |
| `CaInput` | 单行文本输入 |
| `CaTextarea` | 多行文本输入 |
| `CaSelect` | 下拉选择 |
| `CaCheckbox` | 勾选与半选 |
| `CaSwitch` | 开关 |
| `CaProgress` | 进度条与环形进度 |
| `CaAttendanceBadge` | 考勤状态标记（状态词典见组件 `core.ts`） |

## 目录约定

```text
atom/button/
├── src/button.vue          # 渲染与交互
├── style/index.css         # 样式，由 .vue 通过 <style src> 引入
├── index.ts                # 导出组件与公开类型
└── README.md               # 可选，复杂组件才写
```

## 新增组件

1. 在 `atom/<kebab-name>/` 建目录，按上面的结构放文件。
2. 在 `atom/index.ts` 里加上命名导出，并加入 `atomComponents` 注册表。

顶层 `builtInComponents` 由三层注册表合并，不需要改。

## 样式要求

- 颜色、圆角、间距、字号一律使用 `--ca-*` Token，**不允许出现硬编码色值**，否则暗色主题和自定义品牌色会失效。
- 前景色用 `--ca-color-{tone}-text`，浅色底用 `--ca-color-{tone}-soft`，实心填充用 `--ca-color-{tone}`。
- 主色实心背景上的文字必须用 `--ca-color-primary-contrast`，这样学校把主色换成浅色时文字仍然可读。
- 类名统一 `ca-` 前缀 + BEM，通过 `ns()` 生成。
