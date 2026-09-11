<script setup lang="ts">
import {
  CaAttendanceBadge, CaAvatar, CaButton, CaInput, CaPageHeader, CaPagination,
  CaSearchForm, CaSelect, CaTable, CaTag, toast,
} from '@unionschool/campus-admin'
import type { TableColumn } from '@unionschool/campus-admin'
import { useStudentList } from '../../composables/useStudentList'
import type { StudentRow } from '../../composables/useStudentList'

const {
  query, page, pageSize, loading, selectedIds, rows, total, search, reset, load,
} = useStudentList()

const gradeOptions = [
  { label: '全部年级', value: '' },
  { label: '高一', value: '高一' },
  { label: '高二', value: '高二' },
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '正常', value: 'normal' },
  { label: '请假', value: 'leave' },
  { label: '缺勤', value: 'absent' },
]

/** 列配置是普通数据，可来自配置中心或后端下发 */
const columns: TableColumn<StudentRow>[] = [
  { key: 'name', title: '学生', width: 180 },
  { key: 'studentNo', title: '学号', width: 130 },
  { key: 'className', title: '班级' },
  { key: 'status', title: '考勤状态', width: 120, align: 'center' },
  { key: 'checkIn', title: '今日打卡', width: 110, align: 'center' },
  { key: 'balance', title: '一卡通余额', width: 130, numeric: true, sortable: true },
]

function removeSelected() {
  if (!selectedIds.value.length) {
    toast.warning('请先选择学生')
    return
  }
  toast.success(`已移除 ${selectedIds.value.length} 名学生`, '演示环境不会真正删除数据')
  selectedIds.value = []
}
</script>

<template>
  <div class="student-page">
    <CaPageHeader title="学生管理" description="智慧校园学生档案与考勤总览，支持按年级、状态筛选">
      <CaButton @click="load">刷新</CaButton>
      <CaButton type="danger" variant="outline" @click="removeSelected">批量移除</CaButton>
      <CaButton type="primary" @click="toast.info('新增学生', '演示环境暂未接入表单流程')">新增学生</CaButton>
    </CaPageHeader>

    <CaSearchForm :columns="3" :loading="loading" @search="search" @reset="reset">
      <label class="student-page__field">
        <span>姓名 / 学号</span>
        <CaInput v-model="query.keyword" placeholder="输入姓名或学号" clearable @enter="search" />
      </label>
      <label class="student-page__field">
        <span>年级</span>
        <CaSelect v-model="query.grade" :options="gradeOptions" />
      </label>
      <label class="student-page__field">
        <span>考勤状态</span>
        <CaSelect v-model="query.status" :options="statusOptions" />
      </label>
    </CaSearchForm>

    <section class="student-page__panel">
      <CaTable
        :columns="columns"
        :data="rows"
        row-key="id"
        stripe
        :loading="loading"
        empty-text="没有符合条件的学生"
        @row-click="(row) => toast.info(row.name, `${row.className} · 学号 ${row.studentNo}`)"
      >
        <template #cell-name="{ row }">
          <span class="student-page__cell">
            <CaAvatar :name="row.name" size="small" />
            <b>{{ row.name }}</b>
          </span>
        </template>
        <template #cell-status="{ row }">
          <CaAttendanceBadge :status="row.status" size="small" />
        </template>
        <template #cell-checkIn="{ row }">
          <span v-if="row.checkIn !== '—'" class="student-page__time">{{ row.checkIn }}</span>
          <CaTag v-else tone="neutral" size="small">未打卡</CaTag>
        </template>
        <template #cell-balance="{ row }">
          ¥ {{ row.balance.toFixed(2) }}
        </template>
      </CaTable>

      <div class="student-page__footer">
        <span class="student-page__hint">共 {{ total }} 名学生 · 当前第 {{ page }} 页</span>
        <CaPagination v-model:current="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.student-page { display: grid; gap: 16px; }
.student-page__field { display: grid; gap: 6px; font-size: 12px; color: #7b8b9c; }
.student-page__panel { display: grid; gap: 14px; padding: 16px; border: 1px solid #e6eef6; border-radius: 12px; background: #fff; }
.student-page__cell { display: inline-flex; align-items: center; gap: 8px; }
.student-page__cell b { font-weight: 500; }
.student-page__time { font-variant-numeric: tabular-nums; color: #4d5f70; }
.student-page__footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.student-page__hint { color: #7b8b9c; font-size: 12px; }
</style>
