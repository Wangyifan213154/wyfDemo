/**
 * 控制所有czml路径显隐
 * @param {boolean} value 显示或隐藏
 */
export function showCZMLPath(value) {
  // console.log(window.EarthViewer.dataSources._dataSources[9].entities.values[0].path);
  // console.log(window.EarthViewer.dataSources._dataSources[9].entities.values[0].path.show._value);
  window.EarthViewer.dataSources._dataSources.forEach((item) => {
    let path = item.entities.values[0].path
    if (path) {
      path.show._value = value
    }
  })
}

/**
 * 控制czml或entity显隐
 * @param {string} id entity的id或datasource的name
 * @param {boolean} value 显示或隐藏
 */
export function showDynamicEntity(id, value) {
  let sourceSource = window.EarthViewer.dataSources.getByName(id)
  let entity = sourceSource.length
    ? sourceSource[0].entities.values[0]
    : window.EarthViewer.entities.getById(id)
  if (!entity) return
  entity.show = value
}

/**
 * 控制实体尾迹
 * @param {string} id entity的id或datasource的name
 * @param {boolean} value 显示或隐藏
 */
export function showCZMLWake(id, value) {
  let entity = window.EarthViewer.entities.getById(id + 'weijixian')
  if (!entity) return
  entity.show = value
}

/**
 * 控制实体传感器范围
 * @param {string} id entity的id或datasource的name
 * @param {boolean} value 显示或隐藏
 */
export function showSensorRange(id, value) {
  let entity = window.EarthViewer.entities.getById(`SU==sensor==${id}`)
  console.log(entity)
  if (!entity) return
  entity.show = value
}

/**
 * 控制单个czml路径显隐
 * @param {string} id entity的id或datasource的name
 * @param {boolean} value 显示或隐藏
 */
export function showSingleCZMLPath(id, value) {
  let sourceSource = window.EarthViewer.dataSources.getByName(id)
  if (sourceSource.length == 0) return
  // let entity = sourceSource.length ? sourceSource[0].entities.values[0] : window.EarthViewer.entities.getById(id)
  let entity = sourceSource[0].entities.values[0]
  if (!entity) return
  let path = entity.path
  if (path) {
    path.show._value = value
  }
}

// 添加尾迹先
export const wjxian = (czmlname, side) => {
  let collection = []

  function changeHeight() {
    let targetDs = window.EarthViewer.dataSources.getByName(czmlname)
    if (targetDs.length == 0) {
      return
    }
    let targetEntity = targetDs[0].entities.getById(czmlname)

    // let proTime = window.MSIMEarth.JulianDate.addSeconds(
    //   window.EarthViewer.clock.currentTime,
    //   0.1,
    //   new window.MSIMEarth.JulianDate()
    // )
    var YGPosition = targetEntity.position.getValue(
      window.EarthViewer.clock.currentTime
    )
    if (typeof YGPosition === 'undefined') {
      return
    }
    var YGCartographic = window.MSIMEarth.Cartographic.fromCartesian(YGPosition)
    let starLinkLng = window.MSIMEarth.Math.toDegrees(YGCartographic.longitude)
    let starLinkLat = window.MSIMEarth.Math.toDegrees(YGCartographic.latitude)
    let starLinkAlt = YGCartographic.height
    if (length > 3) {
      let length = collection.length
      let lastDegrees = [
        collection[length - 3],
        collection[length - 2],
        collection[length - 1]
      ]
      let lastCartesian = window.MSIMEarth.Cartesian3.fromDegrees(
        ...lastDegrees
      )
      let distance = getSpaceDistance([YGPosition, lastCartesian])
      if (distance < 0.001) return
    }
    if (typeof starLinkLng === 'undefined') {
      window.EarthViewer.entities.removeById(czmlname)
      return
    }
    // let position = new Cesium.Cartesian3.fromDegrees(
    //   starLinkLng,
    //   starLinkLat,
    //   starLinkAlt
    // )
    collection.push(starLinkLng)
    collection.push(starLinkLat)
    collection.push(starLinkAlt + 30)
    if (collection.length > 2000) {
      collection.splice(0, 3)
    }

    return window.MSIMEarth.Cartesian3.fromDegreesArrayHeights(collection)
  }
  let imageUrl = 'static/image/texture/materiallineR.png'
  if (side === 'blue') {
    imageUrl = 'static/image/texture/materialline3.png'
  }
  window.EarthViewer.entities.add({
    id: czmlname + 'weijixian',
    name: 'Wide blue dashed line with a gap color',
    show: false,
    polyline: {
      // positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      //   -75, 40, 250000, -125, 40, 250000
      // ]),
      positions: new window.MSIMEarth.CallbackProperty(changeHeight, false),
      width: 45,
      material: new window.MSIMEarth.FlowLineMaterialProperty({
        image: imageUrl,
        mixColor: new window.MSIMEarth.Color(1.0, 1.0, 0.6, 1.0),
        mixRatio: 0.5,
        repeat: new window.MSIMEarth.Cartesian2(1, 1),
        flowSpeed: -0.00001,
        transparent: true
      }),
      distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
        0,
        10e4
      )
    }
  })
}

