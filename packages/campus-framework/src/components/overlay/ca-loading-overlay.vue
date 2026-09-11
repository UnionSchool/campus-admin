<script setup lang="ts">
defineOptions({ name: 'CaLoadingOverlay' })

withDefaults(defineProps<{
  visible?: boolean
  text?: string
}>(), {
  visible: false,
  text: '',
})
</script>

<template>
  <Transition name="ca-loading-fade">
    <div v-if="visible" class="ca-loading" role="status" aria-live="polite">
      <div class="ca-loading__box">
        <span class="ca-loading__spinner" aria-hidden="true"></span>
        <p v-if="text" class="ca-loading__text">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.ca-loading {
  position: fixed;
  inset: 0;
  z-index: var(--ca-z-index-message, 3000);
  display: grid;
  place-items: center;
  background: transparent;
  /* 不拦截点击：加载动画是提示性的，不应阻断用户操作 */
  pointer-events: none;
}
.ca-loading__box {
  display: grid;
  justify-items: center;
  gap: 10px;
  min-width: 92px;
  padding: 18px 20px;
  border-radius: var(--ca-radius-lg, 12px);
  background: #16283dcc;
  color: #fff;
  box-shadow: var(--ca-shadow-lg, 0 12px 30px #1e3d5f1f);
}
.ca-loading__spinner {
  width: 26px;
  height: 26px;
  border: 2px solid #ffffff5c;
  border-top-color: #fff;
  border-radius: 50%;
  animation: ca-loading-spin .8s linear infinite;
}
.ca-loading__text {
  font-size: var(--ca-font-size-sm, 12px);
  line-height: 1;
}
@keyframes ca-loading-spin {
  to { transform: rotate(360deg); }
}
.ca-loading-fade-enter-active,
.ca-loading-fade-leave-active { transition: opacity .18s; }
.ca-loading-fade-enter-from,
.ca-loading-fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .ca-loading__spinner { animation-duration: 2.4s; }
  .ca-loading-fade-enter-active,
  .ca-loading-fade-leave-active { transition: none; }
}
</style>
