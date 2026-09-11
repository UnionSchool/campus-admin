/**
 * 统一发布脚本：校验 → 打标签 → 推送 GitHub / Gitee → 发布 npm 包。
 *
 * Monorepo 采用统一版本号：根 package.json 的 version 是唯一版本来源，
 * 各子包必须与根版本一致，避免出现 campus-core 与 campus-admin 版本漂移。
 */
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const dryRun = process.argv.includes('--dry-run')
/** 跳过本地 npm 发布：交给推标签后触发的 release.yml 在 CI 里发布（只有 CI 能生成 provenance） */
const skipNpm = process.argv.includes('--skip-npm')
const allowedArgs = new Set(['--dry-run', '--skip-npm'])
const unknownArgs = process.argv.slice(2).filter(arg => !allowedArgs.has(arg))

if (unknownArgs.length > 0) {
  fail(`不支持的参数：${unknownArgs.join(', ')}`)
}

const rootPackage = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const version = rootPackage.version
const tag = `v${version}`
const branch = 'main'
const remotes = ['origin', 'gitee']
const publishable = ['campus-core', 'campus-framework', 'campus-ui', 'campus-admin']

/**
 * npm 的 dist-tag：预发布版本（0.1.0-alpha.1）必须显式指定，否则 npm 直接拒绝发布，
 * 与 .github/workflows/release.yml 的规则保持一致。
 */
const distTag = version.includes('-') ? 'next' : 'latest'

/**
 * 本地没有受支持的 CI 环境，npm 生成 provenance 会直接报错
 * （`Automatic provenance generation not supported for provider: null`），
 * 所以本地发布显式关闭；在 CI 里执行时保留 package.json 的 publishConfig.provenance。
 */
const provenanceArgs = process.env.CI ? [] : ['--no-provenance']

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
  })

  if (options.allowFailure) return result
  if (result.status !== 0) fail(`命令执行失败：${command} ${args.join(' ')}`)
  return options.capture ? result.stdout.trim() : ''
}

function fail(message) {
  console.error(`\n发布终止：${message}`)
  process.exit(1)
}

function ensure(condition, message) {
  if (!condition) fail(message)
}

function packageVersion(name) {
  const file = new URL(`../packages/${name}/package.json`, import.meta.url)
  return JSON.parse(readFileSync(file, 'utf8')).version
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

console.log(`准备发布 Campus ${version}${dryRun ? '（演练模式）' : ''}`)

publishable.forEach((name) => {
  const current = packageVersion(name)
  ensure(current === version, `包 ${name} 的版本为 ${current}，与根版本 ${version} 不一致`)
})

const currentBranch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { capture: true })
if (!dryRun && currentBranch !== branch) {
  fail(`当前分支为 ${currentBranch}，请切换到 ${branch} 后再发布`)
}

const status = run('git', ['status', '--porcelain'], { capture: true })
if (status) {
  fail('工作区存在未提交改动，请先提交或暂存')
}

if (remoteTagExists('origin') || remoteTagExists('gitee')) {
  fail(`标签 ${tag} 已存在，请先更新版本号`)
}

console.log('执行发布门禁检查...')
if (!dryRun) run('npm', ['run', 'check'])

console.log(`创建标签 ${tag} 并推送...`)
if (dryRun) {
  remotes.forEach(remote => console.log(`[dry-run] git push ${remote} ${branch} 与 ${tag}`))
  publishable.forEach(name => console.log(
    `[dry-run] pnpm --filter @unionschool/${name} publish --access public --tag ${distTag} ${provenanceArgs.join(' ')}`
      + (skipNpm ? '（已按 --skip-npm 跳过）' : ''),
  ))
  console.log('演练完成，未产生任何提交、标签或发布。')
  process.exit(0)
}

run('git', ['tag', '-a', tag, '-m', `Campus ${version}`])
remotes.forEach((remote) => {
  run('git', ['push', remote, branch])
  run('git', ['push', remote, tag])
})

/**
 * 本地发布不带 provenance：
 * npm 只支持在 GitHub Actions / GitLab CI 这类受支持的 CI 环境里生成 provenance，
 * 本地执行会直接报 `Automatic provenance generation not supported for provider: null`，
 * 所以这里显式关掉（package.json 里的 publishConfig.provenance 是给 CI 用的）。
 * 需要带 provenance 的发布请用 `--skip-npm`，由 Git 标签触发 release.yml 在 CI 里完成。
 */
if (skipNpm) {
  console.log('已跳过本地 npm 发布，标签推送到 GitHub 后会触发 release.yml 在 CI 中发布（带 provenance）。')
}
else {
  console.log(`发布 npm 包（统一版本号，dist-tag ${distTag}，本地不生成 provenance）...`)
  publishable.forEach((name) => {
    run('pnpm', [
      '--filter', `@unionschool/${name}`,
      'publish',
      '--access', 'public',
      '--tag', distTag,
      ...provenanceArgs,
    ])
  })
}

console.log(`发布完成：Campus ${version}`)
