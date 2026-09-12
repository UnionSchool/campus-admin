# feature —— 功能类

## 判据

**由多个原子/基础组件组成，完成一件完整的事，且不区分用户角色。**

判断方法：能用一句话说清"它做完了什么"。例如"选一个学生""看一周课表"。
如果同一件事在不同角色下长得不一样（班主任 / 财务 / 校长），那属于业务页面，不进组件库。

这一层**不追求数量**，只在有真实页面需求时才新增。

## 组件

| 组件 | 说明 |
| --- | --- |
| `CaStudentPicker` | 搜索并选择学生，支持单选与多选 |
| `CaWeeklyTimetable` | 周课表，个人与班级切换、按周浏览 |
| `CaDailyAgenda` | 按日期查看日程，支持按周切换 |

## 数据约定

功能类组件同样**不访问接口**：候选数据通过 Props 传入，操作通过事件抛出。
`CaWeeklyTimetable` 与 `CaDailyAgenda` 当前内置演示数据，接入真实项目时改为 Props 注入。

## 目录约定

```text
feature/student-picker/
├── src/student-picker.vue
├── src/core.ts             # 过滤、选中态计算等纯逻辑
├── style/index.css
├── index.ts
└── README.md
```

## 新增组件

1. 在 `feature/<kebab-name>/` 建目录放文件。
2. 在 `feature/index.ts` 里加上命名导出，并加入 `featureComponents` 注册表。

新组件要先确认它落不进 `atom` 与 `base`：单个控件是原子，纯区域渲染是基础，
只有当"多个组件组合起来完成一件事"时才归到这一层。
