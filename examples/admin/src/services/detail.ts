import { ref } from 'vue'

export interface DetailContent {
  title: string
  description: string
}

/**
 * 全局详情弹窗状态。
 *
 * 示例里多个页面都要弹同一套「详情」对话框，用一个共享状态避免每页重复实现。
 * 真实项目可替换为 App 级别的弹层服务或组件。
 */
export const detail = ref<DetailContent | null>(null)

export function showDetail(title: string, description: string) {
  detail.value = { title, description }
}

export function closeDetail() {
  detail.value = null
}
