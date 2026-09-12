#!/usr/bin/env node
/**
 * 统一版本号：根 package.json 是唯一版本来源，四个包与示例跟随它。
 *
 * 用法：
 *   node scripts/version.mjs                    # 缺省自增预发布号：0.1.0-alpha.2 → 0.1.0-alpha.3
 *   node scripts/version.mjs patch|minor|major|prerelease
 *   node scripts/version.mjs --preid beta       # 预发布后缀，默认 alpha
 *   node scripts/version.mjs 0.2.0-alpha.1      # 完全自定义版本号
 *   node scripts/version.mjs --dry-run          # 只预览，不写入
 *
 * 只改版本号与 lockfile：不提交、不打标签、不发布。
 * 发布用 pnpm run release（缺省同样会自增，除非传 --no-bump）。
 */
import { BUMP_TYPES, applyVersion, computeVersion, readRootVersion, refreshLockfile, versionFiles } from './lib/version.mjs'

function fail(message) {
  console.error(`\n版本号调整终止：${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  const options = { dryRun: false, preid: 'alpha', target: '' }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    // pnpm run script -- --flag 会把裸 -- 一起传进来，忽略它
    if (arg === '--') continue
    if (arg === '--dry-run') options.dryRun = true
    else if (arg === '--preid') options.preid = argv[++index] ?? options.preid
    else if (arg.startsWith('-')) fail(`不支持的参数：${arg}`)
    else options.target = arg
  }
  // 缺省自增预发布号
  if (!options.target) options.target = 'prerelease'
  return options
}

const options = parseArgs(process.argv.slice(2))
if (!BUMP_TYPES.includes(options.target) && !/^\d+\.\d+\.\d+/.test(options.target)) {
  fail(`无法识别的版本参数：${options.target}（支持 ${BUMP_TYPES.join(' / ')} 或具体版本号）`)
}

const before = readRootVersion()
const after = computeVersion(before, options.target, options.preid)

console.log(`版本号：${before} → ${after}${options.dryRun ? '（演练模式，不写入）' : ''}`)

if (options.dryRun) {
  console.log(`[dry-run] 写入：${versionFiles().join('、')}`)
  console.log('[dry-run] pnpm install --lockfile-only')
  process.exit(0)
}

const changed = applyVersion(after)
console.log(`已更新：${changed.length ? changed.join('、') : '（无变化）'}`)

console.log('\n刷新 lockfile...')
refreshLockfile()

console.log(`\n完成。后续：pnpm run release（会带上当前版本 ${after} 发布）`)
