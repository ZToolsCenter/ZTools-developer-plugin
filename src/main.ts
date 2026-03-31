import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/assets/styles/index'
import 'virtual:uno.css'
import App from './App.vue'
import router from './router'
import {useTheme} from "@/composables";
import { dispatchZtoolsCodeEvent, initZtoolsBaseEventHandler } from '@/events'
// 单独导入注册事件
import './events/allCodeEvent'

if (window.ztools) {
  initZtoolsBaseEventHandler();

  // 统一对 zTools onPluginEnter 事件进行派发, 内部不要再对 ztools.onPluginEnter 进行监听
  ztools.onPluginEnter((action) => {
    // 将 utools 事件派发根据不同的 code 进行派发出去
    console.log('[插件事件: onPluginEnter]', action)
    dispatchZtoolsCodeEvent(action, router)
  })
}



const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

useTheme({
  setDarkTheme: () => {
    document.documentElement.setAttribute('class', 'dark')
  },
  setDefaultTheme: () => {
    document.documentElement.removeAttribute('class')
  },
})
