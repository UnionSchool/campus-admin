<!--
 * 查询表单：列表页的查询条件区域，统一字段栅格与查询/重置/展开操作。
 *
 * 用法：
 *   <CaSearchForm :columns="3" :loading="loading" @search="load" @reset="reset">
 *     <label>姓名<CaInput v-model="query.keyword" /></label>
 *     <label>年级<CaSelect v-model="query.grade" :options="grades" /></label>
 *   </CaSearchForm>
 *
 * Props：columns 展开时的列数 / visibleCount 收起时保留的字段数 / loading
 *        / searchText / resetText
 * 事件：search、reset
 * Expose：expand()、collapse()（父组件在外层控制展开时使用）
-->

<script setup lang="ts">
import { computed, ref } from '@unionschool/campus-framework'
import { ChevronDown, RotateCcw, Search } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'

defineOptions({ name: 'CaSearchForm' })

const props = withDefaults(defineProps<{
  loading?: boolean
  /** 展开时显示的字段列数 */
  columns?: number
  /** 收起时保留的字段数量 */
  visibleCount?: number
  searchText?: string
  resetText?: string
}>(), {
  columns: 4,
  visibleCount: 3,
  searchText: '查询',
  resetText: '重置',
})

const emit = defineEmits<{ search: []; reset: [] }>()

const expanded = ref(false)
/** 由父级插槽内容填充字段数量，用于决定是否显示展开按钮 */
const fieldCount = ref(0)

const className = ns('search-form')
const canCollapse = computed(() => fieldCount.value > props.visibleCount)
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`,
}))

defineExpose({ expand: () => { expanded.value = true }, collapse: () => { expanded.value = false } })
</script>

<template>
  <form :class="className" @submit.prevent="emit('search')">
    <div
      :class="cx(ns('search-form', 'fields'), canCollapse && !expanded ? ns('search-form', 'fields', 'collapsed') : '')"
      :style="canCollapse && !expanded ? { ...gridStyle, maxHeight: `var(--ca-search-form-row, 100%)` } : gridStyle"
    >
      <slot />
    </div>
    <div :class="ns('search-form', 'actions')">
      <button :class="ns('search-form', 'button')" type="button" :disabled="loading" @click="emit('reset')">
        <RotateCcw :size="14" />{{ resetText }}
      </button>
      <button :class="cx(ns('search-form', 'button'), ns('search-form', 'button', 'primary'))" type="submit" :disabled="loading">
        <Search :size="14" />{{ loading ? '查询中…' : searchText }}
      </button>
      <button v-if="canCollapse" :class="ns('search-form', 'toggle')" type="button" @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
        <ChevronDown :size="13" :class="cx(ns('search-form', 'arrow'), expanded ? ns('search-form', 'arrow', 'open') : '')" />
      </button>
    </div>
  </form>
</template>

<style scoped>
.ca-search-form { display: grid; gap: var(--ca-space-3); padding: var(--ca-space-4); border: 1px solid var(--ca-border-color); border-radius: var(--ca-radius-lg); background: var(--ca-surface-card); }
.ca-search-form__fields { display: grid; gap: var(--ca-space-3); }
.ca-search-form__fields--collapsed { overflow: hidden; }
.ca-search-form__actions { display: flex; align-items: center; justify-content: flex-end; gap: var(--ca-space-2); }
.ca-search-form__button { display: inline-flex; align-items: center; gap: 5px; min-height: var(--ca-control-height-md); padding: 0 var(--ca-space-3); border: 1px solid var(--ca-border-color); border-radius: var(--ca-radius-md); background: var(--ca-surface-card); color: var(--ca-text-regular); font-size: var(--ca-font-size-sm); }
.ca-search-form__button:hover:not(:disabled) { border-color: var(--ca-color-primary); color: var(--ca-color-primary); }
.ca-search-form__button--primary { border-color: transparent; background: var(--ca-color-primary); color: white; }
.ca-search-form__button--primary:hover:not(:disabled) { background: var(--ca-color-primary-hover); color: white; }
.ca-search-form__button:disabled { opacity: .6; cursor: not-allowed; }
.ca-search-form__toggle { display: inline-flex; align-items: center; gap: 3px; color: var(--ca-text-secondary); font-size: var(--ca-font-size-sm); }
.ca-search-form__toggle:hover { color: var(--ca-color-primary); }
.ca-search-form__arrow { transition: transform .16s; }
.ca-search-form__arrow--open { transform: rotate(180deg); }
@media (prefers-reduced-motion: reduce) {
  .ca-search-form__arrow { transition: none; }
}
</style>
