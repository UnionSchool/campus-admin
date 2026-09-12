<!--
 * 输入框：单行文本输入，支持前缀后缀、清空与错误态。
 * 校验失败时传 invalid，并通过 errorId 关联错误提示元素。
 *
 * 用法：
 *   <CaInput v-model="keyword" placeholder="姓名或学号" clearable @enter="search" />
 *   <CaInput v-model="phone" type="tel" :invalid="!!error" :error-id="'phone-error'" />
 *
 * Props：modelValue / type text|password|number|tel / placeholder / size / disabled
 *        / readonly / clearable / invalid / errorId
 *
 * 事件：update:modelValue、enter、clear
 * Expose：focus()
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import { X } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { useLocale } from '@campus-admin/locale'

defineOptions({ name: 'CaInput' })

const { t } = useLocale()

const props = withDefaults(defineProps<{
  modelValue?: string | number
  type?: 'text' | 'password' | 'number' | 'tel'
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  /** 校验失败，显示错误边框 */
  invalid?: boolean
  /** 关联的错误提示 id，供 aria-describedby 使用 */
  errorId?: string
}>(), {
  type: 'text',
  size: 'medium',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  enter: []
  clear: []
}>()

const inputRef = ref<HTMLInputElement>()
const focused = ref(false)

const className = computed(() => cx(
  ns('input'),
  ns('input', undefined, props.size),
  focused.value ? ns('input', undefined, 'focused') : '',
  props.invalid ? ns('input', undefined, 'invalid') : '',
  props.disabled ? ns('input', undefined, 'disabled') : '',
))

const showClear = computed(() => props.clearable && !props.disabled && String(props.modelValue ?? '') !== '')

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function clear() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

/** 供父组件调用，例如打开弹层后自动聚焦 */
function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div :class="className">
    <span v-if="$slots.prefix" :class="ns('input', 'affix')"><slot name="prefix" /></span>
    <input
      ref="inputRef"
      :class="ns('input', 'inner')"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :aria-invalid="invalid || undefined"
      :aria-describedby="errorId"
      @input="handleInput"
      @focus="focused = true"
      @blur="focused = false"
      @keyup.enter="emit('enter')"
    />
    <button v-if="showClear" :class="ns('input', 'clear')" type="button" :aria-label="t('ca.common.clear')" @click="clear"><X :size="12" /></button>
    <span v-if="$slots.suffix" :class="ns('input', 'affix')"><slot name="suffix" /></span>
  </div>
</template>

<style src="../style/index.css"></style>
