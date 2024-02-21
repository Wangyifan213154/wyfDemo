import store from '@/store'
import LayerManagementSource from '@/views/layerList/hooks/layerManagementSource'
import { explotEffect } from '@/utils/czmlprocess/爆炸'
import {
  resetView,
  clearFrustum,
  removeDetectFrustum
} from '@/utils/earth/cameraControl'

export default function () {
  let layerManagementSource = new LayerManagementSource({
    viewer: window.EarthViewer,
    Cesium: window.MSIMEarth
  })

  let bz = new explotEffect(window.EarthViewer)

  let options = {
    earth: window.MSIMEarth,
    viewer: window.viewer,
    type: 'panel'
  }
  let layerList = new window.EarthPlugn.treeManagement(options)

  const handlePD = (json) => {
    if (json.Data.Name) {
      store.commit('setPdTargetTreeData', json.Data.Name)
      // 图层清除
      let resultTreeData = layerList.panelManagement.deleteNode(
        store.state.sceneModule.layerManagementData,
        json.Data.Name
      )
      store.commit(
        'setLayerManagementData',
        JSON.parse(JSON.stringify(resultTreeData))
      )
      // 潜在静态目标
      let targetS = window.EarthViewer.entities.getById(json.Data.Name)
      if (targetS) {
        // console.log('爆炸',json);
        bz.init(targetS._position._value)
        setTimeout(() => {
          bz.remove()
        }, 2000)
      }
      // 潜在动态目标
      let targetM = window.EarthViewer.dataSources.getByName(json.Data.Name)
      if (targetM && targetM.length > 0) {
        let targetMEntity = targetM[0].entities.values[0]
        let YGPosition = targetMEntity.position.getValue(
          window.EarthViewer.clock.currentTime
        )
        if (typeof YGPosition !== 'undefined') {
          // console.log('爆炸',json);
          bz.init(YGPosition)
          setTimeout(() => {
            bz.remove()
          }, 2000)
        }
      }
      // 若观看的实体被删除，切换自由视角
      let viewid = store.state.sceneModule.curViewEntityID
      // console.log(viewid, json.Data.Name)
      if (viewid == json.Data.Name) {
        console.log('视角')
        resetView()
      }
      // 移除战场环境 红色
      window.EarthViewer.entities.removeById(json.Data.Name)
      clearFrustum(json.Data.Name)
      removeDetectFrustum(json.Data.Name)
      let czmlEn = window.EarthViewer.dataSources.getByName(json.Data.Name)
      if (czmlEn && czmlEn.length > 0) {
        console.log('czmlEn', czmlEn)
        czmlEn[0].entities.values[0].show = false
        czmlEn[0].show = false
        setTimeout(() => {
          window.EarthViewer.dataSources.remove(
            window.EarthViewer.dataSources.getByName(json.Data.Name)
          )
        }, 100)
      }
      // 右上角消息提示
      beautyToast.error({
        title: '销毁',
        message: json.Data.LabelName + '移除战场环境',
        darkTheme: true
      })
    }
  }
  return { handlePD }
}
