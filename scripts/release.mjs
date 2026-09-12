#!/usr/bin/env node
/**
 * 发布到 npm（统一版本）。
 *
 * 版本号规则：Git 标签与 npm 版本完全一致（`v<version>`），
 * 缺省自增预发布号，也可以指定递增类型或完全自定义。
 *
 * 用法：
 *   node scripts/release.mjs                      # 自增预发布号 0.1.0-alpha.2 → 0.1.0-alpha.3，再发布
 *   node scripts/release.mjs patch|minor|major    # 指定递增类型
 *   node scripts/release.mjs --preid beta         # 预发布后缀，默认 alpha
 *   node scripts/release.mjs --version 0.2.0-alpha.1   # 完全自定义版本号
 *   node scripts/release.mjs --no-bump            # 用当前版本号发布（不升版本）
 *   node scripts/release.mjs --dry-run            # 演练：只校验并打印计划
 *   node scripts/release.mjs --local              # 本地发布（无 provenance，CI 不可用时兜底）
 *   node scripts/release.mjs --skip-check         # 刚跑过 npm run check 时跳过
 *
 * 职责边界：负责「升版本 → 提交版本号 → 打标签 → 推标签 → 发布」，
 * 不做日常代码提交（那是 scripts/deploy.mjs 的职责）。
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { BUMP_TYPES, applyVersion, computeVersion, PROJECT_ROOT, readRootVersion, refreshLockfile, versionFiles } from './lib/version.mjs'

const REMOTES = ['origin', 'gitee']
/** 发布顺序即依赖顺序：底座包先发，装配包后发 */
const PUBLISHABLE = ['icon', 'locale', 'ui', 'core']
const RELEASE_BRANCH = 'main'

function fail(message) {
  console.error(`\n发布终止：${message}`)
  process.exit(1)
}

function ensure(condition, message) {
  if (!condition) fail(message)
}

function parseArgs(argv) {
  const options = { dryRun: false, local: false, skipCheck: false, bump: true, preid: 'alpha', target: '', version: '' }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    // pnpm run script -- --flag 会把裸 -- 一起传进来，忽略它
    if (arg === '--') continue
    if (arg === '--dry-run') options.dryRun = true
    else if (arg === '--local') options.local = true
    else if (arg === '--skip-check') options.skipCheck = true
    else if (arg === '--no-bump') options.bump = false
    else if (arg === '--preid') options.preid = argv[++index] ?? options.preid
    else if (arg === '--version') options.version = argv[++index] ?? ''
    else if (arg.startsWith('-')) fail(`不支持的参数：${arg}`)
    else options.target = arg
  }
  if (options.target && !BUMP_TYPES.includes(options.target)) {
    fail(`无法识别的递增类型：${options.target}（支持 ${BUMP_TYPES.join(' / ')}，或用 --version 指定具体版本）`)
  }
  if (options.version && !/^\d+\.\d+\.\d+/.test(options.version)) {
    fail(`无法识别的版本号：${options.version}`)
  }
  return options
}

const options = parseArgs(process.argv.slice(2))
const currentVersion = readRootVersion()

/** 目标版本：--version 优先，其次递增类型，--no-bump 表示沿用当前版本 */
const nextVersion = options.version
  || (options.bump ? computeVersion(currentVersion, options.target || 'prerelease', options.preid) : currentVersion)

const tag = `v${nextVersion}`

/**
 * npm 的 dist-tag：预发布版本必须显式指定，否则 npm 直接拒绝发布，
 * 与 .github/workflows/release.yml 保持一致。
 */
const distTag = nextVersion.includes('-') ? 'next' : 'latest'

/**
 * 本地发布不带 provenance：npm 只支持在 GitHub Actions / GitLab CI 这类受支持的 CI 环境里
 * 生成 provenance，本地执行会报 `Automatic provenance generation not supported for provider: null`。
 * CI 里执行时保留 package.json 的 publishConfig.provenance。
 */
const provenanceArgs = process.env.CI ? [] : ['--no-provenance']

function run(command, args, runOptions = {}) {
  const result = spawnSync(command, args, {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    stdio: runOptions.capture ? 'pipe' : 'inherit',
  })
  if (runOptions.allowFailure) return result
  if (result.status !== 0) fail(`命令执行失败：${command} ${args.join(' ')}`)
  return runOptions.capture ? result.stdout.trim() : ''
}

/** dry-run 只打印命令；其余情况真实执行 */
function step(command, args) {
  if (options.dryRun) {
    console.log(`[dry-run] ${command} ${args.join(' ')}`)
    return ''
  }
  return run(command, args, { capture: true })
}

function packageVersion(name) {
  return JSON.parse(readFileSync(join(PROJECT_ROOT, `packages/${name}/package.json`), 'utf8')).version
}

function remoteTagExists(remote) {
  const result = run('git', ['ls-remote', '--exit-code', '--tags', remote, `refs/tags/${tag}`], {
    allowFailure: true,
    capture: true,
  })
  if (result.status === 0) return true
  if (result.status === 2) return false
  fail(`无法检查 ${remote} 的标签，请检查网络与仓库权限`)
}

