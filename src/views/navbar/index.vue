<!-- 工具条 -->
<template>
  <div class="left-navbar" id="toolBar">
    <div class="navbar-btn">
      <div
        v-show="!state.navbarBtn[0].actived"
        @click="showoff(true)"
        @mouseenter="enterItem(state.navbarBtn[0])"
        @mouseout="outItem(state.navbarBtn[0])"
      >
        <el-tooltip
          effect="light"
          :content="state.navbarBtn[0].name"
          placement="left"
        >
          <div>
            <img
              :src="
                state.navbarBtn[0].sign
                  ? state.navbarBtn[0].img4
                  : state.navbarBtn[0].img3
              "
              :alt="state.navbarBtn[0].name"
              style="padding: 10px; width: 30px; height: 30px"
            />
          </div>
        </el-tooltip>
      </div>
      <div v-show="state.navbarBtn[0].actived">
        <div
          v-for="(item, index) in state.navbarBtn"
          :key="index"
          @click="selectMenu(item)"
          @mouseenter="enterItem(item)"
          @mouseout="outItem(item)"
          class="btn-item pointer-cursor"
        >
          <el-tooltip effect="light" :content="item.name" placement="left">
            <div>
              <img
                :src="
                  item.actived || state.activeMenu == item.tag || item.sign
                    ? item.img2
                    : item.img
                "
                :alt="item.name"
                style="padding: 10px; width: 30px; height: 30px"
              />
            </div>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import emitter from '@/utils/eventbus'
// import { getSceneLog } from '@/service/api/coreApi'
import { useStore } from 'vuex'
import { reactive, watch, onMounted, ref } from 'vue'
// import { Callback, addHeatMap, setWXZNSF, cancalWXZNSF } from '@/utils/mapTools'
import ConnectLine from '@/utils/earthPlugin/core/actionController/connectLineController'

const emit = defineEmits(['changeModel', 'openLog', 'openMessage']) //定义事件
onMounted(() => {
  emitter.on('showTree', (val) => {
    let param = {
      name: '图层',
      tag: 'showTree',
      actived: false,
      img: require('@/assets/image/rightNavbar/图层.png'),
      img2: require('@/assets/image/rightNavbar/图层备份.png')
    }
    selectMenu(param)
  })
  emitter.on('gridHot', (val) => {
    state.gridHot = !val
    let param = {
      name: '侦察需求热力图',
      tag: 'gridHot',
      actived: false,
      sign: false,
      img: require('@/assets/image/rightNavbar/地球自转.png'),
      img2: require('@/assets/image/rightNavbar/地球自转-p.png')
    }
    selectMenu(param)
  })
})
const store = useStore()

