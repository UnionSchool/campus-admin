<!--
 * 复选框：单个勾选或半选状态，常用于“同意条款”和表格选择。
 *
 * 用法：
 *   <CaCheckbox v-model="checked" label="接收通知" />
 *   <CaCheckbox :model-value="'indeterminate'" label="半选" @update:model-value="toggleAll" />
 *
 * Props：modelValue boolean|'indeterminate' / label / disabled
 * 事件：update:modelValue
-->

<script setup lang="ts">
import { computed } from '@unionschool/campus-framework'
import { Check, Minus } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'

defineOptions({ name: 'CaCheckbox' })

const props = withDefaults(defineProps<{
  modelValue?: boolean | 'indeterminate'
  label?: string
  disabled?: boolean
}>(), {
  modelValue: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const className = computed(() => cx(
  ns('checkbox'),
  props.disabled ? ns('checkbox', undefined, 'disabled') : '',
  props.modelValue === true ? ns('checkbox', undefined, 'checked') : '',
  props.modelValue === 'indeterminate' ? ns('checkbox', undefined, 'indeterminate') : '',
))

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', props.modelValue !== true)
}
</script>

<template>
  <label :class="className">
    <input
      :class="ns('checkbox', 'input')"
      type="checkbox"
      :checked="modelValue === true"
      :disabled="disabled"
      @change="toggle"
    />
    <span :class="ns('checkbox', 'box')" aria-hidden="true">
      <Minus v-if="modelValue === 'indeterminate'" :size="11" />
      <Check v-else-if="modelValue === true" :size="11" />
    </span>
    <span v-if="label || $slots.default" :class="ns('checkbox', 'label')"><slot>{{ label }}</slot></span>
  </label>
</template>

<style scoped>
.ca-checkbox { display: inline-flex; align-items: center; gap: var(--ca-space-2); cursor: pointer; font-size: var(--ca-font-size-md); color: var(--ca-text-regular); }
.ca-checkbox--disabled { cursor: not-allowed; color: var(--ca-text-placeholder); }
.ca-checkbox__input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.ca-checkbox__box {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 1px solid var(--ca-border-color-strong);
  border-radius: var(--ca-radius-sm);
  background: var(--ca-surface-card);
  color: transparent;
  transition: background-color .18s, border-color .18s, color .18s;
}
.ca-checkbox:hover:not(.ca-checkbox--disabled) .ca-checkbox__box { border-color: var(--ca-color-primary); }
.ca-checkbox--checked .ca-checkbox__box,
.ca-checkbox--indeterminate .ca-checkbox__box { border-color: var(--ca-color-primary); background: var(--ca-color-primary); color: white; }
.ca-checkbox--disabled .ca-checkbox__box { background: var(--ca-surface-sunken); }
.ca-checkbox__input:focus-visible + .ca-checkbox__box { outline: 2px solid var(--ca-color-primary); outline-offset: 2px; }
.ca-checkbox__label { line-height: 1.4; }
</style>
