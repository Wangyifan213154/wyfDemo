const sceneModule = {
  // namespaced: true, //独立使用
  state: {
    sceneBid: '', //1537697435244036096 1511952921024004096
    layerManagementData: [], //图层数据
    reconnaissanceArea: true, //侦察区域
    curDetectLineState: 'straight', //探测线状态
    process: '', //底部阶段性描述
    czmlEventSourceData: '', //实时信息数据存储
    earthRotate: false, //地球自转
    earthLight: false, //地球光照开关
    cEarthComp: '', //图层面板机场港口导弹阵地
    sceneTestTime: 60, //地球自转速度
    danInfors: {}, //保存第一视角面板相关信息
    showFirstDiv: false,
    voiceUrl: null, // 语音播放
    msgMessionTime: '', //仿真时间
    startingFalseInfo: '', //场景载入数据结束
    curViewEntityID: '', //图层上次点击实体
    damageAssessmentData: {}, //毁伤评估数据
    timeOverviewData: {}, //底部阶段性描述
    showIdentify: false, //识别
    showCarousel: false, //轮播图片
    showVoice: false,
    multiplier: 1,
    playState: 'forward',
    pdTargetTreeData: '', //左侧兵力树节点图片
    timeDelayVal: 1,
    planeConfig: [], //['姿态', '速度', '类型']
    earthObjectConfig: ['链路'], //['传感器范围', '链路', '作战范围']
    audioUrl: '', //右下角视频名称
    redSituation: '5:28:13', //11:28:13  15:28:13  21:28:13 23:28:13
    threatTrendAnalysis: {
      threatLevel: '高', // 高  中 低
      obj: '无人机',
      position: '121.597593，24.0304',
      capacity: '打击', //  打击 侦察 干扰 通信
      intention: '预警探测', // 预警探测 目标指示
      opportunity: '90%'
    } // 威胁趋势分析
  },
  getters: {
    getSceneTestTime(state) {
      return state.sceneTestTime
    },
    getTimeDelay(state) {
      return state.timeDelayVal
    }
  },
  mutations: {
    setSceneID(state, payload) {
      state.sceneBid = payload
    },
    setLayerManagementData(state, payload) {
      state.layerManagementData = payload
    },
    setReconnaissanceArea(state, payload) {
      state.reconnaissanceArea = payload
    },
    setDetectLineState(state, payload) {
      state.curDetectLineState = payload
    },
    setProcess(state, payload) {
      state.process = payload
    },
    setCzmlEventSourceData(state, payload) {
      state.czmlEventSourceData = payload
    },
    setEarthRotate(state, payload) {
      state.earthRotate = payload
    },
    setEarthLight(state, payload) {
      state.earthLight = payload
    },
    changeCEarthComp(state, val) {
      state.cEarthComp = val
    },
    setSceneTest(state, payload) {
      state.sceneTestTime = payload
    },
    setDanInfor(state, payload) {
      state.danInfors = payload
    },
    setShowFirstDiv(state, payload) {
      state.showFirstDiv = payload
    },
    setMsgMessionTime(state, payload) {
      state.msgMessionTime = payload
    },
    setStartingFalseInfo(state, payload) {
      state.startingFalseInfo = payload
    },
    setViewEntityID(state, payload) {
      state.curViewEntityID = payload
    },
    setDamageAssessmentData(state, payload) {
      state.damageAssessmentData = payload
    },
    settimeOverviewData(state, payload) {
      state.timeOverviewData = payload
    },
    setPdTargetTreeData(state, payload) {
      state.pdTargetTreeData = payload
    },
    setTimeDealy(state, payload) {
      state.timeDelayVal = payload
    }
  },
  actions: {}
  // modules: {
  //   Events
  // }
}

export default sceneModule
