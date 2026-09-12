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

<style src="../style/index.css"></style>
