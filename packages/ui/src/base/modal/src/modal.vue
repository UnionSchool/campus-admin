<!--
 * 对话框：需要用户确认或填写信息时使用，自带遮罩、滚动锁、Esc 关闭与 Tab 焦点循环。
 * 关闭后焦点会回到触发元素；多个弹层同时打开时滚动锁按计数生效。
 *
 * 用法：
 *   <CaModal v-model="open" title="新增学生" show-footer confirm-text="保存" @confirm="save">
 *     <CaInput v-model="name" placeholder="学生姓名" />
 *   </CaModal>
 *
 * Props：modelValue / title / width / maskClosable / escClosable / destroyOnClose
 *        / showFooter / confirmText / cancelText / confirmLoading
 * 事件：update:modelValue、confirm、cancel、closed
 * 插槽：default 内容、title、footer（覆盖默认两个按钮）
-->

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { useLocale } from '@campus-admin/locale'
import { focusableElements, lockScroll, unlockScroll } from './core'

defineOptions({ name: 'CaModal' })

const { t } = useLocale()

const props = withDefaults(defineProps<{
  modelValue?: boolean
  title?: string
  width?: number | string
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean
  /** 按 Esc 是否关闭 */
  escClosable?: boolean
  /** 关闭后是否销毁内容 */
  destroyOnClose?: boolean
  showFooter?: boolean
  confirmText?: string
  cancelText?: string
  confirmLoading?: boolean
}>(), {
  maskClosable: true,
  escClosable: true,
  showFooter: false,
})

/** 未显式传文案时用当前语言的默认值 */
const confirmTextValue = computed(() => props.confirmText ?? t('ca.common.confirm'))
const cancelTextValue = computed(() => props.cancelText ?? t('ca.common.cancel'))

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  closed: []
}>()

const panelRef = ref<HTMLElement>()
const rendered = ref(props.modelValue)
let previousFocus: HTMLElement | null = null

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function confirm() {
  emit('confirm')
}

function onKeydown(event: KeyboardEvent) {
  if (!props.modelValue) return
  if (event.key === 'Escape' && props.escClosable) {
    event.stopPropagation()
    close()
    return
  }
  if (event.key !== 'Tab') return
  const focusables = focusableElements(panelRef.value)
  if (!focusables.length) return
  const first = focusables[0] as HTMLElement
  const last = focusables[focusables.length - 1] as HTMLElement
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    lockScroll()
    document.addEventListener('keydown', onKeydown)
    rendered.value = true
    await nextTick()
    focusableElements(panelRef.value)[0]?.focus()
  } else if (rendered.value) {
    unlockScroll()
    document.removeEventListener('keydown', onKeydown)
    previousFocus?.focus()
    previousFocus = null
    if (props.destroyOnClose) rendered.value = false
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
    <Transition name="ca-modal">
      <div v-if="modelValue && rendered" :class="ns('modal')" @click.self="maskClosable && close()">
        <section
          ref="panelRef"
          :class="cx(ns('modal', 'panel'), ns('modal', undefined, 'panel'))"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :style="{ width: typeof width === 'number' ? `${width}px` : width }"
        >
          <header :class="ns('modal', 'header')">
            <h2 :class="ns('modal', 'title')"><slot name="title">{{ title }}</slot></h2>
            <button :class="ns('modal', 'close')" type="button" :aria-label="t('ca.common.close')" @click="close"><X :size="18" /></button>
          </header>
          <div :class="ns('modal', 'body')"><slot /></div>
          <footer v-if="showFooter || $slots.footer" :class="ns('modal', 'footer')">
            <slot name="footer">
              <button :class="ns('modal', 'button')" type="button" @click="close">{{ cancelTextValue }}</button>
              <button :class="cx(ns('modal', 'button'), ns('modal', 'button', 'primary'))" type="button" :disabled="confirmLoading" @click="confirm">
                {{ confirmLoading ? t('ca.common.processing') : confirmTextValue }}
              </button>
            </slot>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="../style/index.css"></style>
