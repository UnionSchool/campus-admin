<!--
 * 按钮：统一的操作入口，覆盖实心、描边、文字三种形态。
 * 提交类按钮务必配合 loading 防重复提交；仅图标的按钮必须提供 aria-label。
 *
 * 用法：
 *   <CaButton type="primary" @click="save">保存</CaButton>
 *   <CaButton type="danger" variant="outline" :loading="submitting">删除</CaButton>
 *   <CaButton icon-only aria-label="刷新"><template #icon><RefreshCw :size="15" /></template></CaButton>
 *
 * Props：type primary|success|warning|danger|info|neutral / variant solid|outline|text
 *        size small|medium|large / loading / disabled / block / iconOnly / nativeType
 *
 * 事件：click（禁用与 loading 状态下不触发）
 * 插槽：default 文案、icon 图标
-->

<script setup lang="ts">
import { computed } from '@unionschool/campus-framework'
import { ns, cx } from '@/core/namespace'
import type { ComponentSize, ComponentTone } from '@/core/namespace'

defineOptions({ name: 'CaButton' })

const props = withDefaults(defineProps<{
  /** 语义色调 */
  type?: ComponentTone
  /** 视觉形态：实心 / 描边 / 文字 */
  variant?: 'solid' | 'outline' | 'text'
  size?: ComponentSize
  disabled?: boolean
  loading?: boolean
  /** 占满父级宽度 */
  block?: boolean
  /** 仅图标按钮，需要额外提供 aria-label */
  iconOnly?: boolean
  /** 原生 button type */
  nativeType?: 'button' | 'submit' | 'reset'
}>(), {
  type: 'neutral',
  variant: 'outline',
  size: 'medium',
  nativeType: 'button',
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const className = computed(() => cx(
  ns('button'),
  ns('button', undefined, props.type),
  ns('button', undefined, props.variant),
  ns('button', undefined, props.size),
  props.block ? ns('button', undefined, 'block') : '',
  props.iconOnly ? ns('button', undefined, 'icon-only') : '',
  props.loading ? ns('button', undefined, 'loading') : '',
))

const isDisabled = computed(() => props.disabled || props.loading)

function handleClick(event: MouseEvent) {
  if (isDisabled.value) return
  emit('click', event)
}
</script>

<template>
  <button :class="className" :type="nativeType" :disabled="isDisabled" :aria-busy="loading || undefined" @click="handleClick">
    <span v-if="loading" :class="ns('button', 'spinner')" aria-hidden="true"></span>
    <span v-else-if="$slots.icon" :class="ns('button', 'icon')"><slot name="icon" /></span>
    <span v-if="$slots.default" :class="ns('button', 'label')"><slot /></span>
  </button>
</template>

<!-- 样式见同目录 style/index.css，颜色全部走 Token，跟随明暗主题与品牌色 -->
<style src="../style/index.css"></style>
