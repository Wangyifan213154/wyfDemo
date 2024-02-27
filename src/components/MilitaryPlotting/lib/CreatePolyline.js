/*
 * 创建笔直折线
 * 可拆卸
 * @Author: Wang jianLei
 * @Date: 2022-04-16 21:49:57
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2022-04-21 08:57:36
 */
import CreateRemindertip from './ReminderTip'
let Cesium = window.XEarth
const CreatePolyline = function (viewer, resultList, options, callback) {
  if (!viewer) throw new Error('no viewer object!')
  Cesium = window.XEarth
  options = options || {}
  let id = options.id || setSessionid()
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value')
  let color = options.color || window.XEarth.Color.RED
  let width = options.width || 2
  const handler = new window.XEarth.ScreenSpaceEventHandler(viewer.canvas)
  let toolTip = '左键点击开始绘制'
  let anchorpoints = []
  let polyline = undefined
  handler.setInputAction(function (event) {
    toolTip = '左键添加点，右键结束绘制'
    let pixPos = event.position
    let cartesian = getCatesian3FromPX(viewer, pixPos)
    if (anchorpoints.length == 0) {
      anchorpoints.push(cartesian)
      polyline = viewer.entities.add({
        name: 'Polyline',
        id: id,
        polyline: {
          positions: new window.XEarth.CallbackProperty(function () {
            return anchorpoints
          }, false),
          width: width,
          material: color
        }
      })
      polyline.GeoType = 'Polyline'
    }
    anchorpoints.push(cartesian)
  }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)
  handler.setInputAction(function (movement) {
    let endPos = movement.endPosition
    CreateRemindertip(toolTip, endPos, true)
    if (window.XEarth.defined(polyline)) {
      anchorpoints.pop()
      let cartesian = getCatesian3FromPX(viewer, endPos)
      anchorpoints.push(cartesian)
    }
  }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)
  handler.setInputAction(function (event) {
    anchorpoints.pop()
    polyline.pottingPoint = anchorpoints
    resultList.push(polyline)
    handler.destroy()
    CreateRemindertip(toolTip, event.position, false)
    if (typeof callback == 'function') callback(polyline)
  }, window.XEarth.ScreenSpaceEventType.RIGHT_DOWN)
}
function getCatesian3FromPX(viewer, px) {
  let picks = viewer.scene.drillPick(px)
  let cartesian = null
  let isOn3dtiles = false,
    isOnTerrain = false
  // drillPick
  for (let i in picks) {
    let pick = picks[i]
    if (
      (pick &&
        pick.primitive instanceof window.XEarth.Cesium3DTileFeature) ||
      (pick && pick.primitive instanceof window.XEarth.Cesium3DTileset) ||
      (pick && pick.primitive instanceof window.XEarth.Model)
    ) {
      //模型上拾取
      isOn3dtiles = true
    }
    // 3dtilset
    if (isOn3dtiles) {
      viewer.scene.pick(px)
      cartesian = viewer.scene.pickPosition(px)
      if (cartesian) {
        let cartographic =
          window.XEarth.Cartographic.fromCartesian(cartesian)
        if (cartographic.height < 0) cartographic.height = 0
        let lon = window.XEarth.Math.toDegrees(cartographic.longitude),
          lat = window.XEarth.Math.toDegrees(cartographic.latitude),
          height = cartographic.height
        cartesian = transformWGS84ToCartesian(viewer, {
          lng: lon,
          lat: lat,
          alt: height
        })
      }
    }
  }
  // 地形
  let boolTerrain =
    viewer.terrainProvider instanceof window.XEarth.EllipsoidTerrainProvider
  // Terrain
  if (!isOn3dtiles && !boolTerrain) {
    let ray = viewer.scene.camera.getPickRay(px)
    if (!ray) return null
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    isOnTerrain = true
  }
  // 地球
  if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
    cartesian = viewer.scene.camera.pickEllipsoid(
      px,
      viewer.scene.globe.ellipsoid
    )
  }
  if (cartesian) {
    let position = transformCartesianToWGS84(viewer, cartesian)
    if (position.alt < 0) {
      cartesian = transformWGS84ToCartesian(viewer, position, 0.1)
    }
    return cartesian
  }
  return false
}

/***
 * 坐标转换 84转笛卡尔
 * @param {Object} {lng,lat,alt} 地理坐标
 * @return {Object} Cartesian3 三维位置坐标
 */
function transformWGS84ToCartesian(viewer, position, alt) {
  return position
    ? window.XEarth.Cartesian3.fromDegrees(
      position.lng || position.lon,
      position.lat,
      (position.alt = alt || position.alt),
      window.XEarth.Ellipsoid.WGS84
    )
    : window.XEarth.Cartesian3.ZERO
}

/***
 * 坐标转换 笛卡尔转84
 * @param {Object} Cartesian3 三维位置坐标
 * @return {Object} {lng,lat,alt} 地理坐标
 */
function transformCartesianToWGS84(viewer, cartesian) {
  let ellipsoid = window.XEarth.Ellipsoid.WGS84
  let cartographic = ellipsoid.cartesianToCartographic(cartesian)
  return {
    lng: window.XEarth.Math.toDegrees(cartographic.longitude),
    lat: window.XEarth.Math.toDegrees(cartographic.latitude),
    alt: cartographic.height
  }
}
function setSessionid(num) {
  let len = num || 32
  let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  let maxPos = chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}
export default CreatePolyline
