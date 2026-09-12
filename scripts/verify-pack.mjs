#!/usr/bin/env node
/**
 * 发布产物校验：对四个包执行 pnpm pack，并检查 tarball 内容。
 *
 * 校验目标：
 * 1. 必须包含 dist/ 与 package.json。
 * 2. 不得包含源码、示例、内部文档、测试与构建配置。
 * 3. 打包结果输出到系统临时目录，不污染仓库。
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const packages = ['icon', 'locale', 'ui', 'core']
const outputDir = mkdtempSync(join(tmpdir(), 'campus-pack-'))

/** 发布产物必须带上的文件：包描述、构建产物、许可证与说明（许可证与版权随包分发） */
const required = [
  /^package\/package\.json$/,
  /^package\/LICENSE$/,
  /^package\/README\.md$/,
  /^package\/dist\//,
]
const forbidden = /^package\/(src|examples|docs|\.github|\.local-docs|test|tests|__tests__)\//

let failed = false

try {
  packages.forEach((name) => {
    const cwd = join(projectRoot, 'packages', name)
    execFileSync('pnpm', ['pack', '--pack-destination', outputDir], { cwd, stdio: 'pipe' })
  })

  const tarballs = readdirSync(outputDir).filter(file => file.endsWith('.tgz'))
  if (tarballs.length !== packages.length) {
    throw new Error(`期望 ${packages.length} 个 tarball，实际 ${tarballs.length} 个`)
  }

  tarballs.forEach((file) => {
    const entries = execFileSync('tar', ['-tzf', join(outputDir, file)], { encoding: 'utf8' })
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    required.forEach((pattern) => {
      if (!entries.some(entry => pattern.test(entry))) {
        console.error(`  ✗ ${file}: 缺少 ${pattern}`)
        failed = true
      }
    })

    entries.filter(entry => forbidden.test(entry)).forEach((entry) => {
      console.error(`  ✗ ${file}: 不应包含 ${entry}`)
      failed = true
    })
  })
} finally {
  rmSync(outputDir, { recursive: true, force: true })
}

if (failed) {
  console.error('发布产物校验未通过。')
  process.exit(1)
}

console.log(`发布产物校验通过：${packages.length} 个包的 tarball 内容符合白名单。`)
