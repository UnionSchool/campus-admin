# lib/mock 演示数据

按**接口 uri** 存放演示数据，路径与后端路由一一对应。
`request.ts` 内部按 uri 查找，业务代码里的 url 始终只有一份。

## 目录约定

| 接口 uri | 文件 |
| --- | --- |
| `/card/account/record/page` | `mock/card/account/record/page.json` |
| `/card/account/balance` | `mock/card/account/balance.json` |
| `/card/account/recharge` | `mock/card/account/recharge.json` |
| `/course/schedule` | `mock/course/schedule.json` |
| `/menu/main` | `mock/menu/main.json` |
| `/student/page` | `mock/student/page.json` |
| `/notice/page` | `mock/notice/page.json` |

- 分页列表放在 `page.json`，与接口的 `/page` 子路径对应。
- 目录层级 = uri 层级，新增接口时按同样的路径建文件即可，不需要改代码。

## 数据格式

与真实接口完全一致，直接复制后端返回即可：

```json
{
  "code": 0,
  "msg": "success",
  "data": [],
  "count": 12,
  "extra": {}
}
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `code` | 是 | `0` 表示成功，其他为业务错误码 |
| `msg` | 是 | 提示文案 |
| `data` | 否 | 业务数据，对象或数组 |
| `count` | 否 | 分页总数，列表接口使用 |
| `extra` | 否 | 附加数据，例如筛选回显、字典、统计 |

因为格式与真实接口一致，可以把线上真实响应直接覆盖到这些文件里做回归对比。

## 环境开关

由 `request.ts` 内部判断，业务代码零感知：

```ts
// 开发环境且存在同名 mock 文件 → 直接返回演示数据
// 生产环境，或开发环境下没有对应 mock 文件 → 走真实接口
```

因此接入真实后端时：

1. 该接口的 mock 文件可以直接删除，开发环境会立刻改走真实请求；
2. 或者把 `main.ts` 里的 `request.mock` 显式设为 `false`，整体关闭 mock。

## 为什么用 glob 而不是逐个 import

带连字符或全小写的文件名无法作为合法 JS 标识符，逐个 `import` 会写得很别扭。
这里用 `import.meta.glob('./**/*.json', { eager: true })` 自动收集，
新增文件不需要登记，也不会出现"加了文件忘了注册"的情况。
