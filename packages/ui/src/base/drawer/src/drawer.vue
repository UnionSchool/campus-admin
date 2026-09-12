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
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { focusableElements, lockScroll, unlockScroll } from '../../modal/src/core'

import { useLocale } from '@campus-admin/locale'

defineOptions({ name: 'CaDrawer' })

const { t } = useLocale()

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
            <button :class="ns('drawer', 'close')" type="button" :aria-label="t('ca.common.close')" @click="close"><X :size="18" /></button>
          </header>
          <div :class="ns('drawer', 'body')"><slot /></div>
          <footer v-if="$slots.footer" :class="ns('drawer', 'footer')"><slot name="footer" /></footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="../style/index.css"></style>
