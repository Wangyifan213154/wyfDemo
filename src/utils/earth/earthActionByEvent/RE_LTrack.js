import ConnectLine from '@/utils/earthPlugin/core/actionController/connectLineController'
import store from '@/store'
import { join } from 'lodash'

// 创建连线类
let connectLineManage = new ConnectLine()
const option = {
  earth: window.MSIMEarth,
  viewer: window.viewer
}

export default function () {
  const sceneAction = new window.EarthPlugn.sceneAction(option)
  const initTrackLine = (json) => {
    let color = lineColorConfig[json.Type]
    // let colorC = new window.MSIMEarth.Color(
    //   color[0] / 255,
    //   color[1] / 255,
    //   color[2] / 255,
    //   color[3]
    // )
    let earthObjectConfig = store.state.sceneModule.earthObjectConfig
    let show = earthObjectConfig.findIndex((item) => item == '链路') > -1
    if (typeof json.Line === 'undefined') return
    if (json.Line[0] == 150 && json.Line[1] === 231) return
    let curColor = [0, 0, 0, 0]
    if (json.Line) {
      curColor = json.Line
    }
    let colorC = new window.MSIMEarth.Color(
      curColor[0] / 255,
      curColor[1] / 255,
      curColor[2] / 255,
      curColor[3] / 255
    )
    // 日志展示
    // store.commit('setCzmlEventSourceData', json)
    // console.log(connectLineManage.addLine);

    sceneAction.connectLineManagement.addLine({
      sourId: json.Data.sName,
      targetId: json.Data.tName,
      color: colorC,
      type: json.Type,
      width: 12,
      show: show
    })
    // connectLineManage.addLine({
    //   sourId: json.Data.sName,
    //   targetId: json.Data.tName,
    //   color: colorC,
    //   type: json.Type
    // })
  }

  const dropTrackLine = (json) => {
    // 日志展示
    // store.commit('setCzmlEventSourceData', json)
    // connectLineManage.removeStrikePlan({
    //   sourId: json.Data.sName,
    //   targetId: json.Data.tName,
    //   type: 'RE_LTrackInit'
    // })
    sceneAction.connectLineManagement.removeStrikePlan({
      sourId: json.Data.sName,
      targetId: json.Data.tName,
      type: 'RE_LTrackInit'
    })
  }

  return { initTrackLine, dropTrackLine }
}
