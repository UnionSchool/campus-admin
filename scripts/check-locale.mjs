#!/usr/bin/env node
/**
 * 国际化词条检查。
 *
 * 缺词条不会报错，只会在页面上把 key 原样显示出来，很容易漏到线上，
 * 所以在门禁里做两件事：
 * 1. 代码里用到的词条键必须在语言包里存在；
 * 2. 各语言包的键必须完全一致（少一条就会在切语言时露出另一种语言）。
 *
 * 检查两个目标：组件库（@campus-admin/ui 的 ca.* 命名空间，词条在 @campus-admin/locale）
 * 与示例后台的业务词条。
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const LOCALES = ['zh-CN', 'en-US']

const violations = []

const TARGETS = [
  {
    name: '组件库 @campus-admin/ui',
    /** 扫描这些目录下的 .ts/.vue：组件用词条，locale 定义词条 */
    roots: [join(projectRoot, 'packages/ui/src'), join(projectRoot, 'packages/locale/src')],
    /** 语言包目录本身不参与扫描 */
    skip: ['lang'],
    langDir: join(projectRoot, 'packages/locale/src/lang'),
    /** 只统计这个前缀的键 */
    match: key => key.startsWith('ca.'),
    /** 这些前缀的词条由代码动态拼接，不做“未使用”提示 */
    dynamic: [],
  },
  {
    name: '示例后台 examples/admin',
    roots: [join(projectRoot, 'examples/admin/src'), join(projectRoot, 'examples/admin')],
    skip: ['locale', 'node_modules', 'dist'],
    langDir: join(projectRoot, 'examples/admin/src/locale'),
    match: key => /^(app|page|menu)\./.test(key),
    /** menu.<菜单 id> 由后端 id 拼接，不会以字面量出现在代码里 */
    dynamic: ['menu.'],
  },
]

function walk(dir, onFile) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (entry === 'node_modules' || entry === 'dist') continue
    if (statSync(fullPath).isDirectory()) walk(fullPath, onFile)
    else if (/\.(ts|vue)$/.test(entry)) onFile(fullPath, entry)
  }
}

/**
 * 代码里用到的词条键。
 * 只要是源码里出现过的字符串字面量就算用到（t() 里、三元里、或者
 * 作为 labelKey 字段），这样既覆盖动态取值，也不会漏掉分支里的文案。
 */
function usedKeys(target) {
  const keys = new Map()
  target.roots.forEach((root) => {
    walk(root, (fullPath, name) => {
      if (!/\.(ts|vue)$/.test(name)) return
      const rel = relative(projectRoot, fullPath)
      if (target.skip.some(item => rel.split('/').includes(item))) return
      const source = readFileSync(fullPath, 'utf8')
      for (const match of source.matchAll(/['"]([A-Za-z][\w-]*(?:\.[\w-]+)+)['"]/g)) {
        const key = match[1]
        if (!target.match(key)) continue
        if (!keys.has(key)) keys.set(key, rel)
      }
    })
  })
  return keys
}

/** 语言包里的词条键：按缩进还原 'a.b.c' 结构，键名可以是带引号的 kebab-case */
function catalogKeys(langDir, locale) {
  const file = join(langDir, `${locale}.ts`)
  const keys = new Set()
  const stack = []
  readFileSync(file, 'utf8').split('\n').forEach((line) => {
    const match = /^(\s+)(?:'([^']+)'|([A-Za-z][\w]*)):\s*(.*)$/.exec(line)
    if (!match) return
    const indent = match[1].length
    const name = match[2] ?? match[3]
    const value = match[4]
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop()
    const path = [...stack.map(item => item.name), name].join('.')
    if (value.startsWith("'")) keys.add(path)
    else stack.push({ indent, name })
  })
  return keys
}

const summary = []

TARGETS.forEach((target) => {
  const used = usedKeys(target)
  const catalogs = Object.fromEntries(LOCALES.map(locale => [locale, catalogKeys(target.langDir, locale)]))
  const [base] = LOCALES

  used.forEach((file, key) => {
    if (!catalogs[base].has(key)) violations.push(`${target.name}：${file} 用到的词条 ${key} 在 ${base}.ts 中不存在`)
  })

  LOCALES.slice(1).forEach((locale) => {
    catalogs[base].forEach((key) => {
      if (!catalogs[locale].has(key)) violations.push(`${target.name}：${locale}.ts 缺少词条 ${key}`)
    })
    catalogs[locale].forEach((key) => {
      if (!catalogs[base].has(key)) violations.push(`${target.name}：${base}.ts 缺少词条 ${key}（${locale}.ts 中有）`)
    })
  })

  const unused = [...catalogs[base]]
    .filter(key => !used.has(key) && !target.dynamic.some(prefix => key.startsWith(prefix)))

  summary.push({ target, used, total: catalogs[base].size })
  if (unused.length) {
    console.log(`${target.name}：以下 ${unused.length} 条词条暂未被引用（可能是预留）：`)
    unused.forEach(key => console.log(`  - ${key}`))
  }
})

if (violations.length) {
  console.error('国际化词条检查未通过：')
  violations.forEach(item => console.error(`  - ${item}`))
  process.exit(1)
}

summary.forEach(({ target, used, total }) => {
  console.log(`${target.name}：${LOCALES.join(' / ')} 各 ${total} 条，代码用到 ${used.size} 条。`)
})
console.log('国际化词条检查通过。')
