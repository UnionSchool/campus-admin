<!--
 * 表格：数据列表的核心组件，支持泛型列配置、自定义单元格、受控与非受控排序。
 *
 * 用法：
 *   const columns: TableColumn<StudentRow>[] = [
 *     { key: 'name', title: '姓名' },
 *     { key: 'status', title: '状态', align: 'center' },
 *     { key: 'balance', title: '余额', numeric: true, sortable: true },
 *   ]
 *   <CaTable :columns="columns" :data="rows" row-key="id" stripe :loading="loading" empty-text="暂无数据">
 *     <template #cell-name="{ row }"><CaAvatar :name="row.name" size="small" />{{ row.name }}</template>
 *   </CaTable>
 *
 * Props：columns / data / rowKey / loading / stripe / compact / sortKey / sortOrder / emptyText
 * 事件：update:sortKey、update:sortOrder、sort、row-click
 * 插槽：cell-<列 key> 自定义单元格、empty 空态
 *
 * 排序：不传 sortKey / sortOrder 时组件内部排序，点击表头按 升序 → 降序 → 取消 循环；
 * 接服务端排序时传入这两个 prop 并监听 sort 事件重新拉取数据。
 * rowKey 必须是稳定字段或函数，不要用数组下标。
-->

<script setup lang="ts" generic="T extends object">
import { computed, ref, watch } from '@unionschool/campus-framework'
import { ArrowDown, ArrowUp, ChevronsUpDown } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import CaEmpty from '../../../feedback/empty/index'
import { cellValue, columnAlign, resolveRowKey, sortRows } from './core'
import type { SortOrder, TableColumn } from './core'

defineOptions({ name: 'CaTable' })

const props = withDefaults(defineProps<{
  columns: TableColumn<T>[]
  data?: T[]
  rowKey?: string | ((row: T) => string)
  loading?: boolean
  /** 斑马纹 */
  stripe?: boolean
  /** 紧凑行高 */
  compact?: boolean
  sortKey?: string
  sortOrder?: SortOrder
  emptyText?: string
}>(), {
  data: () => [],
  loading: false,
  sortOrder: null,
  emptyText: '暂无数据',
})

const emit = defineEmits<{
  'update:sortKey': [key: string]
  'update:sortOrder': [order: SortOrder]
  'row-click': [row: T, index: number]
  sort: [key: string, order: SortOrder]
}>()

const className = computed(() => cx(
  ns('table'),
  props.stripe ? ns('table', undefined, 'stripe') : '',
  props.compact ? ns('table', undefined, 'compact') : '',
))

/**
 * 排序状态支持受控与非受控两种用法：
 * - 传入 sortKey / sortOrder 时以 props 为准；
 * - 不传时组件内部维护，点击表头即可排序。
 */
const innerSort = ref<{ key: string; order: SortOrder }>({ key: props.sortKey ?? '', order: props.sortOrder ?? null })

watch(() => props.sortKey, (key) => { if (key !== undefined) innerSort.value.key = key ?? '' })
watch(() => props.sortOrder, (order) => { if (order !== undefined) innerSort.value.order = order ?? null })

const localSort = computed(() => ({
  key: props.sortKey ?? innerSort.value.key,
  order: props.sortOrder ?? innerSort.value.order,
}))

const rows = computed(() => {
  const { key, order } = localSort.value
  if (!key || !order) return props.data
  const column = props.columns.find(item => item.key === key)
  if (!column?.sortable) return props.data
  return sortRows(props.data, column, order)
})

function toggleSort(column: TableColumn<T>) {
  if (!column.sortable) return
  const isSame = localSort.value.key === column.key
  const next: SortOrder = !isSame || localSort.value.order === null
    ? 'asc'
    : localSort.value.order === 'asc' ? 'desc' : null
  innerSort.value = { key: next ? column.key : '', order: next }
  emit('update:sortKey', next ? column.key : '')
  emit('update:sortOrder', next)
  emit('sort', column.key, next)
}
</script>

