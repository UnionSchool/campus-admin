/**
 * 极简订阅式 store。
 *
 * 命令式 API（ca.loading / ca.toast / ca.alert ...）是普通 JS 函数，
 * 但界面要用 Vue 渲染。这里用订阅模式做桥梁：
 * - 服务层只改数据并通知订阅者，不感知 Vue
 * - Vue 侧订阅同一份数据，用 computed 渲染
 *
 * 因此渲染层可以整体替换（比如换成小程序），服务调用代码不用改。
 */
export class CampusStore<T> {
  private state: T
  private readonly listeners = new Set<(state: T) => void>()

  constructor(initial: T) {
    this.state = initial
  }

  get(): T {
    return this.state
  }

  /** 合并更新并通知订阅者；传函数可基于上一次状态计算 */
  set(patch: Partial<T> | ((prev: T) => Partial<T>)): void {
    const next = typeof patch === 'function' ? patch(this.state) : patch
    this.state = { ...this.state, ...next }
    this.listeners.forEach(listener => listener(this.state))
  }

  /** 订阅变更，返回取消订阅函数 */
  subscribe(listener: (state: T) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}
