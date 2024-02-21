import store from '@/store'
export default class ConnectLine {
  constructor(options) {
    // this.curLineState = 'straight'
  }
  addLine(params) {
    // this.distanceLabel(params)
    let that = this
    let viewer = window.EarthViewer
    let linkId = `${params.type}==${params.sourId}==${params.targetId}`
    let hasLink = viewer.entities.getById(linkId)
    if (hasLink) return

    let sourceSource, targetSource
    let entity1, entity2

    // sourceSource = viewer.dataSources.getByName(params.sourId)
    // targetSource = viewer.dataSources.getByName(params.targetId)
    // entity1 = sourceSource.length ? sourceSource[0].entities.values[0] : viewer.entities.getById(params.sourId)
    // entity2 = targetSource.length ? targetSource[0].entities.values[0] : viewer.entities.getById(params.targetId)
    // if (sourceSource.length == 0 || targetSource.length == 0) {
    // 	console.log(sourceSource, targetSource);
    // }
    // if (!entity1 || !entity2) return
    let showref = params.show

    // let missilePath = computeFlyline([targetLng, targetLat], [sourceLng, sourceLat], 80000)
    let mixColor = params.color || window.XEarth.Color.RED
    let b = window.EarthViewer.entities.add({
      id: linkId,
      polyline: {
        show: showref,
        positions: new window.XEarth.CallbackProperty(changePos, false),
        arcType: window.XEarth.ArcType.NONE,
        width: params.width || 15,
        material: new window.XEarth.FlowLineMaterialProperty({
          transparent: true,
          mixColor: mixColor,
          repeat: new window.XEarth.Cartesian2(8, 8),
          mixRatio: 0.9,
          flowSpeed: 5,
          image: require('/public/static/image/texture/materiallineF.png')
        })
      }
    })
    // if (params.type == 'RE_JamS') {
    // 	console.log(b);
    // }

    function changePos() {
      sourceSource = viewer.dataSources.getByName(params.sourId)
      targetSource = viewer.dataSources.getByName(params.targetId)
      // if (params.type == 'RE_WeaponF' && sourceSource.length == 0 || params.type == 'RE_WeaponF' && targetSource.length == 0) {
      // 	console.log(sourceSource, targetSource);
      // 	return
      // }
      // if (sourceSource.length == 0 || targetSource.length == 0) return
      entity1 = sourceSource.length
        ? sourceSource[0].entities.values[0]
        : viewer.entities.getById(params.sourId)
      entity2 = targetSource.length
        ? targetSource[0].entities.values[0]
        : viewer.entities.getById(params.targetId)

      if (!entity1 || !entity2) return
      let entityPos1 = entity1.position._value
        ? entity1.position._value
        : entity1.position.getValue(viewer.clock.currentTime)
      let entityPos2 = entity2.position._value
        ? entity2.position._value
        : entity2.position.getValue(viewer.clock.currentTime)
      if (!entityPos1 || !entityPos2) return
      // 直线曲线切换
      let position
      if (
        params.type == 'RE_LTrackInit' ||
        params.type == 'RE_WeaponF' ||
        params.type == 'RE_JamS'
      ) {
        let entityCartographic =
          window.XEarth.Cartographic.fromCartesian(entityPos1)
        let sourceLng = window.XEarth.Math.toDegrees(
          entityCartographic.longitude
        )
        let sourceLat = window.XEarth.Math.toDegrees(
          entityCartographic.latitude
        )
        let sourceAlt = entityCartographic.height
        let entity1Cartographic =
          window.XEarth.Cartographic.fromCartesian(entityPos2)
        let destinateLng = window.XEarth.Math.toDegrees(
          entity1Cartographic.longitude
        )
        let destinateLat = window.XEarth.Math.toDegrees(
          entity1Cartographic.latitude
        )
        let destinateAlt = entity1Cartographic.height
        let curLineState = store.state.sceneModule.curDetectLineState
        if (curLineState == 'straight') {
          position = [entityPos1, entityPos2]
        } else if (curLineState == 'parabola') {
          position = that.computeFlyline(
            [sourceLng, sourceLat, sourceAlt],
            [destinateLng, destinateLat, destinateAlt],
            20000
          )
        }
      } else {
        position = [entityPos1, entityPos2]
      }
      // 只直线
      // let position = [entityPos1, entityPos2]
      return position
    }
  }
  removeStrikePlan(params) {
    let a = window.EarthViewer.entities.removeById(
      `${params.type}==${params.sourId}==${params.targetId}`
    )
    // console.log('删除线',a);
  }
  showEntityByKeyword(key, show) {
    window.EarthViewer.entities.values.forEach((item) => {
      if (item.id.includes(key)) {
        item.show = show
      }
    })
  }
  connecting(params) {
    let Cesium = window.XEarth
    //
    let sourceSource = viewer.dataSources.getByName(params.sourType)
    let targetSource = viewer.dataSources.getByName(params.targType)
    if (sourceSource.length == 0 || targetSource.length == 0) {
      return
    }
    //获取实体
    let entity1 = sourceSource[0].entities.getById(params.sourID)
    let entity2 = targetSource[0].entities.getById(params.targID)
    if (!entity1 || !entity2) {
      return
    }

    let mixColor = params.netColor
    // window.EarthViewer.clock.shouldAnimate = false
    window.EarthViewer.entities.removeById(
      `${params.sourId}==${params.targetId}`
    )
    window.EarthViewer.entities.add({
      id: `${params.sourId}==${params.targetId}`,
      polyline: {
        positions: new window.XEarth.CallbackProperty(changePos, false),
        arcType: window.XEarth.ArcType.NONE,
        width: 10,
        material: new window.XEarth.PolylineGlowMaterialProperty({
          color: mixColor,
          glowPower: 0.1
        })
      }
    })
    params.net.entities.push({
      id: `${params.sourID}==${params.targID}`
    })

    let sp = window.EarthViewer.clock.multiplier
    let stepNum = sp < 5 ? 100 - sp * 20 : 2
    let stepIndex = 1
    //改变位置
    function changePos() {
      // if (!window.XEarth.defined(params.net)) return
      let position
      let entityPos1 = entity1.position.getValue(viewer.clock.currentTime)
      let entityPos2 = entity2.position.getValue(viewer.clock.currentTime)
      if (!entityPos1 || !entityPos2) {
        return
      }
      let entityCartographic =
        window.XEarth.Cartographic.fromCartesian(entityPos1)
      let sourceLng = window.XEarth.Math.toDegrees(
        entityCartographic.longitude
      )
      let sourceLat = window.XEarth.Math.toDegrees(
        entityCartographic.latitude
      )
      let sourceAlt = entityCartographic.height
      let entity1Cartographic =
        window.XEarth.Cartographic.fromCartesian(entityPos2)
      let destinateLng = window.XEarth.Math.toDegrees(
        entity1Cartographic.longitude
      )
      let destinateLat = window.XEarth.Math.toDegrees(
        entity1Cartographic.latitude
      )
      let destinateAlt = entity1Cartographic.height
      let lngStep = (destinateLng - sourceLng) / stepNum
      let latStep = (destinateLat - sourceLat) / stepNum
      let altStep = (destinateAlt - sourceAlt) / stepNum
      let changelng = sourceLng,
        changelat = sourceLat,
        changealt = sourceAlt
      if (stepIndex < stepNum) {
        changelng += stepIndex * lngStep
        changelat += stepIndex * latStep
        changealt += stepIndex * altStep
      } else {
        changelng = destinateLng
        changelat = destinateLat
        changealt = destinateAlt
        showPoseFlag = true
      }
      stepIndex += 1
      position = window.XEarth.Cartesian3.fromDegreesArrayHeights([
        sourceLng,
        sourceLat,
        sourceAlt,
        changelng,
        changelat,
        changealt
      ])
      return position
    }

    function changePos() {
      let position
      let entityPos1 = entity1.position._value
        ? entity1.position._value
        : entity1.position.getValue(viewer.clock.currentTime)
      let entityPos2 = entity2.position._value
        ? entity2.position._value
        : entity2.position.getValue(viewer.clock.currentTime)

      if (!entityPos1 || !entityPos2) return
      position = [entityPos1, entityPos2]

      return position
    }
  }
  distanceLabel(params) {
    let that = this
    let distance = 0
    let text = ''
    let linkId = `distancelabel==${params.sourId}==${params.targetId}`

    let distanceLabel = window.EarthViewer.entities.add({
      id: linkId,
      show: params.show,
      position: new window.XEarth.CallbackProperty(changeCenter, false),
      label: {
        //文字标签
        font: 'normal 29px MicroSoft YaHei',
        text: '',
        scaleByDistance: new window.XEarth.NearFarScalar(
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
      distance = that.getSpaceDistance([entityPos1, entityPos2])
      text = `距目标: ${distance}公里`
      distanceLabel.label.text = text
      let entityCartographic1 =
        window.XEarth.Cartographic.fromCartesian(entityPos1)
      let entityCartographic2 =
        window.XEarth.Cartographic.fromCartesian(entityPos2)

      let sourceLng = window.XEarth.Math.toDegrees(
        entityCartographic1.longitude
      )
      let sourceLat = window.XEarth.Math.toDegrees(
        entityCartographic1.latitude
      )
      let sourceAlt = entityCartographic1.height
      let sourceLng1 = window.XEarth.Math.toDegrees(
        entityCartographic2.longitude
      )
      let sourceLat1 = window.XEarth.Math.toDegrees(
        entityCartographic2.latitude
      )
      let sourceAlt1 = entityCartographic2.height
      let lng = (sourceLng + sourceLng1) / 2
      let lat = (sourceLat + sourceLat1) / 2
      let alt = (sourceAlt + sourceAlt1) / 2
      return window.XEarth.Cartesian3.fromDegrees(lng, lat, alt)
    }
  }
  getSpaceDistance(positions) {
    let distance = 0
    for (var i = 0; i < positions.length - 1; i++) {
      var point1cartographic = window.XEarth.Cartographic.fromCartesian(
        positions[i]
      )
      var point2cartographic = window.XEarth.Cartographic.fromCartesian(
        positions[i + 1]
      )
      /**根据经纬度计算出距离**/
      var geodesic = new window.XEarth.EllipsoidGeodesic()
      geodesic.setEndPoints(point1cartographic, point2cartographic)
      var s = geodesic.surfaceDistance
      //返回两点之间的距离
      s = Math.sqrt(
        Math.pow(s, 2) +
          Math.pow(point2cartographic.height - point1cartographic.height, 2)
      )
      distance = distance + s
    }
    return (distance / 1000).toFixed(0)
  }
  computeFlyline(point1, point2, h) {
    let Cesium = window.XEarth
    return getBSRxyz(...point1, ...point2, h)
    function getBSRxyz(x1, y1, h1, x2, y2, h2, h) {
      let arr3d = getBSRPoints(x1, y1, h1, x2, y2, h2, h)
      let arrAll = []
      for (let ite of arr3d) {
        arrAll.push(ite[0])
        arrAll.push(ite[1])
        arrAll.push(ite[2])
      }
      return Cesium.Cartesian3.fromDegreesArrayHeights(arrAll)
    }
    function getBSRPoints(x1, y1, h1, x2, y2, h2, h) {
      let point1 = [y1, h1]
      let point2 = [(y2 + y1) / 2, (h1 + h2) / 2 + h]
      let point3 = [y2, h2]
      let arr = getBSR(point1, point2, point3)
      let arr3d = []
      for (let i = 0; i < arr.length; i++) {
        let x = ((x2 - x1) * (arr[i][0] - y1)) / (y2 - y1) + x1
        arr3d.push([x, arr[i][0], arr[i][1]])
      }
      return arr3d
    }
    // 生成贝塞尔曲线
    function getBSR(point1, point2, point3) {
      var ps = [
        { x: point1[0], y: point1[1] },
        { x: point2[0], y: point2[1] },
        { x: point3[0], y: point3[1] }
      ]
      // 100 每条线由100个点组成
      let guijipoints = CreateBezierPoints(ps, 100)
      return guijipoints
    }
    // 贝赛尔曲线算法
    // anchorpoints: [{ x: 116.30, y: 39.60 }, { x: 37.50, y: 40.25 }, { x: 39.51, y: 36.25 }]
    function CreateBezierPoints(anchorpoints, pointsAmount) {
      var points = []
      for (var i = 0; i < pointsAmount; i++) {
        var point = MultiPointBezier(anchorpoints, i / pointsAmount)
        points.push([point.x, point.y])
      }
      return points
    }
    function MultiPointBezier(points, t) {
      var len = points.length
      var x = 0,
        y = 0
      var erxiangshi = function (start, end) {
        var cs = 1,
          bcs = 1
        while (end > 0) {
          cs *= start
          bcs *= end
          start--
          end--
        }
        return cs / bcs
      }
      for (var i = 0; i < len; i++) {
        var point = points[i]
        x +=
          point.x *
          Math.pow(1 - t, len - 1 - i) *
          Math.pow(t, i) *
          erxiangshi(len - 1, i)
        y +=
          point.y *
          Math.pow(1 - t, len - 1 - i) *
          Math.pow(t, i) *
          erxiangshi(len - 1, i)
      }
      return { x: x, y: y }
    }
  }
  addDashLine(params) {
    // this.distanceLabel(params)
    let that = this
    let viewer = window.EarthViewer
    let linkId = `${params.type}==${params.sourId}==${params.targetId}`
    let hasLink = viewer.entities.getById(linkId)
    if (hasLink) return

    let sourceSource, targetSource
    let entity1, entity2

    let showref = params.show

    // let missilePath = computeFlyline([targetLng, targetLat], [sourceLng, sourceLat], 80000)
    let mixColor = params.color || window.XEarth.Color.RED
    let b = window.EarthViewer.entities.add({
      id: linkId,
      show: showref,
      polyline: {
        positions: new window.XEarth.CallbackProperty(changePos, false),
        arcType: window.XEarth.ArcType.NONE,
        width: params.width || 15,
        material: new window.XEarth.FlowLineMaterialProperty({
          transparent: true,
          mixColor: mixColor,
          repeat: new window.XEarth.Cartesian2(8, 8),
          mixRatio: 0.9,
          flowSpeed: -5,
          image: require('/public/static/image/texture/materialline.png')
        })
      }
    })
    // if (params.type == 'RE_JamS') {
    // 	console.log(b);
    // }

    function changePos() {
      sourceSource = viewer.dataSources.getByName(params.sourId)
      targetSource = viewer.dataSources.getByName(params.targetId)
      // if (params.type == 'RE_WeaponF' && sourceSource.length == 0 || params.type == 'RE_WeaponF' && targetSource.length == 0) {
      // 	console.log(sourceSource, targetSource);
      // 	return
      // }
      // if (sourceSource.length == 0 || targetSource.length == 0) return
      entity1 = sourceSource.length
        ? sourceSource[0].entities.values[0]
        : viewer.entities.getById(params.sourId)
      entity2 = targetSource.length
        ? targetSource[0].entities.values[0]
        : viewer.entities.getById(params.targetId)

      if (!entity1 || !entity2) return
      let entityPos1 = entity1.position._value
        ? entity1.position._value
        : entity1.position.getValue(viewer.clock.currentTime)
      let entityPos2 = entity2.position._value
        ? entity2.position._value
        : entity2.position.getValue(viewer.clock.currentTime)
      if (!entityPos1 || !entityPos2) return
      // 直线曲线切换
      let position
      if (
        params.type == 'RE_LTrackInit' ||
        params.type == 'RE_WeaponF' ||
        params.type == 'RE_JamS'
      ) {
        let entityCartographic =
          window.XEarth.Cartographic.fromCartesian(entityPos1)
        let sourceLng = window.XEarth.Math.toDegrees(
          entityCartographic.longitude
        )
        let sourceLat = window.XEarth.Math.toDegrees(
          entityCartographic.latitude
        )
        let sourceAlt = entityCartographic.height
        let entity1Cartographic =
          window.XEarth.Cartographic.fromCartesian(entityPos2)
        let destinateLng = window.XEarth.Math.toDegrees(
          entity1Cartographic.longitude
        )
        let destinateLat = window.XEarth.Math.toDegrees(
          entity1Cartographic.latitude
        )
        let destinateAlt = entity1Cartographic.height
        let curLineState = store.state.sceneModule.curDetectLineState
        if (curLineState == 'straight') {
          position = [entityPos1, entityPos2]
        } else if (curLineState == 'parabola') {
          position = that.computeFlyline(
            [sourceLng, sourceLat, sourceAlt],
            [destinateLng, destinateLat, destinateAlt],
            20000
          )
        }
      } else {
        position = [entityPos1, entityPos2]
      }
      // 只直线
      // let position = [entityPos1, entityPos2]
      return position
    }
  }
}
