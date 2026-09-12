<!--
 * 标语：学校/机构可传自己的标语，不传时用默认的众校通标语。
 *
 * 用法：
 *   <CaSlogan />                              // 默认：为教育多做一点
 *   <CaSlogan title="让每个孩子被看见" />       // 学校自己的标语
 *
 * Props：title 学校 / 机构标语，为空时回退到词条 ca.slogan.default
 *
 * 说明：根元素是 span，不产生额外布局，样式由使用方继承（字号、颜色跟随所在位置）。
 -->
<script setup lang="ts">
import { computed } from 'vue'
import { ns } from '@/core/namespace'
import { useLocale } from '@campus-admin/locale'

defineOptions({ name: 'CaSlogan' })

const props = withDefaults(defineProps<{
  /** 学校 / 机构标语，为空时用默认的众校通标语 */
  title?: string
}>(), {
  title: '',
})

const { t } = useLocale()

/** 有自定义标语用自定义，没有回退默认标语 */
const text = computed(() => props.title || t('ca.slogan.default'))
</script>

<template>
  <span :class="ns('slogan')">{{ text }}</span>
</template>

<style src="../style/index.css"></style>
