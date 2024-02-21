import { createStore } from 'vuex'
import axios from 'axios' // 接口封装后导入接口即可
import home from './modules/home'
import sceneModule from './modules/scene'
import packModule from './modules/pack'

const store = createStore({
  state() {
    return {
      name: 'wx', //测试用
      list: [], //测试用
      message: { name: 'wx', age: 18 },
      webSocket: null, //ws
      wsUrl: path.wsPath, //通信地址
      frequency: 1,
      operationTime: ''
    }
  },
  getters: {
    nameInfo(state) {
      return `name:${state.name}`
    },
    getMessage(state) {
      return state.message
    },
    getOperationTime(state) {
      return state.operationTime
    }
  },
  mutations: {
    initWebsocket(state) {
      state.webSocket = new WebSocket(state.wsUrl)
      // debugger
      //连接
      state.webSocket.onopen = function (event) {
        // 如果连接成功则发送心跳，防止ws协议自动断联
        console.log(event)
        setInterval(() => {
          console.log('1')
          state.webSocket.send('1')
        }, 1000 * state.frequency)
      }
      // 消息接收
      state.webSocket.onmessage = function (e) {
        let messageStructure = JSON.parse(e.data)
        if (messageStructure) {
          state.message = messageStructure
        } else {
          state.message = messageStructure.data
        }
        console.log('获取到的消息:', messageStructure)
      }
      // 通讯异常
      state.webSocket.onerror = function () {
        console.log('通讯出现了异常')
      }
      // 关闭连接
      state.webSocket.onclose = function () {
        console.log('关闭连接')
      }
    },
    changeName(state, payload) {
      state.name = payload
    },
    addData(state, payload) {
      state.list = payload
    },
    setOperationTime(state, payload) {
      state.operationTime = payload
    }
  },
  actions: {
    getxxx(context, payload) {
      return new Promise((resolve, reject) => {
        axios
          .get('xxx')
          .then((res) => {
            context.commit('addData', res.data.list)
            resolve({ name: 'wx', age: 9 })
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  },
  modules: {
    home,
    sceneModule: sceneModule,
    packModule: packModule,
    // homeModule: homeModule
  }
})

export default store
