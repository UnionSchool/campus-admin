<!--
 * 抽屉：承载详情、表单等次级内容，支持从左、右、底部滑出。
 * 相比对话框更适合放长内容和多字段表单。
 *
 * 用法：
 *   <CaDrawer v-model="open" title="学生详情" placement="right" :size="420">
 *     <StudentDetail :id="currentId" />
 *   </CaDrawer>
 *
 * Props：modelValue / title / placement right|left|bottom / size / maskClosable / escClosable
 * 事件：update:modelValue、closed
 * 插槽：default 内容、title、footer
-->

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from '@unionschool/campus-framework'
import { X } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { focusableElements, lockScroll, unlockScroll } from '../../../feedback/modal/src/core'

defineOptions({ name: 'CaDrawer' })

const props = withDefaults(defineProps<{
  modelValue?: boolean
  title?: string
  placement?: 'right' | 'left' | 'bottom'
  size?: number | string
  maskClosable?: boolean
  escClosable?: boolean
}>(), {
  placement: 'right',
  size: 420,
  maskClosable: true,
  escClosable: true,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean]; closed: [] }>()

const panelRef = ref<HTMLElement>()
let previousFocus: HTMLElement | null = null

function close() {
  emit('update:modelValue', false)
}

function onKeydown(event: KeyboardEvent) {
  if (!props.modelValue) return
  if (event.key === 'Escape' && props.escClosable) {
    event.stopPropagation()
    close()
  }
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    lockScroll()
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    focusableElements(panelRef.value)[0]?.focus()
  } else {
    unlockScroll()
    document.removeEventListener('keydown', onKeydown)
    previousFocus?.focus()
    previousFocus = null
    emit('closed')
  }
})

onBeforeUnmount(() => {
  if (props.modelValue) unlockScroll()
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ca-drawer">
      <div v-if="modelValue" :class="ns('drawer')" @click.self="maskClosable && close()">
        <aside
          ref="panelRef"
          :class="cx(ns('drawer', 'panel'), ns('drawer', undefined, placement))"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :style="placement === 'bottom' ? { height: typeof size === 'number' ? `${size}px` : size } : { width: typeof size === 'number' ? `${size}px` : size }"
        >
          <header :class="ns('drawer', 'header')">
            <h2 :class="ns('drawer', 'title')"><slot name="title">{{ title }}</slot></h2>
            <button :class="ns('drawer', 'close')" type="button" aria-label="关闭" @click="close"><X :size="18" /></button>
          </header>
          <div :class="ns('drawer', 'body')"><slot /></div>
          <footer v-if="$slots.footer" :class="ns('drawer', 'footer')"><slot name="footer" /></footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ca-drawer { position: fixed; inset: 0; z-index: var(--ca-z-index-modal); background: var(--ca-overlay-color); }
.ca-drawer__panel { position: absolute; display: flex; flex-direction: column; max-width: 100vw; max-height: 100dvh; background: var(--ca-surface-card); box-shadow: var(--ca-shadow-lg); }
.ca-drawer__panel.right { top: 0; right: 0; bottom: 0; }
.ca-drawer__panel.left { top: 0; left: 0; bottom: 0; }
.ca-drawer__panel.bottom { left: 0; right: 0; bottom: 0; border-radius: var(--ca-radius-xl) var(--ca-radius-xl) 0 0; }
.ca-drawer__header { display: flex; align-items: center; justify-content: space-between; gap: var(--ca-space-4); padding: var(--ca-space-4) var(--ca-space-5); border-bottom: 1px solid var(--ca-border-color); }
.ca-drawer__title { color: var(--ca-text-primary); font-size: var(--ca-font-size-lg); font-weight: 600; }
.ca-drawer__close { color: var(--ca-text-placeholder); }
.ca-drawer__close:hover { color: var(--ca-text-regular); }
.ca-drawer__body { flex: 1; padding: var(--ca-space-5); overflow-y: auto; color: var(--ca-text-regular); font-size: var(--ca-font-size-md); }
.ca-drawer__footer { display: flex; justify-content: flex-end; gap: var(--ca-space-3); padding: var(--ca-space-4) var(--ca-space-5); border-top: 1px solid var(--ca-border-color); }
.ca-drawer-enter-active, .ca-drawer-leave-active { transition: opacity .2s; }
.ca-drawer-enter-active .ca-drawer__panel, .ca-drawer-leave-active .ca-drawer__panel { transition: transform .24s ease; }
.ca-drawer-enter-from, .ca-drawer-leave-to { opacity: 0; }
.ca-drawer-enter-from .ca-drawer__panel.right, .ca-drawer-leave-to .ca-drawer__panel.right { transform: translateX(100%); }
.ca-drawer-enter-from .ca-drawer__panel.left, .ca-drawer-leave-to .ca-drawer__panel.left { transform: translateX(-100%); }
.ca-drawer-enter-from .ca-drawer__panel.bottom, .ca-drawer-leave-to .ca-drawer__panel.bottom { transform: translateY(100%); }
@media (prefers-reduced-motion: reduce) {
  .ca-drawer-enter-active, .ca-drawer-leave-active, .ca-drawer-enter-active .ca-drawer__panel, .ca-drawer-leave-active .ca-drawer__panel { transition: none; }
}
</style>
