#!/usr/bin/env node
/**
 * 清理构建产物。
 *
 * 用法:
 *   node scripts/clean.mjs all
 *   node scripts/clean.mjs dist:packages/campus-core dist:packages/campus-admin
 *   node scripts/clean.mjs dist site
 *
 * 只有显式传入目标才删除，避免误删目录，
 * 也保证“分包或改名后旧类型声明不会残留在 dist 中”。
 */
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2)

const packageNames = ['campus-core', 'campus-framework', 'campus-ui', 'campus-admin']
const outputs = []

if (args.includes('all') || args.length === 0) {
  packageNames.forEach(name => outputs.push(`packages/${name}/dist`))
  outputs.push('examples/admin/dist', 'examples/web/dist', 'site-dist')
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
  if (arg.startsWith('dist:')) {
    outputs.push(`${arg.slice('dist:'.length)}/dist`)
  }
}

if (!outputs.length) {
  console.log('没有需要清理的目标，可用目标：all | dist | site | dist:<包路径>')
  process.exit(0)
}

outputs.forEach((target) => {
  rmSync(resolve(projectRoot, target), { recursive: true, force: true })
  console.log(`已清理 ${target}/`)
})
