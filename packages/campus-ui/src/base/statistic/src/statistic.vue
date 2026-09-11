<!--
 * 统计数值：展示单个指标，常配合卡片布局成组使用。
 *
 * 用法：
 *   <CaStatistic card label="今日到校率" :value="97.8" unit="%" tone="success" hint="较上周 +0.6" />
 *
 * Props：label / value / unit / hint / tone / card
-->

<script setup lang="ts">
import { computed } from '@unionschool/campus-framework'
import { ns, cx } from '@/core/namespace'
import type { ComponentTone } from '@/core/namespace'

defineOptions({ name: 'CaStatistic' })

const props = withDefaults(defineProps<{
  label: string
  value: string | number
  unit?: string
  /** 辅助说明，例如“较上周 +3” */
  hint?: string
  tone?: ComponentTone
  /** 卡片模式：白底 + 阴影 */
  card?: boolean
}>(), {
  tone: 'neutral',
})

const className = computed(() => cx(
  ns('statistic'),
  ns('statistic', undefined, props.tone),
  props.card ? ns('statistic', undefined, 'card') : '',
))

/** 数值保留原样，仅统一显示口径 */
const display = computed(() => (typeof props.value === 'number' ? props.value.toLocaleString('zh-CN') : props.value))
</script>

<template>
  <div :class="className">
    <span :class="ns('statistic', 'label')">{{ label }}</span>
    <b :class="ns('statistic', 'value')">{{ display }}<small v-if="unit">{{ unit }}</small></b>
    <span v-if="hint" :class="ns('statistic', 'hint')">{{ hint }}</span>
  </div>
</template>

<style scoped>
.ca-statistic { display: grid; gap: 4px; }
.ca-statistic--card { padding: var(--ca-space-4); border-radius: var(--ca-radius-lg); background: var(--ca-surface-card); box-shadow: var(--ca-shadow-md); }
.ca-statistic__label { color: var(--ca-text-secondary); font-size: var(--ca-font-size-xs); }
.ca-statistic__value { color: var(--ca-text-primary); font-size: 22px; font-weight: 600; line-height: 1.2; font-variant-numeric: tabular-nums; }
.ca-statistic__value small { margin-left: 4px; color: var(--ca-text-secondary); font-size: var(--ca-font-size-xs); font-weight: 400; }
.ca-statistic__hint { color: var(--ca-text-placeholder); font-size: var(--ca-font-size-xs); }
.ca-statistic--primary .ca-statistic__value { color: var(--ca-color-primary); }
.ca-statistic--success .ca-statistic__value { color: var(--ca-color-success); }
.ca-statistic--warning .ca-statistic__value { color: var(--ca-color-warning); }
.ca-statistic--danger .ca-statistic__value { color: var(--ca-color-danger); }
.ca-statistic--info .ca-statistic__value { color: var(--ca-color-info); }
</style>
