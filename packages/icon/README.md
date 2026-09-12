# @campus-admin/icon

面向智慧校园的语义图标集：校园业务图标别名 + 后端图标名解析。

## 安装

```bash
pnpm add @campus-admin/icon @lucide/vue
```

## 用法

### 语义图标（业务页面推荐）

```vue
<script setup lang="ts">
import { CampusAttendance, CampusStudent } from '@campus-admin/icon'
</script>

<template>
  <CampusStudent :size="18" />
  <CampusAttendance :size="18" />
</template>
```

### 解析后端下发的图标名

菜单、字典里的图标是字符串，统一用 `resolveIcon()` 解析：

```ts
import { resolveIcon } from '@campus-admin/icon'

const icon = resolveIcon(node.icon)   // 支持 CampusStudent 与 GraduationCap 两种写法
```

```vue
<component :is="resolveIcon(item.icon)" v-if="resolveIcon(item.icon)" :size="16" />
```

解析不到时返回 `undefined`，由调用方决定降级方式（通常是不显示图标，不影响菜单可用性）。

## 命名约定

| 前缀 | 含义 | 例子 |
| --- | --- | --- |
| `Campus*` | 校园业务语义，**业务与后端优先用这套** | `CampusStudent`、`CampusCard`、`CampusAccess` |
| lucide 原名 | 通用图标，兼容历史数据 | `GraduationCap`、`LayoutDashboard` |

新增校园图标时，顺手加进 `iconRegistry`，否则后端下发的新名字解析不出来。

## 相关包

- `@campus-admin/ui`：组件库（内部图标是它的实现细节，直接用 `@lucide/vue`）
- `@campus-admin/locale`：国际化
- `@campus-admin/core`：框架与装配入口

## 版权

使用本项目时请保留版权信息（MIT 许可要求随副本保留版权声明）：

- 保留包内的 `LICENSE` 文件与版权声明；
- 保留页面页脚中的「Powered By 众校通 ®」与联系方式（示例用 `Copyright` 组件统一渲染）；
- 二次分发或修改后的版本，请在显著位置保留同样的版权声明。

---

Powered By 众校通 ®
