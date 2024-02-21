<template>
  <div class="home">
    <div id="lng-lat-info" class="lng-lat-info"></div>
    <earth-viewer> </earth-viewer>
    <button id="toogle-btn2" @click="ttt" v-show="true">执行</button>
    <homeHeader
      class="animate__animated animate__fadeInDown animate__delay-10s"
    ></homeHeader>
    <!-- 图层列表 -->
    <layerList
      v-show="isShowTree"
      class="animate__animated animate__backInDown animate__delay-10s"
    ></layerList>
    <firstDiv></firstDiv>
    <!-- <el-select class="drawPoint" value-key="value" @change="drawPoint(item)">
      <el-option
        v-for="item in keyList"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select> -->
  </div>
</template>

<script>
// @ is an alias to /src
import EarthViewer from '@/views/3D/EarthViewer.vue'
import layerList from '@/views/navbar/layerList/index.vue'
import firstDiv from '@/utils/bubble/firstDiv'
// 导入hooks
import { websocket } from './hooks/index.js'
import { useStore } from 'vuex'
import emitter from '@/utils/eventbus'
import { reactive, ref, toRefs, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
const homeHeader = defineAsyncComponent(() =>
  import('@/components/homeHeader/HomeHeader.vue')
)

export default {
  name: 'HomeView',
  components: {
    EarthViewer,
    homeHeader,
    layerList,
    firstDiv
  },
  setup() {
    const radarShow = ref(false)
    const store = useStore()
    const state = reactive({
      keyList: [],
      isShowTree: false
    })

    const router = new useRouter()

    const terrainExaggeration = (speed) => {
      const viewer = window.EarthViewer

      let sp = speed || 0.01
      viewer.scene.globe.depthTestAgainstTerrain = true
      viewer.scene.globe.terrainExaggeration = 0
      terrainBand()
      viewer.camera.flyTo({
        destination: new window.XEarth.Cartesian3(
          -3007850.519157388,
          5137536.34772638,
          2341661.9104861133
        ),
        orientation: {
          heading: 0.3444160325644585,
          pitch: -0.18032308765797556,
          roll: 6.282808059773251
        },
        duration: 3,
        pitchAdjustHeight: 30000,
        complete: () => {
          setTimeout(() => {
            // // 绕台旋转
            // let flyingRoam = new FlyingRoam({})
            // flyingRoam.rotate()
            //
            let inter = setInterval(() => {
              if (viewer.scene.globe.terrainExaggeration > 2) {
                // flyRoamTaiwan()
                // setTimeout(() => {
                //   viewer.scene.globe.material = null
                // }, 7000)
                clearInterval(inter)
                // flyingRoam.quitLook2()
              } else {
                viewer.scene.globe.terrainExaggeration += sp
              }
            }, 100)
          }, 1000)
        }
      })
    }

    const terrainBand = () => {
      const viewer = window.EarthViewer

      let entries1 = []
      let colors = [
        [0, 20, 234, 242, 0],
        [200, 20, 234, 242, 0.8],
        [2000, 44, 176, 14, 0.8],
        [4000, 230, 233, 7, 0.8],
        [6000, 227, 119, 9, 0.8],
        [8000, 235, 7, 12, 0.8]
      ]
      colors.forEach((item) => {
        let entry = {
          height: item[0],
          color: new window.XEarth.Color(
            item[1] / 255,
            item[2] / 255,
            item[3] / 255,
            item[4]
          )
        }
        entries1.push(entry)
      })
      const layerBand = [
        {
          entries: entries1,
          extendDownwards: true,
          extendUpwards: true
        }
      ]
      viewer.scene.globe.material = window.XEarth.createElevationBandMaterial({
        scene: viewer.scene,
        layers: layerBand
      })
    }
    // 进入home页面后初始化websocket
    // websocket()
    const viewTW = () => {
      let terrainLayer = new window.XEarth.CesiumTerrainProvider({
        url: googleConfig.terrainTW, //加载地形
        tilingScheme: new window.XEarth.GeographicTilingScheme()
      })
      window.EarthViewer.scene.terrainProvider = terrainLayer
      terrainExaggeration(0.03)
    }
    const ttt = () => {
      let optionCloud = {
        position: [120.1969, 22.8564, 1000],
        id: 'dsadadd'
      }
      // window.sceneAction.environmentController.particleCloudByOption(optionCloud)
      // window.sceneAction.environmentController.twPowerGrid()
      // window.sceneAction.environmentController.addImportancePlantAndSubstation('flowLine')
      // window.sceneAction.satelliteSimulateController.addSatellites()
      // window.sceneAction.satelliteSimulateController.createCzmlGroup()
      // setTimeout(() => {
      //   window.sceneAction.satelliteSimulateController.connect()
      // }, 6000)
      // window.sceneAction.satelliteSimulateController.test()
      let terrainLayer = new window.XEarth.CesiumTerrainProvider({
        url: 'http://localhost:9080/dongbeiDem',
        tilingScheme: new window.XEarth.GeographicTilingScheme()
      })
      window.EarthViewer.scene.terrainProvider = terrainLayer
    }

    onMounted(() => {
      emitter.on('isShowTree', (val) => {
        state.isShowTree = val
      })
      let options = {
        earth: window.MSIMEarth,
        viewer: window.viewer,
        type: 'panel'
      }
      let layerList = new window.EarthPlugn.treeManagement(options)
    })

    return { viewTW, ...toRefs(state), ttt }
  }
}
</script>
<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;

  #toogle-btn {
    z-index: 100;
    position: absolute;
    top: 20px;
    right: 100px;
  }

  #toogle-btn2 {
    z-index: 100;
    position: absolute;
    top: 60px;
    right: 60px;
  }

  .button-box {
    z-index: 100;
    position: absolute;
    top: 60px;
    right: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  .drawPoint {
    position: absolute;
    left: 20px;
    top: 20px;
  }

  #toogle-btn3 {
    z-index: 100;
    position: absolute;
    top: 20px;
    right: 100px;
  }

  #toogle-btn4 {
    z-index: 100;
    position: absolute;
    top: 80px;
    right: 100px;
  }

  #toogle-btn5 {
    z-index: 100;
    position: absolute;
    top: 120px;
    right: 100px;
  }

  .toogle {
    position: absolute;
    top: 110px;
    right: 100px;
    z-index: 100;

    #toogle-btn3 {
      z-index: 100;
      // position: absolute;
      // top: 200px;
      // right: 100px;
    }
  }
}

.home {
  height: 100%;
  width: 100%;
}

.lng-lat-info {
  position: fixed;
  right: 20px;
  bottom: 0px;
  color: white;
  z-index: 9999;
}

.voice {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 999;
  // width:300px!important;
}

#time-div {
  position: absolute;
  z-index: 99;
  left: 100px;
  top: 30px;
  font-size: 30px;
  color: rgb(14, 203, 233);
}

#trailer {
  position: absolute;
  z-index: 99;
  top: 290px;
  left: 162px;
  width: 500px;
  height: 450px;
}
</style>
