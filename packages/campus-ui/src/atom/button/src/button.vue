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

<style scoped>
.ca-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ca-space-1);
  min-height: var(--ca-control-height-md);
  padding: 0 var(--ca-space-3);
  border: 1px solid var(--ca-border-color);
  border-radius: var(--ca-radius-md);
  background: var(--ca-surface-card);
  color: var(--ca-text-regular);
  font-size: var(--ca-font-size-md);
  line-height: 1;
  white-space: nowrap;
  transition: background-color .18s, border-color .18s, color .18s, opacity .18s;
}
.ca-button:hover:not(:disabled) { border-color: var(--ca-border-color-strong); background: var(--ca-surface-sunken); }
.ca-button:active:not(:disabled) { background: var(--ca-color-neutral-100); }
.ca-button:disabled { opacity: .55; }

.ca-button--small { min-height: var(--ca-control-height-sm); padding: 0 var(--ca-space-2); font-size: var(--ca-font-size-sm); border-radius: var(--ca-radius-sm); }
.ca-button--large { min-height: var(--ca-control-height-lg); padding: 0 var(--ca-space-4); font-size: var(--ca-font-size-lg); }
.ca-button--block { display: flex; width: 100%; }
.ca-button--icon-only { width: var(--ca-control-height-md); padding: 0; }
.ca-button--small.ca-button--icon-only { width: var(--ca-control-height-sm); }
.ca-button--large.ca-button--icon-only { width: var(--ca-control-height-lg); }

.ca-button--solid { border-color: transparent; color: var(--ca-text-inverse); background: var(--ca-color-neutral-500); }
.ca-button--solid.ca-button--primary { background: var(--ca-color-primary); }
.ca-button--solid.ca-button--primary:hover:not(:disabled) { background: var(--ca-color-primary-hover); }
.ca-button--solid.ca-button--success { background: var(--ca-color-success); }
.ca-button--solid.ca-button--warning { background: var(--ca-color-warning); }
.ca-button--solid.ca-button--danger { background: var(--ca-color-danger); }
.ca-button--solid.ca-button--info { background: var(--ca-color-info); }
.ca-button--solid.ca-button--neutral:hover:not(:disabled) { background: var(--ca-color-neutral-700); }
.ca-button--solid:hover:not(:disabled) { filter: brightness(1.04); }

.ca-button--outline.ca-button--primary { border-color: var(--ca-color-primary); color: var(--ca-color-primary); background: var(--ca-color-primary-soft); }
.ca-button--outline.ca-button--success { border-color: var(--ca-color-success); color: var(--ca-color-success); background: var(--ca-color-green-50); }
.ca-button--outline.ca-button--warning { border-color: var(--ca-color-warning); color: #c47a35; background: var(--ca-color-orange-50); }
.ca-button--outline.ca-button--danger { border-color: var(--ca-color-danger); color: var(--ca-color-danger); background: var(--ca-color-red-50); }
.ca-button--outline.ca-button--info { border-color: var(--ca-color-info); color: var(--ca-color-info); background: var(--ca-color-cyan-50); }

.ca-button--text { border-color: transparent; background: transparent; padding: 0 var(--ca-space-1); }
.ca-button--text.ca-button--primary { color: var(--ca-color-primary); }
.ca-button--text.ca-button--danger { color: var(--ca-color-danger); }
.ca-button--text:hover:not(:disabled) { background: var(--ca-color-neutral-100); }

.ca-button__icon { display: inline-flex; align-items: center; }
.ca-button__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ca-button-spin .7s linear infinite;
}
@keyframes ca-button-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .ca-button__spinner { animation-duration: 2s; }
}
</style>
