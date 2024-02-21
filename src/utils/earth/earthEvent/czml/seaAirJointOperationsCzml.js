import { onMounted } from 'vue'
import store from '@/store'
import { wjxian } from '@/utils/earth/czmlTool'
import { defendSurround } from '@/views/hooks/twSeaLandSkyBase.js'

export default function () {
  const sceneAction = new window.EarthPlugn.sceneAction({
    earth: window.MSIMEarth,
    viewer: window.viewer
  })
  let timeC = 0
  let i = 0
  const handleCzmlUpdate = (json) => {
    if (json && json[0]) {
      // console.log(json);
      // console.log(window.MSIMEarth.JulianDate.toIso8601(window.EarthViewer.clock.currentTime));
      if (i < 1) {
        setTimeout(() => {
          defendSurround()
        }, 4000)
        console.log(`当前时间差是${json[1].position.cartographicDegrees[0]}`)
        timeC = json[1].position.cartographicDegrees[0]
        i++
      }
      json[1].position.cartographicDegrees[0] -=
        timeC - (store.getters.getTimeDelay + timeVal)
      // json[1].position.cartographicDegrees[0] += 1.0
      json[1].path.show = false
      // json[1].path.leadTime = 50000
      // json[0].clock.multiplier = store.state.sceneModule.multiplier
      json[1].path.trailTime = 50000
      let name = json[1].name
      if (name == 'destroyer1') {
        // console.log(json)
        // console.log(store.state.sceneModule.msgMessionTime);
      }
      json[0].name = json[1].name
      // json[1].label = czmlLabel(
      //   json[1].label.text,
      //   json[1].properties.airplaneAction
      // )
      json[1].label = sceneAction.planeCzmlManage.changePlaneLabel({
        name: json[1].label.text,
        data: json[1].properties.airplaneAction,
        configContent: store.state.sceneModule.planeConfig
      })
      json[1].label.showBackground = false
      delete json[1].availability

      json[0].clock.currentTime =
        window.EarthViewer.clock.currentTime.toString()

      let czmlcontainer = window.EarthViewer.dataSources.getByName(name)
      if (
        czmlcontainer.length === 0 &&
        typeof czmlcontainer.clock === 'undefined'
      ) {
        czmlcontainer = new window.MSIMEarth.CzmlDataSource(name)
        window.EarthViewer.dataSources.add(czmlcontainer)
        console.log('首次创建', json)
        czmlcontainer.process(json)
        // if (
        //   json[1].name === 'PursuitFighter' ||
        //   json[1].name === 'ManeuverFighter'
        // ) {
        //   wjxian(name, json[1].properties.airplaneAction.side)
        // }
        wjxian(name, json[1].properties.airplaneAction.side)
        // 首次创建 添加到图层面板
      } else {
        czmlcontainer[0].entities.values[0].label.style =
          window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE
        czmlcontainer[0].entities.values[0].label.outlineWidth = 5
        czmlcontainer[0].entities.values[0].label.fillColor =
          window.MSIMEarth.Color.WHITE
        if (
          czmlcontainer[0].entities.values[0].properties.airplaneAction._value
            .side === 'blue'
        ) {
          czmlcontainer[0].entities.values[0].path.material =
            new window.window.MSIMEarth.Color(0.0, 1.0, 1.0, 1.0)
          czmlcontainer[0].entities.values[0].path.width = 0.5
          czmlcontainer[0].entities.values[0].model.silhouetteColor =
            new window.MSIMEarth.Color(0.0, 1.0, 1.0, 0.3)
          czmlcontainer[0].entities.values[0].label.outlineColor =
            window.MSIMEarth.Color.BLUE
        } else {
          czmlcontainer[0].entities.values[0].path.material =
            new window.window.MSIMEarth.Color(1, 0, 0, 1)
          czmlcontainer[0].entities.values[0].path.width = 0.5
          czmlcontainer[0].entities.values[0].model.silhouetteColor =
            new window.MSIMEarth.Color(1.0, 0.0, 0.0, 0.3)
          czmlcontainer[0].entities.values[0].label.outlineColor =
            window.MSIMEarth.Color.RED
        }
        czmlcontainer[0].entities.values[0].model.silhouetteSize = 0.5
        czmlcontainer[0].entities.values[0].label.distanceDisplayCondition =
          new window.MSIMEarth.DistanceDisplayCondition(0, 20e5)
        czmlcontainer[0].entities.values[0].label.backgroundColor =
          new window.MSIMEarth.Color(1, 1, 1, 0.2)
        // // 根据仿真端传递的信息实时计算HPR
        // json[1].orientation = {
        //   unitQuaternion: [0, 0, 0, 0] // 这里替换成算好的四元数
        // }
        // 移除不必要的属性
        delete json[1].model
        delete json[1].orientation
        delete json[1].path
        czmlcontainer[0].process(json)
      }
    }
  }
  const czmlLabel = (name, data) => {
    // let text = `${nameReplace(name)}\n
    // 方向角：${data.heading.toFixed(2)}\n
    // 俯仰角：${data.pitch.toFixed(2)}\n
    // 翻滚角：${data.roll.toFixed(2)}\n
    // 速度：${data.speed.toFixed(2)}\n
    // 类型：${data.type}\n`
    let type = 1
    let text =
      name +
      '\n' +
      'H:' +
      data.heading.toFixed(3) +
      ' ' +
      'P:' +
      data.pitch.toFixed(3) +
      ' ' +
      'R:' +
      data.roll.toFixed(3) +
      '\n' +
      // '俯仰角：' +
      // data.pitch.toFixed(2) +
      // '\n' +
      // '翻滚角：' +
      // data.roll.toFixed(2) +
      // '\n' +
      '速度：' +
      data.speed.toFixed(2)
    '\n' + '类型：' + data.type
    switch (type) {
      case 1:
        text =
          name +
          '\n' +
          'H:' +
          data.heading.toFixed(3) +
          ' ' +
          'P:' +
          data.pitch.toFixed(3) +
          ' ' +
          'R:' +
          data.roll.toFixed(3) +
          '\n' +
          // '俯仰角：' +
          // data.pitch.toFixed(2) +
          // '\n' +
          // '翻滚角：' +
          // data.roll.toFixed(2) +
          // '\n' +
          '速度：' +
          data.speed.toFixed(2)
        '\n' + '类型：' + data.type
        break
      case 2:
        text =
          name +
          '\n' +
          // '俯仰角：' +
          // data.pitch.toFixed(2) +
          // '\n' +
          // '翻滚角：' +
          // data.roll.toFixed(2) +
          // '\n' +
          '速度：' +
          data.speed.toFixed(2)
        '\n' + '类型：' + data.type
        break
      case 3:
        text = name + '\n' + '类型：' + data.type
        break
      default:
        break
    }
    let outlineColor = window.MSIMEarth.Color.RED
    let label = {
      show: true,
      font: 'normal 14px MicroSoft YaHei',
      text: text,
      style: 'FILL_AND_OUTLINE',
      showBackground: false,
      // fillColor: {
      //   rgba: [255, 255, 255, 255]
      // },
      // outlineColor: {
      //   rgba: [0, 0, 0, 255]
      // },
      // outlineWidth: 2,
      // backgroundColor: [1, 1, 1, 0.8],
      horizontalOrigin: 'LEFT',
      pixelOffset: {
        cartesian2: [20, -30]
      }

      // height: 40
    }
    return label
  }
  return { handleCzmlUpdate }
}
