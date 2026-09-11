<script setup lang="ts">
import { ref, watch } from '../../vue'
import type { OverlayItem } from '../../services/modal'
import { closeOverlay } from '../../services/modal'

defineOptions({ name: 'CaOverlayList' })

withDefaults(defineProps<{
  items?: OverlayItem[]
}>(), {
  items: () => [],
})

/** 正在执行回调的弹层 id，用于按钮 loading 与防重复点击 */
const pending = ref<number | null>(null)

/** 记录触发元素，关闭后把焦点还回去 */
let previousFocus: HTMLElement | null = null

watch(() => (document.activeElement instanceof HTMLElement ? document.activeElement : null), () => {}, { immediate: false })

async function handleConfirm(item: OverlayItem) {
  if (pending.value === item.id) return
  pending.value = item.id
  try {
    await item.onConfirm?.()
  } finally {
    pending.value = null
    closeOverlay(item.id)
    previousFocus?.focus()
    previousFocus = null
  }
}

function handleCancel(item: OverlayItem) {
  item.onCancel?.()
  closeOverlay(item.id)
  previousFocus?.focus()
  previousFocus = null
}

/** 打开时记住当前焦点，便于关闭后恢复 */
function captureFocus() {
  if (!previousFocus) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }
}
</script>

<template>
  <div class="ca-overlay-root">
    <div
      v-for="item in items"
      :key="item.id"
      class="ca-overlay"
      @click.self="item.variant === 'confirm' && handleCancel(item)"
      @vue:mounted="captureFocus"
    >
      <section class="ca-overlay__panel" role="dialog" aria-modal="true" :aria-label="item.title ?? item.content">
        <header v-if="item.title" class="ca-overlay__header">
          <h2 class="ca-overlay__title">{{ item.title }}</h2>
        </header>
        <div v-if="item.content" class="ca-overlay__body">{{ item.content }}</div>
        <footer class="ca-overlay__footer">
          <button
            v-if="item.variant === 'confirm'"
            class="ca-overlay__button"
            type="button"
            :disabled="pending === item.id"
            @click="handleCancel(item)"
          >
            {{ item.cancelText ?? '取消' }}
          </button>
          <button
            class="ca-overlay__button ca-overlay__button--primary"
            type="button"
            :disabled="pending === item.id"
            @click="handleConfirm(item)"
          >
            {{ pending === item.id ? '处理中…' : item.confirmText }}
          </button>
        </footer>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ca-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--ca-z-index-modal, 2000);
  display: grid;
  place-items: center;
  padding: 20px;
  background: var(--ca-overlay-color, #16283d66);
  backdrop-filter: blur(2px);
}
.ca-overlay__panel {
  width: min(420px, 100%);
  border-radius: var(--ca-radius-xl, 16px);
  background: var(--ca-surface-card, #fff);
  box-shadow: var(--ca-shadow-lg, 0 12px 30px #1e3d5f1f);
  overflow: hidden;
}
.ca-overlay__header { padding: 22px 24px 0; }
.ca-overlay__title { color: var(--ca-text-primary, #2f3d4c); font-size: var(--ca-font-size-lg, 16px); font-weight: 600; text-align: center; }
.ca-overlay__body { padding: 12px 24px 4px; color: var(--ca-text-regular, #4d5f70); font-size: var(--ca-font-size-md, 14px); line-height: 1.7; text-align: center; }
.ca-overlay__footer { display: flex; gap: 12px; padding: 18px 24px 22px; }
.ca-overlay__button {
  flex: 1;
  min-height: var(--ca-control-height-lg, 42px);
  border: 1px solid var(--ca-border-color, #e6eef6);
  border-radius: var(--ca-radius-md, 8px);
  background: var(--ca-surface-card, #fff);
  color: var(--ca-text-regular, #4d5f70);
  font-size: var(--ca-font-size-md, 14px);
}
.ca-overlay__button--primary { border-color: transparent; background: var(--ca-color-primary, #0878fa); color: #fff; }
.ca-overlay__button--primary:hover:not(:disabled) { background: var(--ca-color-primary-hover, #0069e0); }
.ca-overlay__button:disabled { opacity: .6; cursor: not-allowed; }
</style>
