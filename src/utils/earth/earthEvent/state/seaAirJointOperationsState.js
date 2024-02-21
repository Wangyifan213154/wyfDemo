import store from '@/store'
import LayerManagementSource from '@/views/layerList/hooks/layerManagementSource'
import {
  RE_LTrack,
  SU,
  RE_WeaponF,
  RE_Jam
} from '@/utils/earth/earthActionByEvent'
import {
  createDetectFrustumFun,
  removeDetectFrustum,
  createNoManDetectFrustumFun
} from '@/utils/earth/cameraControl'

export default function () {
  let layerManagementSource = new LayerManagementSource({
    viewer: window.EarthViewer,
    Cesium: window.MSIMEarth
  })
  const { initTrackLine, dropTrackLine } = RE_LTrack()
  const { sensorSwitch } = SU()
  const { initWeaponFLine } = RE_WeaponF()
  const { initJamLine, dropJamLine, sensorJam } = RE_Jam()

  const handleState = (json) => {
    switch (json.Type) {
      case 'SU':
        // 日志展示
        // store.commit('setCzmlEventSourceData', json)
        console.log(json)
        if (json.Data.ON) {
          if (json.Data.Name == 'optical') {
            if (json.Data.PName == 'RAircraft1') {
              createDetectFrustumFun(json.Data.PName, -40)
            } else if (json.Data.PName == 'RAircraft2') {
              createDetectFrustumFun(json.Data.PName, 40)
            }
            setTimeout(() => {
              store.state.sceneModule.showIdentify = true
            }, 24000)
            console.log('zhence')
            // return
          } else if (json.Data.Name == 'ruav') {
            console.log('zhence')
            setTimeout(() => {
              store.state.sceneModule.showIdentify = true
            }, 6000)
            createNoManDetectFrustumFun(json.Data.PName)
            // return
          }
        } else {
          if (json.Data.Name == 'optical' || json.Data.Name == 'ruav') {
            removeDetectFrustum(json.Data.PName)
            store.state.sceneModule.showIdentify = false
            // store.state.sceneModule.showCarousel = true
            // return
          }
        }

        sensorSwitch(json)
        break
      case 'plateMove':
        console.log(json)
        let a = window.EarthViewer.entities.removeById(json.Data.Name)
        window.EarthViewer.entities.removeById(`SU==${json.Data.Name}`)
        window.EarthViewer.entities.removeById(`SU==${json.Data.Name}==big`)
        window.EarthViewer.entities.removeById(`SU==${json.Data.Name}==small`)
        break
      case 'RE_LTrackInit':
        // 日志展示
        // store.commit('setCzmlEventSourceData', json)
        initTrackLine(json)
        break
      case 'RE_LTrackDrop':
        // 日志展示
        // store.commit('setCzmlEventSourceData', json)
        dropTrackLine(json)
        break
      case 'RE_WeaponF':
        // 日志展示
        console.log(json)
        // store.commit('setCzmlEventSourceData', json)
        initWeaponFLine(json)
        break

      case 'RE_JamS':
        // 受到干扰
        console.log('tabelDesc', json)
        initJamLine(json)
        sensorJam(json)
        break
      case 'RE_JamE':
        dropJamLine(json)
        break
      case 'process':
        // 底部阶段性描述
        store.commit('setProcess', json.Name)
        break
      default:
        break
    }
  }
  return { handleState }
}
