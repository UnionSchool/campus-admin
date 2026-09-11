<!--
 * 分页：受控分页器，页数多时自动折叠中间页码。
 * 服务端分页时监听 change 重新拉取数据。
 *
 * 用法：
 *   <CaPagination v-model:current="page" v-model:page-size="pageSize" :total="total" @change="load" />
 *
 * Props：current / pageSize / total / disabled / showTotal
 * 事件：update:current、update:pageSize、change
-->

<script setup lang="ts">
import { computed } from '@unionschool/campus-framework'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { buildPages, totalPagesOf } from './core'

defineOptions({ name: 'CaPagination' })

const props = withDefaults(defineProps<{
  /** 当前页，从 1 开始 */
  current?: number
  pageSize?: number
  /** 数据总数，用于计算总页数 */
  total: number
  disabled?: boolean
  /** 显示“共 N 条” */
  showTotal?: boolean
}>(), {
  current: 1,
  pageSize: 10,
  disabled: false,
  showTotal: true,
})

const emit = defineEmits<{
  'update:current': [page: number]
  'update:pageSize': [size: number]
  change: [page: number, size: number]
}>()

const totalPages = computed(() => totalPagesOf(props.total, props.pageSize))
const pages = computed(() => buildPages(props.current, totalPages.value))

function go(page: number) {
  if (props.disabled) return
  const target = Math.min(totalPages.value, Math.max(1, page))
  if (target === props.current) return
  emit('update:current', target)
  emit('change', target, props.pageSize)
}
</script>

<template>
  <nav :class="ns('pagination')" aria-label="分页导航">
    <span v-if="showTotal" :class="ns('pagination', 'total')">共 {{ total }} 条</span>
    <button :class="ns('pagination', 'arrow')" type="button" aria-label="上一页" :disabled="disabled || current <= 1" @click="go(current - 1)">
      <ChevronLeft :size="14" />
    </button>
    <template v-for="(item, index) in pages" :key="`${item.type}-${item.page}-${index}`">
      <span v-if="item.type === 'ellipsis'" :class="ns('pagination', 'ellipsis')">…</span>
      <button
        v-else
        :class="cx(ns('pagination', 'item'), item.page === current ? ns('pagination', 'item', 'active') : '')"
        type="button"
        :aria-current="item.page === current ? 'page' : undefined"
        :disabled="disabled"
        @click="go(item.page)"
      >
        {{ item.page }}
      </button>
    </template>
    <button :class="ns('pagination', 'arrow')" type="button" aria-label="下一页" :disabled="disabled || current >= totalPages" @click="go(current + 1)">
      <ChevronRight :size="14" />
    </button>
  </nav>
</template>

<style scoped>
.ca-pagination { display: flex; align-items: center; gap: var(--ca-space-1); flex-wrap: wrap; }
.ca-pagination__total { margin-right: var(--ca-space-2); color: var(--ca-text-secondary); font-size: var(--ca-font-size-sm); }
.ca-pagination__item, .ca-pagination__arrow {
  display: inline-grid;
  place-items: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid var(--ca-border-color);
  border-radius: var(--ca-radius-sm);
  background: var(--ca-surface-card);
  color: var(--ca-text-regular);
  font-size: var(--ca-font-size-sm);
  font-variant-numeric: tabular-nums;
}
.ca-pagination__item:hover:not(:disabled), .ca-pagination__arrow:hover:not(:disabled) { border-color: var(--ca-color-primary); color: var(--ca-color-primary); }
.ca-pagination__item--active { border-color: var(--ca-color-primary); background: var(--ca-color-primary); color: white; font-weight: 500; }
.ca-pagination__item--active:hover:not(:disabled) { color: white; }
.ca-pagination__item:disabled, .ca-pagination__arrow:disabled { color: var(--ca-text-placeholder); cursor: not-allowed; }
.ca-pagination__ellipsis { padding: 0 4px; color: var(--ca-text-placeholder); font-size: var(--ca-font-size-sm); }
</style>
