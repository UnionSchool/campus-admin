<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CaAttendanceBadge, CaAvatar, CaButton, CaCheckbox, CaClassTree, CaDrawer,
  CaEmpty, CaInput, CaModal, CaPageHeader, CaPagination, CaProgress,
  CaSearchForm, CaSelect, CaSkeleton, CaStatistic, CaStudentPicker, CaSwitch,
  CaTable, CaTag, CaTextarea, toast,
} from '@campus-admin/core'
import type { GradeTreeNode, StudentOption, TableColumn } from '@campus-admin/core'

const students: StudentOption[] = [
  { id: '20260301', name: '李思远', studentNo: '20260301', grade: '高二', className: '高二（3）班' },
  { id: '20260302', name: '王雨桐', studentNo: '20260302', grade: '高二', className: '高二（3）班' },
  { id: '20260303', name: '陈昊然', studentNo: '20260303', grade: '高二', className: '高二（1）班' },
  { id: '20260304', name: '赵一诺', studentNo: '20260304', grade: '高二', className: '高二（2）班' },
]

const grades: GradeTreeNode[] = [
  { id: 'g1', label: '高一', children: [{ id: 'c11', label: '高一（1）班' }, { id: 'c12', label: '高一（2）班' }] },
  { id: 'g2', label: '高二', children: [{ id: 'c21', label: '高二（1）班' }, { id: 'c22', label: '高二（2）班' }, { id: 'c23', label: '高二（3）班' }] },
]

const columns: TableColumn<StudentOption>[] = [
  { key: 'name', title: '姓名' },
  { key: 'studentNo', title: '学号' },
  { key: 'className', title: '班级' },
  { key: 'id', title: 'ID', numeric: true, sortable: true },
]

const picked = ref<string[]>(['20260301'])
const selectedClass = ref('c23')
const keyword = ref('')
const switchOn = ref(true)
const checked = ref(true)
const agree = ref(false)
const remark = ref('')
const size = ref('medium')
const page = ref(1)
const modalOpen = ref(false)
const drawerOpen = ref(false)
const loading = ref(false)
const grade = ref('')

// 静态样式类名，写在 script setup 中供模板引用
const pageWrap = 'showcase'
const section = 'showcase__section'
const row = 'showcase__row'
const formGrid = 'showcase__form-grid'
const field = 'showcase__field'
const statGrid = 'showcase__stat-grid'
const twoColumn = 'showcase__two-column'
const cellWithAvatar = 'showcase__cell'
const muted = 'showcase__muted'

const gradeOptions = [
  { label: '全部年级', value: '' },
  { label: '高一', value: 'g1' },
  { label: '高二', value: 'g2' },
]

const selectedStudents = computed(() => students.filter(item => picked.value.includes(item.id)))
const total = 46
</script>

