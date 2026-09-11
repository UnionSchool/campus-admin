<!--
 * 多行文本框：用于备注、说明等长文本，可显示字数统计。
 *
 * 用法：
 *   <CaTextarea v-model="remark" :rows="3" :maxlength="200" show-count placeholder="请输入备注" />
 *
 * Props：modelValue / placeholder / rows / maxlength / disabled / invalid / showCount
 * 事件：update:modelValue
-->

<script setup lang="ts">
import { computed, ref } from '@unionschool/campus-framework'
import { ns, cx } from '@/core/namespace'

defineOptions({ name: 'CaTextarea' })

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  rows?: number
  maxlength?: number
  disabled?: boolean
  invalid?: boolean
  /** 展示字数统计，需要配合 maxlength */
  showCount?: boolean
}>(), {
  rows: 3,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const focused = ref(false)

const count = computed(() => String(props.modelValue ?? '').length)
const className = computed(() => cx(
  ns('textarea'),
  focused.value ? ns('textarea', undefined, 'focused') : '',
  props.invalid ? ns('textarea', undefined, 'invalid') : '',
  props.disabled ? ns('textarea', undefined, 'disabled') : '',
))
</script>

<template>
  <div :class="className">
    <textarea
      :class="ns('textarea', 'inner')"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @focus="focused = true"
      @blur="focused = false"
    />
    <span v-if="showCount" :class="ns('textarea', 'count')">{{ count }}<template v-if="maxlength"> / {{ maxlength }}</template></span>
  </div>
</template>

<style scoped>
.ca-textarea {
  position: relative;
  display: block;
  border: 1px solid var(--ca-border-color);
  border-radius: var(--ca-radius-md);
  background: var(--ca-surface-card);
  transition: border-color .18s, box-shadow .18s;
}
.ca-textarea--focused { border-color: var(--ca-color-primary); box-shadow: 0 0 0 3px var(--ca-color-primary-soft); }
.ca-textarea--invalid { border-color: var(--ca-color-danger); }
.ca-textarea--disabled { background: var(--ca-surface-sunken); }
.ca-textarea__inner {
  display: block;
  width: 100%;
  padding: var(--ca-space-2) var(--ca-space-3);
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: var(--ca-text-primary);
  font-family: inherit;
  font-size: var(--ca-font-size-md);
  line-height: var(--ca-line-height);
  resize: vertical;
  outline: none;
}
.ca-textarea__inner::placeholder { color: var(--ca-text-placeholder); }
.ca-textarea__count {
  position: absolute;
  right: var(--ca-space-2);
  bottom: var(--ca-space-1);
  color: var(--ca-text-placeholder);
  font-size: var(--ca-font-size-xs);
  font-variant-numeric: tabular-nums;
}
</style>
