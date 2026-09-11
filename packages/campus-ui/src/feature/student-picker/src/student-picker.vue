<!--
 * 学生选择器：按姓名、学号、班级筛选并选择学生，支持单选与多选。
 * 学生列表由业务方查询后传入；需要服务端搜索时监听 search 事件。
 *
 * 用法：
 *   <CaStudentPicker v-model="studentIds" multiple :students="students" :loading="loading" @search="fetchStudents" />
 *
 * Props：modelValue / students / multiple / placeholder / loading / clearable
 * 事件：update:modelValue、change、search
 * 工具：filterStudents、toIdList、isSelected、toggleSingle、toggleMultiple
 *
 * 数据约定：id 使用字符串，避免后端大整数在 JavaScript 中丢失精度。
-->

<script setup lang="ts">
import { computed, ref } from '@unionschool/campus-framework'
import { Search } from '@lucide/vue'
import { ns, cx } from '@/core/namespace'
import CaAvatar from '../../../atom/avatar/index'
import CaCheckbox from '../../../atom/checkbox/index'
import CaEmpty from '../../../base/empty/index'
import { useLocale } from '@/locale'
import { filterStudents, isSelected, toggleMultiple, toggleSingle } from './core'
import type { StudentOption, StudentValue } from './core'

defineOptions({ name: 'CaStudentPicker' })

const { t } = useLocale()

const props = withDefaults(defineProps<{
  modelValue?: StudentValue
  /** 候选学生，由业务方通过接口获取后传入，组件不访问接口 */
  students?: StudentOption[]
  multiple?: boolean
  placeholder?: string
  loading?: boolean
  /** 取消选择时是否抛出空数组/undefined */
  clearable?: boolean
}>(), {
  students: () => [],
  loading: false,
  clearable: true,
})

/** 未显式传 placeholder 时用当前语言的默认文案 */
const placeholderText = computed(() => props.placeholder ?? t('ca.studentPicker.placeholder'))

const emit = defineEmits<{
  'update:modelValue': [value: StudentValue]
  change: [value: StudentValue, students: StudentOption[]]
  search: [keyword: string]
}>()

const keyword = ref('')
const visible = computed(() => filterStudents(props.students, keyword.value))
const selectedIds = computed(() => {
  if (props.modelValue === undefined || props.modelValue === '') return [] as string[]
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue as string]
})

function pick(student: StudentOption) {
  if (props.multiple) {
    const next = toggleMultiple(props.modelValue, student.id)
    emit('update:modelValue', next)
    emit('change', next, props.students.filter(item => next.includes(item.id)))
    return
  }
  const next = toggleSingle(props.modelValue, student.id)
  emit('update:modelValue', next)
  emit('change', next, props.students.filter(item => item.id === next))
}

function onSearch() {
  emit('search', keyword.value)
}
</script>

<template>
  <div :class="ns('student-picker')">
    <div :class="ns('student-picker', 'search')">
      <Search :size="15" aria-hidden="true" />
      <input
        v-model="keyword"
        :class="ns('student-picker', 'input')"
        type="search"
        :placeholder="placeholderText"
        :aria-label="t('ca.studentPicker.searchLabel')"
        @input="onSearch"
      />
      <span v-if="selectedIds.length" :class="ns('student-picker', 'count')">{{ t('ca.studentPicker.selected', { count: selectedIds.length }) }}</span>
    </div>

    <div :class="ns('student-picker', 'list')" role="listbox" :aria-multiselectable="multiple">
      <div v-if="loading" :class="ns('student-picker', 'loading')">{{ t('ca.common.loading') }}</div>
      <button
        v-for="student in visible"
        v-else
        :key="student.id"
        :class="cx(ns('student-picker', 'item'), isSelected(modelValue, student.id) ? ns('student-picker', 'item', 'selected') : '')"
        type="button"
        role="option"
        :aria-selected="isSelected(modelValue, student.id)"
        @click="pick(student)"
      >
        <CaCheckbox v-if="multiple" :model-value="isSelected(modelValue, student.id)" tabindex="-1" />
        <CaAvatar :src="student.avatar" :name="student.name" size="small" />
        <span :class="ns('student-picker', 'info')">
          <b>{{ student.name }}</b>
          <small>{{ [student.className, student.studentNo && t('ca.studentPicker.studentNo', { no: student.studentNo })].filter(Boolean).join(' · ') }}</small>
        </span>
      </button>
      <CaEmpty v-if="!visible.length && !loading" :title="t('ca.studentPicker.emptyTitle')" :description="t('ca.studentPicker.emptyDescription')" size="small" />
    </div>
  </div>
</template>

<style src="../style/index.css"></style>
