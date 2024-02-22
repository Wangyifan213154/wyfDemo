import CreateRemindertip from './reminderTip'
const Cesium = window.XEarth
/**
 * 创建贴地多边形
 * @param {object} viewer viewer
 * @param {Array} resultList
 * @param {{id:String,color:object,outlineColor:object,outlineWidth:number}} options {id，填充颜色，轮廓线颜色，轮廓线宽度}
 * @param {Function} callback 携带创建的多边形对象
 */
const CreatePolygonOnGround = function (viewer, resultList, options, callback) {
  if (!viewer) throw new Error('no viewer object!')
  options = options || {}
  let id = options.id || setSessionid() //Polygon的id
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value')
  let color = options.color || window.XEarth.Color.RED //Polygon的填充色
  let outlineColor = options.outlineColor || color.withAlpha(1) //Polygon的轮廓线颜色
  let outlineWidth = options.outlineWidth || 2 //Polygon的轮廓线宽度
  const handler = new window.XEarth.ScreenSpaceEventHandler(viewer.canvas)
  let toolTip = '左键点击开始绘制'
  let anchorpoints = []
  let polygon = null
  let drawStatus = true
  handler.setInputAction(function (event) {
    let pixPos = event.position
    let cartesian = getCatesian3FromPX(viewer, pixPos)
    if (anchorpoints.length == 0) {
      toolTip = '左键添加第二个点'
      anchorpoints.push(cartesian)
      let linePoints = new window.XEarth.CallbackProperty(function () {
        let verPoints = anchorpoints.concat([anchorpoints[0]])
        return verPoints
      }, false)
      let dynamicPositions = new window.XEarth.CallbackProperty(function () {
        return new window.XEarth.PolygonHierarchy(anchorpoints)
      }, false)
      polygon = viewer.entities.add({
        name: 'Polygon',
        id: id,
        polyline: {
          positions: linePoints,
          width: outlineWidth,
          material: outlineColor,
          clampToGround: true
        },
        polygon: {
          heightReference: window.XEarth.HeightReference.None,
          hierarchy: dynamicPositions,
          material: color
        }
      })
      polygon.GeoType = 'Polygon'
    } else {
      toolTip = '左键添加点，Ctrl+Z回退，右键完成绘制'
    }
    anchorpoints.push(cartesian)
  }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)
  handler.setInputAction(function (movement) {
    let endPos = movement.endPosition
    CreateRemindertip(toolTip, endPos, true)
    if (window.XEarth.defined(polygon)) {
      anchorpoints.pop()
      let cartesian = getCatesian3FromPX(viewer, endPos)
      anchorpoints.push(cartesian)
    }
    if (anchorpoints.length === 3) {
      polygon.polygon.heightReference =
        window.XEarth.HeightReference.CLAMP_TO_GROUND
    }
  }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)
  handler.setInputAction(function (event) {
    anchorpoints.pop()
    polygon.pottingPoint = anchorpoints
    resultList.push(polygon)
    handler.destroy()
    CreateRemindertip(toolTip, event.position, false)
    drawStatus = false
    if (typeof callback == 'function') callback(polygon)
  }, window.XEarth.ScreenSpaceEventType.RIGHT_DOWN)
  //Ctrl + Z回退
  document.onkeydown = function (event) {
    if (event.ctrlKey && window.event.keyCode == 90) {
      if (!drawStatus) {
        return false
      }
      anchorpoints.pop()
      if (anchorpoints.length == 2) {
        toolTip = '左键添加第二个点'
      }
    }
  }
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
export default CreatePolygonOnGround
