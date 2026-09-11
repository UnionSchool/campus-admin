<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const mode = ref('personal')
const selectedClass = ref('高一（1）班')
const weekOffset = ref(0)
const emit = defineEmits<{ detail: [title: string, description: string] }>()
const days = computed(() => Array.from({ length: 7 }, (_, index) => {
  const date = new Date(2026, 8, 7 + weekOffset.value * 7 + index)
  return { label: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][index], date, today: date.getTime() === new Date(2026, 8, 11).getTime() }
}))
const range = computed(() => `${days.value[0]!.date.getMonth() + 1}.${days.value[0]!.date.getDate()} — ${days.value[6]!.date.getMonth() + 1}.${days.value[6]!.date.getDate()}`)
const periods = [
  { group: '早自习', label: '早读', time: '07:30–08:00' },
  { group: '上午', label: '第 1 节', time: '08:10–08:55' },
  { group: '', label: '第 2 节', time: '09:05–09:50' },
  { group: '', label: '第 3 节', time: '10:10–10:55' },
  { group: '', label: '第 4 节', time: '11:05–11:50' },
  { group: '下午', label: '第 5 节', time: '14:00–14:45' },
  { group: '', label: '第 6 节', time: '14:55–15:40' },
  { group: '', label: '第 7 节', time: '15:50–16:35' },
]
const lessons = [
  { day: 0, row: 0, subject: '语文', className: '高一（1）班', tone: 'blue' },
  { day: 2, row: 0, subject: '语文', className: '高一（3）班', tone: 'orange' },
  { day: 1, row: 1, subject: '语文', className: '高一（2）班', tone: 'blue' },
  { day: 3, row: 1, subject: '语文', className: '高一（1）班', tone: 'green' },
  { day: 4, row: 2, subject: '语文', className: '高一（3）班', tone: 'orange' },
  { day: 0, row: 3, subject: '语文', className: '高一（3）班', tone: 'orange' },
  { day: 2, row: 3, subject: '语文', className: '高一（2）班', tone: 'blue' },
  { day: 4, row: 4, subject: '语文', className: '高一（1）班', tone: 'green' },
  { day: 1, row: 5, subject: '语文', className: '高一（1）班', tone: 'green' },
  { day: 3, row: 6, subject: '语文', className: '高一（2）班', tone: 'blue' },
  { day: 0, row: 7, subject: '教研', className: '语文教研组', tone: 'blue' },
]
function lessonAt(row: number, day: number) {
  if (weekOffset.value !== 0 || day > 4) return undefined
  if (mode.value === 'personal') return lessons.find(item => item.row === row && item.day === day)
  const subjects = ['语文', '数学', '英语', '物理', '化学', '历史', '体育', '班会']
  return { subject: subjects[(row + day) % subjects.length], className: selectedClass.value, tone: ['blue', 'green', 'orange'][(row + day) % 3] }
}
</script>

<template>
  <section class="surface timetable-panel">
    <div class="timetable-toolbar">
      <div class="line-tabs" role="tablist" aria-label="课表类型">
        <button role="tab" :aria-selected="mode === 'personal'" :class="{ active: mode === 'personal' }" @click="mode = 'personal'">个人课表</button>
        <button role="tab" :aria-selected="mode === 'class'" :class="{ active: mode === 'class' }" @click="mode = 'class'">班级课表</button>
      </div>
      <div class="week-control"><button aria-label="上一周" @click="weekOffset--"><ChevronLeft :size="15" /></button><span>第 {{ 2 + weekOffset }} 周 <b>{{ range }}</b></span><button aria-label="下一周" @click="weekOffset++"><ChevronRight :size="15" /></button><button class="today-button" @click="weekOffset = 0">本周</button></div>
    </div>
    <div class="timetable-meta"><span>{{ mode === 'personal' ? '林老师 · 语文' : '班级教学安排' }}<i></i>2026–2027 学年 · 第一学期</span><select v-if="mode === 'class'" v-model="selectedClass" aria-label="选择班级"><option>高一（1）班</option><option>高一（2）班</option><option>高一（3）班</option></select><span v-else class="lesson-count">本周 <b>11</b> 节课</span></div>
    <div class="timetable-scroll">
      <table class="timetable"><caption class="sr-only">{{ range }} 教学课表</caption><thead><tr><th colspan="2">时段 / 节次</th><th v-for="day in days" :key="day.date.toISOString()" :class="{ 'is-today': day.today }"><span>{{ day.label }}</span><b>{{ day.date.getDate().toString().padStart(2, '0') }}</b></th></tr></thead>
        <tbody><tr v-for="(period, row) in periods" :key="period.time" :class="{ 'afternoon-start': row === 5 }"><th v-if="period.group" :rowspan="row === 0 ? 1 : row === 1 ? 4 : 3" class="period-group">{{ period.group }}</th><th class="period-time"><span>{{ period.label }}</span><small>{{ period.time }}</small></th><td v-for="(day, index) in days" :key="day.label" :class="{ 'today-column': day.today, weekend: index > 4 }"><button v-if="lessonAt(row, index)" :class="['lesson', lessonAt(row, index)?.tone]" @click="emit('detail', `${lessonAt(row, index)?.className} · ${lessonAt(row, index)?.subject}`, `${day.date.getMonth() + 1} 月 ${day.date.getDate()} 日 ${period.time}，授课教师：林老师。请提前准备教学资料。`)"><b>{{ lessonAt(row, index)?.className }}</b><span>{{ lessonAt(row, index)?.subject }}</span></button></td></tr></tbody>
      </table>
    </div>
    <div class="timetable-footer"><span><i class="legend blue"></i>高一（2）班<i class="legend green"></i>高一（1）班<i class="legend orange"></i>高一（3）班</span><span>点击课程查看详情</span></div>
  </section>
</template>
