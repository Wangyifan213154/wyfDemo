import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as echarts from 'echarts'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'amfe-flexible'
import animated from 'animate.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/css/main.less'
const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus, {
  locale: zhCn
})
app.config.globalProperties.$echarts = echarts
app.use(store)
app.use(router)
app.mount('#app')
