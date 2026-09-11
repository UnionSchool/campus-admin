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
import { useLocale } from '@/locale'

defineOptions({ name: 'CaSearchForm' })

const { t } = useLocale()

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
})

/** 未显式传文案时用当前语言的默认值 */
const searchTextValue = computed(() => props.searchText ?? t('ca.searchForm.search'))
const resetTextValue = computed(() => props.resetText ?? t('ca.searchForm.reset'))

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
        <RotateCcw :size="14" />{{ resetTextValue }}
      </button>
      <button :class="cx(ns('search-form', 'button'), ns('search-form', 'button', 'primary'))" type="submit" :disabled="loading">
        <Search :size="14" />{{ loading ? t('ca.searchForm.searching') : searchTextValue }}
      </button>
      <button v-if="canCollapse" :class="ns('search-form', 'toggle')" type="button" @click="expanded = !expanded">
        {{ expanded ? t('ca.common.collapse') : t('ca.common.expand') }}
        <ChevronDown :size="13" :class="cx(ns('search-form', 'arrow'), expanded ? ns('search-form', 'arrow', 'open') : '')" />
      </button>
    </div>
  </form>
</template>

<style src="../style/index.css"></style>
