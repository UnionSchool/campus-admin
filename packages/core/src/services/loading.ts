import { CampusStore } from './store'

export interface LoadingState {
  visible: boolean
  /** 加载文案，可选 */
  text: string
}

export interface LoadingHandle {
  /** 关闭加载动画 */
  hide: () => void
}

/**
 * 加载动画状态。
 *
 * 不支持并发：重复调用 ca.loading() 只返回新的句柄，
 * 任意一个句柄 hide() 都会关闭——加载动画本来就是全局唯一的状态。
 */
export const loadingStore = new CampusStore<LoadingState>({ visible: false, text: '' })

/** 显示加载动画，返回用于关闭的句柄 */
export function showLoading(text = ''): LoadingHandle {
  loadingStore.set({ visible: true, text })
  return {
    hide: () => hideLoading(),
  }
}

/** 关闭加载动画，可在任意位置调用（例如请求拦截器兜底） */
export function hideLoading(): void {
  loadingStore.set({ visible: false, text: '' })
}
