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
import { computed } from '@unionschool/campus-framework'
import { ns, cx } from '@/core/namespace'
import { useLocale } from '@/locale'

defineOptions({ name: 'CaPageHeader' })

const { t } = useLocale()

const props = withDefaults(defineProps<{
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
/**
 * bordered 用类名表达而不是属性选择器：
 * defineProps 声明的 prop 不会作为属性落到根元素上，用 [bordered='true'] 匹配不到。
 */
const className = computed(() => cx(
  ns('page-header'),
  props.bordered ? ns('page-header', undefined, 'bordered') : '',
))
</script>

<template>
  <header :class="className">
    <div :class="ns('page-header', 'main')">
      <button v-if="backable" :class="ns('page-header', 'back')" type="button" :aria-label="t('ca.common.back')" @click="emit('back')"><ArrowLeft :size="16" /></button>
      <div :class="ns('page-header', 'text')">
        <h1 :class="ns('page-header', 'title')">{{ title }}</h1>
        <p v-if="description" :class="ns('page-header', 'desc')">{{ description }}</p>
      </div>
    </div>
    <div v-if="$slots.default" :class="ns('page-header', 'actions')"><slot /></div>
  </header>
</template>

<style src="../style/index.css"></style>
