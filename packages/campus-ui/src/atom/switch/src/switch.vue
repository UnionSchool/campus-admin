<!--
 * 开关：表示即时生效的开关状态，适合启用/停用类配置。
 * 带文字时建议明确开与关的含义，而不是只写“启用”。
 *
 * 用法：
 *   <CaSwitch v-model="enabled" active-text="启用" inactive-text="停用" />
 *
 * Props：modelValue / activeText / inactiveText / disabled
 * 事件：update:modelValue
-->

<script setup lang="ts">
import { computed } from '@unionschool/campus-framework'
import { ns, cx } from '@/core/namespace'

defineOptions({ name: 'CaSwitch' })

const props = withDefaults(defineProps<{
  modelValue?: boolean
  /** 开启 / 关闭时的辅助文字 */
  activeText?: string
  inactiveText?: string
  disabled?: boolean
}>(), {
  modelValue: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const className = computed(() => cx(
  ns('switch'),
  props.modelValue ? ns('switch', undefined, 'on') : '',
  props.disabled ? ns('switch', undefined, 'disabled') : '',
))

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button :class="className" type="button" role="switch" :aria-checked="modelValue" :disabled="disabled" @click="toggle">
    <span :class="ns('switch', 'track')"><i :class="ns('switch', 'thumb')"></i></span>
    <span v-if="modelValue ? activeText : inactiveText" :class="ns('switch', 'text')">{{ modelValue ? activeText : inactiveText }}</span>
  </button>
</template>

<style scoped>
.ca-switch { display: inline-flex; align-items: center; gap: var(--ca-space-2); font-size: var(--ca-font-size-sm); color: var(--ca-text-secondary); }
.ca-switch--disabled { opacity: .55; cursor: not-allowed; }
.ca-switch__track {
  position: relative;
  display: block;
  width: 34px;
  height: 19px;
  border-radius: var(--ca-radius-full);
  background: var(--ca-color-neutral-300);
  transition: background-color .2s;
}
.ca-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: white;
  box-shadow: var(--ca-shadow-sm);
  transition: transform .2s;
}
.ca-switch--on .ca-switch__track { background: var(--ca-color-primary); }
.ca-switch--on .ca-switch__thumb { transform: translateX(15px); }
.ca-switch:focus-visible .ca-switch__track { outline: 2px solid var(--ca-color-primary); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .ca-switch__track, .ca-switch__thumb { transition: none; }
}
</style>
