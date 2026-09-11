<!--
 * 日程安排：按日期查看当天日程，支持按周切换与关键词过滤。
 *
 * 用法：
 *   <CaDailyAgenda :keyword="keyword" @detail="openDetail" />
 *
 * Props：keyword 过滤关键词
 * 事件：detail(title, description)
 * 逻辑：createWeekDates、filterAgenda、moveWeek、formatAgendaDate、describeAgendaItem
 *
 * 数据说明：当前为演示数据，真实项目需要把日程数据改为通过 Props 注入。
 * 颜色全部走 Token，自动支持暗色主题与自定义品牌色。
-->

<script setup lang="ts">
import { CalendarDays, ChevronLeft, ChevronRight } from '@lucide/vue'
// 只依赖 framework 适配层与纯逻辑 core，不直接依赖 Vue
import { computed, ref } from '@unionschool/campus-framework'
import { ns, cx } from '@/core/namespace'
import { formatDay, useLocale } from '@/locale'
import {
  createWeekDates,
  describeAgendaItem,
  filterAgenda,
  formatAgendaDate,
  moveWeek,
} from './core'
import { demoAgendaItems } from './data'

defineOptions({ name: 'CaDailyAgenda' })

const { locale, t } = useLocale()

const props = withDefaults(defineProps<{ keyword?: string }>(), { keyword: '' })
const emit = defineEmits<{ detail: [title: string, description: string] }>()

const selectedDay = ref(11)
const offset = ref(0)
const cells = computed(() => createWeekDates(offset.value, locale.value))
const visibleItems = computed(() => filterAgenda(demoAgendaItems, selectedDay.value, props.keyword))
const selectedDate = computed(() => new Date(2026, 8, selectedDay.value))
const monthLabel = computed(() => formatAgendaDate(selectedDate.value, locale.value))

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
  emit('detail', item.title, describeAgendaItem(item, selectedDate.value, locale.value, t))
}
</script>

<template>
  <section :class="ns('agenda')">
    <div :class="ns('agenda', 'head')">
      <h3 :class="ns('agenda', 'heading')">{{ t('ca.agenda.title') }}</h3>
      <button :class="ns('agenda', 'link')" type="button" @click="backToToday">{{ t('ca.agenda.backToToday') }}</button>
    </div>

    <div :class="ns('agenda', 'month')">
      <span>{{ monthLabel }}</span>
      <span :class="ns('agenda', 'count')">{{ t('ca.agenda.count', { count: visibleItems.length }) }}</span>
    </div>

    <div :class="ns('agenda', 'strip')">
      <button :class="ns('agenda', 'arrow')" type="button" :aria-label="t('ca.agenda.prevWeek')" @click="changeWeek(-1)"><ChevronLeft :size="14" /></button>
      <button
        v-for="cell in cells"
        :key="cell.date.toISOString()"
        type="button"
        :class="cx(
          ns('agenda', 'date'),
          cell.date.getTime() === selectedDate.getTime() ? ns('agenda', 'date', 'selected') : '',
          cell.hasEvent ? ns('agenda', 'date', 'has-event') : '',
        )"
        :aria-pressed="cell.date.getTime() === selectedDate.getTime()"
        :aria-label="t('ca.agenda.dayLabel', { date: formatDay(cell.date, locale) })"
        @click="selectCell(cell)"
      >
        <small>{{ cell.label }}</small><b>{{ cell.date.getDate().toString().padStart(2, '0') }}</b>
      </button>
      <button :class="ns('agenda', 'arrow')" type="button" :aria-label="t('ca.agenda.nextWeek')" @click="changeWeek(1)"><ChevronRight :size="14" /></button>
    </div>

    <div :class="ns('agenda', 'list')" aria-live="polite">
      <div
        v-for="item in visibleItems"
        :key="item.title"
        :class="cx(ns('agenda', 'item'), item.done ? ns('agenda', 'item', 'done') : '')"
      >
        <span :class="ns('agenda', 'dot')"></span>
        <div :class="ns('agenda', 'card')">
          <div :class="ns('agenda', 'card-head')">
            <time :class="ns('agenda', 'time')">{{ item.time }}</time>
            <button :class="ns('agenda', 'detail')" type="button" @click="showDetail(item)">{{ t('ca.agenda.detail') }}</button>
          </div>
          <p>{{ item.title }}</p>
          <small :class="ns('agenda', 'location')">{{ item.location }}</small>
        </div>
      </div>
      <div v-if="!visibleItems.length" :class="ns('agenda', 'empty')">
        <CalendarDays :size="30" />
        <p>{{ props.keyword ? t('ca.agenda.emptySearchTitle') : t('ca.agenda.emptyTitle') }}</p>
        <span>{{ props.keyword ? t('ca.agenda.emptySearchDescription') : t('ca.agenda.emptyDescription') }}</span>
      </div>
    </div>

    <div :class="ns('agenda', 'footer')"><i></i>{{ t('ca.agenda.footer') }}</div>
  </section>
</template>

<style src="../style/index.css"></style>
