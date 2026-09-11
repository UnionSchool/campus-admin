import { createApp } from 'vue'
import { ca, createCampusAdmin } from '@unionschool/campus-admin'
import '@unionschool/campus-admin/style.css'
import './style/app.css'
import App from './App.vue'
import router, { initApp } from './src/router'
import { initTheme } from './src/composables/useTheme'
import { initLanguage } from './src/composables/useLanguage'
import { businessMessages } from './src/locale'
import { requestProvider } from './src/lib/provider'

// 先落主题再建应用，避免首屏先亮色再变暗
initTheme()

// 语言与主题一样在挂载前定好，避免首屏先中文再切英文
const language = initLanguage()

const app = createApp(App)

// 通过主包入口装配框架：注册组件、注入应用实例、启动生命周期
const campus = createCampusAdmin({
  name: '智慧校园',
  version: '0.1.0-alpha.1',
  config: {
    request: { baseURL: '/api', debug: import.meta.env.DEV, mock: import.meta.env.DEV },
    permission: { mode: 'rbac' },
    /**
     * 业务语言包交给框架：与组件库内置的 ca.* 词条深合并到同一个语言实例，
     * 两套词库、一个实例，组件文案与业务文案一起切换。
     */
    locale: { locale: language, fallbackLocale: 'zh-CN', messages: businessMessages },
  },
  // 请求层通过 Provider 注册，业务代码用 campus('request') 取实例
  providers: [requestProvider],
})

app.use(campus)
app.use(router)

/**
 * 挂载全局命令式 API，业务页面即可直接 ca.toast(...)、ca.alert(...)。
 * 已有同名全局对象时不覆盖，避免与第三方脚本冲突；需要类型提示时按需 import。
 */
if (typeof window !== 'undefined') {
  // 不覆盖已有同名全局对象，避免与第三方脚本冲突
  const target = window as unknown as { ca?: typeof ca }
  if (!target.ca) target.ca = ca
}

// 菜单依赖后端下发，先初始化再挂载，避免首屏出现空菜单
initApp()
  .catch(error => console.error('[app] 初始化失败：', error))
  .finally(() => app.mount('#app'))
