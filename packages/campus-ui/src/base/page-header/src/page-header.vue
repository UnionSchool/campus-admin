<!--
 * 页面标题：统一页面标题、描述与操作区，建议每个业务页面都用它开头。
 *
 * 用法：
 *   <CaPageHeader title="学生管理" description="学生档案与考勤总览" backable @back="router.back()">
 *     <CaButton type="primary">新增学生</CaButton>
 *   </CaPageHeader>
 *
 * Props：title / description / backable / bordered
 * 事件：back
 * 插槽：default 右侧操作区
-->

<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { ns } from '@/core/namespace'

defineOptions({ name: 'CaPageHeader' })

withDefaults(defineProps<{
  title: string
  description?: string
  /** 显示返回按钮，点击抛出 back 事件 */
  backable?: boolean
  /** 分隔线 */
  bordered?: boolean
}>(), {
  bordered: true,
})

const emit = defineEmits<{ back: [] }>()
const className = ns('page-header')
</script>

<template>
  <header :class="className">
    <div :class="ns('page-header', 'main')">
      <button v-if="backable" :class="ns('page-header', 'back')" type="button" aria-label="返回" @click="emit('back')"><ArrowLeft :size="16" /></button>
      <div :class="ns('page-header', 'text')">
        <h1 :class="ns('page-header', 'title')">{{ title }}</h1>
        <p v-if="description" :class="ns('page-header', 'desc')">{{ description }}</p>
      </div>
    </div>
    <div v-if="$slots.default" :class="ns('page-header', 'actions')"><slot /></div>
  </header>
</template>

<style scoped>
.ca-page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--ca-space-4); padding-bottom: var(--ca-space-4); }
.ca-page-header[bordered='true'] { border-bottom: 1px solid var(--ca-border-color); }
.ca-page-header__main { display: flex; align-items: center; gap: var(--ca-space-3); min-width: 0; }
.ca-page-header__back { display: grid; place-items: center; width: 28px; height: 28px; border: 1px solid var(--ca-border-color); border-radius: var(--ca-radius-md); color: var(--ca-text-secondary); }
.ca-page-header__back:hover { border-color: var(--ca-color-primary); color: var(--ca-color-primary); }
.ca-page-header__text { min-width: 0; }
.ca-page-header__title { color: var(--ca-text-primary); font-size: var(--ca-font-size-xl); font-weight: 600; line-height: 1.3; }
.ca-page-header__desc { margin-top: 2px; color: var(--ca-text-secondary); font-size: var(--ca-font-size-sm); }
.ca-page-header__actions { display: flex; align-items: center; gap: var(--ca-space-2); flex-shrink: 0; }
</style>
