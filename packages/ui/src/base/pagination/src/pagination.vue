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
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { useLocale } from '@campus-admin/locale'
import { buildPages, totalPagesOf } from './core'

defineOptions({ name: 'CaPagination' })

const { t } = useLocale()

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
  <nav :class="ns('pagination')" :aria-label="t('ca.pagination.label')">
    <span v-if="showTotal" :class="ns('pagination', 'total')">{{ t('ca.pagination.total', { total }) }}</span>
    <button :class="ns('pagination', 'arrow')" type="button" :aria-label="t('ca.pagination.prev')" :disabled="disabled || current <= 1" @click="go(current - 1)">
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
    <button :class="ns('pagination', 'arrow')" type="button" :aria-label="t('ca.pagination.next')" :disabled="disabled || current >= totalPages" @click="go(current + 1)">
      <ChevronRight :size="14" />
    </button>
  </nav>
</template>

<style src="../style/index.css"></style>