const state = reactive({
  activeMenu: '', //当前选中的左侧列表
  // earthswitch: store.state.sceneModule.earthRotate,
  gridHot: true, //热力图
  constellationVisible: false, //是否星座面板
  legendoffShow: false,
  navbarBtn: [
    {
      name: '工具栏',
      tag: 'showoff',
      actived: false,
      sign: false,
      img: require('@/assets/image/rightNavbar/显.png'),
      img2: require('@/assets/image/rightNavbar/显-p.png'),
      img3: require('@/assets/image/rightNavbar/隐.png'),
      img4: require('@/assets/image/rightNavbar/隐-p.png')
    },
    {
      name: '时间控制',
      tag: 'timeLine',
      actived: false,
      sign: false,
      img: require('@/assets/image/rightNavbar/时间轴_p.png'),
      img2: require('@/assets/image/rightNavbar/时间轴_选中.png')
    },
    {
      name: '复位',
      tag: 'reset',
      actived: false,
      sign: false,
      img: require('@/assets/image/rightNavbar/复位.png'),
      img2: require('@/assets/image/rightNavbar/复位备份.png')
    },
    {
      name: '二三维切换',
      tag: 'toogleDimension',
      actived: false,
      sign: false,
      img: require('@/assets/image/rightNavbar/二三维.png'),
      img2: require('@/assets/image/rightNavbar/二三维备份.png')
    },
    {
      name: '图层',
      tag: 'showTree',
      actived: false,
      img: require('@/assets/image/rightNavbar/图层.png'),
      img2: require('@/assets/image/rightNavbar/图层备份.png')
    },
    {
      name: '语音交互',
      tag: 'isShowVoice',
      actived: false,
      sign: false,
      img: require('@/assets/image/rightNavbar/流程导引.png'),
      img2: require('@/assets/image/rightNavbar/流程导引_选中.png')
    },
    {
      name: '军标',
      tag: 'militaryPlot',
      actived: false,
      sign: false,
      img: require('@/assets/image/rightNavbar/图例.png'),
      img2: require('@/assets/image/rightNavbar/图例-p.png')
    },
    {
      name: '场景执行',
      tag: 'scenarioExecution',
      actived: false,
      sign: false,
      img: require('@/assets/image/rightNavbar/光照开关.png'),
      img2: require('@/assets/image/rightNavbar/光照开关-p.png')
    },
    {
      name: '深度',
      tag: 'depthTestAgainstTerrain',
      actived: false,
      sign: false,
      img: require('@/assets/image/rightNavbar/加载卫星.png'),
      img2: require('@/assets/image/rightNavbar/加载卫星备份.png')
    }
  ],
  isShowTree: false, //是否展示图层列表
  isScenarioExecution: false, //场景执行按钮
  isShowTimeLine: false,
  isShowEntities: true, //第一次点击隐藏
  isShowDia: false,
  isShowlegent: false,
  GraticuleController: null, // 经纬网对象
  ceshi: false,
  showReconnaissanceArea: true, // 侦察区域
  showReconnaissanceObject: true, // 侦察对象
  defendSurroundObject: true,
  showMilitaryPlot: false, //军标
  isShowVoice: false, //czml路径
  stageDescription: false, // 阶段性描述
  detectLineStates: ['straight', 'parabola', 'hide'], // 所有探测线状态
  curDetectLineState: 'straight' // 当前探测线状态
})
// 按钮移入移出
const enterItem = (item) => {
  // if (item.actived == false) {
  //   return
  // }
  item.sign = true
}
const outItem = (item) => {
  if (item.name == '复位') {
    item.actived = false
  }
  item.sign = false
}

