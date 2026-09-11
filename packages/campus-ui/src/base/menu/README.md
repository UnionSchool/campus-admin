# menu 菜单分类

> 位置：`packages/campus-ui/src/base/menu/`（基础类下的菜单子分类）。

菜单类组件按类别组织，便于后续持续扩展。各菜单共用同一套树结构与状态处理，
避免逐个组件重复实现展开、选中、key 解析等逻辑。

## 目录约定

```text
menu/
├── core.ts          # 共用工具：树拍平、key 解析、默认展开
├── side-menu/       # 侧边导航菜单（支持多级）
│   ├── src/side-menu.vue
│   └── index.ts
└── <下一个菜单>/    # 如 dropdown-menu、context-menu
```

组件目录内只放与该菜单强相关的代码，通用的树处理放 `core.ts`。

## 共用能力（core.ts）

| 方法 | 作用 |
| --- | --- |
| `resolveKey(item)` | 取节点唯一标识，依次回退 `key` → `value` → `label` |
| `flattenMenu(items, expanded, level, parentKeys)` | 按展开状态把菜单树拍平，产出渲染所需的 `level`、`parentKeys` |
| `collectExpandableKeys(items)` | 收集所有可展开节点，用于默认全部展开 |

拍平式渲染的收益：多级菜单不需要递归组件，展开状态集中在单实例里，
不会出现父子组件状态不同步的问题；扩展到三级及以上也无需改组件结构。

## 组件设计原则

- **不依赖路由**：菜单只抛出 `select` 事件并更新 `modelValue`，跳转由业务侧决定。
  这样同一个组件既能用于 Vue Router，也能用于小程序、静态页面或纯链接。
- **受控与非受控都支持**：`expandedKeys` 传入即受控，不传则组件内部维护。
- **数据驱动**：菜单结构由 `items` 描述，业务侧可从接口下发。

## 已实现的菜单

### SideMenu 侧边菜单

```vue
<script setup lang="ts">
import { CaSideMenu } from '@unionschool/campus-ui'
import type { SideMenuItem } from '@unionschool/campus-ui'
import { useRouter } from 'vue-router'

const router = useRouter()

const items: SideMenuItem[] = [
  { label: '学生管理', icon: GraduationCap, value: '/students' },
  { label: '考勤管理', icon: ClipboardCheck, badge: '4', children: [
    { label: '今日考勤', value: '/attendance/today' },
    { label: '请假审批' },
  ] },
]

function go(item: SideMenuItem) {
  if (item.value) router.push(item.value)
}
</script>

<template>
  <CaSideMenu :items="items" :model-value="$route.path" @select="go" />
</template>
```

主要 Props：

| Prop | 说明 | 默认值 |
| --- | --- | --- |
| `items` | 菜单数据，支持 `children` 多级 | — |
| `modelValue` | 当前选中节点的 key | — |
| `expandedKeys` | 受控展开状态 | 非受控 |
| `defaultExpandAll` | 默认展开全部分组 | `false` |
| `highlightBranch` | 子项选中时父级高亮 | `true` |
| `indent` | 一级左内边距，可传负数继续左移 | `14` |
| `indentStep` | 每深一级额外增加的缩进量 | `14` |
| `levelOffset` | 按层级微调缩进，下标即层级，例如 `[0, 0, -5]` | `[]` |
| `subIcon` | 二级及以下没有子菜单时的默认图标 | 小圆点 |
| `ariaLabel` | 导航区域无障碍标签 | `导航菜单` |

事件：`update:modelValue`、`update:expandedKeys`、`select`、`expand-change`。

### 布局规则

```text
一级：[箭头占位 14px][图标 16px][文字 14px][角标·展开箭头靠右]，左内边距 = indent
二级：[图标 14px][文字 12px][角标·展开箭头靠右]，左内边距 = indent + indentStep
三级：[图标 14px][文字 12px]，左内边距 = indent + 2 × indentStep
```

- **箭头固定在右侧**，展开时旋转 180°，收起时指向下方。
- **一级保留箭头列占位**，所以同一层级里「有子菜单」和「没有子菜单」的项，
  图标和文字左边界完全对齐。
- **二级及以下的默认图标按“是否还能展开”回退**：

  | 情况 | 默认图标 |
  | --- | --- |
  | 还有子菜单 | 向右双箭头 `ChevronsRight`（暗示可继续展开） |
  | 没有子菜单 | 小圆点 `Dot`，并用更粗描边保证小尺寸清晰 |

  两种回退都可以用 `subIcon` prop 覆盖，或按节点写 `icon`。
- 缩进公式：`indent + level × indentStep + levelOffset[level]`。
  需要只调某一层时用 `levelOffset`，不影响其他层级：

  ```vue
  <!-- 一级、二级不变，三级左移 5px -->
  <CaSideMenu :indent="2" :indent-step="32" :level-offset="[0, 0, -5]" />
  ```
- **层级没有上限**。展开状态用单实例维护后按 `level` 拍平渲染，
  所以数据里嵌套到几层就能渲染到几层，组件代码不需要改。
- 二级及以下统一样式：行高 38px、文字 12px；一级保持 42px / 14px。

### 自定义图标与文字

`icon` 字段按节点设置，一二级可分别指定：

```ts
const items: SideMenuItem[] = [
  { label: '学校概况', icon: LayoutDashboard, children: [
    { label: '我的首页', value: '/home', icon: LayoutDashboard },
    { label: '学生管理', value: '/students', icon: GraduationCap },
    { label: '未指定图标时回退为圆点', value: '/other' },
  ] },
  { label: '教学教务', icon: BookOpen, children: [
    { label: '课程管理', children: [          // 三级：菜单项自身也可再带 children
      { label: '课程表', value: '/teaching/course-schedule' },
      { label: '课程设置' },
    ] },
    { label: '成绩管理' },
  ] },
]
```

### 选中与自动展开

- `modelValue` 命中任意层级（包括三级）时，组件会**自动展开它的整条祖先链**，
  不会出现「页面已经切过去，菜单里却找不到当前项」。
- 祖先链上的节点会带 `is-branch` 高亮，视觉上能看出当前项属于哪个模块。
- 点击带 `children` 的节点只切换展开，不触发 `select`；只有叶子节点才抛出 `select` 事件。

需要完全自定义渲染时用插槽，插槽参数是当前节点：

```vue
<CaSideMenu :items="items" :model-value="route.path" @select="go">
  <!-- 自定义图标 -->
  <template #icon="{ item }">
    <MySchoolIcon v-if="item.value === '/home'" />
    <component :is="item.icon" v-else />
  </template>

  <!-- 自定义文字，例如加副标题或状态 -->
  <template #default="{ item }">
    <span class="menu-label">{{ item.label }}</span>
    <small v-if="item.badge">{{ item.badge }} 项待办</small>
  </template>
</CaSideMenu>
```

## 后续规划

| 组件 | 用途 |
| --- | --- |
| `dropdown-menu` | 操作列、更多操作、用户菜单 |
| `context-menu` | 表格行/画布区域的右键菜单 |
| `tree-menu` | 年级班级、组织架构等树形选择 |
| `nav-menu` | 顶部水平导航，与侧边菜单共享数据 |
