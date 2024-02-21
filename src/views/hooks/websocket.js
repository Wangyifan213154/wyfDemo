/**
 * homeView组件加载时初始化websocket消息
 */
import { useStore } from 'vuex'
import { onMounted } from 'vue'

export default function () {
  const store = useStore()
  const initSocket = () => {
    store.commit('initWebsocket')
  }
  onMounted(() => {
    // 或者是组件挂载前？
    initSocket()
  })

  return {}
}
