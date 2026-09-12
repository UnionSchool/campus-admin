/**
 * 原子类组件。
 *
 * 判据：元素级、不占版面，扔进任意容器都不会自己撑出一块区域，
 * 多数情况下作为其他组件的零件使用。
 *
 * 这一层最稳定，上层组件都依赖它，新增组件优先补在这里。
 */
import { CaAttendanceBadge } from './attendance-badge'
import { CaAvatar } from './avatar'
import { CaButton } from './button'
import { CaCheckbox } from './checkbox'
import { CaIcon } from './icon'
import { CaInput } from './input'
import { CaProgress } from './progress'
import { CaSelect } from './select'
import { CaSlogan } from './slogan'
import { CaSwitch } from './switch'
import { CaTag } from './tag'
import { CaTextarea } from './textarea'

export {
  CaAttendanceBadge,
  CaAvatar,
  CaButton,
  CaCheckbox,
  CaIcon,
  CaInput,
  CaProgress,
  CaSelect,
  CaSlogan,
  CaSwitch,
  CaTag,
  CaTextarea,
}

export type { AttendanceMeta, AttendanceStatus } from './attendance-badge'
export type { SelectOption, SelectOptions } from './select'

/** 原子层注册表，由顶层 index.ts 合并成 builtInComponents */
export const atomComponents = {
  CaAttendanceBadge,
  CaAvatar,
  CaButton,
  CaCheckbox,
  CaIcon,
  CaInput,
  CaProgress,
  CaSelect,
  CaSlogan,
  CaSwitch,
  CaTag,
  CaTextarea,
}
