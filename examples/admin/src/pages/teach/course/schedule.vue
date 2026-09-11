<!--
 * 课程表
 * 菜单位置：教学教务 → 课程管理 → 课程表
 *
 * 目录层级与菜单层级一一对应，路径即目录：
 *   /teach/course/schedule
 *    ├ 一级  ├ 二级   └ 页面
 *
 * 数据来自 GET /course/schedule，开发环境由 request 从
 * lib/mock/course/schedule.json 返回，生产环境走真实接口。
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaButton, CaEmpty, CaPageHeader, CaSkeleton, toast } from '@unionschool/campus-admin'
import { getCourseSchedule } from '../../../lib/api/schedule'
import type { ScheduleData, ScheduleLesson } from '../../../lib/api/schedule'

/** 星期表头，与 lesson.day 对应 */
const weekDays = ['周一', '周二', '周三', '周四', '周五']

const loading = ref(true)
const schedule = ref<ScheduleData | null>(null)
const weekLabel = ref('')

/** 取某天某节的课程，模板里按行列渲染时用 */
function lessonAt(row: number, day: number): ScheduleLesson | undefined {
  return schedule.value?.lessons.find(item => item.row === row && item.day === day)
}

const lessonCount = computed(() => schedule.value?.lessons.length ?? 0)

async function load() {
  const load = ca.loading()
  loading.value = true
  const res = await getCourseSchedule({ week: 2 })
  loading.value = false
  console.log(res)
  if (res.code === 0) {
    schedule.value = res.data ?? null
    setTimeout(() => {
      load.hide()
    }, 1000);
    weekLabel.value = (res.extra as { weekLabel?: string } | undefined)?.weekLabel ?? ''
    return
  }
  else {
    ca.alert(res.msg)
  }
}

void load()
</script>

<template>
  <div class="schedule-page">
    <CaPageHeader title="课程表" :description="schedule?.term ?? '加载中…'">
      <CaButton @click="load">刷新</CaButton>
      <CaButton type="primary" @click="toast.info('调课', '调课功能待接入')">调课申请</CaButton>
    </CaPageHeader>

    <section class="schedule-page__panel">
      <header class="schedule-page__meta">
        <span>{{ weekLabel || '本周' }}</span>
        <span class="schedule-page__count">共 {{ lessonCount }} 节课</span>
      </header>

      <CaSkeleton v-if="loading" variant="card" :rows="3" />

      <CaEmpty v-else-if="!schedule?.lessons.length" title="本周暂无课程" description="可以切换周次查看其他安排" />

      <div v-else class="schedule-page__scroll">
        <table class="schedule-table">
          <caption class="ca-sr-only">{{ weekLabel }} 课程表</caption>
          <thead>
            <tr>
              <th class="schedule-table__period">节次</th>
              <th v-for="(day, index) in weekDays" :key="day" :class="{ 'is-today': index === 4 }">{{ day }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(period, row) in schedule.periods" :key="period.time">
              <th class="schedule-table__period">
                <span>{{ period.label }}</span>
                <small>{{ period.time }}</small>
              </th>
              <td v-for="(day, index) in weekDays" :key="day" :class="{ 'is-today': index === 4 }">
                <button v-if="lessonAt(row, index)" :class="['schedule-table__lesson', lessonAt(row, index)?.tone]"
                  @click="toast.info(
                    `${lessonAt(row, index)?.subject} · ${lessonAt(row, index)?.teacher}`,
                    `${period.label} ${period.time}，${lessonAt(row, index)?.className}`,
                  )">
                  <b>{{ lessonAt(row, index)?.subject }}</b>
                  <small>{{ lessonAt(row, index)?.teacher }}</small>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.schedule-page {
  display: grid;
  gap: 16px;
}

.schedule-page__panel {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e6eef6;
  border-radius: 12px;
  background: #fff;
}

.schedule-page__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #4d5f70;
}

.schedule-page__count {
  color: #7b8b9c;
}

.schedule-page__scroll {
  overflow-x: auto;
}

.schedule-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  table-layout: fixed;
}

.schedule-table th,
.schedule-table td {
  border: 1px solid #eef3f9;
}

.schedule-table thead th {
  height: 36px;
  background: #f7fafd;
  font-size: 12px;
  font-weight: 500;
  color: #5d6d7d;
}

.schedule-table thead th.is-today {
  color: #0878fa;
  background: #edf6ff;
}

.schedule-table__period {
  width: 88px;
  padding: 6px;
  text-align: center;
  font-size: 11px;
  font-weight: 400;
  color: #8a98a7;
}

.schedule-table__period small {
  display: block;
  margin-top: 2px;
  font-size: 9px;
  color: #a5b0ba;
}

.schedule-table tbody tr {
  height: 52px;
}

.schedule-table tbody td {
  padding: 3px;
}

.schedule-table tbody td.is-today {
  background: #fbfdff;
}

.schedule-table__lesson {
  display: grid;
  gap: 2px;
  width: 100%;
  height: 100%;
  padding: 5px 6px;
  border-left: 2px solid var(--tone);
  border-radius: 4px;
  text-align: left;
}

.schedule-table__lesson b {
  font-size: 12px;
  font-weight: 500;
}

.schedule-table__lesson small {
  font-size: 10px;
  opacity: .8;
}

.schedule-table__lesson:hover {
  background: var(--tint);
}

.schedule-table__lesson.blue {
  --tone: #4b98fa;
  --tint: #edf4ff;
  color: #3d7fbf;
}

.schedule-table__lesson.green {
  --tone: #46bea3;
  --tint: #ebfaf5;
  color: #2f8f74;
}

.schedule-table__lesson.orange {
  --tone: #ff9c57;
  --tint: #fff4ea;
  color: #c47a35;
}
</style>
