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

<style src="../style/index.css"></style>
