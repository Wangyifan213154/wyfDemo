/**
 * homeView组件加载时初始化websocket消息
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

export default function () {
  const instance = getCurrentInstance()
  const _this = instance.appContext.config.globalProperties

  // const store = useStore()
  // 测线
  // 通视分析
  const visibilityAnalysis = () => {
    console.log(_this)
    const Cesium = window.XEarth
    const viewer = window.EarthViewer
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
    let ellipsoid = viewer.scene.globe.ellipsoid
    _this.handler = new window.XEarth.ScreenSpaceEventHandler(
      viewer.scene.canvas
    )
    //去掉单双击的效果
    viewer.screenSpaceEventHandler.removeInputAction(
      window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
    viewer.screenSpaceEventHandler.removeInputAction(
      window.XEarth.ScreenSpaceEventType.LEFT_CLICK
    )

    let getDistance = function (cartesian1, cartesian2) {
      let ellipsoid = viewer.scene.globe.ellipsoid
      let lat1 = ellipsoid.cartesianToCartographic(cartesian1).latitude
      let lng1 = ellipsoid.cartesianToCartographic(cartesian1).longitude
      let lat2 = ellipsoid.cartesianToCartographic(cartesian2).latitude
      let lng2 = ellipsoid.cartesianToCartographic(cartesian2).longitude
      let EARTH_RADIUS = 6378137.0

      let f = (lat1 + lat2) / 2
      let g = (lat1 - lat2) / 2
      let l = (lng1 - lng2) / 2

      let sg = Math.sin(g)
      let sl = Math.sin(l)
      let sf = Math.sin(f)

      let s, c, w, r, d, h1, h2
      let a = EARTH_RADIUS
      let fl = 1 / 298.257

      sg = sg * sg
      sl = sl * sl
      sf = sf * sf

      s = sg * (1 - sl) + (1 - sf) * sl
      c = (1 - sg) * (1 - sl) + sf * sl

      w = Math.atan(Math.sqrt(s / c))
      r = Math.sqrt(s * c) / w
      d = 2 * w * a
      h1 = (3 * r - 1) / 2 / c
      h2 = (3 * r + 1) / 2 / s

      let distance = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg))
      return distance >= 1000
        ? (distance / 1000).toFixed(2) + 'km'
        : distance.toFixed(2) + 'm'
    }
    let drawLine = function (positions, color) {
      viewer.entities.add({
        polyline: {
          positions: positions,
          width: 3,
          material: color,
          depthFailMaterial: color
        }
      })
    }
    let positions = [],
      that = _this,
      count = 0
    //鼠标左键单击画点
    _this.handler.setInputAction(function (click) {
      // let cartesian = viewer.scene.camera.pickEllipsoid(click.position, ellipsoid);
      let ray = viewer.camera.getPickRay(click.position)
      let cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (cartesian) {
        positions.push(cartesian)
        viewer.entities.add({
          position: cartesian,
          point: {
            show: true,
            color: window.XEarth.Color.AQUA,
            pixelSize: 10,
            clampToGround: true,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        })
        count++
        if (count == 2) {
          // 计算射线的方向
          let direction = window.XEarth.Cartesian3.normalize(
            window.XEarth.Cartesian3.subtract(
              positions[1],
              positions[0],
              new window.XEarth.Cartesian3()
            ),
            new window.XEarth.Cartesian3()
          )
          // 建立射线
          let ray = new window.XEarth.Ray(positions[0], direction)
          let result = viewer.scene.pickFromRay(ray, [
            positions[0],
            positions[1]
          ]) // 计算交点
          if (window.XEarth.defined(result) && result != null) {
            drawLine(
              [result.position, positions[0]],
              window.XEarth.Color.GREEN
            ) // 可视区域
            viewer.entities.add({
              position: window.XEarth.Cartesian3.midpoint(
                result.position,
                positions[0],
                result
              ),
              label: {
                show: true,
                text: getDistance(result.position, positions[0]),
                clampToGround: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                font: 'bold 36px MicroSoft YaHei',
                scale: 0.5,
                horizontalOrigin: window.XEarth.HorizontalOrigin.LEFT,
                style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
                fillColor: window.XEarth.Color.GREEN,
                outlineColor: window.XEarth.Color.BLACK,
                outlineWidth: 2,
                show: true
              }
            })
            drawLine(
              [result.position, positions[1]],
              window.XEarth.Color.RED
            ) // 不可视区域
            viewer.entities.add({
              position: window.XEarth.Cartesian3.midpoint(
                result.position,
                positions[1],
                result
              ),
              label: {
                show: true,
                text: getDistance(result.position, positions[1]),
                clampToGround: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                font: 'bold 36px MicroSoft YaHei',
                scale: 0.5,
                horizontalOrigin: window.XEarth.HorizontalOrigin.LEFT,
                style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
                fillColor: window.XEarth.Color.RED,
                outlineColor: window.XEarth.Color.BLACK,
                outlineWidth: 2,
                show: true
              }
            })
          } else {
            drawLine([positions[0], positions[1]], window.XEarth.Color.GREEN) // 可视区域
            viewer.entities.add({
              position: window.XEarth.Cartesian3.midpoint(
                positions[0],
                positions[1],
                result
              ),
              label: {
                show: true,
                text: getDistance(positions[0], positions[1]),
                clampToGround: false,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                font: 'bold 36px MicroSoft YaHei',
                scale: 0.5,
                horizontalOrigin: window.XEarth.HorizontalOrigin.LEFT,
                style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
                fillColor: window.XEarth.Color.GREEN,
                outlineColor: window.XEarth.Color.BLACK,
                outlineWidth: 2,
                show: true
              }
            })
          }
          that.handler.destroy()
        }
      }
    }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)
  }

  // const visibilityAnalysis = () => {
  // 	const Cesium = window.XEarth;
  // 	const viewer = window.EarthViewer;
  // 	let that = _this;
  // 	console.log(analysisVisible2);
  // 	_this.handler = new window.XEarth.ScreenSpaceEventHandler(viewer.scene.canvas);
  // 	_this.handler.setInputAction(function (movement) {
  // 		let cartesian = viewer.scene.pickPosition(movement.position);
  // 		that.viewPosition = cartesian;
  // 		if (that.positions.length < 2) {
  // 			console.log(cartesian);
  // 			that.positions.push(cartesian);
  // 		} else {
  // 			//   that.analysisVisible(that.positions); //方式1
  // 			analysisVisible2(that.positions[0], that.positions[1]); //方式2
  // 		}
  // 	}, window.XEarth.ScreenSpaceEventType.LEFT_CLICK);
  // }

  // const analysisVisible2 = (startPoint, endPoint) => {
  // 	const Cesium = window.XEarth;
  // 	const viewer = window.EarthViewer;
  // 	// 1. 优先用射线求交点
  // 	const startLLH = cartesianToLonLatHeight(startPoint);
  // 	const endLLH = cartesianToLonLatHeight(endPoint);
  // 	const carS = window.XEarth.Cartesian3.fromDegrees(startLLH[0], startLLH[1], startLLH[2]);
  // 	const carE = window.XEarth.Cartesian3.fromDegrees(endLLH[0], endLLH[1], endLLH[2]);
  // 	const direction = window.XEarth.Cartesian3.normalize(
  // 		window.XEarth.Cartesian3.subtract(carE, carS, new window.XEarth.Cartesian3()),
  // 		new window.XEarth.Cartesian3()
  // 	);
  // 	const ray = new window.XEarth.Ray(carS, direction);
  // 	const result = window.viewer.scene.pickFromRay(ray);
  // 	if (window.XEarth.defined(result) && window.XEarth.defined(result.object) && result.position) {
  // 		// 有碰到东西，碰到第一个点之前的可视，之后的不可视
  // 		const distanceEnd = window.XEarth.Cartesian3.distance(result.position, carE);
  // 		if (distanceEnd > 1) {
  // 			this.addPolylinePrimitive(carS, result.position, window.XEarth.Color.GREEN);
  // 			this.addPolylinePrimitive(result.position, carE, window.XEarth.Color.RED);
  // 		} else {
  // 			this.addPolylinePrimitive(carS, carE, window.XEarth.Color.GREEN);
  // 		}
  // 	}
  // }

  return {
    visibilityAnalysis
  }
}
