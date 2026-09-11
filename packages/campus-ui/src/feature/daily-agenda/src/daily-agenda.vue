<!--
 * 日程安排：按日期查看当天日程，支持按周切换与关键词过滤。
 *
 * 用法：
 *   <CaDailyAgenda :keyword="keyword" @detail="openDetail" />
 *
 * Props：keyword 过滤关键词
 * 事件：detail(title, description)
 * 逻辑：createWeekDates、filterAgenda、moveWeek、formatAgendaDate、describeAgendaItem
-->

<script setup lang="ts">
import { CalendarDays, ChevronLeft, ChevronRight } from '@lucide/vue'
// 只依赖 framework 适配层与纯逻辑 core，不直接依赖 Vue
import { computed, ref } from '@unionschool/campus-framework'
import {
  createWeekDates,
  describeAgendaItem,
  filterAgenda,
  formatAgendaDate,
  moveWeek,
} from './core'
import { demoAgendaItems } from './data'

defineOptions({ name: 'CaDailyAgenda' })

const props = withDefaults(defineProps<{ keyword?: string }>(), { keyword: '' })
const emit = defineEmits<{ detail: [title: string, description: string] }>()

const selectedDay = ref(11)
const offset = ref(0)
const cells = computed(() => createWeekDates(offset.value))
const visibleItems = computed(() => filterAgenda(demoAgendaItems, selectedDay.value, props.keyword))
const selectedDate = computed(() => new Date(2026, 8, selectedDay.value))
const monthLabel = computed(() => formatAgendaDate(selectedDate.value))

function selectCell(cell: { date: Date }) {
  selectedDay.value = cell.date.getDate()
}

function changeWeek(direction: number) {
  const next = moveWeek(offset.value, direction)
  offset.value = next.offset
  selectedDay.value = next.day
}

function backToToday() {
  offset.value = 0
  selectedDay.value = 11
}

function showDetail(item: (typeof demoAgendaItems)[number]) {
  emit('detail', item.title, describeAgendaItem(item, selectedDate.value))
}
</script>

<template>
  <section class="surface agenda-panel">
    <div class="section-head"><h3>日程安排</h3><button class="text-link" @click="backToToday">回到今天</button></div>
    <div class="agenda-month"><span>{{ monthLabel }}</span><span class="subtle">{{ visibleItems.length }} 项日程</span></div>
    <div class="date-strip">
      <button class="date-arrow" aria-label="日程上一周" @click="changeWeek(-1)"><ChevronLeft :size="14" /></button>
      <button
        v-for="cell in cells"
        :key="cell.date.toISOString()"
        :class="['date-item', { selected: cell.date.getTime() === selectedDate.getTime(), 'has-event': cell.hasEvent }]"
        :aria-pressed="cell.date.getTime() === selectedDate.getTime()"
        :aria-label="`${cell.date.getMonth() + 1}月${cell.date.getDate()}日日程`"
        @click="selectCell(cell)"
      >
        <small>{{ cell.label }}</small><b>{{ cell.date.getDate().toString().padStart(2, '0') }}</b>
      </button>
      <button class="date-arrow" aria-label="日程下一周" @click="changeWeek(1)"><ChevronRight :size="14" /></button>
    </div>
    <div class="agenda-list" aria-live="polite">
      <div v-for="item in visibleItems" :key="item.title" :class="['agenda-item', { completed: item.done }]"><span class="timeline-dot"></span><div class="agenda-card"><div><time>{{ item.time }}</time><button @click="showDetail(item)">详情</button></div><p>{{ item.title }}</p><small>{{ item.location }}</small></div></div>
      <div v-if="!visibleItems.length" class="agenda-empty"><CalendarDays :size="30" /><p>{{ props.keyword ? '未找到相关日程' : '当天暂无日程' }}</p><span>{{ props.keyword ? '试试其他关键词' : '可以查看其他日期的安排' }}</span></div>
    </div>
    <div class="agenda-footer"><i></i>所有日程均为本地演示数据</div>
  </section>
</template>
