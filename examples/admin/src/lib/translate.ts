/**
 * 后端文案与词条的衔接。
 *
 * 约定：后端返回稳定 id 与默认文案（label），前端按 menu.<id> 去词条里查；
 * 查得到就用词条（跟当前语言），查不到就用后端下发的文案兜底，
 * 这样后端还没接入多语言时页面也不会出现裸 key。
 */
import type { TranslateFn } from '@campus-admin/core'

/** 菜单节点的词条键，后端显式给了 labelKey 时以它为准 */
export function menuKeyOf(node: { id: string; labelKey?: string }): string {
  return node.labelKey ?? `menu.${node.id}`
}

/** 有词条用词条，没有用兜底文案 */
export function translateOr(
  t: TranslateFn,
  te: (key: string) => boolean,
  key: string | undefined,
  fallback: string,
): string {
  if (!key) return fallback
  return te(key) ? t(key) : fallback
}
