/**
 * homeView组件加载时初始化websocket消息
 */
import { useStore } from 'vuex'

export default function () {
  const store = useStore()
  const sendMessageToServer = () => {
    const ws = store.state.webSocket
    if (ws.readyState == 1) {
      ws.send(`{ "name":"runoob", "alexa":10000, "site":"www.runoob.com" }`)
    }
  }

  return {
    sendMessageToServer
  }
}
