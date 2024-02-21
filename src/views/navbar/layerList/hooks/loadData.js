import {
  ref,
  onMounted,
  reactive,
  watch,
  getCurrentInstance,
  defineEmits
} from 'vue'
// import loadEvent from '@/utils/earth/cesium/loadEvent'
import store from '@/store/index'
// import { getSceneList } from '@/service/api/coreApi'
import emitter from '@/utils/eventbus'
import LayerManagementSource from './layerManagementSource'
import {
  changeCameraView,
  createFrustumFun,
  clearFrustum,
  removeSightTarget,
  createNoManDetectFrustumFun,
  frustumObjectArray,
  thirdSightFrame,
  thirdSightFrame1,
  removeSightedFrame,
  createDetectFrustumFun
} from '@/utils/earth/cameraControl'
// import { getTargetNameByMissileName } from '@/service/SSE.js'
import {
  getMinHangJSON,
  // getSpaceBoxData
} from '@/service/battlefieldEnvironment'

// const { imageUrl } = path.url

export default function () {
  let viewer = window.viewer
  let Cesium = window.MSIMEarth
  const treeRef = ref(null)
  const state2 = reactive({
    radioValue: 'free',
    clickEntityID: '',
    isShowFrumstum: false,
    showFrumstumDiv: false,
    pathChecked: false,
    wackChecked: false,
    sensorChecked: false,
    wallChecked: false,
    frustumChecked: false,
    sightFrameChecked: false,
    missileLineChecked: false,
    operationalRadiusChecked: false,
    communicationRadiusChecked: false,
    firepowerRadiusChecked: false,
    narrowBandDisbChecked: false,
    fullBandDisbChecked: false,
    existFullBandDisb: true,
    existNarrowBandDisb: true,
    existFrustum: true,
    existPath: true,
    existWack: true,
    existSensor: true,
    existWall: true,
    existSightFrame: true,
    existMissileLine: true,
    existOperationalRadius: true,
    existCommunicationRadius: true,
    existFirepowerRadius: true,
    minhangData: {},
    spaceBoxData: []
  })
  const sceneRealTimeTreeRef = ref(null)
  let layerManagementSource = new LayerManagementSource({
    viewer: window.viewer,
    Cesium: window.Cesium
  })
  let options = {
    earth: window.MSIMEarth,
    viewer: window.viewer,
    type: 'panel'
  }
  let layerList
  // 战场环境数据
  const getBattlefieldEnvironmentData = () => {
    getMinHangJSON().then((res) => {
      state2.minhangData = res
    })
    let params = {
      heightMax: 10000,
      heightMin: 1000,
      latMax: 43,
      latMin: 32,
      level: 9,
      lonMax: 123,
      lonMin: 112,
      maxNum: 100,
      minNum: 4
    }
    getSpaceBoxData(params).then((res) => {
      state2.spaceBoxData = res.data
    })
  }
  onMounted(() => {
    // let options = {
    //   earth: window.MSIMEarth,
    //   viewer: window.viewer,
    //   type: 'panel'
    // }
    // getBattlefieldEnvironmentData()
    layerList = new window.EarthPlugn.treeManagement(options)
    state.treeData = layerList.panelManagement.initTreeNodes(
      state.treeDataDefault
    )
    console.log(state.treeData);
    store.commit('setLayerManagementData', state.treeData)
    console.log(store.state.sceneModule.layerManagementData, 'tree')
    // 初始化时图层树只包含地理数据
    // state.treeData = JSON.parse(JSON.stringify(state.treeDataDefault))
    // 初始化选中的地理数据
    let resTree
    if (state.treeData && state.treeData.length > 0) {
      state.treeData[0].childList.forEach((layer) => {
        if (layer.checked) {
          resTree = layerList.panelManagement.updateTickStatus(
            state.treeData,
            layer,
            'add'
          )
        }
      })
    }
  })
  watch(
    () => store.state.sceneModule.sceneBid,
    (newValue, oldValue) => {
      if (newValue) {
        // 重新加载树
        getSceneListData(newValue)
      }
    }
  )
  watch(
    () => store.state.sceneModule.layerManagementData,
    (newValue, oldValue) => {
      // 更新选中状态
      let checkedData = []
      newValue.forEach((item) => {
        check(item.childList)
      })
      function check(childList) {
        childList.forEach((i) => {
          if (i.checked) {
            checkedData.push(i.code)
          }
          if (i.childList) {
            check(i.childList)
          } else {
            return
          }
        })
      }
      treeRef.value.setCheckedKeys(checkedData)
    },
    { deep: true }
  )
  // tree动态类名 (先声明再调用)
  const customNodeClass = (data, node) => {
    if (data.isPenultimate) {
      // 不显示复选框
      return 'root-node'
    }
    return null
  }
  // 获取全局对象
  const state = reactive({
    defaultProps: {
      label: 'name',
      id: 'code',
      children: 'childList',
      class: customNodeClass
    },
    currentLayer: true, // true 默认图层 false 场景实时实体
    treeData: [], //树结构
    treeDataDefault: [
      // {
      //   code: 1,
      //   name: '地理数据',
      //   disabled: true,
      //   isPenultimate: true,
      //   clickable: false,
      //   childList: [
      //     {
      //       name: '全球地形',
      //       code: 'terrain',
      //       checked: false,
      //       clickable: false,
      //       // url: path.terrainUrl,
      //       geoType: '',
      //       callback: 'globalTerrain'
      //     },
      //     {
      //       name: '地球自转',
      //       code: 'showSwitch',
      //       checked: false,
      //       clickable: false,
      //       geoType: '',
      //       callback: 'earthRotation'
      //     },
      //     {
      //       name: '地球光照',
      //       code: 'showillumination',
      //       checked: false,
      //       clickable: false,
      //       geoType: '',
      //       callback: 'earthIllumination'
      //     },
      //     {
      //       name: '九段线',
      //       code: 'nineLine',
      //       checked: true,
      //       clickable: false,
      //       // url: path.baseDataUrl.nineLine,
      //       // geoType: 'polyline',
      //       // color: Cesium.Color.GOLDENROD,
      //       addname: true,
      //       callback: 'nineDashedLine'
      //     },
      //     {
      //       name: '岛链',
      //       code: 'isLandLian',
      //       checked: true,
      //       clickable: false,
      //       url: '',
      //       geoType: 'polyline',
      //       callback: 'islandChain'
      //       // color: Cesium.Color.YELLOW.withAlpha(0.4)
      //     },
      //     {
      //       name: '四海两边',
      //       code: 'fourSeaTwoBorder',
      //       checked: false,
      //       clickable: false,
      //       // url: path.baseDataUrl.fourSeaTwoBorder,
      //       geoType: 'polygon',
      //       callback: 'add4H2B'
      //       // color: new Cesium.Color(255, 255, 255, 0.4)
      //     },
      //     {
      //       name: '机场资源',
      //       code: 'airport',
      //       clickable: false,
      //       // url: path.baseDataUrl.airport,
      //       geoType: 'point',
      //       // color: Cesium.Color.STEELBLUE,
      //       addname: true,
      //       callback: 'addAirport'
      //     },
      //     {
      //       name: '国家点',
      //       code: 'china',
      //       checked: true,
      //       // url: path.baseDataUrl.airport,
      //       geoType: 'point',
      //       clickable: false,
      //       // color: Cesium.Color.STEELBLUE,
      //       addname: true,
      //       callback: 'nationalPoint'
      //     },
      //     {
      //       name: '地名',
      //       code: 'mainCity',
      //       checked: true,
      //       // url: path.baseDataUrl.airport,
      //       geoType: 'point',
      //       clickable: false,
      //       // color: Cesium.Color.STEELBLUE,
      //       addname: true,
      //       callback: 'geographicName'
      //     },
      //     {
      //       name: '国家边界线',
      //       code: 'borderline',
      //       checked: true,
      //       // url: path.baseDataUrl.borderline,
      //       geoType: 'polyline',
      //       clickable: false,
      //       // color: new Cesium.Color(164 / 255, 91 / 255, 82 / 255, 1),
      //       wcodeth: 4,
      //       callback: 'nationalBoundaryLine'
      //     },
      //     {
      //       name: '重要目标',
      //       code: 'importanceTarget',
      //       geoType: 'point',
      //       clickable: false,
      //       callback: 'importantGoal'
      //     },
      //     {
      //       name: '台湾信息网',
      //       code: 'taiwanInformationNetwork',
      //       clickable: false,
      //       checked: false,
      //       callback: 'taiwanInformationNetwork'
      //     },
      //     {
      //       name: '台湾海运线',
      //       code: 'taiwanShippingLine',
      //       clickable: false,
      //       checked: false,
      //       callback: 'taiwanShippingLine'
      //     },
      //     {
      //       name: '台海禁航区',
      //       code: 'taiwanStraitNoNavigationZone',
      //       clickable: false,
      //       checked: false,
      //       callback: 'taiwanStraitNoNavigationZone'
      //     }
      //   ]
      // },
      // {
      //   code: 2,
      //   name: '战场环境',
      //   disabled: true,
      //   isPenultimate: true,
      //   clickable: false,
      //   childList: [
      //     {
      //       name: '大浪区',
      //       code: 'daLangDistrict',
      //       clickable: false,
      //       checked: false,
      //       callback: 'daLangDistrict'
      //     },
      //     {
      //       name: '民航航线',
      //       code: 'civilAviationHeading',
      //       clickable: false,
      //       checked: false,
      //       callback: 'civilAviationHeading',
      //       data: state2.minhangData
      //     },
      //     {
      //       name: '地形图',
      //       code: 'topographicMap',
      //       clickable: false,
      //       checked: false,
      //       callback: 'topographicMap'
      //     },
      //     // {
      //     //   name: '空间盒',
      //     //   code: 'spaceBox',
      //     //   clickable: false,
      //     //   checked: false,
      //     //   callback: 'spaceBox',
      //     //   data: state2.spaceBoxData
      //     // },
      //     // {
      //     //   name: '第一层网格',
      //     //   code: 'firstGrid',
      //     //   clickable: false,
      //     //   checked: false,
      //     //   callback: 'firstGrid'
      //     // },
      //     // {
      //     //   name: '第二层网格',
      //     //   code: 'secondGrid',
      //     //   clickable: false,
      //     //   checked: false,
      //     //   callback: 'secondGrid'
      //     // }
      //     // {
      //     //   name: '第三层网格',
      //     //   code: 'thirdGird',
      //     //   clickable: false,
      //     //   checked: false,
      //     //   callback: 'thirdGird'
      //     // },
      //     // {
      //     //   name: '第四层网格',
      //     //   code: 'fourthGird',
      //     //   clickable: false,
      //     //   checked: false,
      //     //   callback: 'fourthGird'
      //     // },
      //     // {
      //     //   name: '第五层网格',
      //     //   code: 'fifthGird',
      //     //   clickable: false,
      //     //   checked: false,
      //     //   callback: 'fifthGird'
      //     // }
      //   ]
      // },
      {
        code: 3,
        name: '红方',
        disabled: true,
        isPenultimate: true,
        clickable: false,
        childList: []
      },
      {
        code: 4,
        name: '蓝方',
        disabled: true,
        isPenultimate: true,
        clickable: false,
        childList: []
      }
    ],
    sceneRealTimeEntity: [], // 场景实时实体树结构
    currentChecked: {},
    checkeys: [],
    radioValue: 'free',
    isShowFrumstum: false,
    showFrumstumDiv: false,
    detailVisible: false,
    statusRadio: 'free'
  })

  // 重新加载树
  const getSceneListData = async (sceneID) => {
    // 深拷贝赋值初始地理数据
    state.treeData = store.state.sceneModule.layerManagementData
    store.commit('setLayerManagementData', state.treeData)
  }

  // 图层勾选
  const handleCheck = (val, arg) => {
    if (!val) return
    if (state.currentLayer) {
      // 修改选中状态
      val.checked = !val.checked
      window.sceneAction.planeCzmlManage.showDynamicEntity(val.code, val.checked)
      // kjh图例显隐
      if (
        arg.checkedKeys.includes('firstGrid') ||
        arg.checkedKeys.includes('secondGrid')
      ) {
        emitter.emit('spaceGrid', true)
      } else {
        emitter.emit('spaceGrid', false)
      }
      let resultTreeData
      /** 清除 **/
      if (!val.checked) {
        resultTreeData = layerList.panelManagement.updateTickStatus(
          store.state.sceneModule.layerManagementData,
          val,
          ''
        )
      } else {
        if (val.name == '民航航线') {
          val.data = state2.minhangData
        }
        if (val.name == '空间盒') {
          val.data = state2.spaceBoxData
        }
        resultTreeData = layerList.panelManagement.updateTickStatus(
          store.state.sceneModule.layerManagementData,
          val,
          'add'
        )
      }
      // store.commit(
      //   'setLayerManagementData',
      //   JSON.parse(JSON.stringify(resultTreeData))
      // )
    } else {
      // 单选
      treeRef.value.setCheckedKeys([val.code])
      state.currentChecked = val
      // 如果勾选实体列表，默认显示自由视角
      if (!state.currentLayer) {
        state.radioValue = 'free'
        changeSelected('free')
        state.isShowFrumstum = false
        changeCheck(false)
      }
    }
  }
  // 实体场景勾选
  const handleCheckSceneRealTimeEntity = (val, arg) => {
    // 单选
    sceneRealTimeTreeRef.value.setCheckedKeys([val.code])
    state.currentChecked = val
    // 如果勾选实体列表，默认显示自由视角
    if (!state.currentLayer) {
      state.radioValue = 'free'
      changeSelected('free')
      state.isShowFrumstum = false
      changeCheck(false)
      // if (val.code.indexOf('missile') > -1) {
      //   state.showFrumstumDiv = true
      // }
    }
  }

  const changeSelected = (value) => {
    changeCameraView(state2.clickNode.code, value)
  }
  const changeCheck = (value) => {
    emitter.emit('changeFrumstum', value)
  }

  const pathCheckChange = (value) => {
    if (value) {
      window.sceneAction.planeCzmlManage.addPathLine(state2.clickNode.code)
    } else {
      window.sceneAction.planeCzmlManage.removePathLine(state2.clickNode.code)
    }
  }

  const entityWackChange = (value) => {
    window.sceneAction.planeCzmlManage.showCZMLWake(state2.clickNode.code, value)
  }

  const entityWallChange = (value) => {
    if (value) {
      window.sceneAction.planeCzmlManage.addPathWall(state2.clickNode.code)
    } else {
      window.sceneAction.planeCzmlManage.removePathWall(state2.clickNode.code)
    }
  }

  const entitySensorChange = (value) => {
    window.sceneAction.planeCzmlManage.showSensorRange(state2.clickNode.code, value)
  }

  const entityFrustumChange = (value) => {
    if (value) {
      createFrustumFun(state2.clickNode.code)
      // createDetectFrustumFun(state2.clickNode.code)
      // createNoManDetectFrustumFun(state2.clickNode.code)
    } else {
      clearFrustum(state2.clickNode.code)
      setTimeout(() => {
        removeSightedFrame()
      }, 1000)
    }
  }

  const sightFrameChange = (value) => {
    let sourceSource = window.EarthViewer.dataSources.getByName(
      state2.clickNode.code
    )
    if (sourceSource.length == 0) return
    let entity = sourceSource[0].entities.values[0]
    if (!entity) return
    if (value) {
      thirdSightFrame(entity)
      thirdSightFrame1(entity)
    } else {
      removeSightTarget(state2.clickNode.code)
    }
  }

  // const missileLineChange = (value) => {
  //   let data = {
  //     missileName: state2.clickNode.code
  //   }
  //   getTargetNameByMissileName(data).then((res) => {
  //     if (res.code) {
  //       console.log(res.data)
  //       let id = `RE_WeaponF==${state2.clickNode.code}==${res.data}`
  //       let entityMissileLine = window.EarthViewer.entities.getById(id)
  //       if (entityMissileLine) {
  //         entityMissileLine.show = value
  //       }
  //       let distanceid = `distancelabel==${state2.clickNode.code}==${res.data}`
  //       let distance = window.EarthViewer.entities.getById(distanceid)
  //       if (distance) {
  //         distance.show = value
  //       }
  //     }
  //   })
  // }

  const operationalRadiusChange = (value) => {
    if (value) {
      console.log(state2.clickNode.code)
      window.sceneAction.planeCzmlManage.createEntityCircle({
        sourId: state2.clickNode.code,
        type: 'operationalRadius',
        radius: 50000,
        color: [255, 255, 0]
      })
    } else {
      window.EarthViewer.entities.removeById(
        'operationalRadius' + state2.clickNode.code
      )
    }
  }

  const communicationRadiusChange = (value) => {
    if (value) {
      window.sceneAction.planeCzmlManage.createEntityCircle({
        sourId: state2.clickNode.code,
        type: 'communicationRadius',
        radius: 30000,
        color: [0, 255, 0]
      })
    } else {
      window.EarthViewer.entities.removeById(
        'communicationRadius' + state2.clickNode.code
      )
    }
  }

  const firepowerRadiusChange = (value) => {
    if (value) {
      window.sceneAction.planeCzmlManage.createPan({
        sourId: state2.clickNode.code,
        type: 'firepowerRadius',
        radius: 100000,
        color: [0, 255, 0],
        angle: 140
      })
    } else {
      window.EarthViewer.entities.removeById(
        state2.clickNode.code + 'pan' + 'firepowerRadius'
      )
    }
  }

  const fullBandDisbChange = (value) => {
    if (value) {
      window.sceneAction.planeCzmlManage.createEntityCircle({
        sourId: state2.clickNode.code,
        type: 'fullBandDisb',
        radius: 40000,
        color: [192, 125, 252]
      })
    } else {
      window.EarthViewer.entities.removeById(
        'fullBandDisb' + state2.clickNode.code
      )
    }
  }

  const narrowBandDisbChange = (value) => {
    if (value) {
      window.sceneAction.planeCzmlManage.createPan({
        sourId: state2.clickNode.code,
        type: 'narrowBandDisb',
        radius: 40000,
        color: [192, 125, 252],
        angle: 90
      })
    } else {
      window.EarthViewer.entities.removeById(
        state2.clickNode.code + 'pan' + 'narrowBandDisb'
      )
    }
  }

  // 切换图层
  const handleSwitchLayers = () => {
    // 设置当前场景动态实体列表数据(导弹巡航弹视角)
    let realEntityList = store.getters.getRealTimeEntityList
    let arr = []
    console.log(realEntityList)
    realEntityList.forEach((item) => {
      if (store.state.sceneModule.side == 1) {
        if (item.code == 2) {
          arr.push(item)
        }
      } else if (store.state.sceneModule.side == 0) {
        if (item.code == 1) {
          arr.push(item)
        }
      } else {
        arr.push(item)
      }
    })
    state.sceneRealTimeEntity = arr
    // sceneRealTimeTreeRef.value.setCheckedNodes([])
    if (state.currentLayer) {
      store.commit('setLayerManagementData', state.sceneRealTimeEntity)
      treeRef.value.setCheckedNodes([])
    } else {
      store.commit('setLayerManagementData', state.treeData)
    }
    state.currentLayer = !state.currentLayer
  }

  const handleNodeClick = (node) => {
    if (node.clickable) {
      // 红蓝方显隐
      // showDynamicEntity(node.code, !node.checked)
      state.detailVisible = true
      // console.log(node);
      // state2.clickEntityID = node.code
      state2.clickNode = node
      // 配置选项卡
      configCheckBoxShow(state2.clickNode)
      configChecked(state2.clickNode)
    }
  }

  const configChecked = (node) => {
    let entitywack = window.EarthViewer.entities.getById(
      node.code + 'weijixian'
    )
    if (entitywack) {
      state2.wackChecked = entitywack.show
    }
    // 路径线
    let entitypath = window.EarthViewer.entities.getById(node.code + 'pathLine')
    state2.pathChecked = entitypath ? true : false
    // 路径墙
    let entitywall = window.EarthViewer.entities.getById(node.code + 'pathWall')
    state2.wallChecked = entitywall ? true : false
    // 传感器范围
    let entitysensor = window.EarthViewer.entities.getById(
      `SU==sensor==${node.code}`
    )
    if (entitysensor) {
      state2.sensorChecked = entitysensor.show
    }
    // 瞄准框
    let entitySightFrame = window.EarthViewer.entities.getById(
      node.code + 'thirdSight'
    )
    state2.sightFrameChecked = entitySightFrame ? true : false
    // 视锥
    // console.log(frustumObjectArray.includes(item => item.id == node.code), node.code, frustumObjectArray);
    let frustum = frustumObjectArray.find((item) => item.id == node.code)
    state2.frustumChecked = frustum ? true : false
    // 导弹线
    let data = {
      missileName: state2.clickNode.code
    }
    // getTargetNameByMissileName(data).then((res) => {
    //   if (res.code) {
    //     let id = `RE_WeaponF==${state2.clickNode.code}==${res.data}`
    //     let entityMissileLine = window.EarthViewer.entities.getById(id)
    //     if (entityMissileLine) {
    //       state2.missileLineChecked = entityMissileLine.show
    //     }
    //   }
    // })
    // 半径
    let entityoperational = window.EarthViewer.entities.getById(
      'operationalRadius' + node.code
    )
    state2.operationalRadiusChecked = entityoperational ? true : false
    let entitycommunicationRadius = window.EarthViewer.entities.getById(
      'communicationRadius' + node.code
    )
    state2.communicationRadiusChecked = entitycommunicationRadius ? true : false
    let entityfirepowerRadiusChecked = window.EarthViewer.entities.getById(
      node.code + 'pan' + 'firepowerRadius'
    )
    state2.firepowerRadiusChecked = entityfirepowerRadiusChecked ? true : false
    let entityfullBandDisbChecked = window.EarthViewer.entities.getById(
      'fullBandDisb' + node.code
    )
    state2.fullBandDisbChecked = entityfullBandDisbChecked ? true : false
    let entitynarrowBandDisbChecked = window.EarthViewer.entities.getById(
      node.code + 'pan' + 'narrowBandDisb'
    )
    state2.narrowBandDisbChecked = entitynarrowBandDisbChecked ? true : false
  }

  const configCheckBoxShow = (node) => {
    let entitywack = window.EarthViewer.entities.getById(
      node.code + 'weijixian'
    )
    // console.log(entitywack);
    state2.existWack = entitywack ? true : false

    let entitysensor = window.EarthViewer.entities.getById(
      `SU==sensor==${node.code}`
    )
    state2.existSensor = entitysensor ? true : false

    let missileTypes = ['MEDIUM_RANGE_RADAR_MISSILE', 'LARGE_SAM']
    state2.existMissileLine = missileTypes.find((item) => item == node.type)
      ? true
      : false

    let sourceSource = window.EarthViewer.dataSources.getByName(node.code)
    // if (sourceSource.length == 0) return
    if (sourceSource.length > 0) {
      let entitypath = sourceSource[0].entities.values[0]
      console.log(entitypath)
      state2.existFrustum = true
      state2.existPath = entitypath.path ? true : false
      state2.existWall = entitypath.path ? true : false
      state2.existSightFrame = entitypath.path ? true : false
    } else {
      state2.existFrustum = false
      state2.existPath = false
      state2.existWall = false
      state2.existSightFrame = false
    }
    // let data = {
    //   missileName: id
    // }
    // getTargetNameByMissileName(data).then(res => {
    //   if (res.code == 200) {
    //     state2.existMissileLine = true
    //   } else {
    //     state2.existMissileLine = false
    //   }
    // })
  }

  const handleClose = () => {
    state.detailVisible = false
  }

  // 添加热力图点击显示label监听
  let handlerEvent = null
  let clickShowLabels = {}
  const addMouseMove = (type) => {
    if (!handlerEvent) {
      handlerEvent = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    }

    function showHotNum(event) {
      var picked = viewer.scene.pick(event.position)
      if (Cesium.defined(picked) && picked.id) {
        // 过滤掉线和面
        if (picked.id.polygon && picked.id.properties._number) {
          let hotNumber = picked.id.properties._number.getValue()
          let centerLongitude = picked.id.properties._centerLongitude.getValue()
          let centerLatitude = picked.id.properties._centerLatitude.getValue()
          if (!clickShowLabels[picked.id.id + '-label']) {
            let entity = viewer.entities.add({
              id: picked.id.id + '-label',
              position: Cesium.Cartesian3.fromDegrees(
                centerLongitude,
                centerLatitude,
                1500
              ),
              label: {
                text: '热力值:' + hotNumber,
                font: '400 18px MicroSoft YaHei',
                fillColor: new window.MSIMEarth.Color(
                  230 / 255,
                  0 / 255,
                  0 / 255,
                  0.7
                ),
                style: window.MSIMEarth.LabelStyle.FILL,
                // style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
                horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
                verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
                pixelOffset: new window.MSIMEarth.Cartesian2(-25, -20),
                // showBackground: true,
                backgroundColor: new window.MSIMEarth.Color.fromBytes(
                  235,
                  155,
                  33
                ),
                distanceDisplayCondition:
                  new window.MSIMEarth.DistanceDisplayCondition(0, 350e5)
                // scaleByDistance: new window.MSIMEarth.NearFarScalar(30e5, 1.0, 80e5, 0.7),
                // outlineColor: window.MSIMEarth.Color.BLACK,
                // outlineWidth: 2
              }
            })
            clickShowLabels[picked.id.id + '-label'] = entity
          }
        }
      }
    }
    if (type) {
      if (handlerEvent)
        handlerEvent.setInputAction(
          showHotNum,
          Cesium.ScreenSpaceEventType.LEFT_CLICK
        )
    } else {
      //移除事件监听并清除label
      if (handlerEvent) handlerEvent.removeInputAction(showHotNum)
      handlerEvent = null
      if (Object.keys(clickShowLabels).length > 0) {
        for (let i = 0; i < clickShowLabels.length; i++) {
          if (clickShowLabels[i]) viewer.entities.remove(clickShowLabels[i])
        }
        clickShowLabels = {}
      }
    }
  }

  return {
    state,
    state2,
    handleCheck,
    handleCheckSceneRealTimeEntity,
    treeRef,
    sceneRealTimeTreeRef,
    handleSwitchLayers,
    changeCheck,
    changeSelected,
    handleNodeClick,
    configChecked,
    handleClose,
    pathCheckChange,
    entityWackChange,
    entitySensorChange,
    entityWallChange,
    entityFrustumChange,
    sightFrameChange,
    // missileLineChange,
    firepowerRadiusChange,
    communicationRadiusChange,
    operationalRadiusChange,
    fullBandDisbChange,
    narrowBandDisbChange
  }
}
