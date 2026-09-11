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
import { computed, ref } from '@unionschool/campus-framework'
import { ns, cx } from '@/core/namespace'
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

const emit = defineEmits<{ detail: [title: string, description: string] }>()

const mode = ref<TimetableMode>('personal')
const selectedClass = ref(CLASS_OPTIONS[0] as string)
const weekOffset = ref(0)
const days = computed(() => createDays(weekOffset.value))
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
  emit('detail', `${lesson.className} · ${lesson.subject}`, describeLesson(lesson, cell.date, period))
}
</script>

<template>
  <section :class="ns('timetable')">
    <div :class="ns('timetable', 'toolbar')">
      <div :class="ns('timetable', 'tabs')" role="tablist" aria-label="课表类型">
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'personal'"
          :class="cx(ns('timetable', 'tab'), mode === 'personal' ? ns('timetable', 'tab', 'active') : '')"
          @click="mode = 'personal'"
        >个人课表</button>
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'class'"
          :class="cx(ns('timetable', 'tab'), mode === 'class' ? ns('timetable', 'tab', 'active') : '')"
          @click="mode = 'class'"
        >班级课表</button>
      </div>

      <div :class="ns('timetable', 'week')">
        <button :class="ns('timetable', 'nav')" type="button" aria-label="上一周" @click="weekOffset--"><ChevronLeft :size="15" /></button>
        <span>第 {{ 2 + weekOffset }} 周 <b>{{ range }}</b></span>
        <button :class="ns('timetable', 'nav')" type="button" aria-label="下一周" @click="weekOffset++"><ChevronRight :size="15" /></button>
        <button :class="ns('timetable', 'today')" type="button" @click="weekOffset = 0">本周</button>
      </div>
    </div>

    <div :class="ns('timetable', 'meta')">
      <span>
        {{ mode === 'personal' ? '林老师 · 语文' : '班级教学安排' }}
        <i :class="ns('timetable', 'divider')"></i>
        2026–2027 学年 · 第一学期
      </span>
      <select v-if="mode === 'class'" v-model="selectedClass" :class="ns('timetable', 'select')" aria-label="选择班级">
        <option v-for="item in CLASS_OPTIONS" :key="item">{{ item }}</option>
      </select>
      <span v-else :class="ns('timetable', 'count')">本周 <b>11</b> 节课</span>
    </div>

    <div :class="ns('timetable', 'scroll')">
      <table :class="ns('timetable', 'table')">
        <caption class="ca-sr-only">{{ range }} 教学课表</caption>
        <thead>
          <tr>
            <th colspan="2">时段 / 节次</th>
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
      <span>
        <i :class="cx(ns('timetable', 'legend'), ns('timetable', 'legend', 'blue'))"></i>高一（2）班
        <i :class="cx(ns('timetable', 'legend'), ns('timetable', 'legend', 'green'))"></i>高一（1）班
        <i :class="cx(ns('timetable', 'legend'), ns('timetable', 'legend', 'orange'))"></i>高一（3）班
      </span>
      <span>点击课程查看详情</span>
    </div>
  </section>
</template>

<style src="../style/index.css"></style>
