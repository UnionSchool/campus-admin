#!/usr/bin/env node
/**
 * 清理构建产物。
 *
 * 用法:
 *   node scripts/clean.mjs all
 *   node scripts/clean.mjs dist:packages/core dist:packages/ui
 *   node scripts/clean.mjs dist site
 *   node scripts/clean.mjs cache      # 增量编译缓存（*.tsbuildinfo）
 *   node scripts/clean.mjs coscli     # 上传失败日志（coscli_output、coscli.log）
 *
 * 只有显式传入目标才删除，避免误删目录，
 * 也保证“分包或改名后旧类型声明不会残留在 dist 中”。
 */
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
/** 统一带结尾斜杠，便于把绝对路径截成仓库相对路径 */
const projectRoot = rootDir.endsWith('/') ? rootDir : `${rootDir}/`
const args = process.argv.slice(2)

const packageNames = ['icon', 'locale', 'ui', 'core']
const outputs = []
/** 需要按文件名模式清理的缓存文件 */
const cachePattern = /\.tsbuildinfo$/

if (args.includes('all') || args.length === 0) {
  packageNames.forEach(name => outputs.push(`packages/${name}/dist`))
  outputs.push('examples/admin/dist', 'examples/web/dist', 'site-dist', 'coscli_output')
}

for (const arg of args) {
  if (arg === 'all') continue
  if (arg === 'dist') {
    outputs.push('dist')
    continue
  }
  if (arg === 'site') {
    outputs.push('site-dist')
    continue
  }
  if (arg === 'coscli') {
    outputs.push('coscli_output', 'coscli.log')
    continue
  }
  if (arg.startsWith('dist:')) {
    outputs.push(`${arg.slice('dist:'.length)}/dist`)
  }
}

const cleanCache = args.includes('cache') || args.includes('all') || args.length === 0

if (!outputs.length && !cleanCache) {
  console.log('没有需要清理的目标，可用目标：all | dist | site | cache | coscli | dist:<包路径>')
  process.exit(0)
}

outputs.forEach((target) => {
  rmSync(resolve(projectRoot, target), { recursive: true, force: true })
  console.log(`已清理 ${target}/`)
})

/** 递归删除 *.tsbuildinfo：改了 tsconfig 后旧缓存会让类型检查结果偏旧 */
if (cleanCache) {
  const cleaned = []
  const walk = (dir) => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.git') continue
      const fullPath = resolve(dir, entry)
      if (statSync(fullPath).isDirectory()) walk(fullPath)
      else if (cachePattern.test(entry)) {
        rmSync(fullPath, { force: true })
        cleaned.push(fullPath.slice(projectRoot.length))
      }
    }
  }
  walk(projectRoot)
  console.log(cleaned.length ? `已清理增量编译缓存：${cleaned.join('、')}` : '没有增量编译缓存')
}