<template>
  <div :class="className">
    <div :class="ns('table', 'scroll')">
      <table>
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="{ width: typeof column.width === 'number' ? `${column.width}px` : column.width }"
              :class="cx(column.sortable ? ns('table', 'sortable') : '', ns('table', undefined, columnAlign(column)))"
              :aria-sort="localSort.key === column.key && localSort.order ? (localSort.order === 'asc' ? 'ascending' : 'descending') : 'none'"
            >
              <button v-if="column.sortable" type="button" @click="toggleSort(column)">
                {{ column.title }}
                <ArrowUp v-if="localSort.key === column.key && localSort.order === 'asc'" :size="12" />
                <ArrowDown v-else-if="localSort.key === column.key && localSort.order === 'desc'" :size="12" />
                <ChevronsUpDown v-else :size="12" :class="ns('table', 'sort-idle')" />
              </button>
              <template v-else>{{ column.title }}</template>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" :class="ns('table', 'state')">
              <span :class="ns('table', 'spinner')" aria-hidden="true"></span>加载中…
            </td>
          </tr>
          <tr
            v-for="(row, index) in rows"
            v-else
            :key="resolveRowKey(row, index, rowKey)"
            :class="ns('table', 'row')"
            @click="emit('row-click', row, index)"
          >
            <td v-for="column in columns" :key="column.key" :class="ns('table', undefined, columnAlign(column))">
              <slot :name="`cell-${column.key}`" :row="row" :index="index" :column="column">
                {{ cellValue(row, column, index) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!rows.length && !loading" :class="ns('table', 'empty')">
      <slot name="empty"><CaEmpty :title="emptyText" size="small" /></slot>
    </div>
  </div>
</template>

<style scoped>
.ca-table { display: block; width: 100%; }
.ca-table__scroll { overflow-x: auto; }
.ca-table table { width: 100%; min-width: 520px; border-collapse: separate; border-spacing: 0; font-size: var(--ca-font-size-sm); }
.ca-table th { padding: var(--ca-space-2) var(--ca-space-3); background: var(--ca-surface-sunken); color: var(--ca-text-secondary); font-weight: 500; text-align: left; white-space: nowrap; border-bottom: 1px solid var(--ca-border-color); }
.ca-table th:first-child { border-top-left-radius: var(--ca-radius-md); }
.ca-table th:last-child { border-top-right-radius: var(--ca-radius-md); }
.ca-table th button { display: inline-flex; align-items: center; gap: 4px; color: inherit; font-size: inherit; }
.ca-table th button:hover { color: var(--ca-color-primary); }
.ca-table__sort-idle { color: var(--ca-color-neutral-300); }
.ca-table td { padding: var(--ca-space-3); color: var(--ca-text-regular); border-bottom: 1px solid var(--ca-border-color); vertical-align: middle; }
.ca-table--compact th, .ca-table--compact td { padding: var(--ca-space-1) var(--ca-space-2); }
.ca-table--stripe tbody tr:nth-child(even) { background: var(--ca-surface-sunken); }
.ca-table__row { transition: background-color .16s; }
.ca-table__row:hover { background: var(--ca-color-primary-soft); }
.ca-table__row { cursor: pointer; }
.ca-table--left { text-align: left; }
.ca-table--center { text-align: center; }
.ca-table--right { text-align: right; font-variant-numeric: tabular-nums; }
.ca-table__state { padding: var(--ca-space-6); color: var(--ca-text-secondary); text-align: center; }
.ca-table__spinner { display: inline-block; width: 12px; height: 12px; margin-right: 6px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; vertical-align: -2px; animation: ca-table-spin .7s linear infinite; }
.ca-table__empty { padding: var(--ca-space-2) 0; }
@keyframes ca-table-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .ca-table__spinner { animation-duration: 2s; }
}
</style>
