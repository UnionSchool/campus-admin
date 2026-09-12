/**
 * 组件库内置词条（简体中文，默认语言）。
 *
 * 约定：
 * 1. 所有键都挂在 ca 命名空间下，ca 由组件库保留；业务要改写组件文案时
 *    只覆盖 ca 下的叶子键，不要覆盖父级路径（父级覆盖会让整棵子树静默失效）；
 * 2. 结构就是 vue-i18n 的 messages，业务可以直接 mergeLocaleMessage('zh-CN', caMessagesZhCN)；
 * 3. 只放“组件自身的界面文案”。班级名、科目、节次、日程条目这类业务数据
 *    不在这里，真实项目由接口下发（见各组件 data.ts 的说明）。
 */
import type { LocaleMessages } from '../types'

const zhCN: LocaleMessages = {
  ca: {
    common: {
      loading: '加载中…',
      close: '关闭',
      clear: '清空',
      remove: '移除',
      confirm: '确定',
      cancel: '取消',
      processing: '处理中…',
      back: '返回',
      expand: '展开',
      collapse: '收起',
    },
    table: {
      empty: '暂无数据',
    },
    pagination: {
      label: '分页导航',
      total: '共 {total} 条',
      prev: '上一页',
      next: '下一页',
    },
    toast: {
      close: '关闭消息',
    },
    empty: {
      title: '暂无数据',
    },
    copyright: {
      line: '© {year} {name}',
      poweredBy: 'Powered By 众校通 ®',
      poweredByPartner: 'Powered By {partner} | 众校通 ®',
    },
    slogan: {
      default: '为教育多做一点',
    },
    select: {
      placeholder: '请选择',
      empty: '暂无选项',
    },
    breadcrumb: {
      label: '面包屑导航',
    },
    searchForm: {
      search: '查询',
      reset: '重置',
      searching: '查询中…',
    },
    classTree: {
      searchPlaceholder: '搜索年级或班级',
      searchLabel: '搜索班级',
      empty: '没有匹配的年级或班级',
    },
    sideMenu: {
      label: '导航菜单',
    },
    studentPicker: {
      placeholder: '搜索姓名、学号或班级',
      searchLabel: '搜索学生',
      selected: '已选 {count}',
      studentNo: '学号 {no}',
      emptyTitle: '没有匹配的学生',
      emptyDescription: '换个关键词试试',
    },
    attendance: {
      normal: '正常',
      late: '迟到',
      leave: '请假',
      absent: '缺勤',
      early: '早退',
      unknown: '未打卡',
    },
    timetable: {
      tabsLabel: '课表类型',
      personal: '个人课表',
      class: '班级课表',
      prevWeek: '上一周',
      nextWeek: '下一周',
      thisWeek: '本周',
      week: '第 {week} 周',
      personalSubtitle: '林老师 · 语文',
      classSubtitle: '班级教学安排',
      term: '2026–2027 学年 · 第一学期',
      classLabel: '选择班级',
      weekCount: '本周 {count} 节课',
      caption: '{range} 教学课表',
      periodHeader: '时段 / 节次',
      hint: '点击课程查看详情',
      detail: '{date} {time}，授课教师：林老师。请提前准备教学资料。',
    },
    agenda: {
      title: '日程安排',
      backToToday: '回到今天',
      count: '{count} 项日程',
      prevWeek: '日程上一周',
      nextWeek: '日程下一周',
      dayLabel: '{date}日程',
      detail: '详情',
      emptyTitle: '当天暂无日程',
      emptyDescription: '可以查看其他日期的安排',
      emptySearchTitle: '未找到相关日程',
      emptySearchDescription: '试试其他关键词',
      footer: '所有日程均为本地演示数据',
      doneState: '此日程已完成。',
      todoState: '请按时参加并准备相关材料。',
      describe: '{date} {time}，地点：{location}。{state}',
    },
  },
}

export default zhCN
