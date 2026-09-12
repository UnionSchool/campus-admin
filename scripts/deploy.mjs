#!/usr/bin/env node
/**
 * 代码部署：提交当前改动并推送到 GitHub / Gitee 的指定分支。
 *
 * 用法：
 *   node scripts/deploy.mjs dev                  # 切到 dev，提交并推送
 *   node scripts/deploy.mjs main                 # 切到 main，跑完整门禁后提交并推送
 *   node scripts/deploy.mjs main --from dev      # 先把 dev 合并进 main（--no-ff）
 *   node scripts/deploy.mjs dev -m "feat: 排课"   # 自定义提交信息
 *   node scripts/deploy.mjs dev --dry-run        # 只打印将执行的命令
 *   node scripts/deploy.mjs dev --no-pull        # 跳过推送前的 rebase
 *   node scripts/deploy.mjs main --no-check      # 跳过门禁（不建议）
 *
 * 职责边界：只做「提交 + 推送」，不创建 tag、不发布 npm —— 那些属于 scripts/release.mjs。
 */
import { spawnSync } from 'node:child_process'

const REMOTES = ['origin', 'gitee']
/** 允许同步的分支：dev 日常开发，main 可发布状态 */
const BRANCHES = ['dev', 'main']

function fail(message) {
  console.error(`\n部署终止：${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  const options = { message: '', from: '', pull: true, check: true, dryRun: false }
  const positional = []
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    // pnpm run script -- --flag 会把裸 -- 一起传进来，忽略它
    if (arg === '--') continue
    if (arg === '--dry-run') options.dryRun = true
    else if (arg === '--no-pull') options.pull = false
    else if (arg === '--no-check') options.check = false
    else if (arg === '-m' || arg === '--message') options.message = argv[++index] ?? ''
    else if (arg === '--from') options.from = argv[++index] ?? ''
    else if (arg.startsWith('-')) fail(`不支持的参数：${arg}`)
    else positional.push(arg)
  }
  return { options, positional }
}

const { options, positional } = parseArgs(process.argv.slice(2))
const branch = positional[0]

if (!branch) {
  console.error('请指定分支：')
  console.error('  pnpm run deploy:dev      # 提交并推送 dev')
  console.error('  pnpm run deploy:main     # 提交并推送 main（完整门禁）')
  console.error('  更多参数见 scripts/deploy.mjs 顶部注释')
  process.exit(1)
}
if (!BRANCHES.includes(branch)) fail(`不支持的同步分支：${branch}（只支持 ${BRANCHES.join(' / ')}）`)
if (positional.length > 1) fail(`只接受一个分支参数，实际收到：${positional.join(', ')}`)
if (options.from && !BRANCHES.includes(options.from)) fail(`--from 只支持 ${BRANCHES.join(' / ')}`)
if (options.from === branch) fail(`--from ${options.from} 与目标分支相同`)

/**
 * 没传 -m 时的兜底提交信息：按改动分布生成摘要（哪个包/目录改得最多）。
 * 正式提交建议由人（或 agent）看一眼 `git status` 后传 -m 写清楚改了什么。
 */
function summarizeChanges() {
  const files = run('git', ['status', '--porcelain'], { capture: true })
    .split('\n')
    .filter(Boolean)
    // 重命名条目形如「R  old -> new」，取新路径统计
    .map((line) => {
      const path = line.slice(3).trim()
      return path.includes(' -> ') ? path.split(' -> ').pop().trim() : path
    })
  if (!files.length) return `chore: 同步 ${branch}`

  const groups = new Map()
  files.forEach((file) => {
    const parts = file.split('/')
    const key = parts[0] === 'packages' || parts[0] === 'examples'
      ? parts.slice(0, 2).join('/')
      : parts.length > 1 ? parts[0] : '根配置'
    groups.set(key, (groups.get(key) || 0) + 1)
  })

  const top = [...groups.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, count]) => `${key}(${count})`)
    .join('、')

  return `chore: 同步 ${branch} — 更新 ${top}，共 ${files.length} 个文件`
}

/** 提交信息：优先用 -m，其次按改动分布自动摘要 */
const message = options.message || summarizeChanges()

function run(command, args, runOptions = {}) {
  const result = spawnSync(command, args, {
    cwd: new URL('..', import.meta.url),
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

function currentBranch() {
  return run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { capture: true })
}

function localBranchExists(name) {
  return run('git', ['rev-parse', '--verify', '--quiet', `refs/heads/${name}`], { allowFailure: true }).status === 0
}

function remoteBranchExists(remote, name) {
  const result = run('git', ['ls-remote', '--exit-code', '--heads', remote, name], { allowFailure: true, capture: true })
  if (result.status === 0) return true
  if (result.status === 2) return false
  fail(`无法检查 ${remote} 的分支列表，请检查网络与仓库权限`)
}

function switchToBranch() {
  if (currentBranch() === branch) return
  if (options.dryRun) {
    console.log(`[dry-run] git checkout ${branch}`)
    return
  }
  if (localBranchExists(branch)) run('git', ['checkout', branch])
  else if (remoteBranchExists('origin', branch)) run('git', ['checkout', '-b', branch, '--track', `origin/${branch}`])
  else run('git', ['checkout', '-b', branch])
}

function pullLatest() {
  if (!options.pull) { console.log('按 --no-pull 跳过 rebase 拉取'); return }
  if (!remoteBranchExists('origin', branch)) { console.log(`origin 还没有 ${branch} 分支，跳过拉取`); return }
  step('git', ['pull', '--rebase', 'origin', branch])
}

function mergeFrom() {
  if (!options.from) return
  console.log(`先把 ${options.from} 合并进 ${branch}...`)
  step('git', ['merge', '--no-ff', options.from, '-m', `merge: ${options.from} into ${branch}`])
}

function runChecks() {
  if (!options.check) { console.log('按 --no-check 跳过门禁'); return }
  // main 代表可发布状态，跑完整门禁；dev 只跑快检
  const commands = branch === 'main'
    ? [['npm', ['run', 'check']]]
    : [
        ['npm', ['run', 'check:boundaries']],
        ['npm', ['run', 'check:locale']],
        ['npm', ['run', 'typecheck']],
      ]
  commands.forEach(([command, args]) => {
    console.log(`\n> ${command} ${args.join(' ')}`)
    if (options.dryRun) console.log(`[dry-run] ${command} ${args.join(' ')}`)
    else run(command, args)
  })
}

function commitIfNeeded() {
  const status = run('git', ['status', '--porcelain'], { capture: true })
  if (!status) { console.log('工作区干净，跳过提交'); return }
  const files = status.split('\n').length
  console.log(`\n提交 ${files} 条改动：${message}`)
  step('git', ['add', '-A'])
  step('git', ['commit', '-m', message])
}

function pushToRemotes() {
  const failed = []
  REMOTES.forEach((remote) => {
    console.log(`\n推送到 ${remote} ${branch}...`)
    // 允许失败：先记下来，两个远程都试过再统一报告「谁成功、谁失败」
    const result = run('git', ['push', remote, `${branch}:${branch}`], { allowFailure: true })
    if (result.status !== 0) failed.push(remote)
  })
  return failed
}

console.log(`部署分支：${branch}${options.dryRun ? '（演练模式）' : ''}`)
if (currentBranch() !== branch) console.log(`当前在 ${currentBranch()}，准备切到 ${branch}`)

switchToBranch()
runChecks()
// 先提交再合并/拉取：git 的 merge 与 pull --rebase 都要求工作区干净，
// 有未提交改动时先拉取会直接失败
commitIfNeeded()
mergeFrom()
pullLatest()

if (options.dryRun) {
  REMOTES.forEach(remote => console.log(`[dry-run] git push ${remote} ${branch}:${branch}`))
  console.log('\n演练完成，未修改仓库、未推送。')
  process.exit(0)
}

const failed = pushToRemotes()
if (failed.length) {
  const done = REMOTES.filter(remote => !failed.includes(remote))
  fail(`推送失败：${failed.join('、')}${done.length ? `（已推送：${done.join('、')}）` : ''}，修好后可重复执行本命令`)
}

console.log(`\n部署完成：${branch} 已推送到 ${REMOTES.join(' / ')}`)
