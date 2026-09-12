<!--
 * 下拉选择：自定义面板的下拉框，选项支持字符串或 { label, value, disabled }。
 * 下拉面板有焦点处理与 Esc 关闭，键盘可用。
 *
 * 用法：
 *   <CaSelect v-model="grade" :options="[{ label: '高一', value: 'g1' }]" placeholder="选择年级" />
 *   <CaSelect v-model="status" :options="['全部', '正常', '请假']" clearable />
 *
 * Props：modelValue / options / placeholder / size / disabled / clearable / invalid
 * 事件：update:modelValue、change
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, X } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { useLocale } from '@campus-admin/locale'
import { findOption, normalizeOptions } from './core'
import type { SelectOptions } from './core'

defineOptions({ name: 'CaSelect' })

const { t } = useLocale()

const props = withDefaults(defineProps<{
  modelValue?: string | number
  options?: SelectOptions
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  clearable?: boolean
  invalid?: boolean
}>(), {
  options: () => [],
  size: 'medium',
})

const emit = defineEmits<{ 'update:modelValue': [value: string]; change: [value: string] }>()

const normalized = computed(() => normalizeOptions(props.options))
const selected = computed(() => findOption(normalized.value, props.modelValue))
/** 未显式传 placeholder 时用当前语言的默认文案 */
const placeholderText = computed(() => props.placeholder ?? t('ca.select.placeholder'))
const open = ref(false)

const className = computed(() => cx(
  ns('select'),
  ns('select', undefined, props.size),
  open.value ? ns('select', undefined, 'open') : '',
  props.invalid ? ns('select', undefined, 'invalid') : '',
  props.disabled ? ns('select', undefined, 'disabled') : '',
))

function pick(option: { value: string; disabled?: boolean }) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
  open.value = false
}

function clear(event: MouseEvent) {
  event.stopPropagation()
  emit('update:modelValue', '')
  emit('change', '')
}

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

function close() {
  open.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle() }
}
</script>

<template>
  <div :class="className" @keydown="handleKeydown" @focusout="(event) => { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) close() }">
    <button
      :class="ns('select', 'trigger')"
      type="button"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span v-if="selected" :class="ns('select', 'value')">{{ selected.label }}</span>
      <span v-else :class="ns('select', 'placeholder')">{{ placeholderText }}</span>
      <span v-if="clearable && selected && !disabled" :class="ns('select', 'clear')" role="button" :aria-label="t('ca.common.clear')" @click="clear"><X :size="12" /></span>
      <ChevronDown :size="14" :class="ns('select', 'arrow')" aria-hidden="true" />
    </button>

    <ul v-if="open" :class="ns('select', 'panel')" role="listbox">
      <li
        v-for="option in normalized"
        :key="option.value"
        :class="cx(ns('select', 'option'), option.disabled ? ns('select', 'option', 'disabled') : '')"
        role="option"
        :aria-selected="option.value === String(modelValue ?? '')"
        @click="pick(option)"
      >
        {{ option.label }}
      </li>
      <li v-if="!normalized.length" :class="ns('select', 'empty')">{{ t('ca.select.empty') }}</li>
    </ul>
  </div>
</template>

<style src="../style/index.css"></style>
