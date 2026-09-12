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
import { computed } from 'vue'
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
        <circle :cx="size / 2" :cy="size / 2" :r="radius" fill="none" stroke="var(--ca-color-neutral-soft)" :stroke-width="strokeWidth" />
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

<style src="../style/index.css"></style>