// 工具条点击事件
const selectMenu = (item) => {
  state.activeMenu = ''
  item.actived = !item.actived
  // 创建连线类
  let connectLineManage = new ConnectLine()
  switch (item.tag) {
    case 'showTree':
      if (state.isShowTree) {
        state.activeMenu = ''
      } else {
        state.activeMenu = item.tag
      }
      showTree()
      break
    case 'reset':
      reset()
      break
    case 'toogleDimension':
      toogleDimension()
      break
    // 经纬网
    case 'toggleLngLatGrid':
      if (!state.GraticuleController) {
        state.GraticuleController = store.getters.getGraticuleController
      }
      state.GraticuleController.setVisible(
        !state.GraticuleController.isVisible()
      )
      break
    case 'showPanel':
      if (!state.isShowDia) {
        state.activeMenu = item.tag
      } else {
        item.actived = false
        item.sign = false
        state.activeMenu = ''
      }
      showPanel()
      break
    case 'showSwitch':
      state.earthswitch = !state.earthswitch
      store.commit('setEarthRotate', state.earthswitch)
      rotate(state.earthswitch)
      break
    // 图例
    case 'legendoff':
      // store.state.sceneModule.legendoff = !store.state.sceneModule.legendoff
      state.legendoffShow = !state.legendoffShow
      store.commit('setLegendoffShow', state.legendoffShow)
      legendoff(state.legendoffShow)
      break
    // 导调控制
    case 'timeLine':
      // if (window.EarthViewer.timeline.container.style.zIndex == 1) {
      //   window.EarthViewer.timeline.container.style.zIndex = -1
      //   emitter.emit('changeTimeLineState', false)
      // } else {
      //   window.EarthViewer.timeline.container.style.zIndex = 1
      //   emitter.emit('changeTimeLineState', true)
      // }
      state.isShowTimeLine = !state.isShowTimeLine
      emitter.emit('changeTimeLineState', state.isShowTimeLine)
      break
    case 'outputLog':
      // getSceneLog().then((res) => {
      //   if (res.code == 200) {
      //     let content = `${JSON.stringify(res.data.sceneInfo)}\n\n`
      //     const ct = res.data.sceneConfiguration.actors
      //     for (let index = 0; index < ct.length; index++) {
      //       const element = ct[index]
      //       content += JSON.stringify(element) + '\n\n'
      //     }
      //     const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      //     const fileName = '推演结果.txt'
      //     const link = document.createElement('a')
      //     link.href = window.URL.createObjectURL(blob)
      //     link.download = fileName
      //     link.click()
      //   }
      // })
      break
    case 'showoff':
      showoff(false)
      break
    // 网格热力图
    case 'gridHot':
      if (!state.gridHot) {
        state.activeMenu = item.tag
      } else {
        state.activeMenu = ''
      }
      item.actived = !item.actived
      state.gridHot = !state.gridHot
      // addHeatMap(state.gridHot)
      reset()
      break
    // 星座配置
    case 'constellationConfiguration':
      if (state.constellationVisible) {
        state.activeMenu = ''
      } else {
        state.activeMenu = item.tag
      }
      state.constellationVisible = !state.constellationVisible
      emitter.emit('constellationVisible', state.constellationVisible)
      emit('showTree', false) //图层隐藏
      state.navbarBtn.map((item) => {
        if (item.tag == 'showTree') {
          item.actived = false
        }
      })

      break
    // czml路径
    case 'isShowVoice':
      state.isShowVoice = !state.isShowVoice
      if (state.isShowVoice) {
        store.state.sceneModule.showVoice = true
      } else {
        store.state.sceneModule.showVoice = false
      }
      break
    case 'ceshi':
      console.log('ceshi')
      state.ceshi = !state.ceshi
      if (state.ceshi) {
        // 右上角提示
        // beautyToast.success({
        //   title: 'Success',
        //   message: 'This is Success Message',
        //   darkTheme: true
        // })
        // emitter.emit('changeRedState','无人机')
      } else {
        // 右上角提示
        // beautyToast.error({
        //   title: 'Error',
        //   message: 'This is Error Message',
        //   darkTheme: true
        // })
        // beautyToast.info({
        //   title: 'Info',
        //   message: 'This is Info Message www.bootstrapmb.com',
        //   darkTheme: true
        // })
        // beautyToast.warning({
        //   title: 'Warning',
        //   message: 'This is Warning Message',
        //   darkTheme: true
        // })
        // emitter.emit('changeBlueState','地面预警2')
      }
      break
    case 'reconnaissanceArea':
      state.showReconnaissanceArea = !state.showReconnaissanceArea
      store.commit('setReconnaissanceArea', state.showReconnaissanceArea)
      if (state.showReconnaissanceArea) {
        connectLineManage.showEntityByKeyword('SU==sensor', true)
        state.activeMenu = item.tag
      } else {
        connectLineManage.showEntityByKeyword('SU==sensor', false)
        state.activeMenu = ''
      }
      break
    // case 'detectLineControl':
    case 'detectLineControl':
      // state.showReconnaissanceObject = !state.showReconnaissanceObject
      // store.commit('setDetectLineState', state.showReconnaissanceObject)
      // if (state.showReconnaissanceObject) {
      //   connectLineManage.showEntityByKeyword('RE_LTrackInit', true)
      //   state.activeMenu = item.tag
      // } else {
      //   connectLineManage.showEntityByKeyword('RE_LTrackInit', false)
      //   state.activeMenu = ''
      // }
      let cur = state.curDetectLineState
      let curIndex = state.detectLineStates.findIndex((item) => item == cur)
      let nextIndex =
        curIndex == state.detectLineStates.length - 1 ? 0 : curIndex + 1
      state.curDetectLineState = state.detectLineStates[nextIndex]
      console.log(state.curDetectLineState)
      if (state.curDetectLineState == 'hide') {
        console.log('隐藏')
        connectLineManage.showEntityByKeyword('RE_LTrackInit', false)
        connectLineManage.showEntityByKeyword('RE_WeaponF', false)
        connectLineManage.showEntityByKeyword('RE_JamS', false)
        connectLineManage.showEntityByKeyword('distancelabel', false)
        emitter.emit('changeConnectionLegend', false)
        state.activeMenu = ''
      } else {
        connectLineManage.showEntityByKeyword('RE_LTrackInit', true)
        connectLineManage.showEntityByKeyword('RE_WeaponF', true)
        connectLineManage.showEntityByKeyword('RE_JamS', true)
        connectLineManage.showEntityByKeyword('distancelabel', true)
        emitter.emit('changeConnectionLegend', true)
        state.activeMenu = item.tag
      }
      // state.activeMenu = state.curDetectLineState !== 'hide' ? item.tag : ''
      store.commit('setDetectLineState', state.curDetectLineState)
      break
    case 'defendSurroundObject':
      state.defendSurroundObject = !state.defendSurroundObject
      if (state.defendSurroundObject) {
        connectLineManage.showEntityByKeyword('defendSurround', true)
        state.activeMenu = item.tag
      } else {
        connectLineManage.showEntityByKeyword('defendSurround', false)
        state.activeMenu = ''
      }
      break
    case 'militaryPlot':
      state.showMilitaryPlot = !state.showMilitaryPlot
      if (state.showMilitaryPlot) {
        emitter.emit('changeMilitaryPlot', true)
        state.activeMenu = item.tag
      } else {
        emitter.emit('changeMilitaryPlot', false)
        state.activeMenu = ''
      }
      break
    case 'stageDescription':
      // state.stageDescription = !state.stageDescription
      // store.commit('setReconnaissanceObject', state.stageDescription)
      if (item.actived) {
        //  显示阶段性描述
        state.activeMenu = item.tag
        emitter.emit('showStageDescription', true)
      } else {
        // 隐藏阶段性描述
        state.activeMenu = ''
        emitter.emit('showStageDescription', false)
      }
      state.navbarBtn.map((i) => {
        if (i.tag == 'stageDescription') {
          i.actived = item.actived
        }
      })
      // item.actived = !item.actived
      break
    case 'scenarioExecution':
      if (store.state.curSceneName) {
        if (state.isScenarioExecution) {
          state.activeMenu = ''
        } else {
          state.activeMenu = item.tag
        }
        state.isScenarioExecution = !state.isScenarioExecution
        emitter.emit('scenarioExecution', state.isScenarioExecution)
      } else {
        item.actived = false
        beautyToast.warning({
          title: 'Warning',
          message: '请选择场景',
          darkTheme: true
        })
      }
      break
    case 'depthTestAgainstTerrain':
      if (window.EarthViewer.scene.globe.depthTestAgainstTerrain) {
        window.EarthViewer.scene.globe.depthTestAgainstTerrain = false
        return
      }
      window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
      break
    default:
      break
  }
}

