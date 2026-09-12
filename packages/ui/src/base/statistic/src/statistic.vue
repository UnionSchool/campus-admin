<!--
 * 统计数值：展示单个指标，常配合卡片布局成组使用。
 *
 * 用法：
 *   <CaStatistic card label="今日到校率" :value="97.8" unit="%" tone="success" hint="较上周 +0.6" />
 *
 * Props：label / value / unit / hint / tone / card
-->

<script setup lang="ts">
import { computed } from 'vue'
import { ns, cx } from '@/core/namespace'
import { formatNumber, useLocale } from '@campus-admin/locale'
import type { ComponentTone } from '@/core/namespace'

defineOptions({ name: 'CaStatistic' })

const { locale } = useLocale()

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

/** 数值按当前语言格式化（千分位等），字符串原样显示 */
const display = computed(() => (
  typeof props.value === 'number' ? formatNumber(props.value, locale.value) : props.value
))
</script>

<template>
  <div :class="className">
    <span :class="ns('statistic', 'label')">{{ label }}</span>
    <b :class="ns('statistic', 'value')">{{ display }}<small v-if="unit">{{ unit }}</small></b>
    <span v-if="hint" :class="ns('statistic', 'hint')">{{ hint }}</span>
  </div>
</template>

<style src="../style/index.css"></style>
