/*
 * @Description:
 * @Version: 2.0
 * @Autor: wx
 * @Date: 2022-05-06 01:28:50
 * @LastEditors: wx
 * @LastEditTime: 2022-05-15 02:16:48
 */
const homeModule = {
  namespaced: true, //独立使用
  state() {
    return {
      homeCounter: 100,
      pieEarthShow: true,
      isPieEarthShowFlag: false, // pieEarth 加载成功为true 切换earth 为false
      hualian: 0,
      taskPlaning: 0
    }
  },
  getters: {
    doubleHomeCounter(state, getters, rootState, rootGetters) {
      return state.homeCounter * 2
    },
    otherGetter(state) {
      return 100
    }
  },
  mutations: {
    increment(state) {
      state.homeCounter++
    },
    toggleEarth(state, val) {
      // state.pieEarthShow = !state.pieEarthShow
      state.pieEarthShow = val
      // window.localStorage.setItem('pieEarthShow', state.pieEarthShow)
    },
    changeHualian(state, val) {
      state.hualian = val
    },
    changeTaskPlaning(state, val) {
      state.taskPlaning = val
    },
    changeArea(state, val) {
      state.area = val
    }
  },
  actions: {
    incrementAction({
      commit,
      dispatch,
      state,
      rootState,
      getters,
      rootGetters
    }) {
      commit('increment')
      commit('increment', null, { root: true }) // 提交根里面，即index.js里得increment

      // dispatch
      // dispatch("incrementAction", null, {root: true})
    }
  }
}

export default homeModule