//复位
const reset = () => {
  const viewer = window.EarthViewer
  // emitter.emit('closeES', '结束') // 结束ES测试
  //清除相机视角固定
  viewer.trackedEntity = ''
  viewer.camera.flyTo({
    destination: new window.MSIMEarth.Cartesian3.fromDegrees(
      109.87,
      34.706,
      21851000
    ),
    orientation: {
      heading: 6.283185307179586,
      pitch: -1.5702354045820344,
      roll: 0
    }
  })
  // let pathIds = store.getters.getSelectSatelliteIdList
  // pathIds.forEach((element) => {
  //   let ds = viewer.dataSources.getByName(element)
  //   if (ds.length > 0) {
  //     for (let t = 0; t < ds.length; t++) {
  //       ds[t].entities.removeAll()
  //     }
  //   }
  // })

  // let ens = viewer.entities.values
  // ens.forEach((element) => {
  //   if (element.id.indexOf('椎体') > -1) {
  //     let removePartId = element.id.split('-椎体')[0]
  //     let walltrail = viewer.entities.getById(removePartId + '-wall-trail')
  //     viewer.entities.remove(element)
  //     viewer.entities.remove(walltrail)
  //     if (window['curDivPoint' + removePartId]) {
  //       window['curDivPoint' + removePartId].closeEvent()
  //     }
  //   }
  // })
  // debugger
  // let msg = [
  //   {
  //     id: '0_1_357',
  //     type: 'sar'
  //   },
  //   {
  //     id: '0_1_177',
  //     type: 'sar'
  //   }
  // ]
  // msg.forEach((element) => {
  //   let ds = viewer.dataSources.getByName(element.type)
  //   let obj = ds[0].entities.getById(element.id)
  //   setWXZNSF(obj)
  //   store.commit('setSatelliteEvent', element)
  // })
}

