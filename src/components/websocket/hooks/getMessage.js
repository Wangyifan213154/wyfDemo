/**
 * homeView组件加载时初始化websocket消息
 */
import { useStore } from 'vuex'
import { watch, ref, computed } from 'vue'
import emitter from '@/utils/eventbus'

export default function () {
  let message = ref('')
  let name = ref('')
  let age = ref()
  const store = useStore()
  watch(
    () => store.state.message,
    (newValue, oldValue) => {
      console.log('当前获取的消息：', newValue)
      let msgObj = JSON.parse(newValue.content) //proxy类型转普通obj
      message = msgObj
      if (typeof msgObj.cmd != undefined && msgObj.cmd == 'system-load') {
        emitter.emit('load', message)
      } else {
        emitter.emit('changeCmd', message)
        emitter.emit('changePannel', message)
      }
    }
  )
  return {
    message,
    name,
    age
  }
}
