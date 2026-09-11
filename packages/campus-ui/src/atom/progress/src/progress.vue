<!--
 * 进度条：展示完成度或剩余额度，支持线形与环形。
 * 需要表达“额度不足”这类语义时用 progressTone() 自动选色。
 *
 * 用法：
 *   <CaProgress :percent="72" show-text />
 *   <CaProgress type="circle" :percent="88" tone="success" />
 *
 * Props：percent / type line|circle / tone / size（环形直径）/ showText / strokeWidth
 * 工具：clampPercent、percentOf、progressTone
-->

<script setup lang="ts">
import { computed } from '@unionschool/campus-framework'
import { ns, cx } from '@/core/namespace'
import { clampPercent } from './core'

defineOptions({ name: 'CaProgress' })

const props = withDefaults(defineProps<{
  /** 百分比，0–100 */
  percent?: number
  type?: 'line' | 'circle'
  tone?: 'primary' | 'success' | 'warning' | 'danger'
  size?: number
  /** 显示右侧百分比文字 */
  showText?: boolean
  strokeWidth?: number
}>(), {
  percent: 0,
  type: 'line',
  tone: 'primary',
  size: 64,
  strokeWidth: 6,
})

const safePercent = computed(() => clampPercent(props.percent))
const className = computed(() => cx(ns('progress'), ns('progress', undefined, props.type), ns('progress', undefined, props.tone)))

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - safePercent.value / 100))
</script>

<template>
  <div :class="className" role="progressbar" :aria-valuenow="Math.round(safePercent)" aria-valuemin="0" aria-valuemax="100">
    <template v-if="type === 'circle'">
      <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" aria-hidden="true">
        <circle :cx="size / 2" :cy="size / 2" :r="radius" fill="none" stroke="var(--ca-color-neutral-100)" :stroke-width="strokeWidth" />
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          stroke="currentColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          :transform="`rotate(-90 ${size / 2} ${size / 2})`"
        />
      </svg>
      <span :class="ns('progress', 'text')">{{ Math.round(safePercent) }}%</span>
    </template>
    <template v-else>
      <div :class="ns('progress', 'track')">
        <i :class="ns('progress', 'bar')" :style="{ width: `${safePercent}%` }"></i>
      </div>
      <span v-if="showText" :class="ns('progress', 'text')">{{ Math.round(safePercent) }}%</span>
    </template>
  </div>
</template>

<style scoped>
.ca-progress { display: flex; align-items: center; gap: var(--ca-space-2); width: 100%; }
.ca-progress--circle { position: relative; display: inline-grid; place-items: center; width: auto; }
.ca-progress--primary { color: var(--ca-color-primary); }
.ca-progress--success { color: var(--ca-color-success); }
.ca-progress--warning { color: var(--ca-color-warning); }
.ca-progress--danger { color: var(--ca-color-danger); }
.ca-progress__track { flex: 1; height: 6px; border-radius: var(--ca-radius-full); background: var(--ca-color-neutral-100); overflow: hidden; }
.ca-progress__bar { display: block; height: 100%; border-radius: inherit; background: currentColor; transition: width .3s ease; }
.ca-progress__text { flex-shrink: 0; color: var(--ca-text-secondary); font-size: var(--ca-font-size-xs); font-variant-numeric: tabular-nums; }
.ca-progress--circle .ca-progress__text { position: absolute; font-size: var(--ca-font-size-sm); font-weight: 500; color: var(--ca-text-primary); }
.ca-progress circle { transition: stroke-dashoffset .3s ease; }
@media (prefers-reduced-motion: reduce) {
  .ca-progress__bar, .ca-progress circle { transition: none; }
}
</style>
