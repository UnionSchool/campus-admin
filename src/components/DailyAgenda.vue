<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDays, ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{ keyword: string }>()
const emit = defineEmits<{ detail: [title: string, description: string] }>()
const selectedDay = ref(11)
const offset = ref(0)
const dates = computed(() => Array.from({ length: 7 }, (_, index) => new Date(2026, 8, 7 + offset.value * 7 + index)))
const selectedDate = computed(() => new Date(2026, 8, selectedDay.value))
const items = [
  { day: 11, time: '09:00', title: '阅读校务简报，确认今日工作安排', location: '行政办公室', done: true },
  { day: 11, time: '11:00', title: '秋季运动会筹备工作协调会', location: '综合楼 · 第一会议室', done: true },
  { day: 11, time: '14:30', title: '高一年级教学质量分析会', location: '教学楼 · 302 教研室', done: false },
  { day: 11, time: '16:30', title: '校园安全与设备巡检结果复核', location: '行政办公室', done: false },
  { day: 10, time: '10:00', title: '新学期班主任工作交流会', location: '综合楼 · 第一会议室', done: true },
  { day: 9, time: '14:00', title: '智慧食堂服务质量评议', location: '食堂二楼', done: true },
]
const visibleItems = computed(() => items.filter(item => item.day === selectedDay.value && item.title.includes(props.keyword.trim())))
function moveWeek(direction: number) { offset.value += direction; selectedDay.value = 7 + offset.value * 7 }
</script>

<template>
  <section class="surface agenda-panel">
    <div class="section-head"><h3>日程安排</h3><button class="text-link" @click="selectedDay = 11; offset = 0">回到今天</button></div>
    <div class="agenda-month"><span>{{ selectedDate.getFullYear() }} 年 {{ selectedDate.getMonth() + 1 }} 月</span><span class="subtle">{{ visibleItems.length }} 项日程</span></div>
    <div class="date-strip"><button class="date-arrow" aria-label="日程上一周" @click="moveWeek(-1)"><ChevronLeft :size="14" /></button><button v-for="(date, index) in dates" :key="date.toISOString()" :class="['date-item', { selected: date.getTime() === selectedDate.getTime(), 'has-event': [9, 10, 11].includes(7 + offset * 7 + index) }]" :aria-pressed="date.getTime() === selectedDate.getTime()" :aria-label="`${date.getMonth() + 1}月${date.getDate()}日日程`" @click="selectedDay = 7 + offset * 7 + index"><small>{{ ['一', '二', '三', '四', '五', '六', '日'][index] }}</small><b>{{ date.getDate().toString().padStart(2, '0') }}</b></button><button class="date-arrow" aria-label="日程下一周" @click="moveWeek(1)"><ChevronRight :size="14" /></button></div>
    <div class="agenda-list" aria-live="polite"><div v-for="item in visibleItems" :key="item.title" :class="['agenda-item', { completed: item.done }]"><span class="timeline-dot"></span><div class="agenda-card"><div><time>{{ item.time }}</time><button @click="emit('detail', item.title, `${selectedDate.getMonth() + 1} 月 ${selectedDate.getDate()} 日 ${item.time}，地点：${item.location}。${item.done ? '此日程已完成。' : '请按时参加并准备相关材料。'}`)">详情</button></div><p>{{ item.title }}</p><small>{{ item.location }}</small></div></div><div v-if="!visibleItems.length" class="agenda-empty"><CalendarDays :size="30" /><p>{{ keyword ? '未找到相关日程' : '当天暂无日程' }}</p><span>{{ keyword ? '试试其他关键词' : '可以查看其他日期的安排' }}</span></div></div>
    <div class="agenda-footer"><i></i>所有日程均为本地演示数据</div>
  </section>
</template>
