<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  BookOpen, CalendarDays, ChevronRight, CircleDollarSign, ClipboardCheck, FileText,
  FolderUp, GraduationCap, MessageSquareText, MonitorSmartphone, Settings2,
  ShieldCheck, UserRound,
} from '@lucide/vue'
import { CaDailyAgenda, CaWeeklyTimetable } from '@unionschool/campus-ui'
import DetailDialog from '../components/DetailDialog.vue'
import { detail, showDetail } from '../services/detail'

const keyword = ref('')
const customizing = ref(false)
const selectedShortcuts = ref(['考勤统计', '学生档案', '通知公告', '课程管理', '请假审批', '设备巡检'])
const draftShortcuts = ref<string[]>([])

const stats = [
  { label: '审批事项', value: '12', icon: ClipboardCheck, tone: 'orange' },
  { label: '消息通知', value: '36', icon: MessageSquareText, tone: 'red' },
  { label: '上级文件', value: '21', icon: FolderUp, tone: 'cyan' },
  { label: '今日日程', value: '4', icon: CalendarDays, tone: 'blue' },
]
const shortcuts = [
  { label: '考勤统计', icon: ClipboardCheck, tone: 'red' }, { label: '学生档案', icon: GraduationCap, tone: 'orange' },
  { label: '通知公告', icon: MessageSquareText, tone: 'green' }, { label: '课程管理', icon: BookOpen, tone: 'amber' },
  { label: '请假审批', icon: UserRound, tone: 'red' }, { label: '设备巡检', icon: MonitorSmartphone, tone: 'blue' },
  { label: '校园缴费', icon: CircleDollarSign, tone: 'cyan' }, { label: '系统设置', icon: Settings2, tone: 'blue' },
]
const files = [
  { title: '关于开展新学期校园安全检查的通知', date: '09/11', tag: '通知', tone: 'blue', unread: true },
  { title: '2026 年秋季学期教育教学工作要点', date: '09/10', tag: '文件', tone: 'orange', unread: true },
  { title: '关于组织教师信息化教学培训的通知', date: '09/09', tag: '通知', tone: 'blue', unread: false },
]

const visibleShortcuts = computed(() => shortcuts.filter(item => selectedShortcuts.value.includes(item.label)))

function openCustomize() {
  draftShortcuts.value = [...selectedShortcuts.value]
  customizing.value = true
}

function saveShortcuts() {
  selectedShortcuts.value = [...draftShortcuts.value]
  customizing.value = false
}
</script>

<template>
  <div class="home-grid">
    <section class="welcome-panel">
      <div class="welcome-copy">
        <h1>上午好，林老师<span>欢迎回到您的工作台</span></h1>
        <p>在学生从幼稚走向成熟的路上，您用生命的火炬，为我们开道。</p>
      </div>
      <div class="book-art" aria-hidden="true">
        <div class="book-shadow"></div>
        <div class="book-pages left-page"><i></i><i></i><i></i><i></i></div>
        <div class="book-pages right-page"><i></i><i></i><i></i><i></i></div>
        <span class="book-spark one"></span><span class="book-spark two"></span>
      </div>
      <div class="summary-stats">
        <button
          v-for="stat in stats"
          :key="stat.label"
          @click="showDetail(stat.label, '当前有 ' + stat.value + ' 项' + stat.label + '。此处展示演示统计，具体记录以接入业务系统后的数据为准。')"
        >
          <span :class="['stat-icon', stat.tone]"><component :is="stat.icon" :size="18" /></span>
          <div><span>{{ stat.label }}</span><strong>{{ stat.value }}</strong></div>
        </button>
      </div>
    </section>

    <section class="guide-panel">
      <div>
        <h2>欢迎使用智慧校园</h2>
        <p>更方便、更智能、更贴心</p>
        <button class="primary-button" @click="showDetail('工作台使用指南', '常用功能：点击“自定义”配置您的高频入口。课表：切换个人或班级视图，点击课程查看详情。日程：选择日期查看当天安排，使用箭头切换周次。')">
          查看指引手册<ChevronRight :size="12" />
        </button>
      </div>
      <div class="guide-art" aria-hidden="true">
        <div class="guide-orbit"></div>
        <div class="mini-screen"><div><i></i><i></i><i></i></div><span></span><b></b><em></em></div>
        <div class="guide-person"><UserRound :size="37" /></div>
        <div class="guide-bubble"><MessageSquareText :size="19" /></div>
      </div>
    </section>

    <div class="primary-column">
      <section class="surface shortcut-section">
        <div class="section-head">
          <h3>常用功能</h3>
          <button class="text-link" @click="openCustomize">自定义<Settings2 :size="12" /></button>
        </div>
        <div class="shortcut-grid">
          <button v-for="item in visibleShortcuts" :key="item.label" class="shortcut" @click="showDetail(item.label, item.label + '业务入口待接入，您可以通过“自定义”调整此处的常用功能。')">
            <span :class="['shortcut-icon', item.tone]"><component :is="item.icon" :size="23" /></span>
            <span>{{ item.label }}</span>
          </button>
          <div v-if="!visibleShortcuts.length" class="shortcut-empty">尚未设置常用功能，请点击“自定义”添加。</div>
        </div>
      </section>

      <CaWeeklyTimetable @detail="showDetail" />

      <section class="surface campus-overview">
        <div class="section-head"><h3>校园概况</h3><span class="subtle">今日数据 · 演示</span></div>
        <div class="overview-stats">
          <div><span>在校学生</span><b>3,286<small>人</small></b></div>
          <div><span>教职工</span><b>286<small>人</small></b></div>
          <div><span>今日到校率</span><b>97.8<small>%</small></b></div>
          <div><span>设备在线</span><b>222<small>/ 224</small></b></div>
        </div>
      </section>
    </div>

    <div class="secondary-column">
      <CaDailyAgenda :keyword="keyword" @detail="showDetail" />

      <section class="surface files-panel">
        <div class="section-head">
          <h3>上级文件</h3>
          <button class="text-link" @click="showDetail('上级文件', '共有 21 份演示文件，首页展示最近 3 份。文档预览和下载将在接入业务接口后提供。')">更多<ChevronRight :size="12" /></button>
        </div>
        <button v-for="file in files" :key="file.title" class="file-item" @click="showDetail(file.title, '发布时间：2026/' + file.date + '。本条为演示文件，尚未关联可下载的附件。')">
          <span :class="['file-icon', file.tone]"><FileText :size="17" /></span>
          <div><b>{{ file.title }}</b><small>{{ file.tag }}<span>2026/{{ file.date }}</span></small></div>
          <i v-if="file.unread"></i>
        </button>
      </section>

      <div class="service-note"><ShieldCheck :size="15" /><span>统一身份认证 · 校园数据安全守护</span></div>
    </div>
  </div>

  <DetailDialog
    :title="customizing ? undefined : detail?.title"
    :description="detail?.description"
    :customizing="customizing"
    title-when-customizing="自定义常用功能"
    @close="customizing = false; detail = null"
  >
    <template v-if="customizing">
      <p>选择要在首页显示的功能，最多 6 项。</p>
      <div class="shortcut-options">
        <label v-for="item in shortcuts" :key="item.label">
          <input v-model="draftShortcuts" type="checkbox" :value="item.label" :disabled="draftShortcuts.length >= 6 && !draftShortcuts.includes(item.label)" />
          <component :is="item.icon" :size="18" />{{ item.label }}
        </label>
      </div>
      <footer>
        <button @click="customizing = false">取消</button>
        <button class="primary-button" @click="saveShortcuts">保存设置</button>
      </footer>
    </template>
  </DetailDialog>
</template>
