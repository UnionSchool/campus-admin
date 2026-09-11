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

<style src="../style/index.css"></style>
