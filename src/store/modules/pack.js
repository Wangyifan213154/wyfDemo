const packModule = {
  // namespaced: true, //独立使用
  state: {
    dataControl: null, // 图层树地理数据管理对象
    gridData: {} // 格网数据
  },
  getters: {
    getDataControl(state) {
      return state.dataControl
    },
    getGridData(state) {
      return state.gridData
    }
  },
  mutations: {
    setDataControl(state, payload) {
      state.dataControl = payload
    },
    setGridData(state, payload) {
      state.gridData = payload
    }
  },
  actions: {}
  // modules: {
  //   Events
  // }
}

export default packModule
