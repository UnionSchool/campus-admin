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
import { computed, ref } from '@unionschool/campus-framework'
import { ChevronDown, X } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { findOption, normalizeOptions } from './core'
import type { SelectOptions } from './core'

defineOptions({ name: 'CaSelect' })

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
  placeholder: '请选择',
  size: 'medium',
})

const emit = defineEmits<{ 'update:modelValue': [value: string]; change: [value: string] }>()

const normalized = computed(() => normalizeOptions(props.options))
const selected = computed(() => findOption(normalized.value, props.modelValue))
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
      <span v-else :class="ns('select', 'placeholder')">{{ placeholder }}</span>
      <span v-if="clearable && selected && !disabled" :class="ns('select', 'clear')" role="button" aria-label="清空" @click="clear"><X :size="12" /></span>
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
      <li v-if="!normalized.length" :class="ns('select', 'empty')">暂无选项</li>
    </ul>
  </div>
</template>

<style scoped>
.ca-select { position: relative; display: block; width: 100%; }
.ca-select__trigger {
  display: flex;
  align-items: center;
  gap: var(--ca-space-2);
  width: 100%;
  min-height: var(--ca-control-height-md);
  padding: 0 var(--ca-space-3);
  border: 1px solid var(--ca-border-color);
  border-radius: var(--ca-radius-md);
  background: var(--ca-surface-card);
  color: var(--ca-text-primary);
  font-size: var(--ca-font-size-md);
  text-align: left;
}
.ca-select--small .ca-select__trigger { min-height: var(--ca-control-height-sm); padding: 0 var(--ca-space-2); font-size: var(--ca-font-size-sm); }
.ca-select--large .ca-select__trigger { min-height: var(--ca-control-height-lg); padding: 0 var(--ca-space-4); font-size: var(--ca-font-size-lg); }
.ca-select--open .ca-select__trigger { border-color: var(--ca-color-primary); box-shadow: 0 0 0 3px var(--ca-color-primary-soft); }
.ca-select--invalid .ca-select__trigger { border-color: var(--ca-color-danger); }
.ca-select--disabled .ca-select__trigger { background: var(--ca-surface-sunken); color: var(--ca-text-placeholder); }
.ca-select__value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ca-select__placeholder { flex: 1; color: var(--ca-text-placeholder); }
.ca-select__clear { display: inline-flex; color: var(--ca-text-placeholder); }
.ca-select__clear:hover { color: var(--ca-text-secondary); }
.ca-select__arrow { color: var(--ca-text-secondary); transition: transform .18s; }
.ca-select--open .ca-select__arrow { transform: rotate(180deg); }
.ca-select__panel {
  position: absolute;
  z-index: var(--ca-z-index-dropdown);
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 260px;
  overflow-y: auto;
  padding: var(--ca-space-1);
  border: 1px solid var(--ca-border-color);
  border-radius: var(--ca-radius-md);
  background: var(--ca-surface-card);
  box-shadow: var(--ca-shadow-popup);
}
.ca-select__option { padding: 7px var(--ca-space-3); border-radius: var(--ca-radius-sm); color: var(--ca-text-regular); font-size: var(--ca-font-size-md); cursor: pointer; }
.ca-select__option:hover { background: var(--ca-color-primary-soft); color: var(--ca-color-primary); }
.ca-select__option[aria-selected='true'] { background: var(--ca-color-primary-soft); color: var(--ca-color-primary); font-weight: 500; }
.ca-select__option--disabled { color: var(--ca-text-placeholder); cursor: not-allowed; }
.ca-select__option--disabled:hover { background: transparent; color: var(--ca-text-placeholder); }
.ca-select__empty { padding: var(--ca-space-3); color: var(--ca-text-placeholder); font-size: var(--ca-font-size-sm); text-align: center; }
</style>
