<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { X } from '@lucide/vue'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  /** 自定义模式：由默认插槽提供内容与底部按钮 */
  customizing?: boolean
  titleWhenCustomizing?: string
}>(), {
  titleWhenCustomizing: '自定义',
})

const emit = defineEmits<{ close: [] }>()

const closeButton = ref<HTMLButtonElement>()
let previousFocus: HTMLElement | null = null

const open = () => Boolean(props.title || props.customizing)

function close() {
  emit('close')
}

/** Esc 关闭 + Tab 焦点循环，关闭后把焦点还给触发元素 */
function onKeydown(event: KeyboardEvent) {
  if (!open()) return
  if (event.key === 'Escape') {
    event.stopPropagation()
    close()
    return
  }
  if (event.key !== 'Tab') return
  const elements = [...document.querySelectorAll<HTMLElement>('.dialog button:not(:disabled), .dialog input:not(:disabled)')]
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => props.title, async (title) => {
  if (title) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    closeButton.value?.focus()
  }
})

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  previousFocus?.focus()
})
</script>

<template>
  <div v-if="title || customizing" class="modal-backdrop" @click.self="close">
    <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <header>
        <h2 id="dialog-title">{{ customizing ? titleWhenCustomizing : title }}</h2>
        <button ref="closeButton" aria-label="关闭详情" @click="close"><X :size="20" /></button>
      </header>
      <p v-if="!customizing">{{ description }}</p>
      <slot />
      <footer v-if="!customizing">
        <button class="primary-button" @click="close">我知道了</button>
      </footer>
    </section>
  </div>
</template>