//卫星显隐
// let toogleCZMLPath = ref(false)
const tooglePath = () => {
  const viewer = window.EarthViewer
  const Cesium = window.MSIMEarth
  let statelLayers = viewer.dataSources.getByName('SATELITE')
  let CustomLayers = viewer.dataSources.getByName('CustomEntity')
  if (!state.isShowEntities) {
    statelLayers[0].entities.values.forEach((e) => {
      e.show = false
    })
    CustomLayers[0].entities.values.forEach((e) => {
      e.show = false
    })
  } else {
    statelLayers[0].entities.values.forEach((e) => {
      e.show = true
    })
    CustomLayers[0].entities.values.forEach((e) => {
      e.show = true
    })
  }
}

// 二三维切换
let mapType = ref('mapView')
const toogleDimension = () => {
  const viewer = window.EarthViewer
  const Cesium = window.MSIMEarth
  if (mapType.value === 'sceneView') {
    if (viewer.view === 'sceneView') {
      return
    }
    viewer.view = 'sceneView'
    viewer.scene.morphTo3D(0)
    mapType.value = 'mapView'
  } else {
    if (viewer.view === 'mapView') {
      return
    }
    viewer.scene.morphTo2D(0)
    viewer.view = 'mapView'
    mapType.value = 'sceneView'
  }
}

// 显示图层列表
const showTree = () => {
  state.isShowTree = !state.isShowTree
  emit('showTree', state.isShowTree)
  emitter.emit('constellationVisible', false) //星座配置隐藏
  state.navbarBtn.map((item) => {
    if (item.tag == 'constellationConfiguration') {
      item.actived = false
    }
  })
  // let msg = {
  //   id: '0_1_357'
  // }
  // let ds = viewer.dataSources.getByName('sar')
  // let obj = ds[0].entities.getById('0_1_357')
  // cancalWXZNSF(obj)
  // store.commit('removeSatelliteEvent', msg)
}

let showDiatext = false
// 显示智能问答框
const showPanel = () => {
  state.isShowDia = !state.isShowDia
  if (state.isShowDia) {
    emitter.emit('showDia', true)
  } else {
    emitter.emit('showDia', false)
    if (showDiatext) {
      store.commit('setShowDia', false)
    }
  }
}

watch(
  () => store.state.sceneModule.sceneBid,
  (newValue, oldValue) => {
    if (store.state.sceneModule.sceneBid != '') {
      state.navbarBtn = arr
    }
  }
)

//日志控制智能问答
watch(
  () => store.state.sceneModule.showDia,
  (newValue, oldValue) => {
    if (newValue) {
      state.isShowDia = true
      state.activeMenu = 'showPanel'
      showDiatext = true
      return
    }
    showDiatext = false
  }
)

// 显示阶段性描述
watch(
  () => store.state.sceneModule.startingFalseInfo,
  (newValue, oldValue) => {
    let param = {
      name: '阶段性描述',
      tag: 'stageDescription',
      actived: false,
      sign: false,
      img: require('@/assets/image/rightNavbar/加载卫星.png'),
      img2: require('@/assets/image/rightNavbar/加载卫星备份.png')
    }
    selectMenu(param)
  }
)
// 图例开关
const legendoff = (e) => {
  store.commit('setLegendoff', e)
}

// 工具条开关
const arr = state.navbarBtn
const showoff = (e) => {
  state.navbarBtn[0].actived = e
  if (!store.state.sceneModule.legendoff) {
    state.navbarBtn = state.navbarBtn.filter((item) => item.name != '图例')
    // state.navbarBtn = state.navbarBtn.filter((item) => item.name != '导调控制')
    state.navbarBtn = state.navbarBtn.filter(
      (item) => item.name != '导出推演结果'
    )
  } else {
    state.navbarBtn = arr
  }
}
</script>

<style lang="less" scoped>
.left-navbar {
  // height: calc(100% - 80px);
  height: 50px;
  width: auto;
  background: transparent;
  // background: url('~@/assets/image/leftNavbar/左侧导航栏底6.png');
  // background-size: 100% 100%;
  // position: absolute;
  // // top: 80px;
  // top: 7%;
  // right: 22%;
  z-index: 22;
  position: absolute;
  right: 2%;
  top: 7%;

  .navbar-logo {
    height: 50px;
    padding: 10px 0;
  }

  .navbar-btn {
    display: flex;

    .btn-item pointer-cursor {
      display: inline-block;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50px;
      width: 50px;
    }
  }
}
</style>
