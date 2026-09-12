# Campus Admin 仓库管理规范

## 1. 基本信息

| 项目 | 内容 |
| --- | --- |
| GitHub 仓库 | `UnionSchool/campus` |
| Gitee 仓库 | `UnionSchool/campus` |
| npm 包 | `@campus-admin/core`、`@campus-admin/core`、`@campus-admin/ui`、`@campus-admin/core` |
| 演示与文档 | <https://campus.zhongxiaotong.com> |
| 技术栈 | Vue 3、TypeScript、Vite |
| 许可证 | MIT |
| 组织方式 | pnpm 工作区：单仓库、统一版本号、多 npm 包 |

## 2. 内容分级与发布边界

仓库内容必须按下表管理：

| 目录或文件 | GitHub | npm | 说明 |
| --- | --- | --- | --- |
| `packages/core/src/` | 上传 | 编译后发布 | 框架核心源码 |
| `packages/core/src/` | 上传 | 编译后发布 | Vue 适配层源码 |
| `packages/ui/src/` | 上传 | 编译后发布 | 组件与样式源码 |
| `packages/core/src/` | 上传 | 编译后发布 | 主包装配源码 |
| `packages/*/dist/` | 不上传 | 发布 | 自动生成的 npm 安装内容 |
| `examples/*/` | 上传 | 不发布 | 示例应用与演示站，按 npm 包名引用框架 |
| `docs/` | 上传 | 不发布 | 面向用户和贡献者的公开文档 |
| `scripts/` | 上传 | 不发布 | 边界检查、清理、发布与上传脚本 |
| `.github/` | 上传 | 不发布 | CI、Release 和协作模板 |
| `.local-docs/` | 不上传 | 不发布 | 内部规划、讨论稿、商业方案和未公开设计资料 |
| `.env*`、密钥、真实数据 | 禁止上传 | 禁止发布 | 敏感信息 |

是否进入 npm 不依赖开发者手工选择，而由各子包的 `files` 白名单控制。当前每个包仅允许：

```json
{
  "files": ["dist", "README.md", "LICENSE"]
}
```

发布前必须执行 `pnpm run pack:dry` 检查各包实际文件清单。`.npmignore` 与 `files` 不同时使用，避免双重规则造成误判。

## 3. 目录结构

```text
campus/
├── .github/                    # 可上传，不进 npm
├── .local-docs/                # 仅本机，不上传、不发布
├── docs/                       # 可上传，不进 npm
├── examples/                   # 可上传，不进 npm
│   ├── admin/                  # 学校管理后台示例（演示站）
│   └── web/                    # 规划中
├── packages/                   # 可上传，按依赖顺序构建
│   ├── icon/                   # 校园语义图标与图标名解析
│   ├── locale/                 # 国际化运行时
│   ├── ui/                     # 组件库（只依赖 locale）
│   └── core/                   # 框架层 + 装配入口
├── scripts/                    # 边界检查、清理、发布、上传
├── package.json                # 根版本号与统一脚本
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

四个子包必须保持统一版本号：根 `package.json` 的 `version` 是唯一版本来源，发布脚本会校验各包版本一致。后续可以在 `packages/ui/src` 内增加 `layout`、`hooks`、`utils` 等目录，也可以在 `examples/` 下新增 `web`、`teacher` 等示例。

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

日常只有三件事，各对应一个命令，职责严格分开：

```bash
pnpm run deploy:dev     # ① 提交当前改动并推送到 GitHub / Gitee 的 dev
pnpm run deploy:main    # ② 提交并推送到 main（跑完整门禁）
pnpm run release        # ③ 发布到 npm（打标签 → CI 发布）
```

前两个只管「提交 + 推送分支」，第三个只管「打标签 + 发布 npm」——发布脚本不会替你提交代码，推送脚本也不会创建标签。

| 命令 | 关键参数 | 做什么 |
| --- | --- | --- |
| `pnpm run deploy:dev` | `-m "信息"`、`--dry-run`、`--no-pull`、`--no-check` | 切到 dev → `git pull --rebase` → 快检（boundaries / locale / typecheck）→ 提交 → 推送两个远程 |
| `pnpm run deploy:main` | 同上，外加 `--from dev` | 同上，但门禁换成完整 `pnpm run check`；`--from dev` 会先 `git merge --no-ff dev` |
| `pnpm run release` | 递增类型、`--version <v>`、`--no-bump`、`--preid`、`--dry-run`、`--local`、`--skip-check` | 校验 → 升版本并提交 → 打 `v<version>` 标签 → 推标签 → 发布（`--local` 时本地发布） |
| `pnpm run version:bump` | 递增类型、具体版本号、`--preid`、`--dry-run` | 只升版本号（根 + 四个包 + 示例）并刷新 lockfile |

**版本号规则：Git 标签与 npm 版本完全一致**（同一个 `v<version>`），且缺省自动递增、需要时完全自定义：

```bash
pnpm run version:bump                    # 缺省自增预发布号：0.1.0-alpha.2 → 0.1.0-alpha.3
pnpm run version:bump patch              # 0.1.0-alpha.2 → 0.1.0
pnpm run version:bump --preid beta       # 换预发布后缀：0.1.0-beta.0
pnpm run version:bump 0.2.0-alpha.1      # 完全自定义
pnpm run version:bump --dry-run          # 只看结果，不写入

