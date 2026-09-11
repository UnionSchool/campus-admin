<!--
 * 考勤状态标签：把考勤状态值渲染成语义色标签，统一校园业务的考勤表达。
 * 状态色由 attendanceMeta() 集中维护，新增状态只需改一处。
 *
 * 用法：
 *   <CaAttendanceBadge status="normal" time="07:52" />
 *   <CaAttendanceBadge status="leave" size="small" />
 *
 * Props：status normal|late|leave|absent|early|unknown / time 打卡时间 / size
 * 工具：attendanceMeta(status)、attendanceRate(counts, total)
 *
 * 状态词典：normal 正常 / late 迟到 / leave 请假 / absent 缺勤 / early 早退 / unknown 未打卡
-->

<script setup lang="ts">
import { computed } from '@unionschool/campus-framework'
import { ns, cx } from '@/core/namespace'
import { attendanceMeta } from './core'
import type { AttendanceStatus } from './core'

defineOptions({ name: 'CaAttendanceBadge' })

const props = withDefaults(defineProps<{
  status?: AttendanceStatus | string
  /** 显示打卡时间等补充信息 */
  time?: string
  size?: 'small' | 'medium'
}>(), {
  status: 'unknown',
  size: 'medium',
})

const meta = computed(() => attendanceMeta(props.status))
const className = computed(() => cx(
  ns('attendance-badge'),
  ns('attendance-badge', undefined, meta.value.tone),
  ns('attendance-badge', undefined, props.size),
))
</script>

<template>
  <span :class="className">
    <i :class="ns('attendance-badge', 'dot')" aria-hidden="true"></i>
    <span>{{ meta.label }}</span>
    <time v-if="time" :class="ns('attendance-badge', 'time')">{{ time }}</time>
  </span>
</template>

<style scoped>
.ca-attendance-badge { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: var(--ca-radius-full); font-size: var(--ca-font-size-sm); line-height: 1.6; white-space: nowrap; }
.ca-attendance-badge--small { padding: 0 6px; font-size: var(--ca-font-size-xs); }
.ca-attendance-badge__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.ca-attendance-badge__time { margin-left: 2px; opacity: .75; font-variant-numeric: tabular-nums; }
.ca-attendance-badge--success { background: var(--ca-color-green-50); color: var(--ca-color-success); }
.ca-attendance-badge--warning { background: var(--ca-color-orange-50); color: #c47a35; }
.ca-attendance-badge--danger { background: var(--ca-color-red-50); color: var(--ca-color-danger); }
.ca-attendance-badge--info { background: var(--ca-color-cyan-50); color: var(--ca-color-info); }
.ca-attendance-badge--primary { background: var(--ca-color-primary-soft); color: var(--ca-color-primary); }
.ca-attendance-badge--neutral { background: var(--ca-color-neutral-100); color: var(--ca-text-secondary); }
</style>
