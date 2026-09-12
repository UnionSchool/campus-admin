#!/usr/bin/env node
/**
 * 分层边界检查。
 *
 * 包结构：icon / locale 是底座，ui 依赖 locale，core 依赖 ui、locale、icon。
 * 规则：
 * 1. 依赖只能向上：ui 不得 import core，locale 不得 import ui/core，icon 不得 import 其他三个包；
 * 2. 源码里不得出现 Vite 相关的构建工具依赖（构建配置只放包根目录）；
 * 3. 包源码不得反向依赖 examples。
 *
 * 该脚本是发布门禁的一部分，保证“升级框架不影响业务”不是口头约定。
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const packagesDir = join(projectRoot, 'packages')

/** 每个包允许依赖的兄弟包；不在表里的兄弟包依赖一律视为违规 */
const ALLOWED_DEPS = {
  icon: [],
  locale: [],
  ui: ['@campus-admin/locale'],
  core: ['@campus-admin/icon', '@campus-admin/locale', '@campus-admin/ui'],
}

/** Vite 等构建工具不允许出现在源码里 */
const BUILD_TOOL_DEP = /from\s+['"](vite|@vitejs\/[^'"]+|rollup|esbuild)['"]/
/** 跨包导入，用于校验依赖方向 */
const CAMPUS_DEP = /from\s+['"](@campus-admin\/[a-z-]+)['"]/g
/** 反向依赖示例 */
const EXAMPLE_DEP = /from\s+['"][^'"]*examples\//

const violations = []
let scanned = 0

function walk(dir, onFile) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (entry === 'node_modules' || entry === 'dist') continue
    if (statSync(fullPath).isDirectory()) {
      walk(fullPath, onFile)
    } else if (/\.(ts|vue|mjs|js)$/.test(entry)) {
      onFile(fullPath)
    }
  }
}

/** 去掉注释后再匹配，避免注释里的示例代码被当成真实依赖 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

Object.entries(ALLOWED_DEPS).forEach(([packageName, allowed]) => {
  for (const dir of ['src', 'scripts'].map(item => join(packagesDir, packageName, item))) {
    walk(dir, (fullPath) => {
      scanned += 1
      const source = stripComments(readFileSync(fullPath, 'utf8'))
      const file = relative(projectRoot, fullPath)

      for (const match of source.matchAll(CAMPUS_DEP)) {
        const dependency = match[1]
        if (!allowed.includes(dependency)) {
          const reason = allowed.length
            ? `${packageName} 只允许依赖 ${allowed.join('、')}，出现了 ${dependency}`
            : `${packageName} 是底层包，不允许依赖 ${dependency}`
          violations.push(`${file}: ${reason}`)
        }
      }

      if (BUILD_TOOL_DEP.test(source)) {
        violations.push(`${file}: 源码不允许依赖构建工具，构建配置请放在包根目录`)
      }
      if (EXAMPLE_DEP.test(source)) {
        violations.push(`${file}: 包源码不允许依赖 examples`)
      }
    })
  }
})

if (violations.length) {
  console.error('分层边界检查未通过：')
  violations.forEach(item => console.error(`  - ${item}`))
  process.exit(1)
}

console.log(`分层边界检查通过：扫描 ${scanned} 个文件，依赖方向正确。`)
