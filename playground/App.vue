<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Bell, BookOpen, Building2, CalendarDays, ChevronDown, ChevronRight, CircleDollarSign, ClipboardCheck, FileText, FolderUp, GraduationCap, Headphones, LayoutDashboard, MapPin, Menu, MessageSquareText, MonitorSmartphone, Search, Settings2, ShieldCheck, UserRound, UsersRound, Utensils, WalletCards, X } from '@lucide/vue'
import WeeklyTimetable from '../src/components/WeeklyTimetable.vue'
import DailyAgenda from '../src/components/DailyAgenda.vue'

const sidebarOpen = ref(false)
const keyword = ref('')
const dialog = ref<{ title: string; description: string } | null>(null)
const customizing = ref(false)
const selectedShortcuts = ref(['考勤统计', '学生档案', '通知公告', '课程管理', '请假审批', '设备巡检'])
const draftShortcuts = ref<string[]>([])
let previousFocus: HTMLElement | null = null
const menus = [
  { label: '我的首页', icon: LayoutDashboard, badge: '' }, { label: '组织与人员', icon: UsersRound, badge: '' },
  { label: '学生管理', icon: GraduationCap, badge: '' }, { label: '教职工管理', icon: UserRound, badge: '' },
  { label: '教学教务', icon: BookOpen, badge: '' }, { label: '考勤管理', icon: ClipboardCheck, badge: '4' },
  { label: '校园一卡通', icon: WalletCards, badge: '' }, { label: '智慧食堂', icon: Utensils, badge: '' },
  { label: '校园安全', icon: ShieldCheck, badge: '2' }, { label: '设备中心', icon: MonitorSmartphone, badge: '' },
  { label: '日程管理', icon: CalendarDays, badge: '' },
]
const shortcuts = [
  { label: '考勤统计', icon: ClipboardCheck, tone: 'red' }, { label: '学生档案', icon: GraduationCap, tone: 'orange' },
  { label: '通知公告', icon: MessageSquareText, tone: 'green' }, { label: '课程管理', icon: BookOpen, tone: 'amber' },
  { label: '请假审批', icon: UserRound, tone: 'red' }, { label: '设备巡检', icon: MonitorSmartphone, tone: 'blue' },
  { label: '校园缴费', icon: CircleDollarSign, tone: 'cyan' }, { label: '系统设置', icon: Settings2, tone: 'blue' },
]
const visibleShortcuts = computed(() => shortcuts.filter(item => selectedShortcuts.value.includes(item.label)))
const stats = [
  { label: '审批事项', value: '12', icon: ClipboardCheck, tone: 'orange' },
  { label: '消息通知', value: '36', icon: MessageSquareText, tone: 'red' },
  { label: '上级文件', value: '21', icon: FolderUp, tone: 'cyan' },
  { label: '今日日程', value: '4', icon: CalendarDays, tone: 'blue' },
]
const files = [
  { title: '关于开展新学期校园安全检查的通知', date: '09/11', tag: '通知', tone: 'blue', unread: true },
  { title: '2026 年秋季学期教育教学工作要点', date: '09/10', tag: '文件', tone: 'orange', unread: true },
  { title: '关于组织教师信息化教学培训的通知', date: '09/09', tag: '通知', tone: 'blue', unread: false },
]
function showDetail(title: string, description: string) {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  dialog.value = { title, description }
}
function closeDialog() { dialog.value = null; customizing.value = false; previousFocus?.focus() }
function selectMenu(label: string) {
  if (label !== '我的首页') showDetail(label, label + '业务页面尚未接入。本次优化展示首页布局与交互，实际业务入口可在后续连接对应页面和接口。')
  sidebarOpen.value = false
}
function openCustomize() {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  draftShortcuts.value = [...selectedShortcuts.value]
  customizing.value = true
}
function saveShortcuts() { selectedShortcuts.value = [...draftShortcuts.value]; closeDialog() }
function handleKey(event: KeyboardEvent) {
  if (event.key === 'Escape') { closeDialog(); sidebarOpen.value = false }
  if (event.key !== 'Tab' || (!dialog.value && !customizing.value)) return
  const elements = [...document.querySelectorAll<HTMLElement>('.dialog button:not(:disabled), .dialog input:not(:disabled)')]
  const first = elements[0], last = elements[elements.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
document.addEventListener('keydown', handleKey)
onBeforeUnmount(() => document.removeEventListener('keydown', handleKey))
function focusDialog(element: unknown) { if (element instanceof HTMLElement) element.focus() }
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <button class="mobile-menu" aria-label="打开菜单" @click="sidebarOpen = true"><Menu :size="20" /></button>
      <div class="brand"><GraduationCap :size="35" :stroke-width="1.8" /><div><strong>众校通智慧校园</strong><span>Intelligent campus management system</span></div></div>
      <nav class="top-nav" aria-label="全局模块"><button class="active">基础应用</button><button @click="showDetail('智能排课', '自动排课与调课功能待接入，可先在首页查看个人和班级课表。')">智能排课</button><button @click="selectMenu('学生管理')">学生生态</button><button @click="showDetail('数据中心', '数据中心业务页面待接入。')">数据中心</button></nav>
      <div class="top-actions"><div class="search-box"><Search :size="16" /><input v-model="keyword" aria-label="搜索日程" placeholder="搜索日程" /></div><button class="notification" aria-label="消息通知" @click="showDetail('消息通知', '您有 36 条演示消息，其中包含校园公告、请假审批提醒和设备巡检通知。')"><Bell :size="18" /><i></i></button><button class="profile" @click="showDetail('林老师', '众校通实验中学 · 学校管理员。当前展示教师工作台视图。')"><span class="avatar">林</span><span>林老师</span><ChevronDown :size="13" /></button></div>
    </header>
    <aside class="sidebar" :class="{ open: sidebarOpen }"><div class="sidebar-mobile-head"><b>功能导航</b><button aria-label="关闭菜单" @click="sidebarOpen = false"><X :size="20" /></button></div><div class="school-switch"><Building2 :size="18" /><span>众校通实验中学</span><ChevronDown :size="12" /></div><nav class="side-nav" aria-label="学校管理"><button v-for="item in menus" :key="item.label" :class="{ active: item.label === '我的首页' }" @click="selectMenu(item.label)"><component :is="item.icon" :size="17" /><span>{{ item.label }}</span><em v-if="item.badge">{{ item.badge }}</em></button></nav><div class="sidebar-foot"><button @click="showDetail('使用帮助', '首页支持常用功能自定义、个人与班级课表切换、按周查看课程、按日期查看日程及详情。')"><Headphones :size="17" />帮助与服务</button><button @click="selectMenu('系统设置')"><Settings2 :size="17" />系统设置</button><span class="version">众校通 · 让校园管理更简单</span></div></aside>
    <div v-if="sidebarOpen" class="backdrop" @click="sidebarOpen = false"></div>

    <main class="main-content"><div class="workspace"><div class="breadcrumb"><div><MapPin :size="13" /><span>当前位置：基础应用 <ChevronRight :size="11" /> <b>我的首页</b></span></div><span>2026 年 9 月 11 日 · 星期五 <small>演示</small></span></div>
      <div class="home-grid">
        <section class="welcome-panel"><div class="welcome-copy"><h1>上午好，林老师<span>欢迎回到您的工作台</span></h1><p>在学生从幼稚走向成熟的路上，您用生命的火炬，为我们开道。</p></div><div class="book-art" aria-hidden="true"><div class="book-shadow"></div><div class="book-pages left-page"><i></i><i></i><i></i><i></i></div><div class="book-pages right-page"><i></i><i></i><i></i><i></i></div><span class="book-spark one"></span><span class="book-spark two"></span></div><div class="summary-stats"><button v-for="stat in stats" :key="stat.label" @click="showDetail(stat.label, '当前有 ' + stat.value + ' 项' + stat.label + '。此处展示演示统计，具体记录以接入业务系统后的数据为准。')"><span :class="['stat-icon', stat.tone]"><component :is="stat.icon" :size="18" /></span><div><span>{{ stat.label }}</span><strong>{{ stat.value }}</strong></div></button></div></section>
        <section class="guide-panel"><div><h2>欢迎使用智慧校园</h2><p>更方便、更智能、更贴心</p><button class="primary-button" @click="showDetail('工作台使用指南', '常用功能：点击“自定义”配置您的高频入口。课表：切换个人或班级视图，点击课程查看详情。日程：选择日期查看当天安排，使用箭头切换周次。')">查看指引手册<ChevronRight :size="12" /></button></div><div class="guide-art" aria-hidden="true"><div class="guide-orbit"></div><div class="mini-screen"><div><i></i><i></i><i></i></div><span></span><b></b><em></em></div><div class="guide-person"><UserRound :size="37" /></div><div class="guide-bubble"><MessageSquareText :size="19" /></div></div></section>
        <div class="primary-column"><section class="surface shortcut-section"><div class="section-head"><h3>常用功能</h3><button class="text-link" @click="openCustomize">自定义<Settings2 :size="12" /></button></div><div class="shortcut-grid"><button v-for="item in visibleShortcuts" :key="item.label" class="shortcut" @click="showDetail(item.label, item.label + '业务入口待接入，您可以通过“自定义”调整此处的常用功能。')"><span :class="['shortcut-icon', item.tone]"><component :is="item.icon" :size="23" /></span><span>{{ item.label }}</span></button><div v-if="!visibleShortcuts.length" class="shortcut-empty">尚未设置常用功能，请点击“自定义”添加。</div></div></section>
          <WeeklyTimetable @detail="showDetail" />
          <section class="surface campus-overview"><div class="section-head"><h3>校园概况</h3><span class="subtle">今日数据 · 演示</span></div><div class="overview-stats"><div><span>在校学生</span><b>3,286<small>人</small></b></div><div><span>教职工</span><b>286<small>人</small></b></div><div><span>今日到校率</span><b>97.8<small>%</small></b></div><div><span>设备在线</span><b>222<small>/ 224</small></b></div></div></section>
        </div>
        <div class="secondary-column"><DailyAgenda :keyword="keyword" @detail="showDetail" /><section class="surface files-panel"><div class="section-head"><h3>上级文件</h3><button class="text-link" @click="showDetail('上级文件', '共有 21 份演示文件，首页展示最近 3 份。文档预览和下载将在接入业务接口后提供。')">更多<ChevronRight :size="12" /></button></div><button v-for="file in files" :key="file.title" class="file-item" @click="showDetail(file.title, '发布时间：2026/' + file.date + '。本条为演示文件，尚未关联可下载的附件。')"><span :class="['file-icon', file.tone]"><FileText :size="17" /></span><div><b>{{ file.title }}</b><small>{{ file.tag }}<span>2026/{{ file.date }}</span></small></div><i v-if="file.unread"></i></button></section><div class="service-note"><ShieldCheck :size="15" /><span>统一身份认证 · 校园数据安全守护</span></div></div>
      </div><footer class="page-footer">众校通智慧校园<span>连接每一份成长</span></footer></div>
    </main>
    <div v-if="dialog || customizing" class="modal-backdrop" @click.self="closeDialog"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header><h2 id="dialog-title">{{ customizing ? '自定义常用功能' : dialog?.title }}</h2><button :ref="focusDialog" aria-label="关闭详情" @click="closeDialog"><X :size="20" /></button></header><template v-if="customizing"><p>选择要在首页显示的功能，最多 6 项。</p><div class="shortcut-options"><label v-for="item in shortcuts" :key="item.label"><input v-model="draftShortcuts" type="checkbox" :value="item.label" :disabled="draftShortcuts.length >= 6 && !draftShortcuts.includes(item.label)" /><component :is="item.icon" :size="18" />{{ item.label }}</label></div><footer><button @click="closeDialog">取消</button><button class="primary-button" @click="saveShortcuts">保存设置</button></footer></template><template v-else><p>{{ dialog?.description }}</p><footer><button class="primary-button" @click="closeDialog">我知道了</button></footer></template></section></div>
  </div>
</template>
