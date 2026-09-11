<!--
 * 骨架屏：数据加载中的占位，减少布局跳动。
 * 加载时间很短时不要用，避免闪烁。
 *
 * 用法：
 *   <CaSkeleton :rows="3" />
 *   <CaSkeleton variant="avatar" :rows="2" />
 *   <CaSkeleton variant="card" :rows="2" />
 *
 * Props：rows 行数 / variant text|card|avatar
-->

<script setup lang="ts">
import { ns, cx } from '@/core/namespace'

defineOptions({ name: 'CaSkeleton' })

withDefaults(defineProps<{
  /** 骨架行数 */
  rows?: number
  variant?: 'text' | 'card' | 'avatar'
}>(), {
  rows: 3,
  variant: 'text',
})

const className = ns('skeleton')
</script>

<template>
  <div :class="cx(className, ns('skeleton', undefined, variant))" aria-busy="true" aria-live="polite">
    <template v-if="variant === 'avatar'">
      <span :class="ns('skeleton', 'avatar')"></span>
      <div :class="ns('skeleton', 'lines')"><span v-for="row in rows" :key="row"></span></div>
    </template>
    <template v-else-if="variant === 'card'">
      <span :class="ns('skeleton', 'block')"></span>
      <div :class="ns('skeleton', 'lines')"><span v-for="row in rows" :key="row" :style="{ width: row === rows ? '60%' : '100%' }"></span></div>
    </template>
    <template v-else>
      <span v-for="row in rows" :key="row" :style="{ width: row === rows ? '60%' : '100%' }"></span>
    </template>
  </div>
</template>

<style scoped>
.ca-skeleton { display: grid; gap: var(--ca-space-2); width: 100%; }
.ca-skeleton--avatar { grid-template-columns: 40px 1fr; align-items: center; }
.ca-skeleton--card { gap: var(--ca-space-3); }
.ca-skeleton span { display: block; height: 12px; border-radius: var(--ca-radius-sm); background: linear-gradient(90deg, var(--ca-color-neutral-100) 25%, #f4f8fc 37%, var(--ca-color-neutral-100) 63%); background-size: 400% 100%; animation: ca-skeleton-shine 1.4s ease infinite; }
.ca-skeleton__avatar { width: 40px; height: 40px; border-radius: 50%; }
.ca-skeleton__block { height: 96px; border-radius: var(--ca-radius-lg); }
.ca-skeleton__lines { display: grid; gap: var(--ca-space-2); }
@keyframes ca-skeleton-shine { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
@media (prefers-reduced-motion: reduce) {
  .ca-skeleton span { animation: none; }
}
</style>
