<!--
 * 面包屑：展示当前位置的层级路径，通常配合路由渲染。
 * 最后一项为当前页，不可点击。
 *
 * 用法：
 *   <CaBreadcrumb :items="[{ label: '首页', to: '/home' }, { label: '学生管理' }]" @navigate="go" />
 *
 * Props：items 数组 / homeIcon 首项是否显示首页图标
 * 事件：navigate
 * 插槽：extra 右侧附加内容
-->

<script setup lang="ts">
import { ChevronRight, House } from '@lucide/vue'
import { ns } from '@/core/namespace'
import { useLocale } from '@/locale'

export interface BreadcrumbItem {
  label: string
  /** 为空表示当前页，不可点击 */
  to?: string
}

defineOptions({ name: 'CaBreadcrumb' })

const { t } = useLocale()

withDefaults(defineProps<{
  items: BreadcrumbItem[]
  /** 首项显示首页图标 */
  homeIcon?: boolean
}>(), {
  homeIcon: true,
})

const emit = defineEmits<{ navigate: [item: BreadcrumbItem, index: number] }>()
const className = ns('breadcrumb')
</script>

<template>
  <nav :class="className" :aria-label="t('ca.breadcrumb.label')">
    <ol :class="ns('breadcrumb', 'list')">
      <li v-for="(item, index) in items" :key="`${item.label}-${index}`" :class="ns('breadcrumb', 'item')">
        <button
          v-if="index < items.length - 1"
          type="button"
          :class="ns('breadcrumb', 'link')"
          @click="emit('navigate', item, index)"
        >
          <House v-if="homeIcon && index === 0" :size="12" />
          {{ item.label }}
        </button>
        <span v-else :class="ns('breadcrumb', 'current')" aria-current="page">{{ item.label }}</span>
        <ChevronRight v-if="index < items.length - 1" :size="11" :class="ns('breadcrumb', 'separator')" aria-hidden="true" />
      </li>
    </ol>
    <div v-if="$slots.extra" :class="ns('breadcrumb', 'extra')"><slot name="extra" /></div>
  </nav>
</template>

<style src="../style/index.css"></style>
