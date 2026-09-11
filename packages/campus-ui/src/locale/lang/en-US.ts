/**
 * 组件库内置词条（英文）。
 *
 * 与 zh-CN 的键一一对应，缺任何一条都会在英文界面下回退成中文或显示 key 本身。
 * 新增组件文案时两份语言包必须同时补，缺失由 packages/campus-ui 的类型检查兜底。
 */
import type { LocaleMessages } from '../types'

const enUS: LocaleMessages = {
  ca: {
    common: {
      loading: 'Loading…',
      close: 'Close',
      clear: 'Clear',
      remove: 'Remove',
      confirm: 'OK',
      cancel: 'Cancel',
      processing: 'Processing…',
      back: 'Back',
      expand: 'Expand',
      collapse: 'Collapse',
    },
    table: {
      empty: 'No data',
    },
    pagination: {
      label: 'Pagination',
      total: '{total} items',
      prev: 'Previous page',
      next: 'Next page',
    },
    toast: {
      close: 'Close message',
    },
    empty: {
      title: 'No data',
    },
    select: {
      placeholder: 'Please select',
      empty: 'No options',
    },
    breadcrumb: {
      label: 'Breadcrumb',
    },
    searchForm: {
      search: 'Search',
      reset: 'Reset',
      searching: 'Searching…',
    },
    classTree: {
      searchPlaceholder: 'Search grade or class',
      searchLabel: 'Search class',
      empty: 'No matching grade or class',
    },
    sideMenu: {
      label: 'Navigation',
    },
    studentPicker: {
      placeholder: 'Search name, student no. or class',
      searchLabel: 'Search students',
      selected: '{count} selected',
      studentNo: 'No. {no}',
      emptyTitle: 'No matching students',
      emptyDescription: 'Try another keyword',
    },
    attendance: {
      normal: 'Present',
      late: 'Late',
      leave: 'On leave',
      absent: 'Absent',
      early: 'Left early',
      unknown: 'Not checked in',
    },
    timetable: {
      tabsLabel: 'Timetable type',
      personal: 'My timetable',
      class: 'Class timetable',
      prevWeek: 'Previous week',
      nextWeek: 'Next week',
      thisWeek: 'This week',
      week: 'Week {week}',
      personalSubtitle: 'Ms. Lin · Chinese',
      classSubtitle: 'Class teaching plan',
      term: '2026–2027 · First semester',
      classLabel: 'Select class',
      weekCount: '{count} lessons this week',
      caption: '{range} timetable',
      periodHeader: 'Period',
      hint: 'Click a lesson for details',
      detail: '{date} {time}. Teacher: Ms. Lin. Please prepare your materials in advance.',
    },
    agenda: {
      title: 'Schedule',
      backToToday: 'Back to today',
      count: '{count} items',
      prevWeek: 'Previous week',
      nextWeek: 'Next week',
      dayLabel: 'Schedule for {date}',
      detail: 'Details',
      emptyTitle: 'No schedule for this day',
      emptyDescription: 'Pick another date to see its schedule',
      emptySearchTitle: 'No matching schedule',
      emptySearchDescription: 'Try another keyword',
      footer: 'All schedules are local demo data',
      doneState: 'This item is done.',
      todoState: 'Please attend on time and prepare the relevant materials.',
      describe: '{date} {time}, location: {location}. {state}',
    },
  },
}

export default enUS
