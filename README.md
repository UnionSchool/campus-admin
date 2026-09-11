# Campus Admin

面向智慧校园后台管理场景的 Vue 3 前端框架。

- npm：`@unionschool/campus-admin`
- 演示与文档：<https://campus.zhongxiaotong.com>
- GitHub：<https://github.com/UnionSchool/campus-admin>
- Gitee：<https://gitee.com/UnionSchool/campus-admin>

> 当前处于早期开发阶段，API 可能调整，暂不建议直接用于生产环境。

## 本地开发

要求 Node.js 20.19 或更高版本。

```bash
npm ci
npm run dev
```

发布前检查：

```bash
npm run check
```

从 `main` 同时发布到 GitHub、Gitee 和 npm：

```bash
npm run deploy
```

仅执行发布前演练检查：

```bash
npm run deploy -- --dry-run
```

完整的 npm、GitHub 和 Gitee 发布方法见[仓库管理规范](./docs/Campus-Admin-仓库管理规范.md#7-发布流程)。

## 许可证

[MIT](./LICENSE)
