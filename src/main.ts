import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/assets/styles/index'
import 'virtual:uno.css'
import App from './App.vue'
import router from './router'
import {useTheme} from "@/composables";

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
