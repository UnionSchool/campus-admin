/**
 * 应用配置契约。
 *
 * 配置项允许业务项目自由扩展，框架只依赖以下约定字段。
 */
export interface CampusConfig {
  /** 应用名称 */
  name: string
  /** 应用版本 */
  version: string
  /** 业务配置集合，按领域键存储，例如 app、request、auth */
  [key: string]: unknown
}
