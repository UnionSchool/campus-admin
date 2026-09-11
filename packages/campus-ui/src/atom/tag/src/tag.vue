<!--
 * 标签：表达状态、分类或可移除的标记。
 * 状态类标签建议搭配 dot 圆点使用，颜色之外再给一层文字提示。
 *
 * 用法：
 *   <CaTag tone="success" dot>已在校</CaTag>
 *   <CaTag tone="warning">待审批</CaTag>
 *   <CaTag closable @close="remove">可移除</CaTag>
 *
 * Props：tone primary|success|warning|danger|info|neutral / variant soft|solid|outline
 *        / size small|medium / closable / dot
 *
 * 事件：close
-->

<script setup lang="ts">
import { computed } from '@unionschool/campus-framework'
import { X } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import type { ComponentTone } from '@/core/namespace'

defineOptions({ name: 'CaTag' })

const props = withDefaults(defineProps<{
  tone?: ComponentTone
  /** 浅色底 / 实心 */
  variant?: 'soft' | 'solid' | 'outline'
  size?: 'small' | 'medium'
  closable?: boolean
  /** 状态类标签可加圆点 */
  dot?: boolean
}>(), {
  tone: 'primary',
  variant: 'soft',
  size: 'medium',
})

const emit = defineEmits<{ close: [] }>()

const className = computed(() => cx(
  ns('tag'),
  ns('tag', undefined, props.tone),
  ns('tag', undefined, props.variant),
  ns('tag', undefined, props.size),
))
</script>

<template>
  <span :class="className">
    <i v-if="dot" :class="ns('tag', 'dot')" aria-hidden="true"></i>
    <slot />
    <button v-if="closable" :class="ns('tag', 'close')" type="button" aria-label="移除" @click="emit('close')">
      <X :size="11" />
    </button>
  </span>
</template>

<style scoped>
.ca-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--ca-space-1);
  padding: 0 var(--ca-space-2);
  min-height: 22px;
  border: 1px solid transparent;
  border-radius: var(--ca-radius-sm);
  font-size: var(--ca-font-size-sm);
  line-height: 1;
  white-space: nowrap;
}
.ca-tag--small { min-height: 18px; padding: 0 var(--ca-space-1); font-size: var(--ca-font-size-xs); }
.ca-tag__dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.ca-tag__close { display: inline-flex; align-items: center; margin-right: -3px; color: currentColor; opacity: .7; }
.ca-tag__close:hover { opacity: 1; }

.ca-tag--soft.ca-tag--primary { background: var(--ca-color-primary-soft); color: var(--ca-color-primary); }
.ca-tag--soft.ca-tag--success { background: var(--ca-color-green-50); color: var(--ca-color-success); }
.ca-tag--soft.ca-tag--warning { background: var(--ca-color-orange-50); color: #c47a35; }
.ca-tag--soft.ca-tag--danger { background: var(--ca-color-red-50); color: var(--ca-color-danger); }
.ca-tag--soft.ca-tag--info { background: var(--ca-color-cyan-50); color: var(--ca-color-info); }
.ca-tag--soft.ca-tag--neutral { background: var(--ca-color-neutral-100); color: var(--ca-text-secondary); }

.ca-tag--solid { color: var(--ca-text-inverse); }
.ca-tag--solid.ca-tag--primary { background: var(--ca-color-primary); }
.ca-tag--solid.ca-tag--success { background: var(--ca-color-success); }
.ca-tag--solid.ca-tag--warning { background: var(--ca-color-warning); }
.ca-tag--solid.ca-tag--danger { background: var(--ca-color-danger); }
.ca-tag--solid.ca-tag--info { background: var(--ca-color-info); }
.ca-tag--solid.ca-tag--neutral { background: var(--ca-color-neutral-500); }

.ca-tag--outline { background: transparent; }
.ca-tag--outline.ca-tag--primary { border-color: var(--ca-color-primary); color: var(--ca-color-primary); }
.ca-tag--outline.ca-tag--success { border-color: var(--ca-color-success); color: var(--ca-color-success); }
.ca-tag--outline.ca-tag--warning { border-color: var(--ca-color-warning); color: #c47a35; }
.ca-tag--outline.ca-tag--danger { border-color: var(--ca-color-danger); color: var(--ca-color-danger); }
.ca-tag--outline.ca-tag--info { border-color: var(--ca-color-info); color: var(--ca-color-info); }
.ca-tag--outline.ca-tag--neutral { border-color: var(--ca-border-color-strong); color: var(--ca-text-secondary); }
</style>