<template>
  <div :class="pageWrap">
    <CaPageHeader title="组件总览" description="campus-ui 组件在后台场景下的实际渲染效果，数据均为演示数据">
      <CaButton type="primary" @click="toast.success('操作成功', '这是一条全局消息提示')">消息提示</CaButton>
      <CaButton @click="modalOpen = true">打开弹窗</CaButton>
      <CaButton @click="drawerOpen = true">打开抽屉</CaButton>
    </CaPageHeader>

    <section :class="section">
      <h2>基础组件</h2>
      <div :class="row">
        <CaButton type="primary">主要按钮</CaButton>
        <CaButton type="success" variant="solid">成功</CaButton>
        <CaButton type="danger" variant="outline">危险</CaButton>
        <CaButton variant="text" type="primary">文字按钮</CaButton>
        <CaButton :loading="loading" type="primary" @click="loading = !loading">加载状态</CaButton>
        <CaButton disabled>禁用</CaButton>
      </div>
      <div :class="row">
        <CaTag>默认标签</CaTag>
        <CaTag tone="success" dot>已在校</CaTag>
        <CaTag tone="warning">请假</CaTag>
        <CaTag tone="danger" variant="solid">缺勤</CaTag>
        <CaTag tone="info" variant="outline">调课</CaTag>
        <CaTag closable @close="toast.info('已移除标签')">可关闭</CaTag>
      </div>
      <div :class="row">
        <CaAvatar name="李思远" />
        <CaAvatar name="王雨桐" size="large" shape="square" />
        <CaAvatar size="small" />
        <CaAttendanceBadge status="normal" time="07:52" />
        <CaAttendanceBadge status="late" time="08:14" />
        <CaAttendanceBadge status="leave" />
        <CaAttendanceBadge status="absent" />
        <CaAttendanceBadge status="unknown" />
      </div>
    </section>

    <section :class="section">
      <h2>表单组件</h2>
      <div :class="formGrid">
        <label :class="field">
          <span>姓名</span>
          <CaInput v-model="keyword" placeholder="请输入姓名" clearable />
        </label>
        <label :class="field">
          <span>年级</span>
          <CaSelect v-model="grade" :options="gradeOptions" />
        </label>
        <label :class="field">
          <span>备注</span>
          <CaTextarea v-model="remark" :rows="2" :maxlength="60" show-count placeholder="用于演示多行输入" />
        </label>
      </div>
      <div :class="row">
        <CaCheckbox v-model="checked" label="接收通知" />
        <CaCheckbox :model-value="'indeterminate'" label="半选状态" />
        <CaSwitch v-model="switchOn" active-text="启用" inactive-text="停用" />
        <CaCheckbox v-model="agree" label="同意《校园数据使用规范》" />
      </div>
    </section>

    <section :class="section">
      <h2>查询与数据</h2>
      <CaSearchForm :columns="3" @search="toast.info('已执行查询')" @reset="keyword = ''">
        <label :class="field"><span>学生姓名</span><CaInput v-model="keyword" placeholder="姓名或学号" clearable /></label>
        <label :class="field"><span>所属年级</span><CaSelect v-model="grade" :options="gradeOptions" /></label>
        <label :class="field"><span>班级</span><CaInput placeholder="请输入班级" /></label>
        <label :class="field"><span>状态</span><CaSelect :options="['全部', '正常', '请假']" /></label>
      </CaSearchForm>

      <div :class="statGrid">
        <CaStatistic card label="在校学生" :value="3286" unit="人" hint="较上周 +12" />
        <CaStatistic card label="今日到校率" :value="97.8" unit="%" tone="success" />
        <CaStatistic card label="待处理审批" :value="12" unit="项" tone="warning" />
        <CaStatistic card label="离线设备" :value="2" unit="台" tone="danger" />
      </div>

      <CaTable :columns="columns" :data="students" row-key="id" stripe>
        <template #cell-name="{ row }">
          <span :class="cellWithAvatar"><CaAvatar :name="(row as StudentOption).name" size="small" />{{ (row as StudentOption).name }}</span>
        </template>
      </CaTable>
      <CaPagination v-model:current="page" :total="total" :page-size="10" />
    </section>

    <section :class="section">
      <h2>校园业务组件</h2>
      <div :class="twoColumn">
        <div>
          <h3>学生选择器</h3>
          <CaStudentPicker v-model="picked" multiple :students="students" />
          <p :class="muted">已选：{{ selectedStudents.map(item => item.name).join('、') || '未选择' }}</p>
        </div>
        <div>
          <h3>班级树</h3>
          <CaClassTree v-model="selectedClass" :grades="grades" />
          <p :class="muted">当前班级：{{ selectedClass }}</p>
        </div>
      </div>
    </section>

    <section :class="section">
      <h2>反馈与占位</h2>
      <div :class="row">
        <CaProgress :percent="72" show-text />
        <CaProgress :percent="35" tone="warning" show-text />
        <CaProgress type="circle" :percent="88" tone="success" />
      </div>
      <CaSkeleton variant="card" :rows="2" />
      <CaEmpty title="暂无考勤记录" description="选择日期后可查看当天记录" />
    </section>

    <CaModal v-model="modalOpen" title="新增学生" show-footer confirm-text="保存" @confirm="modalOpen = false; toast.success('已保存')">
      <p>这里是弹窗内容，用于演示遮罩、焦点锁定与 Esc 关闭。</p>
      <CaInput placeholder="学生姓名" />
    </CaModal>

    <CaDrawer v-model="drawerOpen" title="学生详情" placement="right" :size="380">
      <p>抽屉用于承载详情类内容，支持右侧、左侧与底部三个方向。</p>
      <CaStudentPicker :students="students" :model-value="picked[0]" />
    </CaDrawer>
  </div>
</template>

<style scoped>
.showcase { display: grid; gap: var(--ca-space-5, 20px); }
.showcase__section { display: grid; gap: var(--ca-space-3, 12px); padding: var(--ca-space-4, 16px); border: 1px solid var(--ca-border-color, #e6eef6); border-radius: var(--ca-radius-lg, 12px); background: var(--ca-surface-card); }
.showcase__section h2 { font-size: 15px; font-weight: 600; }
.showcase__section h3 { margin-bottom: 10px; font-size: 13px; font-weight: 600; color: var(--ca-text-regular); }
.showcase__row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.showcase__form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.showcase__field { display: grid; gap: 6px; font-size: 12px; color: var(--ca-text-secondary); }
.showcase__stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.showcase__two-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.showcase__cell { display: inline-flex; align-items: center; gap: 8px; }
.showcase__muted { margin-top: 8px; color: var(--ca-text-secondary); font-size: 12px; }
@media (max-width: 900px) {
  .showcase__form-grid, .showcase__stat-grid, .showcase__two-column { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .showcase__form-grid, .showcase__stat-grid, .showcase__two-column { grid-template-columns: minmax(0, 1fr); }
}
</style>
