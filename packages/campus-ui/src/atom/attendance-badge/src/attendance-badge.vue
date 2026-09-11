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
import { useLocale } from '@/locale'
import { attendanceMeta } from './core'
import type { AttendanceStatus } from './core'

defineOptions({ name: 'CaAttendanceBadge' })

const { t } = useLocale()

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
/** 状态文案按当前语言取词，切换语言时自动更新 */
const label = computed(() => t(meta.value.labelKey))
const className = computed(() => cx(
  ns('attendance-badge'),
  ns('attendance-badge', undefined, meta.value.tone),
  ns('attendance-badge', undefined, props.size),
))
</script>

<template>
  <span :class="className">
    <i :class="ns('attendance-badge', 'dot')" aria-hidden="true"></i>
    <span>{{ label }}</span>
    <time v-if="time" :class="ns('attendance-badge', 'time')">{{ time }}</time>
  </span>
</template>

<style src="../style/index.css"></style>
