# @campus-admin/locale

面向智慧校园后台的国际化运行时：词条管理、取词与切换、日期与数字格式化。

组件库（`@campus-admin/ui`）与业务共用同一个语言实例：组件词条挂 `ca.*` 命名空间，
业务词条放自己的根键（示例里是 `app.*` / `menu.*` / `page.*`）。

## 安装

```bash
pnpm add @campus-admin/locale
```

## 用法

```ts
import { createLocale, installLocale, useLocale, setLocale } from '@campus-admin/locale'
import { createApp } from 'vue'

const app = createApp(App)

const locale = createLocale({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: { 'zh-CN': zhCN, 'en-US': enUS },   // 业务词条，与内置 ca.* 深合并
})

installLocale(app, locale)     // 之后 setLocale / useLocale 都指向这个实例
setLocale('en-US')             // 切换：组件文案与业务文案一起变
```

组件内取词：

```ts
const { t, te } = useLocale()

t('ca.pagination.total', { total: 12 })   // 组件词条
t('page.home.count', { total: 12 })       // 业务词条
te('menu.school-student')                 // 判断词条是否存在（后端文案兜底用）
```

日期与数字统一走 `Intl` 封装，不要在业务里拼「年 / 月 / 日」：

```ts
import { formatDay, formatMonth, formatNumber, weekdayLabels } from '@campus-admin/locale'

formatMonth(new Date(2026, 8, 11), 'en-US')   // September 2026
weekdayLabels('zh-CN')                        // ['周一', ...]
formatNumber(3286, 'en-US')                   // 3,286
```

## 约定

- `ca.*` 由组件库保留；业务要改写组件文案时只覆盖 `ca` 下的**叶子键**，不要覆盖父级路径（会整段静默失效）。
- 词条结构就是 vue-i18n 的 messages，已经用 vue-i18n 的项目不要再装第二个实例，把 `caMessages` 合并进自己的实例即可。
- 找不到词条时原样返回 key，开发环境会打一次 `[@campus-admin/locale] 缺少词条：xxx`。

完整说明见仓库文档《Campus Admin 国际化使用指南》。

## 版权

使用本项目时请保留版权信息（MIT 许可要求随副本保留版权声明）：

- 保留包内的 `LICENSE` 文件与版权声明；
- 保留页面页脚中的「Powered By 众校通 ®」与联系方式（示例用 `Copyright` 组件统一渲染）；
- 二次分发或修改后的版本，请在显著位置保留同样的版权声明。

---

Powered By 众校通 ®
