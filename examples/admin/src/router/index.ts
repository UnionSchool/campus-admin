import { createRouter, createWebHashHistory } from 'vue-router'
import { shallowRef } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { SideMenuItem } from '@unionschool/campus-ui'
import type { TranslateFn } from '@unionschool/campus-ui'
import * as icons from '@lucide/vue'
import { getMainMenu } from '../lib/api/menu'
import type { MenuNode } from '../lib/api/menu'
import { scanPages } from './pages'
import { menuKeyOf, translateOr } from '../lib/translate'

/**
 * 路由与菜单。
 *
 * - 路由地址来自 pages 目录结构（scanPages），保证刷新任意地址都能落到页面
 * - 菜单树与标题、图标来自后端下发的 getMainMenu()，权限与学校差异都在服务端控制
 * - 两边通过 path 对齐：菜单里有 path 的节点才能点击跳转
 *
 * 使用 hash 模式：演示站部署在 COS 静态存储上，没有服务端 rewrite 规则，
 * hash 模式无需服务端配合，本地用 file:// 打开产物也能正常工作。
 */

const HOME_PATH = '/home'

/** 根路径 / 作为首页别名，访问 / 时地址栏保持 / 且不跳转 */
const HOME_ALIASES = ['/']

/**
 * 路由记录。
 *
 * 页面路由在模块加载时就注册好（标题先用文件名兜底），
 * 这样即使首屏直接访问深链接，router 也能立刻匹配到页面；
 * 菜单接口返回后再补上真实标题与栏目。
 */
const routes: RouteRecordRaw[] = scanPages().map(page => ({
  path: page.path,
  name: page.name,
  component: page.loader,
  // alias 只在首页配置，且必须是数组；传 undefined 会让 vue-router 报 aliases is not iterable
  ...(page.path === HOME_PATH ? { alias: HOME_ALIASES } : {}),
  meta: { title: page.name, section: '基础应用' },
}) as unknown as RouteRecordRaw)

routes.push({ path: '/:pathMatch(.*)*', name: 'not-found', redirect: HOME_PATH })

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

/**
 * 菜单原始数据，登录后由 initApp 填充。
 * 用 shallowRef 而不是普通数组：菜单文案要跟随语言切换重新渲染。
 */
export const menuNodes = shallowRef<MenuNode[]>([])

/** 扁平化的菜单信息，便于按 path 查标题与栏目 */
interface MenuEntry {
  path: string
  title: string
  /** 标题词条键 = menu.<菜单 id> */
  titleKey: string
  section: string
  /** 栏目（一级菜单）词条键 */
  sectionKey: string
}

/**
 * 菜单信息表：path → 标题与栏目。
 *
 * 路由 meta 只保留兜底标题，真实标题统一从这里取，
 * 避免菜单接口返回后还要去改 router 内部的 matcher 副本。
 */
const menuEntryByPath = new Map<string, MenuEntry>()

/** 取当前路由的标题与栏目，供面包屑和文档标题使用 */
export function routeInfo(path: string, fallback: { title: string; section: string }): MenuEntry {
  return menuEntryByPath.get(path) ?? {
    path,
    title: fallback.title,
    titleKey: '',
    section: fallback.section,
    sectionKey: '',
  }
}

router.afterEach((to) => {
  const fallback = {
    title: (to.meta.title as string | undefined) ?? '智慧校园',
    section: (to.meta.section as string | undefined) ?? '基础应用',
  }
  const info = routeInfo(to.path, fallback)
  document.title = `${info.title} · 众校通智慧校园`
})

/**
 * 遍历菜单树，收集「有页面」的菜单项。
 * section 记录所属一级分组，用于面包屑。
 */
function collectMenuEntries(nodes: MenuNode[], section = '', sectionKey = ''): MenuEntry[] {
  const entries: MenuEntry[] = []
  nodes.forEach((node) => {
    const currentSection = section || node.label
    const currentSectionKey = sectionKey || menuKeyOf(node)
    if (node.path) {
      entries.push({
        path: node.path,
        title: node.label,
        titleKey: menuKeyOf(node),
        section: currentSection,
        sectionKey: currentSectionKey,
      })
    }
    if (node.children?.length) {
      entries.push(...collectMenuEntries(node.children, currentSection, currentSectionKey))
    }
  })
  return entries
}

/**
 * 菜单节点 → 侧边菜单数据。
 * 图标是接口下发的字符串名，这里映射成组件；
 * 找不到同名图标时降级为不显示图标，不影响菜单可用性。
 */
function toSideMenu(nodes: MenuNode[], t: TranslateFn, te: (key: string) => boolean): SideMenuItem[] {
  return nodes.map(node => ({
    label: translateOr(t, te, menuKeyOf(node), node.label),
    value: node.path,
    icon: node.icon ? (icons as Record<string, unknown>)[node.icon] : undefined,
    badge: node.badge,
    children: node.children?.length ? toSideMenu(node.children, t, te) : undefined,
  }))
}

/**
 * 按当前语言生成侧栏菜单数据。
 * 在 App.vue 里用 computed 调用，语言切换后菜单文案自动跟随。
 */
export function buildSideMenus(t: TranslateFn, te: (key: string) => boolean): SideMenuItem[] {
  return toSideMenu(menuNodes.value, t, te)
}

/**
 * 注册路由并加载菜单。
 *
 * 路由地址以 pages 目录为准，菜单提供标题与顺序；
 * 菜单里有但目录里没有的页面只保留入口，点击时提示待接入。
 */
/**
 * 拉取菜单并应用到路由与侧边栏。
 *
 * 路由地址已经在模块加载时注册，这里只做两件事：
 * 1. 把菜单里的标题与所属栏目写入路由 meta，用于面包屑与文档标题
 * 2. 生成侧边菜单数据
 *
 * 菜单加载失败时保留目录路由，页面依旧可访问。
 */
async function setupRoutes(): Promise<void> {
  let menu: MenuNode[] = []
  try {
    const res = await getMainMenu()
    if (res.code !== 0) throw new Error(res.msg || '菜单加载失败')
    menu = res.data ?? []
  } catch (error) {
    console.error('[router] 菜单加载失败，回退到目录路由：', error)
  }

  menuEntryByPath.clear()
  collectMenuEntries(menu).forEach(entry => menuEntryByPath.set(entry.path, entry))

  menuNodes.value = menu

  // 菜单就绪后按当前地址刷新一次标题，避免首屏显示文件名兜底标题
  const current = router.currentRoute.value
  if (current?.path) {
    const info = routeInfo(current.path, {
      title: String(current.meta.title ?? '智慧校园'),
      section: String(current.meta.section ?? '基础应用'),
    })
    document.title = `${info.title} · 众校通智慧校园`
  }
}

/**
 * 应用启动：加载菜单、注册路由，并等首次导航完成。
 * 必须在 app.mount 之前调用，否则首屏地址会先命中兜底路由。
 */
export async function initApp(): Promise<void> {
  await setupRoutes()
  await router.isReady()
}

export default router
