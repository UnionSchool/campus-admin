<!--
 * 图标容器：统一单色图标的尺寸与颜色，用作 Lucide 等图标组件的包装。
 * 纯装饰图标默认对屏幕阅读器隐藏；需要被读出时传 :decorative="false"。
 *
 * 用法：
 *   <CaIcon :icon="Bell" :size="18" />
 *   <CaIcon :icon="Bell" :size="18" color="#0878fa" :decorative="false" />
 *
 * Props：icon 图标组件 / size 像素 / color / decorative
-->

<script setup lang="ts">
import type { Component } from '@unionschool/campus-framework'
import { computed } from '@unionschool/campus-framework'
import { ns } from '@/core/namespace'

defineOptions({ name: 'CaIcon' })

const props = withDefaults(defineProps<{
  /** Lucide 图标组件 */
  icon?: Component
  /** 图标尺寸（px） */
  size?: number
  /** 颜色，默认继承父级 currentColor */
  color?: string
  /** 仅装饰用途时设为 true，屏幕阅读器会忽略 */
  decorative?: boolean
}>(), {
  size: 16,
  decorative: true,
})

const className = ns('icon')
const style = computed(() => ({ color: props.color ?? undefined }))
</script>

<template>
  <span :class="className" :style="style" :aria-hidden="decorative ? 'true' : undefined">
    <component :is="icon" v-if="icon" :size="size" :stroke-width="1.8" />
    <slot v-else />
  </span>
</template>

<style src="../style/index.css"></style>
