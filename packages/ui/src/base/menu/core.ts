export interface SideMenuItem {
  /** 显示文案 */
  label: string
  /**
   * 节点标识。
   * 不传时依次回退到 value、label，用于展开状态与选中态匹配。
   */
  key?: string
  /** 业务数据，例如路由地址；组件本身不解释它的含义 */
  value?: string
  /** 图标组件，需为可渲染的 Vue 组件 */
  icon?: unknown
  /** 右侧角标，通常是待办数量 */
  badge?: string
  disabled?: boolean
  children?: SideMenuItem[]
}

export interface FlatSideMenuItem extends SideMenuItem {
  level: number
  itemKey: string
  expandable: boolean
  parentKeys: string[]
}

/** 取节点唯一标识 */
export function resolveKey(item: SideMenuItem): string {
  return item.key ?? item.value ?? item.label
}

/**
 * 按展开状态把菜单树拍平成可渲染列表。
 *
 * 拍平后统一渲染，缩进与层级样式由 level 决定，
 * 因此扩展到三级及以上菜单不需要改组件结构。
 */
export function flattenMenu(items: SideMenuItem[], expanded: Set<string>, level = 0, parentKeys: string[] = []): FlatSideMenuItem[] {
  const rows: FlatSideMenuItem[] = []
  items.forEach((item) => {
    const itemKey = resolveKey(item)
    const expandable = Boolean(item.children?.length)
    rows.push({ ...item, level, itemKey, expandable, parentKeys })
    if (expandable && expanded.has(itemKey)) {
      rows.push(...flattenMenu(item.children as SideMenuItem[], expanded, level + 1, [...parentKeys, itemKey]))
    }
  })
  return rows
}

/** 收集所有可展开节点的 key，用于默认全部展开 */
export function collectExpandableKeys(items: SideMenuItem[]): Set<string> {
  const keys = new Set<string>()
  const walk = (list: SideMenuItem[]) => {
    list.forEach((item) => {
      if (item.children?.length) {
        keys.add(resolveKey(item))
        walk(item.children)
      }
    })
  }
  walk(items)
  return keys
}
