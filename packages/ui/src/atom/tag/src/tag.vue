<!--
 * 标签：表达状态、分类或可移除的标记。
 * 状态类标签建议搭配 dot 圆点使用，颜色之外再给一层文字提示。
 *
 * 用法：
 *   <CaTag tone="success" dot>已在校</CaTag>
 *   <CaTag tone="warning">待审批</CaTag>
 *   <CaTag closable @close="remove">可移除</CaTag>
 *
 * Props：tone primary|success|warning|danger|info|neutral / variant soft|solid|outline
 *        / size small|medium / closable / dot
 *
 * 事件：close
-->

<script setup lang="ts">
import { computed } from 'vue'
import { X } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { useLocale } from '@campus-admin/locale'
import type { ComponentTone } from '@/core/namespace'

defineOptions({ name: 'CaTag' })

const { t } = useLocale()

const props = withDefaults(defineProps<{
  tone?: ComponentTone
  /** 浅色底 / 实心 */
  variant?: 'soft' | 'solid' | 'outline'
  size?: 'small' | 'medium'
  closable?: boolean
  /** 状态类标签可加圆点 */
  dot?: boolean
}>(), {
  tone: 'primary',
  variant: 'soft',
  size: 'medium',
})

const emit = defineEmits<{ close: [] }>()

const className = computed(() => cx(
  ns('tag'),
  ns('tag', undefined, props.tone),
  ns('tag', undefined, props.variant),
  ns('tag', undefined, props.size),
))
</script>

<template>
  <span :class="className">
    <i v-if="dot" :class="ns('tag', 'dot')" aria-hidden="true"></i>
    <slot />
    <button v-if="closable" :class="ns('tag', 'close')" type="button" :aria-label="t('ca.common.remove')" @click="emit('close')">
      <X :size="11" />
    </button>
  </span>
</template>

<style src="../style/index.css"></style>
