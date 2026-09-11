<!--
 * 侧边菜单：支持多级的左侧导航，数据驱动渲染。
 * 组件不依赖路由，选中与跳转由业务侧通过 modelValue 和 select 事件接管。
 *
 * 用法：
 *   <CaSideMenu :items="items" :model-value="route.path" :indent="12" :indent-step="30" @select="go" />
 *
 *   const items: SideMenuItem[] = [
 *     { label: '学校概况', icon: LayoutDashboard, children: [
 *       { label: '我的首页', value: '/home' },
 *       { label: '学生管理', value: '/students', icon: GraduationCap },
 *     ] },
 *   ]
 *
 * Props：items / modelValue / expandedKeys / defaultExpandAll / highlightBranch
 *        / indent（一级左内边距）/ indentStep（每级递增量）/ levelOffset（按层微调）/ subIcon / ariaLabel
 * 事件：update:modelValue、update:expandedKeys、select、expand-change
 * 插槽：icon 自定义图标、default 自定义文字
 *
 * 布局：一级为图标 + 文字，有子菜单时右侧显示展开箭头；二级整体缩进，未设置 icon 时回退为小圆点。
 * 层级：缩进公式为 indent + level × indentStep + levelOffset[level]，层级没有上限。
 *       levelOffset 用于按层级做像素级微调，例如只想把三级左移 5px。
 * 渲染方式：展开状态由单实例维护，按状态把菜单树拍平成列表渲染，所以数据嵌套到几层就能渲染到几层，
 *           组件代码不需要随层级变化而修改。
-->

<script setup lang="ts">
import { computed, ref, watch } from '@unionschool/campus-framework'
import { ChevronDown, ChevronsRight, Dot } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { collectExpandableKeys, flattenMenu, resolveKey } from '../../core'
import type { SideMenuItem } from '../../core'

defineOptions({ name: 'CaSideMenu' })

const props = withDefaults(defineProps<{
  items: SideMenuItem[]
  /** 当前选中节点的 key，通常传当前路由地址 */
  modelValue?: string
  /** 受控展开状态 */
  expandedKeys?: string[]
  /** 是否默认展开全部分组 */
  defaultExpandAll?: boolean
  /** 选中父分组时是否同时高亮 */
  highlightBranch?: boolean
  ariaLabel?: string
  /** 一级菜单左内边距（可传负数继续左移） */
  indent?: number
  /** 每深一级额外增加的缩进量 */
  indentStep?: number
  /**
   * 按层级微调缩进，下标即层级。
   * 例如 [0, 0, -5] 表示一级、二级不变，三级左移 5px。
   */
  levelOffset?: number[]
  /** 二级及以下未提供 icon 时展示的默认图标 */
  subIcon?: unknown
}>(), {
  defaultExpandAll: false,
  highlightBranch: true,
  ariaLabel: '导航菜单',
  indent: 14,
  indentStep: 14,
  levelOffset: () => [],
})

/** 二级菜单默认图标：小圆点 */
const defaultSubIcon = Dot
/** 二级及以下还有子菜单时的默认图标：向右双箭头，暗示可以继续展开 */
const defaultBranchIcon = ChevronsRight

const emit = defineEmits<{
  'update:modelValue': [key: string, item: SideMenuItem]
  'update:expandedKeys': [keys: string[]]
  select: [item: SideMenuItem, key: string]
  'expand-change': [keys: string[], key: string, expanded: boolean]
}>()

const base = ns('side-menu')

/** 非受控时组件内部维护展开状态，受控时以 expandedKeys 为准 */
const innerExpanded = ref<Set<string>>(
  props.defaultExpandAll ? collectExpandableKeys(props.items) : new Set<string>(),
)

// 仅在父级真正传入 expandedKeys 时同步，避免挂载阶段用空值覆盖已恢复的展开状态
watch(() => props.expandedKeys, (keys) => {
  if (keys === undefined) return
  innerExpanded.value = new Set(keys)
}, { immediate: true })

/** 统一写展开状态：受控模式抛出事件，非受控模式直接改内部状态 */
function applyExpanded(next: Set<string>) {
  if (props.expandedKeys) emit('update:expandedKeys', [...next])
  else innerExpanded.value = next
}

const expandedSet = computed(() => (
  props.expandedKeys ? new Set(props.expandedKeys) : innerExpanded.value
))

const rows = computed(() => flattenMenu(props.items, expandedSet.value))

/** 当前选中项的祖先链，用于自动展开 */
const activeAncestors = computed(() => {
  if (!props.modelValue) return [] as string[]
  const walk = (items: SideMenuItem[], trail: string[]): string[] => {
    for (const item of items) {
      const itemKey = resolveKey(item)
      if (itemKey === props.modelValue) return trail
      if (item.children?.length) {
        const hit = walk(item.children, [...trail, itemKey])
        if (hit.length) return hit
      }
    }
    return []
  }
  return walk(props.items, [])
})

