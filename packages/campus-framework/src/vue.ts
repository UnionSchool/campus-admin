/**
 * Vue 适配层，全项目唯一允许直接依赖 vue 的位置。
 *
 * 组件与业务代码通过这里使用响应式与生命周期能力。
 * 升级 Vue 时只检查本文件与 framework 包，业务代码无需改动。
 */
export {
  computed,
  createApp,
  defineAsyncComponent,
  defineComponent,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onScopeDispose,
  onUnmounted,
  provide,
  readonly,
  ref,
  shallowRef,
  toRef,
  toRefs,
  watch,
  watchEffect,
} from 'vue'

export type {
  App,
  Component,
  ComputedRef,
  InjectionKey,
  PropType,
  Ref,
  ShallowRef,
  VNode,
  WritableComputedRef,
} from 'vue'
