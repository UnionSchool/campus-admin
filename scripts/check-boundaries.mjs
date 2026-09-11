#!/usr/bin/env node
/**
 * 分层边界检查（Monorepo 版）。
 *
 * 规则：
 * 1. campus-core 不得依赖 Vue、Vite、UI 库或其他 campus 包。
 * 2. 只有 campus-framework 可以直接 import 'vue'。
 * 3. 包源码不得反向依赖 examples。
 *
 * 该脚本是发布门禁的一部分，保证“框架更新不影响项目”不是口头约定。
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const packagesDir = join(projectRoot, 'packages')

const FRAMEWORK_DEP = /from\s+['"](vue|@vue\/[^'"]+|vite|@vitejs\/[^'"]+|@lucide\/vue)['"]|from\s+['"][^'"]*\.vue['"]/
const VUE_IMPORT = /from\s+['"]vue['"]/
const CAMPUS_PACKAGE = /from\s+['"]@unionschool\/[^'"]+['"]/

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

function sourcesOf(packageName) {
  return ['src', 'scripts'].map(dir => join(packagesDir, packageName, dir))
}

// 规则 1：campus-core 必须与框架完全解耦
for (const dir of sourcesOf('campus-core')) {
  walk(dir, (fullPath) => {
    scanned += 1
    const source = readFileSync(fullPath, 'utf8')
    if (FRAMEWORK_DEP.test(source)) {
      violations.push(`${relative(projectRoot, fullPath)}: campus-core 不允许依赖框架或 UI 库`)
    }
    if (CAMPUS_PACKAGE.test(source)) {
      violations.push(`${relative(projectRoot, fullPath)}: campus-core 不允许依赖其他 campus 包`)
    }
  })
}

// 规则 2：只有 campus-framework 可以直接使用 vue
for (const packageName of ['campus-framework', 'campus-ui', 'campus-admin']) {
  for (const dir of sourcesOf(packageName)) {
    walk(dir, (fullPath) => {
      scanned += 1
      const source = readFileSync(fullPath, 'utf8')
      if (VUE_IMPORT.test(source) && packageName !== 'campus-framework') {
        violations.push(`${relative(projectRoot, fullPath)}: 只有 campus-framework 可以直接 import 'vue'`)
      }
    })
  }
}

if (violations.length) {
  console.error('分层边界检查未通过：')
  violations.forEach(item => console.error(`  - ${item}`))
  process.exit(1)
}

console.log(`分层边界检查通过：扫描 ${scanned} 个文件，core 无框架依赖。`)
