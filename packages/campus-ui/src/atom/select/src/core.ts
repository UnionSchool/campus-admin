export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export type SelectOptions = Array<string | SelectOption>

/** 统一字符串 / 对象两种写法，组件内部只处理对象数组 */
export function normalizeOptions(options: SelectOptions): SelectOption[] {
  return options.map(option => (typeof option === 'string' ? { label: option, value: option } : option))
}

export function findOption(options: SelectOption[], value: string | number | undefined): SelectOption | undefined {
  if (value === undefined || value === '') return undefined
  return options.find(option => option.value === String(value))
}
