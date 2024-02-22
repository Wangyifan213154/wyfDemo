/**
 * 坡度坡向分析
 */
import { useStore } from 'vuex'
import {
  reactive,
  toRefs,
  ref,
  onUnmounted,
  onMounted,
  watch,
  getCurrentInstance
} from 'vue'
import * as turf from '@turf/turf'
import slopeAspect from './analysis/slopeAspect'
import CreatePolygonOnGround from './analysis/CreatePolygonOnGround'
import CreateRemindertip from './analysis/reminderTip'

export default function () {
  const instance = getCurrentInstance()
  const _this = instance.appContext.config.globalProperties

  const Cesium = window.XEarth
  const viewer = window.EarthViewer
  let result = [] //存储创建的坡度分析结果，primitive集合
  let handler = undefined
  let toolTip = ''
  let arrowWidth = 0

  const openTip = () => {
    handler = new window.XEarth.ScreenSpaceEventHandler(window.EarthViewer.canvas)
    handler.setInputAction(function (movement) {
      let endPos = movement.endPosition
      var pick = window.EarthViewer.scene.pick(endPos)
      if (pick && pick.id && pick.id.type === 'SlopeAspect') {
        toolTip = pick.id.value.toFixed(2)
        console.log(pick.id.value)
        CreateRemindertip(toolTip, endPos, true)
      } else {
        toolTip = ''
        CreateRemindertip(toolTip, endPos, false)
      }
    }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)
  }

  const closeTip = () => {
    if (handler) {
      handler.destroy()
      handler = undefined
    }
  }

  //等距离切分网格
  const createNew4Distance = (distance) => {
    openTip()
    let distance1 = distance || 0.1 //默认0.1km精度
    let width = distance1 * 200 > 35 ? 35 : distance1 * 200
    arrowWidth = width < 15 ? 15 : width

    CreatePolygonOnGround(
      window.EarthViewer,
      [],
      {
        color: window.XEarth.Color.RED.withAlpha(0.1),
        outlineColor: window.XEarth.Color.YELLOW,
        outlineWidth: 2
      },
      function (polygon) {
        let degrees = Cartesian3ListToWGS84(polygon.pottingPoint)
        window.EarthViewer.entities.remove(polygon)
        let boundary = []
        let minX = 10000,
          minY = 10000,
          maxX = -10000,
          maxY = -1000
        for (let index = 0; index < degrees.length; index++) {
          const element = degrees[index]
          const x = element.lng
          const y = element.lat
          boundary.push([x, y])
          minX = x < minX ? x : minX
          minY = y < minY ? y : minY
          maxX = x > maxX ? x : maxX
          maxY = y > maxY ? y : maxY
        }
        boundary.push(boundary[0])
        let bbox = [minX, minY, maxX, maxY]
        let mask = turf.polygon([boundary])
        let gridSquare = turf.squareGrid(bbox, distance, { mask: mask })
        createEllipse(gridSquare)
      }
    )
  }

  // 等分切分网格，切分成一个num*num的网格
  const createNew4Num = (num) => {
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
    openTip()
    let num1 = num || 20
    console.log(num1)
    CreatePolygonOnGround(
      window.EarthViewer,
      [],
      {
        color: window.XEarth.Color.RED.withAlpha(0.1),
        outlineColor: window.XEarth.Color.YELLOW,
        outlineWidth: 2
      },
      function (polygon) {
        let degrees = Cartesian3ListToWGS84(polygon.pottingPoint)
        window.EarthViewer.entities.remove(polygon)
        let boundary = []
        let minX = 10000,
          minY = 10000,
          maxX = -10000,
          maxY = -1000
        for (let index = 0; index < degrees.length; index++) {
          const element = degrees[index]
          const x = element.lng
          const y = element.lat
          boundary.push([x, y])
          minX = x < minX ? x : minX
          minY = y < minY ? y : minY
          maxX = x > maxX ? x : maxX
          maxY = y > maxY ? y : maxY
        }
        boundary.push(boundary[0])
        let bbox = [minX, minY, maxX, maxY]
        let a = maxX - minX
        let b = maxY - minY
        b = b > a ? b : a
        const step = b / 20 //网格数
        let width = step * 2000 > 35 ? 35 : step * 2000
        arrowWidth = width < 15 ? 15 : width
        let mask = turf.polygon([boundary])
        let gridSquare = turf.squareGrid(bbox, step, {
          units: 'degrees',
          mask: mask
        })
        createEllipse(gridSquare)
      }
    )
  }

  const createEllipse = (gridSquare) => {
    let boxResults = []
    for (let index = 0; index < gridSquare.features.length; index++) {
      const feature = gridSquare.features[index]
      const coordinates = feature.geometry.coordinates[0]
      const centerdegree = [
        (coordinates[0][0] + coordinates[2][0]) / 2,
        (coordinates[0][1] + coordinates[2][1]) / 2
      ]
      let centerCartographic = window.XEarth.Cartographic.fromDegrees(
        centerdegree[0],
        centerdegree[1]
      )
      boxResults.push(centerCartographic)
      for (let i = 0; i < coordinates.length; i++) {
        const coord = coordinates[i]
        let cartographic = window.XEarth.Cartographic.fromDegrees(
          coord[0],
          coord[1]
        )
        boxResults.push(cartographic)
        const coord1 = coordinates[i + 1]
        if (coord1) {
          let newCoord = [
            (coord[0] + coord1[0]) / 2,
            (coord[1] + coord1[1]) / 2
          ]
          let newCartographic = window.XEarth.Cartographic.fromDegrees(
            newCoord[0],
            newCoord[1]
          )
          boxResults.push(newCartographic)
        }
      }
    }
    window.XEarth.sampleTerrainMostDetailed(
      window.EarthViewer.scene.terrainProvider,
      boxResults
    ).then((updatePositions) => {
      let arrr = []
      let ellipseResults = updatePositions.reduce(function (
        pre,
        item,
        index,
        updatePositions
      ) {
        var begin = index * 10
        var end = begin + 10
        var res = updatePositions.slice(begin, end)
        if (res.length != 0) {
          arrr[index] = res
        }
        return arrr
      },
        [])
      calculateSlope(ellipseResults)
    })
  }

  const createPolygonInsrance = (points, color) => {
    let positions = []
    for (let index = 1; index < points.length - 1; index++) {
      const element = points[index]
      positions.push(window.XEarth.Cartographic.toCartesian(element))
    }
    let polygon = new window.XEarth.PolygonGeometry({
      polygonHierarchy: new window.XEarth.PolygonHierarchy(positions)
    })

    let polygonInstance = new window.XEarth.GeometryInstance({
      geometry: polygon,
      attributes: {
        color: window.XEarth.ColorGeometryInstanceAttribute.fromColor(
          window.XEarth.Color.fromCssColorString(color)
        ),
        show: new window.XEarth.ShowGeometryInstanceAttribute(true) //显示或者隐藏
      }
    })
    return polygonInstance
  }

  const createArrowInstance = (
    targetPoint,
    center,
    diagonalPoint,
    heightDifference,
    curSlope
  ) => {
    let cartographic_0 = new window.XEarth.Cartographic(
      (targetPoint.longitude + center.longitude) / 2,
      (targetPoint.latitude + center.latitude) / 2,
      (targetPoint.height + center.height) / 2
    )
    let cartographic_1 = new window.XEarth.Cartographic(
      (diagonalPoint.longitude + center.longitude) / 2,
      (diagonalPoint.latitude + center.latitude) / 2,
      (diagonalPoint.height + center.height) / 2
    )
    //偏移的
    let positions1 =
      heightDifference > 0
        ? [
          window.XEarth.Cartographic.toCartesian(cartographic_0),
          window.XEarth.Cartographic.toCartesian(cartographic_1)
        ]
        : [
          window.XEarth.Cartographic.toCartesian(cartographic_1),
          window.XEarth.Cartographic.toCartesian(cartographic_0)
        ]
    //箭头线
    const instance = new window.XEarth.GeometryInstance({
      id: {
        type: 'SlopeAspect',
        value: curSlope
      },
      geometry: new window.XEarth.GroundPolylineGeometry({
        positions: positions1,
        width: arrowWidth
      }),
      attributes: {
        color: window.XEarth.ColorGeometryInstanceAttribute.fromColor(
          window.XEarth.Color.BLUE.withAlpha(0.6)
        ),
        show: new window.XEarth.ShowGeometryInstanceAttribute(true) //显示或者隐藏
      }
    })
    return instance
  }

  const calculateSlope = (ellipseResults) => {
    let instances = []
    let polygonInstance = []
    for (let index = 0; index < ellipseResults.length; index++) {
      const ellipse = ellipseResults[index]

      const center = ellipse[0]
      let heightDifference = 0
      let maxIndex = 0
      for (let i = 1; i < ellipse.length - 1; i++) {
        const point = ellipse[i]
        let curHD = point.height - center.height
        if (Math.abs(curHD) > heightDifference) {
          heightDifference = curHD
          maxIndex = i
        }
      }
      let pos0 = new window.XEarth.Cartographic(
        center.longitude,
        center.latitude,
        0
      )
      let pos1 = new window.XEarth.Cartographic(
        ellipse[maxIndex].longitude,
        ellipse[maxIndex].latitude,
        0
      )
      let distance = window.XEarth.Cartesian3.distance(
        window.XEarth.Cartographic.toCartesian(pos0),
        window.XEarth.Cartographic.toCartesian(pos1)
      )
      let curSlope = Math.abs(heightDifference / distance) //坡度的tan值
      let curColor = calculateSlopeColor(curSlope, 0.4)
      const curPolygonInstance = createPolygonInsrance(ellipse, curColor)
      polygonInstance.push(curPolygonInstance)

      let diagonalPoint =
        maxIndex > 4 ? ellipse[maxIndex - 4] : ellipse[maxIndex + 4] //对角点
      let targetPoint = ellipse[maxIndex]
      const arrowInstance = createArrowInstance(
        targetPoint,
        center,
        diagonalPoint,
        heightDifference,
        curSlope
      )
      instances.push(arrowInstance)
    }
    const mapPrimitive = window.EarthViewer.scene.primitives.add(
      new window.XEarth.GroundPrimitive({
        geometryInstances: polygonInstance,
        appearance: new window.XEarth.PerInstanceColorAppearance({
          translucent: true, //false时透明度无效
          closed: false
        })
      })
    )
    const arrowPrimitive = window.EarthViewer.scene.primitives.add(
      new window.XEarth.GroundPolylinePrimitive({
        geometryInstances: instances,
        appearance: new window.XEarth.PolylineMaterialAppearance({
          material: new window.XEarth.Material({
            fabric: {
              type: 'PolylineArrow',
              uniforms: {
                color: new window.XEarth.Color(1.0, 1.0, 0.0, 0.8)
              }
            }
          })
        })
      })
    )
    result.push(arrowPrimitive, mapPrimitive)
  }

  const clearAll = () => {
    result.forEach((element) => {
      window.EarthViewer.scene.primitives.remove(element)
    })
    result = []
  }

  //根据坡度值赋值颜色
  const calculateSlopeColor = (value, alpha) => {
    // 0°～0.5°为平原0.00872686779075879,rgb(85,182,43)
    // 0.5°～2°为微斜坡0.03492076949174773,rgb(135,211,43)
    // 2°～5°为缓斜坡0.08748866352592401,rgb(204,244,44)
    // 5°～15°为斜坡0.2679491924311227,rgb(245,233,44)
    // 15°～35°为陡坡0.7002075382097097,rgb(255,138,43)
    // 35°～55°为峭坡1.4281480067421144,rgb(255,84,43)
    // 55°～90°为垂直壁,rgb(255,32,43)
    if (value < 0.00872686779075879) {
      return 'rgba(85,182,43,' + alpha + ')'
    } else if (value < 0.03492076949174773) {
      return 'rgba(135,211,43,' + alpha + ')'
    } else if (value < 0.08748866352592401) {
      return 'rgba(204,244,44,' + alpha + ')'
    } else if (value < 0.2679491924311227) {
      return 'rgba(245,233,44,' + alpha + ')'
    } else if (value < 0.7002075382097097) {
      return 'rgba(255,138,43,' + alpha + ')'
    } else if (value < 1.4281480067421144) {
      return 'rgba(255,84,43,' + alpha + ')'
    } else {
      return 'rgba(255,32,43,' + alpha + ')'
    }
  }

  /**
   * 笛卡尔坐标数组转WGS84
   * @param {Array} cartesianList 笛卡尔坐标数组
   * @returns {Array} WGS84经纬度坐标数组
   */
  const Cartesian3ListToWGS84 = (cartesianList) => {
    let ellipsoid = window.XEarth.Ellipsoid.WGS84
    let result = []
    for (let index = 0; index < cartesianList.length; index++) {
      const cartesian = cartesianList[index]
      let cartographic = ellipsoid.cartesianToCartographic(cartesian)
      result.push({
        lng: window.XEarth.Math.toDegrees(cartographic.longitude),
        lat: window.XEarth.Math.toDegrees(cartographic.latitude),
        alt: cartographic.height
      })
    }
    return result
  }

  return {
    createNew4Distance,
    createNew4Num
  }
}
