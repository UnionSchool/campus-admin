/**
 * 统一版本号的公共逻辑，被 scripts/version.mjs 与 scripts/release.mjs 共用。
 *
 * 约定：根 package.json 的 version 是唯一版本来源，四个包与示例跟随它；
 * Git 标签固定为 `v<version>`，与发布到 npm 的版本号完全一致。
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

export const PROJECT_ROOT = resolve(new URL('../../', import.meta.url).pathname)

/** 递增类型；不传目标时默认 prerelease 自增 */
export const BUMP_TYPES = ['prerelease', 'patch', 'minor', 'major']

/** 跟随根版本的包：四个发布包 + 示例（示例是私有的，保持同版本便于对照） */
export const PACKAGE_DIRS = [
  'packages/icon',
  'packages/locale',
  'packages/ui',
  'packages/core',
  'examples/admin',
]

/** 读取根版本号 */
export function readRootVersion() {
  return JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf8')).version
}

/** 需要写入版本号的文件（相对仓库根） */
export function versionFiles() {
  return ['package.json', ...PACKAGE_DIRS.map(dir => `${dir}/package.json`)]
}

/**
 * 用 npm 自己算目标版本号：在临时目录放一个最小 package.json，跑一次 `npm version` 再读回结果。
 * 预发布规则（例如 patch / minor 会去掉预发布后缀）完全跟随 npm，不需要复刻 semver。
 */
export function computeVersion(before, target = 'prerelease', preid = 'alpha') {
  const dir = mkdtempSync(join(tmpdir(), 'campus-version-'))
  try {
    const probe = join(dir, 'package.json')
    writeFileSync(probe, JSON.stringify({ name: 'campus-version-probe', version: before }, null, 2))
    const args = ['version', target, '--no-git-tag-version', '--allow-same-version']
    if (BUMP_TYPES.includes(target)) args.push('--preid', preid)
    const result = spawnSync('npm', args, { cwd: dir, encoding: 'utf8' })
    if (result.status !== 0) {
      throw new Error(`无法计算版本号：${(result.stderr || result.stdout || '').trim()}`)
    }
    return JSON.parse(readFileSync(probe, 'utf8')).version
  }
  finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** 把版本号写入根与各包，返回实际发生变化的文件列表 */
export function applyVersion(version) {
  const changed = []
  versionFiles().forEach((file) => {
    const path = join(PROJECT_ROOT, file)
    const json = JSON.parse(readFileSync(path, 'utf8'))
    if (json.version === version) return
    json.version = version
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`)
    changed.push(file)
  })
  return changed
}

/** 刷新 lockfile 中各工作区包的版本 */
export function refreshLockfile() {
  const result = spawnSync('pnpm', ['install', '--lockfile-only'], { cwd: PROJECT_ROOT, stdio: 'inherit' })
  if (result.status !== 0) throw new Error('刷新 lockfile 失败：pnpm install --lockfile-only')
}
