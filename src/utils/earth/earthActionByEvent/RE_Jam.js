import ConnectLine from '@/utils/earthPlugin/core/actionController/connectLineController'
import store from '@/store'

// 创建连线类
let connectLineManage = new ConnectLine()
const option = {
  earth: window.MSIMEarth,
  viewer: window.viewer
}

export default function () {
  const sceneAction = new window.EarthPlugn.sceneAction(option)
  const initJamLine = (json) => {
    let color = lineColorConfig[json.Type]
    let earthObjectConfig = store.state.sceneModule.earthObjectConfig
    let show = earthObjectConfig.findIndex((item) => item == '链路') > -1
    let colorC = new window.MSIMEarth.Color(
      color[0] / 255,
      color[1] / 255,
      color[2] / 255,
      color[3]
    )
    sceneAction.connectLineManagement.addLine({
      sourId: json.Data.sName,
      targetId: json.Data.tName,
      color: colorC,
      type: json.Type,
      show: show
    })
  }

  const dropJamLine = (json) => {
    sceneAction.connectLineManagement.removeStrikePlan({
      sourId: json.Data.sName,
      targetId: json.Data.tName,
      type: 'RE_JamS'
    })
  }

  const sensorJam = (json) => {
    let id = `SU==sensor==${json.Data.tName}`
    console.log(id)
    sceneAction.planeCzmlManage.changeSensorRange({
      id: id,
      multiple: 2 / 3,
      text: json.tabelDesc
    })
  }

  return { initJamLine, dropJamLine, sensorJam }
}
