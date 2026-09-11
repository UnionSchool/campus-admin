# Campus Admin 仓库管理规范

## 1. 基本信息

| 项目 | 内容 |
| --- | --- |
| GitHub 仓库 | `UnionSchool/campus-admin` |
| Gitee 仓库 | `UnionSchool/campus-admin` |
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

## 7. 发布流程

完成版本号、`CHANGELOG.md` 和发布提交后，推荐直接运行统一发布脚本：

```bash
npm run deploy
```

脚本会检查 `main` 分支、干净工作区、两端远程分支、重复 Git 标签和 npm 重复版本，执行 `npm run check`，随后依次推送 GitHub、Gitee，并通过 GitHub 标签触发 npm 自动发布。正式发布前可先演练检查：

```bash
npm run deploy -- --dry-run
```

演练模式不会推送代码、创建标签或发布 npm。下面各节保留手工发布方法，供排错或特殊情况使用。

### 7.1 发布前准备

确认当前位于 `main` 分支且工作区干净：

```bash
git switch main
git pull --ff-only origin main
git status
npm ci
npm run check
```

`npm run check` 会依次执行类型检查、库构建和 `npm pack --dry-run`。发布前还必须更新 `CHANGELOG.md`，并确认 `package.json` 中的版本号尚未在 npm 发布过。

版本号通过 npm 命令更新，预发布版本和稳定版本示例：

```bash
npm version prerelease --preid=alpha --no-git-tag-version
# 或
npm version patch --no-git-tag-version
```

检查变更后提交：

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: release v<版本号>"
```

### 7.2 发布到 GitHub 和 Gitee

项目配置了两个远程仓库：

```text
origin  https://github.com/UnionSchool/campus-admin.git
gitee   https://gitee.com/UnionSchool/campus-admin.git
```

先将同一个 `main` 提交分别推送到两个平台：

```bash
git push origin main
git push gitee main
```

两个仓库的默认分支均应设置为 `main`。可使用以下命令核对：

```bash
git remote show origin
git remote show gitee
```

如果新建 Gitee 仓库时自动生成了初始化提交，应先确认远端文件可以覆盖，再使用 `git push --force-with-lease -u gitee main` 完成首次同步。该命令只用于初始化历史不一致的场景，日常发布禁止强制推送。

### 7.3 发布到 npm

首次发布或需要本机手动发布时：

```bash
npm login
npm whoami
npm run check
```

预发布版本使用对应标签，避免占用 `latest`：

```bash
npm publish --access public --tag alpha
```

稳定版本发布到默认的 `latest` 标签：

```bash
npm publish --access public
```

同一版本号不能重复发布。如果发布内容需要修正，必须增加 `package.json` 版本号后重新发布。

### 7.4 使用 Git 标签自动发布 npm

仓库已配置 `.github/workflows/release.yml`。完成代码推送后，创建与 `package.json` 完全一致的标签，并推送到 GitHub：

```bash
git tag -a v<版本号> -m "v<版本号>"
git push origin v<版本号>
```

GitHub Actions 会执行安装、检查和 npm 发布。带连字符的预发布版本（例如 `v0.2.0-alpha.1`）发布到 `next`，稳定版本发布到 `latest`。

如需让 Gitee 同时保留发布标签，再执行：

```bash
git push gitee v<版本号>
```

自动发布需在 npm 包设置中配置 GitHub Trusted Publishing：

- GitHub Owner：`UnionSchool`
- Repository：`campus-admin`
- Workflow：`release.yml`
- GitHub Environment：`npm`

正式接入 Trusted Publishing 后，不在 GitHub 中保存长期 `NPM_TOKEN`。

### 7.5 发布后验证

```bash
npm view @unionschool/campus-admin version
npm view @unionschool/campus-admin dist-tags
git ls-remote --heads origin main
git ls-remote --heads gitee main
```

还应检查 GitHub Actions 发布任务是否成功，并确认 GitHub、Gitee 的 `main` 指向同一个提交。

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
- npm 包 `@unionschool/campus-admin` 已完成首次发布。
- GitHub 和 Gitee 仓库均已完成首次推送，默认分支为 `main`。
- GitHub 分支保护和 npm Trusted Publishing 仍需按平台实际配置持续检查。
