<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  BookOpen, CalendarDays, ChevronRight, CircleDollarSign, ClipboardCheck, FileText,
  FolderUp, GraduationCap, MessageSquareText, MonitorSmartphone, Settings2,
  ShieldCheck, UserRound,
} from '@lucide/vue'
import { CaDailyAgenda, CaWeeklyTimetable } from '@campus-admin/ui'
import { useLocale } from '@campus-admin/core'
import DetailDialog from '../components/DetailDialog.vue'
import { detail, showDetail } from '../services/detail'

const { t } = useLocale()

const keyword = ref('')
const customizing = ref(false)
// 常用功能用词条键记录，切换语言后已选配置不变
const selectedShortcuts = ref([
  'page.home.shortcutAttendance',
  'page.home.shortcutStudent',
  'page.home.shortcutNotice',
  'page.home.shortcutCourse',
  'page.home.shortcutLeave',
  'page.home.shortcutDevice',
])
const draftShortcuts = ref<string[]>([])

const stats = [
  { labelKey: 'page.home.statApproval', value: '12', icon: ClipboardCheck, tone: 'orange' },
  { labelKey: 'page.home.statNotice', value: '36', icon: MessageSquareText, tone: 'red' },
  { labelKey: 'page.home.statDocument', value: '21', icon: FolderUp, tone: 'cyan' },
  { labelKey: 'page.home.statAgenda', value: '4', icon: CalendarDays, tone: 'blue' },
]
const shortcuts = [
  { labelKey: 'page.home.shortcutAttendance', icon: ClipboardCheck, tone: 'red' },
  { labelKey: 'page.home.shortcutStudent', icon: GraduationCap, tone: 'orange' },
  { labelKey: 'page.home.shortcutNotice', icon: MessageSquareText, tone: 'green' },
  { labelKey: 'page.home.shortcutCourse', icon: BookOpen, tone: 'amber' },
  { labelKey: 'page.home.shortcutLeave', icon: UserRound, tone: 'red' },
  { labelKey: 'page.home.shortcutDevice', icon: MonitorSmartphone, tone: 'blue' },
  { labelKey: 'page.home.shortcutPay', icon: CircleDollarSign, tone: 'cyan' },
  { labelKey: 'page.home.shortcutSetting', icon: Settings2, tone: 'blue' },
]
// 文件标题是演示数据，不参与国际化；类型标签走词条
const files = [
  { title: '关于开展新学期校园安全检查的通知', date: '09/11', tagKey: 'page.home.fileTagNotice', tone: 'blue', unread: true },
  { title: '2026 年秋季学期教育教学工作要点', date: '09/10', tagKey: 'page.home.fileTagDocument', tone: 'orange', unread: true },
  { title: '关于组织教师信息化教学培训的通知', date: '09/09', tagKey: 'page.home.fileTagNotice', tone: 'blue', unread: false },
]

const visibleShortcuts = computed(() => shortcuts.filter(item => selectedShortcuts.value.includes(item.labelKey)))

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
        <h1>{{ t('page.home.greeting') }}<span>{{ t('page.home.greetingHint') }}</span></h1>
        <p>{{ t('page.home.quote') }}</p>
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
          :key="stat.labelKey"
          @click="showDetail(t(stat.labelKey), t('page.home.statDetail', { value: stat.value, label: t(stat.labelKey) }))"
        >
          <span :class="['stat-icon', stat.tone]"><component :is="stat.icon" :size="18" /></span>
          <div><span>{{ t(stat.labelKey) }}</span><strong>{{ stat.value }}</strong></div>
        </button>
      </div>
    </section>

    <section class="guide-panel">
      <div>
        <h2>{{ t('page.home.guideTitle') }}</h2>
        <p>{{ t('page.home.guideSubtitle') }}</p>
        <button class="primary-button" @click="showDetail(t('page.home.guideTitle'), t('page.home.guideDetail'))">
          {{ t('page.home.guideButton') }}<ChevronRight :size="12" />
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
          <h3>{{ t('page.home.shortcutTitle') }}</h3>
          <button class="text-link" @click="openCustomize">{{ t('page.home.shortcutCustomize') }}<Settings2 :size="12" /></button>
        </div>
        <div class="shortcut-grid">
          <button v-for="item in visibleShortcuts" :key="item.labelKey" class="shortcut" @click="showDetail(t(item.labelKey), t('page.home.shortcutDetail', { label: t(item.labelKey) }))">
            <span :class="['shortcut-icon', item.tone]"><component :is="item.icon" :size="23" /></span>
            <span>{{ t(item.labelKey) }}</span>
          </button>
          <div v-if="!visibleShortcuts.length" class="shortcut-empty">{{ t('page.home.shortcutEmpty') }}</div>
        </div>
      </section>

      <CaWeeklyTimetable @detail="showDetail" />

      <section class="surface campus-overview">
        <div class="section-head"><h3>{{ t('page.home.overviewTitle') }}</h3><span class="subtle">{{ t('page.home.overviewSubtitle') }}</span></div>
        <div class="overview-stats">
          <div><span>{{ t('page.home.overviewStudents') }}</span><b>3,286<small>{{ t('page.home.overviewUnitPerson') }}</small></b></div>
          <div><span>{{ t('page.home.overviewStaff') }}</span><b>286<small>{{ t('page.home.overviewUnitPerson') }}</small></b></div>
          <div><span>{{ t('page.home.overviewRate') }}</span><b>97.8<small>%</small></b></div>
          <div><span>{{ t('page.home.overviewDevice') }}</span><b>222<small>/ 224</small></b></div>
        </div>
      </section>
    </div>

    <div class="secondary-column">
      <CaDailyAgenda :keyword="keyword" @detail="showDetail" />

      <section class="surface files-panel">
        <div class="section-head">
          <h3>{{ t('page.home.filesTitle') }}</h3>
          <button class="text-link" @click="showDetail(t('page.home.filesTitle'), t('page.home.filesMoreDetail'))">{{ t('page.home.filesMore') }}<ChevronRight :size="12" /></button>
        </div>
        <button v-for="file in files" :key="file.title" class="file-item" @click="showDetail(file.title, t('page.home.filesDetail', { date: file.date }))">
          <span :class="['file-icon', file.tone]"><FileText :size="17" /></span>
          <div><b>{{ file.title }}</b><small>{{ t(file.tagKey) }}<span>2026/{{ file.date }}</span></small></div>
          <i v-if="file.unread"></i>
        </button>
      </section>

      <div class="service-note"><ShieldCheck :size="15" /><span>{{ t('page.home.serviceNote') }}</span></div>
    </div>
  </div>

  <DetailDialog
    :title="customizing ? undefined : detail?.title"
    :description="detail?.description"
    :customizing="customizing"
    :title-when-customizing="t('page.home.customizeTitle')"
    @close="customizing = false; detail = null"
  >
    <template v-if="customizing">
      <p>{{ t('page.home.customizeDescription') }}</p>
      <div class="shortcut-options">
        <label v-for="item in shortcuts" :key="item.labelKey">
          <input v-model="draftShortcuts" type="checkbox" :value="item.labelKey" :disabled="draftShortcuts.length >= 6 && !draftShortcuts.includes(item.labelKey)" />
          <component :is="item.icon" :size="18" />{{ t(item.labelKey) }}
        </label>
      </div>
      <footer>
        <button @click="customizing = false">{{ t('page.home.cancel') }}</button>
        <button class="primary-button" @click="saveShortcuts">{{ t('page.home.save') }}</button>
      </footer>
    </template>
  </DetailDialog>
</template>
