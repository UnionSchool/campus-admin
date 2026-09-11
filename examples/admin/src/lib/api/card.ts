import { useRequest } from '../request-helper'
import type { ApiEnvelope } from '../types'

/**
 * 校园一卡通接口。
 *
 * 约定：
 * - 每个业务场景一个文件，一个方法对应一个接口
 * - 返回类型写在文件内并导出，页面直接复用
 * - 组件不直接调用本文件，统一通过 Provider 装配（见 services/card.ts）
 * - url 只写一份，开发环境由 request 从 lib/mock 取演示数据，生产环境走真实接口
 */

export interface CardBalance {
  /** 可用余额（元） */
  balance: number
  /** 本月已消费（元） */
  monthlySpend: number
  /** 本月消费限额（元） */
  monthlyLimit: number
  /** 卡号后四位 */
  cardTail: string
}

export type CardRecordType = 'consume' | 'recharge'

export interface CardRecord {
  id: string
  /** 发生时间，ISO 字符串 */
  time: string
  /** 消费地点或渠道 */
  place: string
  /** 金额（元），消费为正数，方向由 type 决定 */
  amount: number
  type: CardRecordType
}

export interface CardRecordQuery {
  /** 学生 ID，必传 */
  studentId: string
  type?: CardRecordType
  /** 起始日期，YYYY-MM-DD */
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

/** 分页接口返回完整结构：data 是流水列表，count 是总数 */
export type CardRecordPage = ApiEnvelope<CardRecord[]>

export interface RechargeParams {
  studentId: string
  amount: number
  /** 支付渠道 */
  channel: 'wechat' | 'alipay' | 'cash'
}

export interface RechargeResult {
  /** 支付流水号，用于幂等与对账 */
  tradeNo: string
  amount: number
  status: 'pending' | 'success' | 'failed'
}

/**
 * 查询一卡通消费流水（分页）
 * uri：GET /card/account/record/page
 * mock：lib/mock/card/account/record/page.json
 */
export function getCardAccountRecord(query: CardRecordQuery): Promise<CardRecordPage> {
  const { studentId, type, startDate, endDate, page = 1, pageSize = 20 } = query
  return useRequest().get<CardRecordPage>('/card/account/record/page', {
    query: { type, startDate, endDate, page, pageSize },
    headers: { 'X-Student-Id': studentId },
  })
}

/** 查询余额：GET /card/account/balance */
export function getCardAccountBalance(studentId: string): Promise<ApiEnvelope<CardBalance>> {
  return useRequest().get<ApiEnvelope<CardBalance>>('/card/account/balance', {
    headers: { 'X-Student-Id': studentId },
  })
}

/**
 * 在线充值：POST /card/account/recharge
 *
 * 充值属于资金操作，后端必须按流水号做幂等；
 * 前端提交前也要禁用按钮，避免重复点击。
 */
export function rechargeCard(params: RechargeParams): Promise<ApiEnvelope<RechargeResult>> {
  return useRequest().post<ApiEnvelope<RechargeResult>>('/card/account/recharge', {
    studentId: params.studentId,
    amount: params.amount,
    channel: params.channel,
  })
}
