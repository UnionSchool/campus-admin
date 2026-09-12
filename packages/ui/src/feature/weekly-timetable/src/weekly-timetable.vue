<!--
 * 课程表：支持个人课表与班级课表切换、按周浏览、点击课程查看详情。
 *
 * 用法：
 *   <CaWeeklyTimetable @detail="openDetail" />
 *
 * 事件：detail(title, description)
 * 逻辑：createDays、formatWeekRange、lessonForClass、findLesson、describeLesson、timetablePeriods
 *
 * 数据说明：当前为演示数据，真实项目需要把课表数据改为通过 Props 注入。
 * 颜色全部走 Token，自动支持暗色主题与自定义品牌色。
-->

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { computed, ref } from 'vue'
import { ns, cx } from '@/core/namespace'
import { useLocale } from '@campus-admin/locale'
import {
  CLASS_OPTIONS,
  createDays,
  describeLesson,
  findLesson,
  formatWeekRange,
  lessonForClass,
  timetablePeriods,
} from './core'
import type { Lesson, TimetableMode } from './core'
import { demoLessons } from './data'

defineOptions({ name: 'CaWeeklyTimetable' })

const { locale, t } = useLocale()

const emit = defineEmits<{ detail: [title: string, description: string] }>()

const mode = ref<TimetableMode>('personal')
const selectedClass = ref(CLASS_OPTIONS[0] as string)
const weekOffset = ref(0)
const days = computed(() => createDays(weekOffset.value, locale.value))
const range = computed(() => formatWeekRange(days.value))

function lessonAt(row: number, day: number): Lesson | undefined {
  if (weekOffset.value !== 0 || day > 4) return undefined
  if (mode.value === 'personal') return findLesson(demoLessons, row, day)
  return lessonForClass(row, day, selectedClass.value)
}

function openLesson(row: number, day: number) {
  const lesson = lessonAt(row, day)
  const period = timetablePeriods[row]
  const cell = days.value[day]
  if (!lesson || !period || !cell) return
  emit(
    'detail',
    `${lesson.className} · ${lesson.subject}`,
    describeLesson(lesson, cell.date, period, locale.value, t),
  )
}
</script>

<template>
  <section :class="ns('timetable')">
    <div :class="ns('timetable', 'toolbar')">
      <div :class="ns('timetable', 'tabs')" role="tablist" :aria-label="t('ca.timetable.tabsLabel')">
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'personal'"
          :class="cx(ns('timetable', 'tab'), mode === 'personal' ? ns('timetable', 'tab', 'active') : '')"
          @click="mode = 'personal'"
        >{{ t('ca.timetable.personal') }}</button>
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'class'"
          :class="cx(ns('timetable', 'tab'), mode === 'class' ? ns('timetable', 'tab', 'active') : '')"
          @click="mode = 'class'"
        >{{ t('ca.timetable.class') }}</button>
      </div>

      <div :class="ns('timetable', 'week')">
        <button :class="ns('timetable', 'nav')" type="button" :aria-label="t('ca.timetable.prevWeek')" @click="weekOffset--"><ChevronLeft :size="15" /></button>
        <span>{{ t('ca.timetable.week', { week: 2 + weekOffset }) }} <b>{{ range }}</b></span>
        <button :class="ns('timetable', 'nav')" type="button" :aria-label="t('ca.timetable.nextWeek')" @click="weekOffset++"><ChevronRight :size="15" /></button>
        <button :class="ns('timetable', 'today')" type="button" @click="weekOffset = 0">{{ t('ca.timetable.thisWeek') }}</button>
      </div>
    </div>

    <div :class="ns('timetable', 'meta')">
      <span>
        {{ mode === 'personal' ? t('ca.timetable.personalSubtitle') : t('ca.timetable.classSubtitle') }}
        <i :class="ns('timetable', 'divider')"></i>
        {{ t('ca.timetable.term') }}
      </span>
      <select v-if="mode === 'class'" v-model="selectedClass" :class="ns('timetable', 'select')" :aria-label="t('ca.timetable.classLabel')">
        <option v-for="item in CLASS_OPTIONS" :key="item">{{ item }}</option>
      </select>
      <span v-else :class="ns('timetable', 'count')">{{ t('ca.timetable.weekCount', { count: 11 }) }}</span>
    </div>

    <div :class="ns('timetable', 'scroll')">
      <table :class="ns('timetable', 'table')">
        <caption class="ca-sr-only">{{ t('ca.timetable.caption', { range }) }}</caption>
        <!-- 列宽用 colgroup 声明：表头首格是 colspan=2，靠 nth-child 定宽会把两列挤在一起 -->
        <colgroup>
          <col :class="ns('timetable', 'col', 'group')" />
          <col :class="ns('timetable', 'col', 'period')" />
          <col v-for="day in days" :key="day.date.toISOString()" :class="ns('timetable', 'col', 'day')" />
        </colgroup>
        <thead>
          <tr>
            <!-- 跨分组 + 节次两列，在整个左侧区域内左右居中 -->
            <th colspan="2" :class="ns('timetable', 'period-head')">{{ t('ca.timetable.periodHeader') }}</th>
            <th
              v-for="day in days"
              :key="day.date.toISOString()"
              :class="cx(ns('timetable', 'day'), day.today ? ns('timetable', 'day', 'today') : '')"
            >
              <span>{{ day.label }}</span><b>{{ day.date.getDate().toString().padStart(2, '0') }}</b>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(period, row) in timetablePeriods"
            :key="period.time"
            :class="row === 5 ? ns('timetable', 'row', 'afternoon') : ''"
          >
            <th v-if="period.group" :rowspan="row === 0 ? 1 : row === 1 ? 4 : 3" :class="ns('timetable', 'group')">{{ period.group }}</th>
            <th :class="ns('timetable', 'period')">
              <span>{{ period.label }}</span><small>{{ period.time }}</small>
            </th>
            <td
              v-for="(day, index) in days"
              :key="day.label"
              :class="cx(
                ns('timetable', 'cell'),
                index > 4 ? ns('timetable', 'cell', 'weekend') : '',
                day.today ? ns('timetable', 'cell', 'today') : '',
              )"
            >
              <button
                v-if="lessonAt(row, index)"
                type="button"
                :class="cx(ns('timetable', 'lesson'), ns('timetable', 'lesson', lessonAt(row, index)?.tone as string))"
                @click="openLesson(row, index)"
              >
                <b>{{ lessonAt(row, index)?.className }}</b>
                <span>{{ lessonAt(row, index)?.subject }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div :class="ns('timetable', 'footer')">
      <!-- 图例是演示班级，与左上角的班级下拉一致，属于演示数据 -->
      <span>
        <i :class="cx(ns('timetable', 'legend'), ns('timetable', 'legend', 'blue'))"></i>高一（2）班
        <i :class="cx(ns('timetable', 'legend'), ns('timetable', 'legend', 'green'))"></i>高一（1）班
        <i :class="cx(ns('timetable', 'legend'), ns('timetable', 'legend', 'orange'))"></i>高一（3）班
      </span>
      <span>{{ t('ca.timetable.hint') }}</span>
    </div>
  </section>
</template>

<style src="../style/index.css"></style>
