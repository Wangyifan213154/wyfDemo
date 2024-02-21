import store from '@/store'

export default function () {
  const option = {
    earth: window.MSIMEarth,
    viewer: window.viewer
  }
  const sceneAction = new window.EarthPlugn.sceneAction(option)
  const sensorSwitch = (json) => {
    // 日志展示
    // store.commit('setCzmlEventSourceData', json)
    // 传感器开关
    if (json.Data.ON) {
      let a = window.EarthViewer.entities.getById(json.Data.PName)
      if (!json.Data.MR) return
      let earthObjectConfig = store.state.sceneModule.earthObjectConfig
      let show =
        earthObjectConfig.findIndex((item) => item == '传感器范围') > -1
      console.log(earthObjectConfig, show)
      sceneAction.planeCzmlManage.sensorRange({
        sourId: json.Data.PName,
        type: json.Type,
        radius: json.Data.MR,
        side: json.Data.Side,
        show: show
      })
    } else {
      sceneAction.planeCzmlManage.removeRange({
        sourId: json.Data.PName,
        type: json.Type
      })
    }
  }

  return { sensorSwitch }
}