function publishOne(name) {
  console.log(`\n发布 @campus-admin/${name}...`)
  if (options.dryRun) {
    console.log(`[dry-run] pnpm --filter @campus-admin/${name} publish --access public --tag ${distTag} ${provenanceArgs.join(' ')}`)
    return
  }
  run('pnpm', [
    '--filter', `@campus-admin/${name}`,
    'publish',
    '--access', 'public',
    '--tag', distTag,
    ...provenanceArgs,
  ])
}

/* ---------- 1. 前置校验 ---------- */

console.log(`准备发布 Campus Admin：${currentVersion} → ${nextVersion}${nextVersion === currentVersion ? '（版本未变）' : ''}${options.dryRun ? '（演练模式）' : ''}`)

PUBLISHABLE.forEach((name) => {
  const current = packageVersion(name)
  ensure(current === currentVersion, `包 @campus-admin/${name} 的版本为 ${current}，与根版本 ${currentVersion} 不一致（可用 pnpm run version:bump 同步）`)
})

const currentBranch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { capture: true })
ensure(currentBranch === RELEASE_BRANCH, `当前分支为 ${currentBranch}，请先切换到 ${RELEASE_BRANCH}（可用 pnpm run deploy:main）`)

const status = run('git', ['status', '--porcelain'], { capture: true })
if (options.dryRun && status) {
  // 演练模式允许脏工作区：只提示，方便在提交前先看一遍发布计划
  console.log('注意：工作区有未提交改动，正式发布会拒绝（可用 pnpm run deploy:main）')
}
else {
  ensure(!status, '工作区存在未提交改动，请先提交（可用 pnpm run deploy:main）')
}

const localTag = run('git', ['tag', '--list', tag], { capture: true })
ensure(!localTag, `本地已存在标签 ${tag}，请换一个版本号（pnpm run version:bump）`)
if (remoteTagExists('origin') || remoteTagExists('gitee')) {
  fail(`标签 ${tag} 已存在于远程，请换一个版本号（pnpm run version:bump）`)
}

if (options.skipCheck) {
  console.log('按 --skip-check 跳过门禁检查')
}
else {
  console.log('\n执行发布门禁检查（npm run check）...')
  if (options.dryRun) console.log('[dry-run] npm run check')
  else run('npm', ['run', 'check'])
}

if (nextVersion === currentVersion) {
  console.log('\n版本号未变化，跳过版本提交')
}
else {
  console.log(`\n写入版本号 ${nextVersion}（根 + 四个包 + 示例）...`)
  if (options.dryRun) {
    console.log(`[dry-run] 写入：${versionFiles().join('、')}`)
    console.log('[dry-run] pnpm install --lockfile-only')
    console.log(`[dry-run] git add ${versionFiles().join(' ')} pnpm-lock.yaml`)
    console.log(`[dry-run] git commit -m "chore: release v${nextVersion}"`)
    REMOTES.forEach(remote => console.log(`[dry-run] git push ${remote} ${RELEASE_BRANCH}`))
  }
  else {
    applyVersion(nextVersion)
    refreshLockfile()
    run('git', ['add', ...versionFiles(), 'pnpm-lock.yaml'])
    run('git', ['commit', '-m', `chore: release v${nextVersion}`])
    const pushFailed = []
    REMOTES.forEach((remote) => {
      const result = run('git', ['push', remote, RELEASE_BRANCH], { allowFailure: true })
      if (result.status !== 0) pushFailed.push(remote)
    })
    if (pushFailed.length) {
      fail(`版本提交推送失败：${pushFailed.join('、')}，本地已提交，可手动重试 git push <remote> ${RELEASE_BRANCH}`)
    }
  }
}

/* ---------- 2. 打标签并推送 ---------- */

console.log(`\n创建标签 ${tag} 并推送...`)
step('git', ['tag', '-a', tag, '-m', `Campus Admin ${nextVersion}`])
if (options.dryRun) {
  REMOTES.forEach(remote => console.log(`[dry-run] git push ${remote} ${tag}`))
}
else {
  const failed = []
  REMOTES.forEach((remote) => {
    const result = run('git', ['push', remote, tag], { allowFailure: true })
    if (result.status !== 0) failed.push(remote)
  })
  if (failed.length) {
    const done = REMOTES.filter(remote => !failed.includes(remote))
    fail(`标签推送失败：${failed.join('、')}${done.length ? `（已推送：${done.join('、')}）` : ''}`
      + `，本地标签已保留，可手动重试：git push <remote> ${tag}`)
  }
}

/* ---------- 3. 发布 ---------- */

if (options.local) {
  console.log(`\n本地发布四个包（dist-tag ${distTag}，不生成 provenance）...`)
  PUBLISHABLE.forEach(publishOne)
}
else {
  console.log('\n标签已推送到 GitHub，release.yml 会在 CI 中按 icon → locale → ui → core 发布（带 provenance）。')
  console.log('查看进度：GitHub → Actions → Release npm packages')
}

console.log(`\n发布完成：Campus Admin ${nextVersion}${options.dryRun ? '（演练模式，未改动任何文件）' : ''}`)