pnpm run release                         # 发布时缺省也会自增一个预发布号，再打标签、发布
pnpm run release --version 0.2.0-alpha.1 # 指定版本发布
pnpm run release --no-bump               # 用当前版本号发布（不升版本）
```

递增规则交给 npm 自己算（`npm version`）：预发布号自增保持同一 `major.minor.patch`，`patch` / `minor` 会去掉预发布后缀，从稳定版切预发布则先抬 patch（`0.1.0` → `0.1.1-alpha.0`）。发布时若版本号有变化，脚本会先提交一次 `chore: release v<version>` 并推送到两个远程，再打标签。

推送脚本的行为约定：

- 目标分支不存在就自动创建（优先跟踪 `origin/<branch>`）；推送前默认 `git pull --rebase`，冲突时停下交给你处理；
- 工作区有改动就自动提交，提交信息默认 `chore: deploy <branch>`，可用 `-m` 覆盖；工作区干净则跳过提交、只推送；
- 两个远程分别推送，失败不静默：会打印「已推送 origin / gitee 失败」，修好后可重复执行（幂等）；任何情况下都不 force push。

发布脚本的校验链：**版本一致 → 分支 main → 工作区干净 → 本地/远程标签不存在 → `npm run check`**。
统一版本下四个包必须同版本，所以一次发布就是四个包一起发（详见 7.3）。

发布的两点约定：

- **CI 是默认发布通道**：`pnpm run release` 只推标签，由 `.github/workflows/release.yml` 在 Actions 里发布，只有 CI 环境能生成 provenance；
- **本地发布不生成 provenance**：npm 只支持 GitHub Actions、GitLab CI 这类环境，本地执行会报 `Automatic provenance generation not supported for provider: null`，`--local` 会显式关闭它。

预发布版本（`0.1.0-alpha.3`）必须显式指定 dist-tag，脚本与 CI 都按版本号自动使用 `next`，稳定版用 `latest`。

下面各节保留手工发布方法，供排错或特殊情况使用。

### 7.1 发布前准备

确认当前位于 `main` 分支且工作区干净：

```bash
git switch main
git pull --ff-only origin main
git status
pnpm install
pnpm run check
```

`pnpm run check` 会依次执行分层边界检查、类型检查、各包构建、示例构建和 `pnpm run pack:dry`。发布前还必须更新 `CHANGELOG.md`，并确认根 `package.json` 中的版本号尚未在 npm 发布过。

版本号通过 npm 命令更新，预发布版本和稳定版本示例：

```bash
npm version prerelease --preid=alpha --no-git-tag-version
# 或
npm version patch --no-git-tag-version
```

检查变更后提交：

```bash
git add package.json packages/*/package.json pnpm-lock.yaml CHANGELOG.md
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
pnpm run check
```

四个子包必须同时发布，预发布版本使用 `next` 标签，避免占用 `latest`（与 `.github/workflows/release.yml`、第 2 节版本规范一致）：

```bash
pnpm --filter @campus-admin/core publish --access public --tag next --no-provenance
pnpm --filter @campus-admin/core publish --access public --tag next --no-provenance
pnpm --filter @campus-admin/ui publish --access public --tag next --no-provenance
pnpm --filter @campus-admin/core publish --access public --tag next --no-provenance
```

稳定版本发布到默认的 `latest` 标签时，去掉 `--tag next`：

```bash
pnpm --filter @campus-admin/core publish --access public --no-provenance
```

发布顺序必须是 `@campus-admin/core` → `@campus-admin/core` → `@campus-admin/ui` → `@campus-admin/core`，否则依赖方会指向尚未发布的版本。同一版本号不能重复发布，如果需要修正内容，必须增加根版本号并同步全部子包后重新发布。

### 7.4 使用 Git 标签自动发布 npm

仓库已配置 `.github/workflows/release.yml`。完成代码推送后，创建与 `package.json` 完全一致的标签，并推送到 GitHub：

```bash
git tag -a v<版本号> -m "v<版本号>"
git push origin v<版本号>
```

GitHub Actions 会执行安装、检查并按依赖顺序发布四个子包。带连字符的预发布版本（例如 `v0.2.0-alpha.1`）发布到 `next`，稳定版本发布到 `latest`。

如需让 Gitee 同时保留发布标签，再执行：

```bash
git push gitee v<版本号>
```

自动发布需在 npm 包设置中配置 GitHub Trusted Publishing：

- GitHub Owner：`UnionSchool`
- Repository：`campus`
- Workflow：`release.yml`
- GitHub Environment：`npm`

四个子包都需要分别配置 Trusted Publishing。正式接入后，不在 GitHub 中保存长期 `NPM_TOKEN`。

### 7.5 发布后验证

```bash
for pkg in @campus-admin/core @campus-admin/core @campus-admin/ui @campus-admin/core; do
  npm view "@campus-admin/$pkg" version
done
git ls-remote --heads origin main
git ls-remote --heads gitee main
```

还应检查 GitHub Actions 发布任务是否成功，并确认 GitHub、Gitee 的 `main` 指向同一个提交。

### 7.6 示例应用与演示站上传

`examples/admin/` 是学校管理后台示例，同时作为 `campus.zhongxiaotong.com` 的演示站。它与其他业务项目一样，只从 npm 包名引用框架，不配置 `src` 别名，构建产物输出到 `examples/admin/dist/`。

本地构建和预览：

```bash
pnpm run build:packages
pnpm run dev:admin            # 开发
pnpm run build:example:admin  # 仅构建 admin 示例
```

确认 coscli 已配置名为 `campus` 的 COS 存储桶后，执行统一上传命令：

```bash
pnpm run up
```

根目录 `up` 脚本（仅保留在本机，未纳入版本控制）按四步执行：

```text
1. npm run build:packages       构建四个包 —— 示例按包名引用 @campus-admin/*，解析到各包 dist，
                                不先构建就会把旧组件上传上去
2. npm run build:example:admin  构建示例
3. coscli sync dist/assets cos://campus/assets -r --delete --force --meta "Cache-Control:public, max-age=31536000, immutable"
                                静态资源带内容 hash：长缓存 + 删除上一版遗留文件
                                （--delete 必须配 --force 才会真正删除；只删 assets/ 前缀，
                                  避免误删站根手工维护的文件）
4. coscli sync dist cos://campus -r --exclude "assets/*" --exclude "index.html"
                                站根其他文件，不删除
5. coscli cp   .../index.html cos://campus/index.html --meta "Cache-Control:no-cache"
                                index.html 不缓存，避免发版后用户拿旧 HTML 请求已替换的 hash 资源
```

上传结束会请求一次 <https://campus.zhongxiaotong.com> 打印 HTTP 状态码做兜底校验。

站点的图标 `examples/admin/public/favicon.ico` 随构建一起输出到 `dist/`，`index.html` 用相对路径引用，不再依赖手工上传到桶上。

本地清理：

```bash
node scripts/clean.mjs all      # 各包 dist + 示例 dist + coscli 日志
node scripts/clean.mjs cache    # 增量编译缓存（*.tsbuildinfo，改了 tsconfig 建议清一次）
node scripts/clean.mjs coscli   # 上传失败日志（coscli_output、coscli.log）
node scripts/clean.mjs dist:packages/ui   # 只清某个包的 dist
```

后续新增示例时，各自输出到自己的 `dist/`，并单独维护部署脚本，互不影响。`examples/web` 目前是预留目录，未纳入 workspace，不参与构建与发布。

## 8. 发布门禁

每次提交发布标签前必须确认：

- `pnpm install`、分层边界检查、类型检查、各包与示例构建全部成功（等价于 `pnpm run check`）。
- `pnpm run pack:dry` 中没有 `examples/`、`docs/`、`.github/`、`.local-docs/` 和源码外的临时文件。
- 四个子包版本号与根版本一致。
- 从生成的 `.tgz` 在干净 Vue 项目中完成安装测试。
- 公开 API、类型和样式入口与文档一致。
- `CHANGELOG.md` 已记录用户可见变更。
- 不包含 Token、`.env`、生产地址、真实校园数据和未授权素材。

## 9. 权限与安全

### 9.1 版权与署名

项目采用 MIT 许可，**使用时必须保留版权信息**：

- 各包发布产物内必须带 `LICENSE`（`scripts/verify-pack.mjs` 会校验），README 末尾统一署名「Powered By 众校通 ®」；
- 示例站与业务页面必须保留页脚署名与联系方式，统一用组件库的 `CaCopyright` 渲染：

```vue
<CaCopyright :name="学校名字" :partner="开发者" />
```

`name` 是版权主体（学校 / 机构名），组件自动拼成「© 年份 学校名字」，年份取当前年份；需要完全自定义版权行时再传 `displayCopyright`；`partner` 是开发者 / 渠道方署名，传了渲染成「Powered By 开发者 | 众校通 ®」；默认插槽可放附加信息。**「Powered By 众校通 ®」是固定署名，不随语言变化，也不允许删除。**
- 二次分发、二次封装或修改后的版本，请在显著位置保留同样的版权声明。

- GitHub 和 npm 均开启双重验证，维护者只拥有必要权限。
- Issue 和 Pull Request 不得包含真实学生信息或生产系统敏感截图。
- 安全漏洞通过 GitHub Security Advisory 私密报告。
- npm 包不得内置学校接口地址、租户标识、密钥或生产环境配置。

## 10. 初始化状态

- 已拆分为 `@campus-admin/icon`、`@campus-admin/locale`、`@campus-admin/ui`、`@campus-admin/core` 四个 npm 包，统一版本号。
- 已隔离 npm 包源码、示例应用、公开文档和本地内部文档。
- 已通过各子包 `files` 白名单限制发布内容。
- 已配置分包构建、类型声明、分层边界检查、CI 和基于 Git 标签的 npm 发布流程。
- `examples/admin` 已按 npm 包名引用框架，并作为 `campus.zhongxiaotong.com` 演示站。
- 四个 npm 包尚未发布，首次发布需先确认 `@campus-admin` 组织发布权限。
- GitHub 和 Gitee 仓库默认分支为 `main`。
- GitHub 分支保护和 npm Trusted Publishing 仍需按平台实际配置持续检查。
