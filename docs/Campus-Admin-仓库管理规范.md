# Campus Admin 仓库管理规范

## 1. 基本信息

| 项目 | 内容 |
| --- | --- |
| GitHub 仓库 | `UnionSchool/campus-admin` |
| npm 包 | `@unionschool/campus-admin` |
| 演示与文档 | <https://campus.zhongxiaotong.com> |
| 技术栈 | Vue 3、TypeScript、Vite |
| 许可证 | MIT |
| 组织方式 | 单仓库、单 `package.json`、单 npm 包 |

## 2. 内容分级与发布边界

仓库内容必须按下表管理：

| 目录或文件 | GitHub | npm | 说明 |
| --- | --- | --- | --- |
| `src/` | 上传 | 编译后发布 | 组件、样式、类型和公共 API 源码 |
| `dist/` | 不上传 | 发布 | 自动生成的 npm 安装内容 |
| `playground/` | 上传 | 不发布 | 本地演示和组件调试应用 |
| `docs/` | 上传 | 不发布 | 面向用户和贡献者的公开文档 |
| `.github/` | 上传 | 不发布 | CI、Release 和协作模板 |
| `.local-docs/` | 不上传 | 不发布 | 内部规划、讨论稿、商业方案和未公开设计资料 |
| `.env*`、密钥、真实数据 | 禁止上传 | 禁止发布 | 敏感信息 |

是否进入 npm 不依赖开发者手工选择，而由根目录 `package.json` 的 `files` 白名单控制。目前仅允许：

```json
{
  "files": ["dist", "README.md", "LICENSE"]
}
```

发布前必须执行 `npm pack --dry-run` 检查实际文件清单。`.npmignore` 与 `files` 不同时使用，避免双重规则造成误判。

## 3. 目录结构

```text
campus-admin/
├── .github/              # 可上传，不进 npm
├── .local-docs/          # 仅本机，不上传、不发布
├── docs/                 # 可上传，不进 npm
├── playground/           # 可上传，不进 npm
├── src/                  # 可上传，构建为 dist
│   ├── components/
│   ├── index.ts          # npm 唯一公开入口
│   └── styles.css
├── dist/                 # 不上传，由构建生成并发布到 npm
├── package.json          # 唯一包配置
└── package-lock.json
```

后续可以在 `src/` 内增加 `campus`、`layout`、`theme`、`icons`、`hooks`、`utils` 和 `locale` 等源码目录，但不得建立独立 `package.json` 或独立版本。

## 4. 内部资料规则

以下内容统一放入 `.local-docs/`：

- 项目规划讨论稿、未确认路线图和内部工作量估算。
- 商业模式、报价、客户信息和未公开产品计划。
- 带真实学校、教师、学生或设备信息的材料。
- 未取得公开授权的参考设计原图、竞品拆解和素材。
- 账号、域名、服务器或发布流程中的敏感操作记录。

`.local-docs/` 已被 Git 忽略，但忽略规则不能替代人工检查。敏感信息曾进入 Git 历史时，单纯删除文件无效，必须立即停止推送并清理历史、轮换相关密钥。

## 5. 分支和提交

- `main`：唯一长期分支，始终保持可构建、可发布。
- `feature/<name>`：新功能。
- `fix/<name>`：缺陷修复。
- `docs/<name>`：公开文档修改。

提交信息使用 Conventional Commits，例如：

```text
feat: add student status component
fix: correct timetable date selection
docs: update repository policy
chore: update build configuration
```

协作启用后，为 `main` 设置分支保护：Pull Request 合并、至少一人审查、CI 必须通过、禁止强制推送和删除分支。

## 6. 版本管理

版本遵循 Semantic Versioning。预发布版本使用 `0.1.0-alpha.1`、`0.1.0-beta.1`、`0.1.0-rc.1`，发布到 npm 的 `next` 标签；稳定版本发布到 `latest` 标签。

根目录 `package.json` 的 `version` 是唯一版本源。Git 标签必须与其完全一致，例如 `v0.1.0-alpha.1`。任何已发布版本不得覆盖或复用版本号。

## 7. npm 发布流程

首次发布由 npm 账号持有人执行：

```bash
npm login
npm whoami
npm run check
npm publish --access public --tag next
```

首次发布成功后，在 npm 包设置中配置 GitHub Trusted Publishing，绑定：

- GitHub Owner：`UnionSchool`
- Repository：`campus-admin`
- Workflow：`release.yml`
- GitHub Environment：`npm`

以后发布：更新版本和 `CHANGELOG.md`，合并到 `main`，创建对应 `v*` 标签并推送。GitHub Actions 对预发布版本使用 `next`，稳定版本使用 `latest`。正式接入 Trusted Publishing 后不保存长期 `NPM_TOKEN`。

## 8. 发布门禁

每次提交发布标签前必须确认：

- `npm ci`、类型检查和库构建成功。
- `npm pack --dry-run` 中没有 `playground/`、`docs/`、`.github/`、`.local-docs/` 和源码外的临时文件。
- 从生成的 `.tgz` 在干净 Vue 项目中完成安装测试。
- 公开 API、类型和样式入口与文档一致。
- `CHANGELOG.md` 已记录用户可见变更。
- 不包含 Token、`.env`、生产地址、真实校园数据和未授权素材。

## 9. 权限与安全

- GitHub 和 npm 均开启双重验证，维护者只拥有必要权限。
- Issue 和 Pull Request 不得包含真实学生信息或生产系统敏感截图。
- 安全漏洞通过 GitHub Security Advisory 私密报告。
- npm 包不得内置学校接口地址、租户标识、密钥或生产环境配置。

## 10. 初始化状态

- 已隔离 npm 库源码、演示应用、公开文档和本地内部文档。
- 已通过 npm `files` 白名单限制发布内容。
- 已配置库构建、类型声明、CI 和基于 Git 标签的 npm 发布流程。
- 首次 npm 发布仍需账号持有人在本机完成登录。
- GitHub 仓库创建、首次推送、分支保护和 Trusted Publishing 绑定需要在平台端完成。
