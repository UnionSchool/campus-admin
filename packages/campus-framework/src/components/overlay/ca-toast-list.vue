<script setup lang="ts">
import { AlertTriangle, Check, Info, X } from '@lucide/vue'
import type { ToastItem } from '../../services/toast'

defineOptions({ name: 'CaToastList' })

withDefaults(defineProps<{
  items?: ToastItem[]
}>(), {
  items: () => [],
})
</script>

<template>
  <div class="ca-toast-list" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="ca-toast">
      <div v-for="item in items" :key="item.id" :class="['ca-toast', item.tone]" role="status">
        <span class="ca-toast__icon" aria-hidden="true">
          <Check v-if="item.tone === 'success'" :size="15" :stroke-width="3" />
          <X v-else-if="item.tone === 'danger'" :size="15" :stroke-width="3" />
          <AlertTriangle v-else-if="item.tone === 'warning'" :size="15" :stroke-width="3" />
          <Info v-else :size="15" :stroke-width="3" />
        </span>
        <span class="ca-toast__text">
          {{ item.text }}
          <small v-if="item.description">{{ item.description }}</small>
        </span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.ca-toast-list {
  position: fixed;
  z-index: var(--ca-z-index-message, 3000);
  top: 12%;
  left: 50%;
  display: grid;
  gap: 8px;
  justify-items: center;
  width: min(320px, calc(100vw - 32px));
  transform: translateX(-50%);
  pointer-events: none;
}
.ca-toast {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 11px 16px;
  border-radius: var(--ca-radius-md, 8px);
  background: #16283de6;
  color: #fff;
  font-size: var(--ca-font-size-md, 14px);
  box-shadow: var(--ca-shadow-lg, 0 12px 30px #1e3d5f1f);
}
.ca-toast__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: #fff;
}
.ca-toast.success .ca-toast__icon { background: var(--ca-color-success, #2fae85); }
.ca-toast.danger .ca-toast__icon { background: var(--ca-color-danger, #e8695f); }
.ca-toast.warning .ca-toast__icon { background: var(--ca-color-warning, #f59a3c); }
.ca-toast.primary .ca-toast__icon { background: var(--ca-color-primary, #0878fa); }
.ca-toast__text { display: grid; gap: 2px; min-width: 0; line-height: 1.5; }
.ca-toast__text small { font-size: 12px; opacity: .82; }
.ca-toast-move-enter-active,
.ca-toast-move-leave-active { transition: opacity .2s, transform .2s; }
.ca-toast-move-enter-from,
.ca-toast-move-leave-to { opacity: 0; transform: translateY(-8px); }
@media (prefers-reduced-motion: reduce) {
  .ca-toast-move-enter-active,
  .ca-toast-move-leave-active { transition: none; }
}
</style>
