import LayerManagement from './layerManagement'
import store from '@/store'
import { addHeatMap, Callback } from '@/utils/mapTools'
import TWHY from '@/utils/earth/tw/twhy'

class LayerManagementSource {
  constructor(options) {
    this.Earth = options.Earth || window.MSIMEarth // 初始化Earth对象
    this.viewer = options.viewer || window.EarthViewer // 初始化viewer对象
    this.LayerManagement = new LayerManagement({
      Earth: this.Earth,
      viewer: this.viewer
    })
    this.dataController = null
  }
  // 改变勾选状态
  updateTickStatus(val, type) {
    let twhy = new TWHY({
      earth: window.MSIMEarth,
      viewer: window.EarthViewer
    })
    this.dataController = store.getters.getDataControl
    val.forEach((item) => {
      this.LayerManagement.updateTree(item.code, type)
      if (type == 'add') {
        /** 增加 */
        // 地理数据
        switch (item.name) {
          case '全球地形':
            this.dataController.addTerrianLayer(item.url)
            break
          case '地球自转':
            store.commit('setEarthRotate', true)
            Callback(true)
            break
          case '地球光照':
            store.commit('setEarthLight', true)
            this.illumination(true)
            break
          // case '九段线':
          //   this.dataController.addNineLine()
          //   break
          case '地名':
            this.dataController.addMainCity()
            break
          case '国家点':
            this.dataController.addChina()
            break
          case '四海两边':
            this.dataController._add4H2B()
            break
          case '重要目标':
            this.dataController.addImportanceTarget()
            break
          case '岛链':
            this.dataController._addDaoLian()
            break
          case '国家边界线':
            this.dataController.guojiexian_C()
            this.dataController.guojiexian_O()
            this.dataController.addNineLine()
            break
          case '机场资源':
            this.dataController.addDLAirport()
            this.dataController.addTWAirport()
            break
          case '台湾机场港口':
            store.commit('changeCEarthComp', {
              name: val.componentName,
              props: {}
            })
            break
          case '台湾导弹阵地':
            store.commit('changeCEarthComp', {
              name: item.componentName,
              props: {}
            })
            break
          case '侦察需求热力图':
            addHeatMap(true)
            break
          case '台湾信息网':
            twhy.viewTaiTXW()
            break
          case '台湾海运线':
            twhy.viewTaiHYX()
            break
          case '台海禁航区':
            twhy.viewTaiHYJZ()

            break
          default:
            break
        }
      } else {
        // 地理数据
        switch (item.name) {
          case '全球地形':
            this.dataController.removeTerrianLayer()
            break
          case '地球自转':
            store.commit('setEarthRotate', false)
            Callback(false)
            break
          case '地球光照':
            store.commit('setEarthLight', false)
            this.illumination(false)
            break
          case '国家边界线':
            this.dataController.clearLayerGeo('guojiexian')
            this.dataController.clearLayerGeo('guojiexian2')
            this.dataController.clearLayerGeo('shengjiexian')
            this.dataController.clearLayerGeo('nineLine')
            break
          case '四海两边':
            this.dataController.clearLayerGeo('4H2B')
            break
          case '岛链':
            this.dataController.clearLayerGeo('daolian1')
            this.dataController.clearLayerGeo('daolian2')
            this.dataController.clearLayerGeo('daolian3')
            break
          case '机场资源':
            store.commit('setLegendSatellite', false)
            this.dataController.clearLayerGeo('DALUJICHANG')
            this.dataController.clearLayerGeo('TAIWANJICHANG')
            break
          case '地名':
            this.dataController.clearLayerGeo('city1')
            this.dataController.clearLayerGeo('city2')
            break
          case '国家点':
            this.dataController.removeEntity({ entityId: 'shoudu' })
            this.dataController.removeEntity({ entityId: 'china' })
            break
          case '九段线':
            this.dataController.clearLayerGeo('nineLine')
            break
          case '重要目标':
            this.dataController.clearImPort()
            break
          // case '台湾机场港口':
          //   store.commit('changeCEarthComp', { name: '', props: {} })
          //   break
          case '台湾导弹阵地':
            store.commit('changeCEarthComp', { name: '', props: {} })
            break
          case '侦察需求热力图':
            addHeatMap(false)
            break
          case '台湾信息网':
            twhy.removeTaiTXW()
            break
          case '台湾海运线':
            twhy.removeTaiHYX()
            break
          case '台海禁航区':
            twhy.removeTaiHYJZ()
            break
          default:
            break
        }
      }
    })
  }
  // 地球光照
  illumination(e) {
    if (e) {
      this.viewer.scene.globe.enableLighting = true
      this.viewer.shadows = true
      this.viewer.terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY
      this.viewer.shadowMap.darkness = 0.02 // 阴影透明度--越大越透明
    } else {
      this.viewer.scene.globe.enableLighting = false
      this.viewer.shadows = false
      this.viewer.terrainShadows = Cesium.ShadowMode.DISABLED
    }
  }
  // 添加节点
  addNode(val, parentName) {
    this.LayerManagement.addTreeNode(val, parentName)
  }
  // 删除节点
  deleteNode(code) {
    this.LayerManagement.deleteTreeNode(code)
  }
}
export default LayerManagementSource
