<!--
 * 空状态：列表或区域无数据时的占位，可附带引导操作。
 *
 * 用法：
 *   <CaEmpty title="暂无考勤记录" description="选择日期后可查看当天记录">
 *     <CaButton type="primary">刷新</CaButton>
 *   </CaEmpty>
 *
 * Props：title / description / size
 * 插槽：icon 自定义图标、default 操作按钮
-->

<script setup lang="ts">
import { Inbox } from '@lucide/vue'
import { ns } from '@/core/namespace'

defineOptions({ name: 'CaEmpty' })

withDefaults(defineProps<{
  title?: string
  description?: string
  size?: 'small' | 'medium'
}>(), {
  title: '暂无数据',
})

const className = ns('empty')
</script>

<template>
  <div :class="className">
    <span :class="ns('empty', 'icon')" aria-hidden="true"><slot name="icon"><Inbox :size="30" /></slot></span>
    <p :class="ns('empty', 'title')">{{ title }}</p>
    <p v-if="description" :class="ns('empty', 'desc')">{{ description }}</p>
    <div v-if="$slots.default" :class="ns('empty', 'action')"><slot /></div>
  </div>
</template>

<style scoped>
.ca-empty { display: grid; justify-items: center; gap: 6px; padding: 32px 16px; text-align: center; }
.ca-empty__icon { display: grid; place-items: center; width: 58px; height: 58px; border-radius: 50%; background: var(--ca-surface-sunken); color: var(--ca-color-neutral-300); }
.ca-empty__title { color: var(--ca-text-regular); font-size: var(--ca-font-size-md); }
.ca-empty__desc { color: var(--ca-text-placeholder); font-size: var(--ca-font-size-xs); }
.ca-empty__action { margin-top: var(--ca-space-2); }
</style>
