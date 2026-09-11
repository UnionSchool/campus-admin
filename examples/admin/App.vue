<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bell, Building2, ChevronDown, ChevronRight, GraduationCap, Headphones, MapPin,
  Menu, Search, Settings2, X,
} from '@lucide/vue'
import { CaSideMenu } from '@unionschool/campus-ui'
import type { SideMenuItem } from '@unionschool/campus-ui'
import DetailDialog from './src/components/DetailDialog.vue'
import { sideMenus } from './src/router'
import { routeInfo } from './src/router'
import { detail, showDetail } from './src/services/detail'

const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const searchKeyword = ref('')

/** 顶部模块导航：有 path 的可跳转，没有的弹出占位说明 */
const topMenus = [
  { label: '基础应用', path: '/home' },
  { label: '学生管理', path: '/school/students' },
  { label: '组件总览', path: '/school/components' },
  { label: '智能排课', path: '', description: '自动排课与调课功能待接入，可先在首页查看个人和班级课表。' },
]

// 面包屑标题来自菜单数据，保证菜单改名时这里自动跟随
const breadcrumb = computed(() => routeInfo(route.path, {
  title: (route.meta.title as string | undefined) ?? '我的首页',
  section: (route.meta.section as string | undefined) ?? '基础应用',
}))

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
  showDetail(item.label, `${item.label}业务页面尚未接入。可先查看「学生管理」与「组件总览」两个已完成页面。`)
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <button class="mobile-menu" aria-label="打开菜单" @click="sidebarOpen = true">
        <Menu :size="20" />
      </button>
      <div class="brand">
        <GraduationCap :size="35" :stroke-width="1.8" />
        <div><strong>众校通智慧校园</strong><span>Intelligent campus management system</span></div>
      </div>
      <nav class="top-nav" aria-label="全局模块">
        <button v-for="item in topMenus" :key="item.label" :class="{ active: item.path && route.path === item.path }"
          @click="item.path ? go(item.path) : showDetail(item.label, item.description ?? '')">
          {{ item.label }}
        </button>
      </nav>
      <div class="top-actions">
        <div class="search-box">
          <Search :size="16" /><input v-model="searchKeyword" aria-label="搜索日程" placeholder="搜索日程" />
        </div>
        <button class="notification" aria-label="消息通知"
          @click="showDetail('消息通知', '您有 36 条演示消息，其中包含校园公告、请假审批提醒和设备巡检通知。')">
          <Bell :size="18" /><i></i>
        </button>
        <button class="profile" @click="showDetail('林老师', '众校通实验中学 · 学校管理员。当前展示教师工作台视图。')">
          <span class="avatar">林</span><span>林老师</span>
          <ChevronDown :size="13" />
        </button>
      </div>
    </header>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-scroll">
        <div class="sidebar-mobile-head">
          <b>功能导航</b>
          <button aria-label="关闭菜单" @click="sidebarOpen = false">
            <X :size="20" />
          </button>
        </div>
        <div class="school-switch">
          <Building2 :size="18" /><span>众校通实验中学</span>
          <ChevronDown :size="12" />
        </div>
        <CaSideMenu :items="sideMenus" :model-value="route.path" :indent="2" :indent-step="32"
          :level-offset="[0, 0, -10]" @select="handleSideMenu" />
        <div class="sidebar-foot">
          <button @click="showDetail('使用帮助', '首页支持常用功能自定义、个人与班级课表切换、按周查看课程、按日期查看日程及详情。')">
            <Headphones :size="17" />帮助与服务
          </button>
          <button @click="showDetail('系统设置', '系统设置业务页面尚未接入。')">
            <Settings2 :size="17" />系统设置
          </button>
          <span class="version">众校通 · 让校园管理更简单</span>
        </div>
      </div>
    </aside>
    <div v-if="sidebarOpen" class="backdrop" @click="sidebarOpen = false"></div>

    <main class="main-content">
      <div class="workspace">
        <div class="breadcrumb">
          <div>
            <MapPin :size="13" />
            <span>当前位置：{{ breadcrumb.section }}
              <ChevronRight :size="11" /> <b>{{ breadcrumb.title }}</b>
            </span>
          </div>
          <span>2026 年 9 月 11 日 · 星期五 <small>演示</small></span>
        </div>

        <!-- hash 路由出口 -->
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>

        <footer class="page-footer">众校通智慧校园<span>连接每一份成长</span></footer>
      </div>
    </main>

    <!-- 全局详情弹窗，各页面通过 showDetail() 复用 -->
    <DetailDialog :title="detail?.title" :description="detail?.description" @close="detail = null" />
  </div>
</template>
