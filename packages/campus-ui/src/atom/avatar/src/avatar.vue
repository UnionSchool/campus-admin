<!--
 * 头像：展示用户或学生的头像，无图片时回退到姓名首字，再回退到占位图标。
 * 用于列表、详情页和用户菜单，组件不请求图片之外的任何数据。
 *
 * 用法：
 *   <CaAvatar :name="student.name" size="small" />
 *   <CaAvatar :src="user.avatar" :name="user.name" shape="square" />
 *
 * Props：src 图片地址 / name 姓名（取首字） / size small|medium|large / shape circle|square
-->

<script setup lang="ts">
import { computed, ref } from '@unionschool/campus-framework'
import { UserRound } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'

defineOptions({ name: 'CaAvatar' })

const props = withDefaults(defineProps<{
  /** 图片地址 */
  src?: string
  /** 没有图片时展示的文字，通常取姓名首字 */
  name?: string
  size?: 'small' | 'medium' | 'large'
  shape?: 'circle' | 'square'
}>(), {
  size: 'medium',
  shape: 'circle',
})

const failed = ref(false)
const initial = computed(() => (props.name ?? '').trim().slice(0, 1))
const className = computed(() => cx(
  ns('avatar'),
  ns('avatar', undefined, props.size),
  ns('avatar', undefined, props.shape),
))
</script>

<template>
  <span :class="className">
    <img v-if="src && !failed" :src="src" :alt="name ?? ''" @error="failed = true" />
    <span v-else-if="initial" :class="ns('avatar', 'text')">{{ initial }}</span>
    <UserRound v-else :size="16" aria-hidden="true" />
  </span>
</template>

<style scoped>
.ca-avatar {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  width: 32px;
  height: 32px;
  background: var(--ca-color-primary-soft);
  color: var(--ca-color-primary);
  font-size: var(--ca-font-size-md);
  user-select: none;
}
.ca-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ca-avatar--circle { border-radius: var(--ca-radius-full); }
.ca-avatar--square { border-radius: var(--ca-radius-md); }
.ca-avatar--small { width: 24px; height: 24px; font-size: var(--ca-font-size-sm); }
.ca-avatar--large { width: 44px; height: 44px; font-size: var(--ca-font-size-lg); }
.ca-avatar__text { line-height: 1; }
</style>
