import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const dryRun = process.argv.includes('--dry-run')
const allowedArgs = new Set(['--dry-run'])
const unknownArgs = process.argv.slice(2).filter((arg) => !allowedArgs.has(arg))

if (unknownArgs.length > 0) {
  fail(`不支持的参数：${unknownArgs.join(', ')}`)
}

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
)
const packageName = packageJson.name
const version = packageJson.version
const tag = `v${version}`
const branch = 'main'
const remotes = ['origin', 'gitee']

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
  })

  if (options.allowFailure) {
    return result
  }

  if (result.status !== 0) {
    fail(`命令执行失败：${command} ${args.join(' ')}`)
  }

  return options.capture ? result.stdout.trim() : ''
}

function fail(message) {
  console.error(`\n发布终止：${message}`)
  process.exit(1)
}

function ensure(condition, message) {
  if (!condition) fail(message)
}

function remoteTagExists(remote) {
  const result = run('git', ['ls-remote', '--exit-code', '--tags', remote, `refs/tags/${tag}`], {
    allowFailure: true,
    capture: true,
  })

  if (result.status === 0) return true
  if (result.status === 2) return false
  fail(`无法检查 ${remote} 的标签，请检查网络和仓库权限`)
}

console.log(`准备发布 ${packageName}@${version}${dryRun ? '（演练模式）' : ''}`)

const currentBranch = run('git', ['branch', '--show-current'], { capture: true })
ensure(currentBranch === branch, `必须在 ${branch} 分支发布，当前分支为 ${currentBranch || 'detached HEAD'}`)

const worktree = run('git', ['status', '--porcelain'], { capture: true })
ensure(worktree === '', '工作区存在未提交变更，请先提交或暂存处理')

for (const remote of remotes) {
  const remoteUrl = run('git', ['remote', 'get-url', remote], { capture: true })
  ensure(remoteUrl !== '', `缺少远程仓库 ${remote}`)
  run('git', ['fetch', remote, branch, '--tags'])

  const ancestor = run(
    'git',
    ['merge-base', '--is-ancestor', `${remote}/${branch}`, 'HEAD'],
    { allowFailure: true, capture: true },
  )
  ensure(
    ancestor.status === 0,
    `${remote}/${branch} 包含本地没有的提交，请先同步并解决分支差异`,
  )

  ensure(!remoteTagExists(remote), `${remote} 已存在标签 ${tag}`)
}

const localTag = run('git', ['tag', '--list', tag], { capture: true })
ensure(localTag === '', `本地已存在标签 ${tag}`)

const npmVersion = run('npm', ['view', `${packageName}@${version}`, 'version'], {
  allowFailure: true,
  capture: true,
})

if (npmVersion.status === 0 && npmVersion.stdout.trim() === version) {
  fail(`npm 已存在 ${packageName}@${version}，请先更新版本号`)
}

// npm 查询不存在版本时通常返回 E404；其他错误可能是网络或鉴权异常。
ensure(
  npmVersion.status !== 0 && /E404|404 Not Found/.test(npmVersion.stderr),
  '无法确认 npm 版本是否可发布，请检查 npm 登录状态和网络',
)

run('npm', ['run', 'check'])

if (dryRun) {
  console.log('\n演练完成：所有发布前检查均已通过，未推送代码、标签或发布 npm。')
  process.exit(0)
}

// origin 标签最后推送，因为它会触发 GitHub Actions 发布 npm。
run('git', ['push', 'origin', branch])
run('git', ['push', 'gitee', branch])
run('git', ['tag', '-a', tag, '-m', tag])
run('git', ['push', 'gitee', tag])
run('git', ['push', 'origin', tag])

console.log(`
发布已触发：
- GitHub main 和 ${tag} 已推送
- Gitee main 和 ${tag} 已推送
- npm 将由 GitHub Actions 发布 ${packageName}@${version}

请在 GitHub Actions 中确认发布任务成功。`)
