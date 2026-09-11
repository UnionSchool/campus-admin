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

<style src="../style/index.css"></style>
