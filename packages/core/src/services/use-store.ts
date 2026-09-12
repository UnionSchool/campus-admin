import { onScopeDispose, shallowRef } from '../vue'
import type { ShallowRef } from '../vue'
import type { CampusStore } from './store'

/**
 * 把订阅式 store 接到 Vue 响应式。
 *
 * store 本身不认识 Vue；这里是二者唯一的桥梁，
 * 换渲染层时只需要替换这个函数。
 */
export function useStore<T>(store: CampusStore<T>): ShallowRef<T> {
  const state = shallowRef(store.get())
  const unsubscribe = store.subscribe((next) => {
    state.value = next
  })
  // 组件卸载或 effect 作用域销毁时自动取消订阅
  onScopeDispose(unsubscribe)
  return state
}
