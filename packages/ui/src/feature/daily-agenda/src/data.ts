import type { AgendaItem } from './core'

/** 演示数据，真实项目通过 Props 注入，组件不访问接口 */
export const demoAgendaItems: AgendaItem[] = [
  { day: 11, time: '09:00', title: '阅读校务简报，确认今日工作安排', location: '行政办公室', done: true },
  { day: 11, time: '11:00', title: '秋季运动会筹备工作协调会', location: '综合楼 · 第一会议室', done: true },
  { day: 11, time: '14:30', title: '高一年级教学质量分析会', location: '教学楼 · 302 教研室', done: false },
  { day: 11, time: '16:30', title: '校园安全与设备巡检结果复核', location: '行政办公室', done: false },
  { day: 10, time: '10:00', title: '新学期班主任工作交流会', location: '综合楼 · 第一会议室', done: true },
  { day: 9, time: '14:00', title: '智慧食堂服务质量评议', location: '食堂二楼', done: true },
]
