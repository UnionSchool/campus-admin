<!--
 * 消息提示容器：挂载一次即可，页面通过命令式 toast 触发。
 * 不需要弹窗打断流程的反馈优先用它，比起模态框更轻。
 *
 * 用法：
 *   // 页面或布局根组件中挂载一次
 *   <CaToastContainer />
 *   // 任意位置调用
 *   toast.success('保存成功')
 *   toast.error('保存失败', '请检查网络后重试')
 *
 * 导出：toast（show/success/warning/error/info/close/clear）、closeToast、clearToasts
 * Props：无
 * 说明：toast 默认 3 秒自动关闭，传 duration: 0 可保持常驻。
-->

<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import { close, toasts } from './store'
import type { ToastTone } from './store'

defineOptions({ name: 'CaToastContainer' })

const icons = {
  primary: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
} satisfies Record<ToastTone, unknown>
</script>

<template>
  <div :class="ns('toast-container')" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="ca-toast">
      <div v-for="item in toasts" :key="item.id" :class="cx(ns('toast'), ns('toast', undefined, item.tone))" role="status">
        <component :is="icons[item.tone]" :size="17" />
        <div :class="ns('toast', 'body')">
          <b>{{ item.text }}</b>
          <p v-if="item.description">{{ item.description }}</p>
        </div>
        <button :class="ns('toast', 'close')" type="button" aria-label="关闭消息" @click="close(item.id)"><X :size="13" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.ca-toast-container {
  position: fixed;
  z-index: var(--ca-z-index-message);
  top: var(--ca-space-5);
  left: 50%;
  display: grid;
  gap: var(--ca-space-2);
  width: min(360px, calc(100vw - 32px));
  transform: translateX(-50%);
  pointer-events: none;
}
.ca-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--ca-space-2);
  padding: var(--ca-space-3);
  border: 1px solid var(--ca-border-color);
  border-radius: var(--ca-radius-lg);
  background: var(--ca-surface-card);
  box-shadow: var(--ca-shadow-popup);
  pointer-events: auto;
}
.ca-toast--primary { color: var(--ca-color-primary); }
.ca-toast--success { color: var(--ca-color-success); }
.ca-toast--warning { color: var(--ca-color-warning); }
.ca-toast--danger { color: var(--ca-color-danger); }
.ca-toast__body { flex: 1; min-width: 0; }
.ca-toast__body b { display: block; color: var(--ca-text-primary); font-size: var(--ca-font-size-md); font-weight: 500; }
.ca-toast__body p { margin-top: 2px; color: var(--ca-text-secondary); font-size: var(--ca-font-size-sm); line-height: var(--ca-line-height); }
.ca-toast__close { flex-shrink: 0; color: var(--ca-text-placeholder); }
.ca-toast__close:hover { color: var(--ca-text-secondary); }
.ca-toast-move-enter-active, .ca-toast-move-leave-active { transition: opacity .2s, transform .2s; }
.ca-toast-move-enter-from, .ca-toast-move-leave-to { opacity: 0; transform: translateY(-8px); }
@media (prefers-reduced-motion: reduce) {
  .ca-toast-move-enter-active, .ca-toast-move-leave-active { transition: none; }
}
</style>
