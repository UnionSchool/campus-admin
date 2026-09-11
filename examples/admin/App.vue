<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bell, Building2, ChevronDown, ChevronRight, GraduationCap, Headphones, MapPin,
  Languages, Menu, Search, Settings2, SunMoon, X,
} from '@lucide/vue'
import { CaSideMenu, useLocale } from '@unionschool/campus-ui'
import type { CaTheme, SideMenuItem } from '@unionschool/campus-ui'
import DetailDialog from './src/components/DetailDialog.vue'
import { buildSideMenus, routeInfo } from './src/router'
import { detail, showDetail } from './src/services/detail'
import { useTheme } from './src/composables/useTheme'
import { useLanguage } from './src/composables/useLanguage'
import { translateOr } from './src/lib/translate'

const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const searchKeyword = ref('')

// 国际化：t 取词，te 判断词条是否存在（后端文案兜底用）
const { t, te } = useLocale()
const { language, languages, switchLanguage } = useLanguage()

// 主题三态：浅色 / 深色 / 自动（跟随系统），状态与持久化在 useTheme 里，这里只负责渲染
const { theme, isDark, setTheme } = useTheme()
const themeModes = computed(() => [
  { value: 'light' as CaTheme, label: t('app.themeLight') },
  { value: 'dark' as CaTheme, label: t('app.themeDark') },
  {
    value: 'auto' as CaTheme,
    label: t('app.themeAuto'),
    // 自动模式的实际明暗由系统决定，标题里带出当前结果
    title: t('app.themeAutoHint', { state: isDark.value ? t('app.themeDark') : t('app.themeLight') }),
  },
])

/** 顶部模块导航：有 path 的可跳转，没有的弹出占位说明 */
const topMenus = [
  { labelKey: 'app.navBasic', path: '/home' },
  { labelKey: 'app.navStudents', path: '/school/students' },
  { labelKey: 'app.navComponents', path: '/school/components' },
  { labelKey: 'app.navSmart', path: '', descriptionKey: 'app.navSmartDetail' },
]

// 侧栏菜单按当前语言生成，记录变更或切换语言都会重新渲染
const sideMenus = computed(() => buildSideMenus(t, te))

// 面包屑标题来自菜单数据，保证菜单改名时这里自动跟随
const breadcrumb = computed(() => {
  const info = routeInfo(route.path, {
    title: (route.meta.title as string | undefined) ?? t('menu.school-home'),
    section: (route.meta.section as string | undefined) ?? t('menu.school'),
  })
  return {
    section: translateOr(t, te, info.sectionKey, info.section),
    title: translateOr(t, te, info.titleKey, info.title),
  }
})

function go(path: string) {
  sidebarOpen.value = false
  if (path === route.path) return
  router.push(path)
}

/**
 * 侧栏点击：value 是已接入页面的路由地址，直接跳转；其余给出占位说明。
 * 菜单组件本身不认识路由，跳转由业务侧决定。
 */
function handleSideMenu(item: SideMenuItem) {
  sidebarOpen.value = false
  if (item.value) {
    go(item.value)
    return
  }
  showDetail(item.label, t('app.menuPending', { label: item.label }))
}

/** 顶部模块导航：无 path 的给出占位说明 */
function handleTopMenu(item: { labelKey: string; path: string; descriptionKey?: string }) {
  if (item.path) {
    go(item.path)
    return
  }
  showDetail(t(item.labelKey), item.descriptionKey ? t(item.descriptionKey) : '')
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <button class="mobile-menu" :aria-label="t('app.openMenu')" @click="sidebarOpen = true">
        <Menu :size="20" />
      </button>
      <div class="brand">
        <GraduationCap :size="35" :stroke-width="1.8" />
        <div><strong>{{ t('app.name') }}</strong><span>{{ t('app.slogan') }}</span></div>
      </div>
      <nav class="top-nav" :aria-label="t('app.modules')">
        <button v-for="item in topMenus" :key="item.labelKey" :class="{ active: item.path && route.path === item.path }"
          @click="handleTopMenu(item)">
          {{ t(item.labelKey) }}
        </button>
      </nav>
      <div class="top-actions">
        <div class="search-box">
          <Search :size="16" /><input v-model="searchKeyword" :aria-label="t('app.search')" :placeholder="t('app.search')" />
        </div>
        <div class="top-switch language-switch" :title="t('app.language')">
          <Languages :size="15" />
          <button v-for="item in languages" :key="item.value" type="button" :class="{ active: language === item.value }"
            :aria-pressed="language === item.value" @click="switchLanguage(item.value)">
            {{ item.short }}
          </button>
        </div>
        <div class="top-switch theme-switch" role="group" :aria-label="t('app.themeLabel')">
          <SunMoon :size="15" />
          <button v-for="mode in themeModes" :key="mode.value" type="button" :class="{ active: theme === mode.value }"
            :aria-pressed="theme === mode.value" :title="mode.title ?? mode.label" @click="setTheme(mode.value)">
            {{ mode.label }}
          </button>
        </div>
        <button class="notification" :aria-label="t('app.notification')"
          @click="showDetail(t('app.notification'), t('app.notificationDetail'))">
          <Bell :size="18" /><i></i>
        </button>
        <button class="profile" @click="showDetail(t('app.profile'), t('app.profileDetail'))">
          <span class="avatar">林</span><span>{{ t('app.profile') }}</span>
          <ChevronDown :size="13" />
        </button>
      </div>
    </header>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-scroll">
        <div class="sidebar-mobile-head">
          <b>{{ t('app.navTitle') }}</b>
          <button :aria-label="t('app.closeMenu')" @click="sidebarOpen = false">
            <X :size="20" />
          </button>
        </div>
        <div class="school-switch">
          <Building2 :size="18" /><span>{{ t('app.school') }}</span>
          <ChevronDown :size="12" />
        </div>
        <CaSideMenu :items="sideMenus" :model-value="route.path" :indent="20" :indent-step="20"
          :level-offset="[0, 0, -10]" @select="handleSideMenu" />
        <div class="sidebar-foot">
          <button @click="showDetail(t('app.help'), t('app.helpDetail'))">
            <Headphones :size="17" />{{ t('app.help') }}
          </button>
          <button @click="showDetail(t('app.settings'), t('app.settingsDetail'))">
            <Settings2 :size="17" />{{ t('app.settings') }}
          </button>
          <span class="version">{{ t('app.version') }}</span>
        </div>
      </div>
    </aside>
    <div v-if="sidebarOpen" class="backdrop" @click="sidebarOpen = false"></div>

    <main class="main-content">
      <div class="workspace">
        <div class="breadcrumb">
          <div>
            <MapPin :size="13" />
            <span>{{ t('app.breadcrumb') }}{{ breadcrumb.section }}
              <ChevronRight :size="11" /> <b>{{ breadcrumb.title }}</b>
            </span>
          </div>
          <span>{{ t('app.date') }} <small>{{ t('app.demo') }}</small></span>
        </div>

        <!-- hash 路由出口 -->
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>

        <footer class="page-footer">{{ t('app.footer') }}<span>{{ t('app.footerSlogan') }}</span></footer>
      </div>
    </main>

    <!-- 全局详情弹窗，各页面通过 showDetail() 复用 -->
    <DetailDialog :title="detail?.title" :description="detail?.description" @close="detail = null" />
  </div>
</template>
