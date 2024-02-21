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
  const initWeaponFLine = (json) => {
    let color = lineColorConfig[json.Type]
    let colorC = new window.MSIMEarth.Color(
      color[0] / 255,
      color[1] / 255,
      color[2] / 255,
      color[3]
    )
    console.log('创建导弹线')
    setTimeout(() => {
      let sourceSource = window.EarthViewer.dataSources.getByName(
        json.Data.WPName
      )
      let targetSource = window.EarthViewer.dataSources.getByName(
        json.Data.tName
      )
      let earthObjectConfig = store.state.sceneModule.earthObjectConfig
      let show = earthObjectConfig.findIndex((item) => item == '链路') > -1
      sceneAction.connectLineManagement.addDashLine({
        sourId: json.Data.WPName,
        targetId: json.Data.tName,
        color: colorC,
        type: json.Type,
        width: 10, // 10
        show: show
      })
      sceneAction.connectLineManagement.distanceLabel({
        sourId: json.Data.WPName,
        targetId: json.Data.tName,
        color: colorC,
        type: json.Type,
        show: show
      })
    }, 2000)
  }

  const distanceLabel = (params) => {
    let distance = 0
    let text = ''
    let linkId = `distancelabel==${params.sourId}==${params.targetId}`

    let distanceLabel = window.EarthViewer.entities.add({
      id: linkId,
      position: new window.MSIMEarth.CallbackProperty(changeCenter, false),
      label: {
        //文字标签
        font: 'normal 29px MicroSoft YaHei',
        text: '',
        scaleByDistance: new window.MSIMEarth.NearFarScalar(
          1000,
          1.2,
          100000,
          0.4
        )
      }
    })
    function changeCenter() {
      let sourceSource = window.EarthViewer.dataSources.getByName(params.sourId)
      let targetSource = window.EarthViewer.dataSources.getByName(
        params.targetId
      )
      // if (sourceSource.length == 0 || targetSource.length == 0) return
      let entity1 = sourceSource.length
        ? sourceSource[0].entities.values[0]
        : window.EarthViewer.entities.getById(params.sourId)
      let entity2 = targetSource.length
        ? targetSource[0].entities.values[0]
        : window.EarthViewer.entities.getById(params.targetId)
      if (!entity1 || !entity2) return
      let entityPos1 = entity1.position._value
        ? entity1.position._value
        : entity1.position.getValue(window.EarthViewer.clock.currentTime)
      let entityPos2 = entity2.position._value
        ? entity2.position._value
        : entity2.position.getValue(window.EarthViewer.clock.currentTime)

      if (!entityPos1 || !entityPos2) return
      distance = getSpaceDistance([entityPos1, entityPos2])
      text = `距目标: ${distance}公里`
      distanceLabel.label.text = text
      let entityCartographic1 =
        window.MSIMEarth.Cartographic.fromCartesian(entityPos1)
      let entityCartographic2 =
        window.MSIMEarth.Cartographic.fromCartesian(entityPos2)

      let sourceLng = window.MSIMEarth.Math.toDegrees(
        entityCartographic1.longitude
      )
      let sourceLat = window.MSIMEarth.Math.toDegrees(
        entityCartographic1.latitude
      )
      let sourceAlt = entityCartographic1.height
      let sourceLng1 = window.MSIMEarth.Math.toDegrees(
        entityCartographic2.longitude
      )
      let sourceLat1 = window.MSIMEarth.Math.toDegrees(
        entityCartographic2.latitude
      )
      let sourceAlt1 = entityCartographic2.height
      let lng = (sourceLng + sourceLng1) / 2
      let lat = (sourceLat + sourceLat1) / 2
      let alt = (sourceAlt + sourceAlt1) / 2
      return window.MSIMEarth.Cartesian3.fromDegrees(lng, lat, alt)
    }
  }

  // 计算距离函数
  function getSpaceDistance(positions) {
    let distance = 0
    for (var i = 0; i < positions.length - 1; i++) {
      var point1cartographic = window.MSIMEarth.Cartographic.fromCartesian(
        positions[i]
      )
      var point2cartographic = window.MSIMEarth.Cartographic.fromCartesian(
        positions[i + 1]
      )
      /**根据经纬度计算出距离**/
      var geodesic = new window.MSIMEarth.EllipsoidGeodesic()
      geodesic.setEndPoints(point1cartographic, point2cartographic)
      var s = geodesic.surfaceDistance
      //返回两点之间的距离
      s = Math.sqrt(
        Math.pow(s, 2) +
          Math.pow(point2cartographic.height - point1cartographic.height, 2)
      )
      distance = distance + s
    }
    // return distance.toFixed(0)
    return (distance / 1000).toFixed(0)
  }

  return { initWeaponFLine }
}
