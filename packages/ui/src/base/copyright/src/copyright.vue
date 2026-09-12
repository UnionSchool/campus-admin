<!--
 * 版权署名：页面底部统一用它渲染，保证各产品/项目署名口径一致。
 *
 * 用法：
 *   <CaCopyright name="众校通实验学校" />
 *   <CaCopyright name="众校通实验学校" partner="Campus Admin" />
 *   <CaCopyright :name="schoolName" partner="合作方">
 *     <a href="https://example.com">备案号</a>
 *   </CaCopyright>
 *
 * Props：name 版权主体（学校 / 机构名，自动拼成「© 年份 名称」）
 *        displayCopyright 完整自定义版权行（传了就整行替代 name 的自动拼装）
 *        partner 开发者 / 渠道方，传了渲染成「Powered By 开发者 | 众校通 ®」
 * 插槽：default 附加内容（备案号、合作方链接等）
 *
 * 说明：「Powered By 众校通 ®」是固定署名，文案来自词条 ca.copyright.*，
 *       默认中英两套完全相同——署名不随语言变化，但保留走词条以便日后本地化。
 -->
<script setup lang="ts">
import { computed } from 'vue'
import { ns } from '@/core/namespace'
import { useLocale } from '@campus-admin/locale'

defineOptions({ name: 'CaCopyright' })

const props = withDefaults(defineProps<{
  /** 版权主体：学校 / 机构名，渲染为「© 年份 名称」 */
  name?: string
  /** 完整自定义版权行；传了就整行替代 name 的自动拼装 */
  displayCopyright?: string
  /** 开发者 / 渠道方名称 */
  partner?: string
}>(), {
  name: '',
  displayCopyright: '',
  partner: '',
})

const { t } = useLocale()

/** 年份取当前年份，不需要每年改文案 */
const currentYear = new Date().getFullYear()

/** 版权行：优先用完整自定义文案，否则由主体名自动拼 */
const copyrightLine = computed(() => {
  if (props.displayCopyright) return props.displayCopyright
  return props.name ? t('ca.copyright.line', { year: currentYear, name: props.name }) : ''
})

/** 署名行：有合作方时渲染成「Powered By 合作方 | 众校通 ®」 */
const poweredBy = computed(() => (
  props.partner
    ? t('ca.copyright.poweredByPartner', { partner: props.partner })
    : t('ca.copyright.poweredBy')
))
</script>

<template>
  <div :class="ns('copyright')">
    <template v-if="copyrightLine">
      {{ copyrightLine }}
      <br />
    </template>
    {{ poweredBy }}
    <slot />
  </div>
</template>

<style src="../style/index.css"></style>