//
/**
 * 添加路径墙
 * @param {string} id entity的id或datasource的name
 * @param {boolean} value 显示或隐藏
 */
export const addPathWall = (czmlname) => {
  window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
  let side = ''
  let collection = []
  let sidecolor = new window.window.MSIMEarth.Color(1.0, 0.0, 0.0, 1.0)
  let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
  if (sourceSource.length == 0) return
  let entity = sourceSource[0].entities.values[0]
  if (!entity) return
  side = entity.properties.airplaneAction._value.side
  let img = 'static/image/texture/loudongRed.png'
  if (side === 'blue') {
    sidecolor = new window.window.MSIMEarth.Color(0.0, 1.0, 1.0, 1.0)
    img = 'static/image/texture/loudong3.png'
  }
  // entity
  function changePositions() {
    let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
    if (sourceSource.length == 0) return
    // let entity = sourceSource.length ? sourceSource[0].entities.values[0] : window.EarthViewer.entities.getById(id)
    let entity = sourceSource[0].entities.values[0]
    if (!entity) return
    let YGPosition = entity.position.getValue(
      window.EarthViewer.clock.currentTime
    )
    if (typeof YGPosition === 'undefined') return
    collection.push(YGPosition)
    return collection
  }
  window.EarthViewer.entities.add({
    id: czmlname + 'pathWall',
    wall: {
      positions: new window.MSIMEarth.CallbackProperty(changePositions, false),
      // material: new window.MSIMEarth.PolylineTrailLinkMaterialProperty({
      //   mixColor: sidecolor,
      //   repeat: new window.MSIMEarth.Cartesian2(1.0, 1.0),
      //   // half: false,
      //   flowSpeed: -0.7,
      //   image: 'static/image/texture/colors2.png',
      //   mixRatio: 0.9,
      //   // image: 'static/image/texture/纵向渐变.png',
      //   transparent: true,
      //   direction: false
      // })
      material: new window.MSIMEarth.ImageMaterialProperty({
        image: img,
        color: sidecolor,
        transparent: true
      })
    }
  })
}
// 删除路径墙
export const removePathWall = (czmlname) => {
  window.EarthViewer.scene.globe.depthTestAgainstTerrain = false
  window.EarthViewer.entities.removeById(czmlname + 'pathWall')
}

/**
 * 添加路径线
 * @param {string} id entity的id或datasource的name
 * @param {boolean} value 显示或隐藏
 */
export const addPathLine = (czmlname) => {
  let side = ''
  let collection = []
  let sidecolor = new window.window.MSIMEarth.Color(1.0, 0.0, 0.0, 1.0)
  let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
  if (sourceSource.length == 0) return
  let entity = sourceSource[0].entities.values[0]
  if (!entity) return
  side = entity.properties.airplaneAction._value.side
  if (side === 'blue') {
    sidecolor = new window.window.MSIMEarth.Color(0.0, 1.0, 1.0, 1.0)
  }
  // entity
  function changePositions() {
    let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
    if (sourceSource.length == 0) return
    // let entity = sourceSource.length ? sourceSource[0].entities.values[0] : window.EarthViewer.entities.getById(id)
    let entity = sourceSource[0].entities.values[0]
    if (!entity) return
    let YGPosition = entity.position.getValue(
      window.EarthViewer.clock.currentTime
    )
    if (typeof YGPosition === 'undefined') return
    collection.push(YGPosition)
    return collection
  }
  window.EarthViewer.entities.add({
    id: czmlname + 'pathLine',
    polyline: {
      positions: new window.MSIMEarth.CallbackProperty(changePositions, false),
      width: 1,
      material: sidecolor
    }
  })
}
// 删除路径线
export const removePathLine = (czmlname) => {
  window.EarthViewer.entities.removeById(czmlname + 'pathLine')
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