// 选中项变化时自动展开其所在分组，避免出现"页面已切换但菜单里找不到当前项"
// flush: 'post' 保证在非受控模式下 innerExpanded 初始化完成后再合并祖先链
watch(activeAncestors, (keys) => {
  if (!keys.length) return
  const next = new Set(expandedSet.value)
  let changed = false
  keys.forEach((key) => {
    if (!next.has(key)) {
      next.add(key)
      changed = true
    }
  })
  if (!changed) return
  applyExpanded(next)
}, { immediate: true, flush: 'post' })

function setExpanded(next: Set<string>, key: string, open: boolean) {
  applyExpanded(next)
  emit('expand-change', [...next], key, open)
}

function toggle(key: string) {
  const next = new Set(expandedSet.value)
  const open = !next.has(key)
  if (open) next.add(key)
  else next.delete(key)
  setExpanded(next, key, open)
}

function isActive(itemKey: string) {
  return Boolean(props.modelValue) && props.modelValue === itemKey
}

/**
 * 解析节点图标。
 *
 * - 一级：只使用传入的 icon，不传则不显示。
 * - 二级及以下：传入的 icon 优先；未传时按“是否还有子菜单”回退——
 *   有子菜单显示向右双箭头，没有子菜单显示小圆点。
 */
function resolveIcon(row: { level: number; icon?: unknown; children?: SideMenuItem[] }) {
  if (row.icon) return row.icon
  if (row.level === 0) return undefined
  if (row.children?.length) return defaultBranchIcon
  return props.subIcon ?? defaultSubIcon
}

/** 判断是否使用默认圆点：圆点需要加粗描边才看得清，箭头保持常规描边 */
function isDefaultSubIcon(row: { level: number; icon?: unknown; children?: SideMenuItem[] }) {
  return row.level > 0 && !row.icon && !row.children?.length
}

function isBranchActive(row: { itemKey: string; children?: SideMenuItem[] }): boolean {
  if (!props.highlightBranch || !row.children?.length) return false
  const hit = (items: SideMenuItem[]): boolean => items.some(item => (
    resolveKey(item) === props.modelValue || (item.children ? hit(item.children) : false)
  ))
  return hit(row.children)
}

function handleSelect(row: SideMenuItem) {
  if (row.disabled) return
  const itemKey = resolveKey(row)
  if (row.children?.length) {
    toggle(itemKey)
    return
  }
  emit('update:modelValue', itemKey, row)
  emit('select', row, itemKey)
}
</script>

<template>
  <nav :class="base" :aria-label="ariaLabel">
    <button
      v-for="row in rows"
      :key="row.itemKey"
      type="button"
      :data-level="row.level"
      :class="cx(
        ns('side-menu', 'item'),
        isActive(row.itemKey) ? ns('side-menu', 'item', 'active') : '',
        isBranchActive(row) ? ns('side-menu', 'item', 'branch') : '',
        expandedSet.has(row.itemKey) ? ns('side-menu', 'item', 'open') : '',
        row.level > 0 ? ns('side-menu', 'item', 'sub') : '',
        row.disabled ? ns('side-menu', 'item', 'disabled') : '',
      )"
      :style="{ paddingLeft: `${indent + row.level * indentStep + (levelOffset[row.level] ?? 0)}px` }"
      :disabled="row.disabled"
      :aria-expanded="row.expandable ? expandedSet.has(row.itemKey) : undefined"
      :aria-current="isActive(row.itemKey) ? 'page' : undefined"
      @click="handleSelect(row)"
    >
      <!-- 一级保留箭头列的占位，保证同级「有/无子菜单」的图标与文字左对齐 -->
      <span v-if="row.level === 0" :class="ns('side-menu', 'arrow-slot')" aria-hidden="true"></span>
      <span v-if="resolveIcon(row) || $slots.icon" :class="ns('side-menu', 'icon')" :data-size="row.level === 0 ? 16 : 14">
        <!-- 图标可自定义：通过 #icon 插槽按节点渲染，未提供时回退到默认图标 -->
        <slot name="icon" :item="row">
          <component :is="resolveIcon(row)" :size="row.level === 0 ? 16 : 14" :stroke-width="isDefaultSubIcon(row) ? 5 : 1.8" />
        </slot>
      </span>
      <span :class="ns('side-menu', 'label')"><slot :item="row">{{ row.label }}</slot></span>
      <!-- 角标与展开箭头统一靠右排列 -->
      <span v-if="row.badge || row.expandable" :class="ns('side-menu', 'tail')">
        <em v-if="row.badge" :class="ns('side-menu', 'badge')">{{ row.badge }}</em>
        <span v-if="row.expandable" :class="ns('side-menu', 'arrow')" aria-hidden="true">
          <ChevronDown :size="14" />
        </span>
      </span>
    </button>
  </nav>
</template>

<style src="../style/index.css"></style>
