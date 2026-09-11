<!--
 * 班级树：年级与班级的两级选择器，支持搜索与展开收起。
 * 数据由业务方通过接口获取后传入，组件不访问接口。
 *
 * 用法：
 *   <CaClassTree v-model="classId" :grades="grades" @change="onClassChange" />
 *   // grades: [{ id: 'g1', label: '高一', children: [{ id: 'c11', label: '高一（1）班' }] }]
 *
 * Props：modelValue / grades / searchable / expandedKeys（受控展开）
 * 事件：update:modelValue、update:expandedKeys、change
 * 工具：flattenTree、filterTree、defaultExpanded
-->

<script setup lang="ts">
import { computed, ref, watch } from '@unionschool/campus-framework'
import { ChevronRight, GraduationCap, UsersRound } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { defaultExpanded, filterTree, flattenTree } from './core'
import type { GradeNode } from './core'

defineOptions({ name: 'CaClassTree' })

const props = withDefaults(defineProps<{
  modelValue?: string
  /** 年级与班级数据，由业务方传入 */
  grades?: GradeNode[]
  searchable?: boolean
  /** 受控展开状态；不传时组件内部维护 */
  expandedKeys?: string[]
}>(), {
  grades: () => [],
  searchable: true,
})

const emit = defineEmits<{
  'update:modelValue': [id: string]
  'update:expandedKeys': [keys: string[]]
  change: [id: string, node: { id: string; label: string }]
}>()

const keyword = ref('')
const innerExpanded = ref<Set<string>>(defaultExpanded(props.grades))

watch(() => props.grades, (grades) => {
  innerExpanded.value = defaultExpanded(grades)
}, { once: true })

const expandedSet = computed(() => (props.expandedKeys ? new Set(props.expandedKeys) : innerExpanded.value))
const visibleGrades = computed(() => filterTree(props.grades, keyword.value))
const rows = computed(() => flattenTree(visibleGrades.value, expandedSet.value))

function toggle(id: string) {
  const next = new Set(expandedSet.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  if (props.expandedKeys) emit('update:expandedKeys', [...next])
  else innerExpanded.value = next
}

function select(id: string, label: string, isLeaf: boolean, disabled?: boolean) {
  if (disabled || !isLeaf) return
  emit('update:modelValue', id)
  emit('change', id, { id, label })
}
</script>

<template>
  <div :class="ns('class-tree')">
    <input
      v-if="searchable"
      v-model="keyword"
      :class="ns('class-tree', 'search')"
      type="search"
      placeholder="搜索年级或班级"
      aria-label="搜索班级"
    />
    <ul :class="ns('class-tree', 'list')" role="tree">
      <li
        v-for="row in rows"
        :key="row.id"
        :class="cx(
          ns('class-tree', 'node'),
          ns('class-tree', 'node', `level-${row.level}`),
          modelValue === row.id ? ns('class-tree', 'node', 'selected') : '',
          row.disabled ? ns('class-tree', 'node', 'disabled') : '',
        )"
        role="treeitem"
        :aria-expanded="row.isLeaf ? undefined : expandedSet.has(row.id)"
        :aria-selected="modelValue === row.id"
      >
        <button type="button" @click="row.isLeaf ? select(row.id, row.label, true, row.disabled) : toggle(row.id)">
          <ChevronRight
            v-if="!row.isLeaf"
            :size="14"
            :class="cx(ns('class-tree', 'arrow'), expandedSet.has(row.id) ? ns('class-tree', 'arrow', 'open') : '')"
          />
          <UsersRound v-else :size="14" />
          <GraduationCap v-if="!row.isLeaf" :size="15" :class="ns('class-tree', 'icon')" />
          <span :class="ns('class-tree', 'label')">{{ row.label }}</span>
        </button>
      </li>
      <li v-if="!rows.length" :class="ns('class-tree', 'empty')">没有匹配的年级或班级</li>
    </ul>
  </div>
</template>

<style scoped>
.ca-class-tree { display: grid; gap: var(--ca-space-2); }
.ca-class-tree__search { min-height: var(--ca-control-height-md); padding: 0 var(--ca-space-3); border: 1px solid var(--ca-border-color); border-radius: var(--ca-radius-md); color: var(--ca-text-primary); font-size: var(--ca-font-size-md); outline: none; }
.ca-class-tree__search:focus { border-color: var(--ca-color-primary); box-shadow: 0 0 0 3px var(--ca-color-primary-soft); }
.ca-class-tree__list { display: grid; gap: 2px; max-height: 360px; overflow-y: auto; }
.ca-class-tree__node button { display: flex; align-items: center; gap: var(--ca-space-2); width: 100%; padding: 7px var(--ca-space-2); border-radius: var(--ca-radius-md); color: var(--ca-text-regular); font-size: var(--ca-font-size-md); text-align: left; }
.ca-class-tree__node button:hover { background: var(--ca-surface-sunken); }
.ca-class-tree__node--level-1 button { padding-left: var(--ca-space-5); }
.ca-class-tree__node--selected button { background: var(--ca-color-primary-soft); color: var(--ca-color-primary); font-weight: 500; }
.ca-class-tree__node--disabled button { color: var(--ca-text-placeholder); cursor: not-allowed; }
.ca-class-tree__arrow { color: var(--ca-text-placeholder); transition: transform .16s; }
.ca-class-tree__arrow--open { transform: rotate(90deg); }
.ca-class-tree__icon { color: var(--ca-color-primary); }
.ca-class-tree__label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ca-class-tree__empty { padding: var(--ca-space-4); color: var(--ca-text-placeholder); font-size: var(--ca-font-size-sm); text-align: center; }
@media (prefers-reduced-motion: reduce) {
  .ca-class-tree__arrow { transition: none; }
}
</style>
