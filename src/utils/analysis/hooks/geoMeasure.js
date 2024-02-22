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
// import "./lib/cloudMaterial1"

export default function () {
  const instance = getCurrentInstance()
  const _this = instance.appContext.config.globalProperties

  // const store = useStore()
  // 测线
  const drawPolyline = () => {
    const Cesium = window.XEarth
    const viewer = window.EarthViewer
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
    let entityLabel = viewer.entities.add({
      label: {
        show: false,
        scale: 0.5,
        font: '32px monospace',
        horizontalOrigin: window.XEarth.HorizontalOrigin.LEFT,
        verticalOrigin: window.XEarth.VerticalOrigin.CENTER,
        pixelOffset: new window.XEarth.Cartesian2(20, 0),
        style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
        fillColor: window.XEarth.Color.WHITE,
        outlineColor: window.XEarth.Color.BLACK,
        outlineWidth: 5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })
    let ellipsoid = viewer.scene.globe.ellipsoid
    const handler = new window.XEarth.ScreenSpaceEventHandler(
      viewer.scene.canvas
    )
    let options = {}
    //去掉单双击的效果
    viewer.screenSpaceEventHandler.removeInputAction(
      window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
    viewer.screenSpaceEventHandler.removeInputAction(
      window.XEarth.ScreenSpaceEventType.LEFT_CLICK
    )

    let getDistance = function (lat1, lng1, lat2, lng2) {
      let EARTH_RADIUS = 6378137.0
      let PI = Math.PI

      function getRad(d) {
        return (d * PI) / 180.0
      }
      let f = getRad((lat1 + lat2) / 2)
      let g = getRad((lat1 - lat2) / 2)
      let l = getRad((lng1 - lng2) / 2)

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

      return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg))
    }
    let PolyLinePrimitive = (function () {
      function _(id, positions) {
        options = {
          id: id,
          position: '',
          show: true,
          polyline: {
            show: true,
            positions: [],
            material: window.XEarth.Color.AQUA,
            clampToGround: true,
            width: 3,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        }
        let updatePolyline = function () {
          return positions
        }
        let updatePolylineLabel = function () {
          if (positions.length > 1) return positions[positions.length - 1]
        }
        instance.positions = positions
        //实时更新polyline
        options.polyline.positions = new window.XEarth.CallbackProperty(
          updatePolyline,
          false
        )
        options.position = new window.XEarth.CallbackProperty(
          updatePolylineLabel,
          false
        )
        instance.entity = viewer.entities.add(options)
      }
      return _
    })()
    let positions = [],
      poly,
      count = 1,
      text = '',
      lastDistance
    let id = new Date().getTime()
    //鼠标左键单击画点
    handler.setInputAction(function (click) {
      let cartesian = viewer.scene.camera.pickEllipsoid(
        click.position,
        ellipsoid
      )
      if (cartesian) {
        if (positions.length == 0) {
          positions.push(cartesian.clone())
        }
        positions.push(cartesian)
        viewer.entities.add({
          id: id + count,
          position: cartesian,
          label: {
            show: true,
            text: text,
            scale: 0.5,
            font: '32px monospace',
            horizontalOrigin: window.XEarth.HorizontalOrigin.LEFT,
            pixelOffset: new window.XEarth.Cartesian2(10, 0),
            style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
            fillColor: window.XEarth.Color.WHITE,
            outlineColor: window.XEarth.Color.BLACK,
            outlineWidth: 5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          point: {
            show: true,
            color: window.XEarth.Color.AQUA,
            pixelSize: 10,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        })
        // 记录上一个点位的距离
        if (text.indexOf('千米') > -1) {
          lastDistance = Number(text.split('千米')[0]) * 1000
        } else {
          lastDistance = Number(text.split('米')[0])
        }
        count++
      }
    }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handler.setInputAction(function (movement) {
      let cartesian = viewer.scene.camera.pickEllipsoid(
        movement.endPosition,
        ellipsoid
      )
      if (cartesian) {
        entityLabel.position = cartesian
        entityLabel.label.show = true
        if (positions.length >= 2) {
          if (!window.XEarth.defined(poly)) {
            poly = new PolyLinePrimitive(new Date().getTime(), positions)
          } else {
            positions.pop()
            cartesian.y += 1 + Math.random()
            positions.push(cartesian)
            // 计算距离
            let minlon = window.XEarth.Math.toDegrees(
              ellipsoid.cartesianToCartographic(positions[positions.length - 2])
                .longitude
            )
            let minlat = window.XEarth.Math.toDegrees(
              ellipsoid.cartesianToCartographic(positions[positions.length - 2])
                .latitude
            )
            let maxlon = window.XEarth.Math.toDegrees(
              ellipsoid.cartesianToCartographic(cartesian).longitude
            )
            let maxlat = window.XEarth.Math.toDegrees(
              ellipsoid.cartesianToCartographic(cartesian).latitude
            )
            let distance = getDistance(minlat, minlon, maxlat, maxlon)
            text = distance + lastDistance
            if (text < 1000) {
              text = text.toFixed(2) + '米'
            } else {
              text = (text / 1000).toFixed(2) + '千米'
            }
            entityLabel.label.text = '左击确认,右击完成\n' + text
          }
        } else {
          entityLabel.label.text = '左击确认,右击完成'
        }
      } else {
        entityLabel.label.show = false
      }
    }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)
    //鼠标右键完成
    handler.setInputAction(function (click) {
      let cartesian = viewer.scene.camera.pickEllipsoid(
        click.position,
        ellipsoid
      )
      if (!cartesian) return
      if (positions.length == 0) return
      positions.push(cartesian)
      viewer.entities.add({
        id: id + count,
        position: cartesian,
        label: {
          show: true,
          text: text,
          scale: 0.5,
          font: '32px monospace',
          horizontalOrigin: window.XEarth.HorizontalOrigin.LEFT,
          pixelOffset: new window.XEarth.Cartesian2(10, 0),
          style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
          fillColor: window.XEarth.Color.WHITE,
          outlineColor: window.XEarth.Color.BLACK,
          outlineWidth: 5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        point: {
          show: true,
          color: window.XEarth.Color.AQUA,
          pixelSize: 10,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      })
      entityLabel.label.show = false
      handler.destroy()
    }, window.XEarth.ScreenSpaceEventType.RIGHT_CLICK)
  }

  const measureAreaSpace = () => {
    const Cesium = window.XEarth
    const viewer = window.EarthViewer
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
    let that = _this
    let measureIds = []

    // 取消双击事件-追踪该位置
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
    // 鼠标事件
    let handler = new window.XEarth.ScreenSpaceEventHandler(
      viewer.scene._imageryLayerCollection
    )
    var positions = []
    var tempPoints = []
    var polygon = null
    var tooltip = document.getElementById('toolTip')
    var cartesian = null
    var floatingPoint //浮动点
    // tooltip.style.display = "block";
    let entityLabel = viewer.entities.add({
      label: {
        show: false,
        scale: 0.5,
        font: '32px monospace',
        horizontalOrigin: window.XEarth.HorizontalOrigin.LEFT,
        verticalOrigin: window.XEarth.VerticalOrigin.CENTER,
        pixelOffset: new window.XEarth.Cartesian2(20, 0),
        style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
        fillColor: window.XEarth.Color.WHITE,
        outlineColor: window.XEarth.Color.BLACK,
        outlineWidth: 5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })

    handler.setInputAction(function (movement) {
      // tooltip.style.left = movement.endPosition.x + 40 + 'px'
      // tooltip.style.top = movement.endPosition.y - 30 + 'px'
      // tooltip.innerHTML = '<p>单击开始，双击结束</p>'
      entityLabel.position = cartesian
      entityLabel.label.show = true
      entityLabel.label.text = '左击开始，右击结束'
      // cartesian = viewer.scene.pickPosition(movement.endPosition);
      let ray = viewer.camera.getPickRay(movement.endPosition)
      // cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      cartesian = viewer.scene.pickPosition(movement.endPosition)
      if (typeof cartesian == 'undefined') {
        cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      }
      //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
      if (positions.length >= 2) {
        if (!window.XEarth.defined(polygon)) {
          polygon = new PolygonPrimitive(positions)
        } else {
          positions.pop()
          // cartesian.y += (1 + Math.random());
          positions.push(cartesian)
        }
        // tooltip.innerHTML='<p>'+distance+'米</p>';
      }
    }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(function (movement) {
      // tooltip.style.display = "none";
      // cartesian = viewer.scene.pickPosition(movement.position);
      let ray = viewer.camera.getPickRay(movement.position)
      // cartesian = viewer.scene.globe.pick(ray, viewer.scene);

      cartesian = viewer.scene.pickPosition(movement.position)
      if (typeof cartesian == 'undefined') {
        cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      }
      // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      if (positions.length == 0) {
        positions.push(cartesian.clone())
      }
      //positions.pop();
      positions.push(cartesian)
      //在三维场景中添加点
      var cartographic = window.XEarth.Cartographic.fromCartesian(
        positions[positions.length - 1]
      )
      var longitudeString = window.XEarth.Math.toDegrees(
        cartographic.longitude
      )
      var latitudeString = window.XEarth.Math.toDegrees(
        cartographic.latitude
      )
      var heightString = cartographic.height
      tempPoints.push({
        lon: longitudeString,
        lat: latitudeString,
        hei: heightString
      })
      floatingPoint = viewer.entities.add({
        name: '多边形面积',
        position: positions[positions.length - 1],
        point: {
          pixelSize: 5,
          color: window.XEarth.Color.RED,
          outlineColor: window.XEarth.Color.WHITE,
          outlineWidth: 2,
          heightReference: that.heightReference
        }
      })
      measureIds.push(floatingPoint.id)
    }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction(function (movement) {
      handler.destroy()
      positions.pop()
      //tempPoints.pop();
      // viewer.entities.remove(floatingPoint);
      // tooltip.style.display = "none";
      //在三维场景中添加点
      // var cartographic = window.XEarth.Cartographic.fromCartesian(positions[positions.length - 1]);
      // var longitudeString = window.XEarth.Math.toDegrees(cartographic.longitude);
      // var latitudeString = window.XEarth.Math.toDegrees(cartographic.latitude);
      // var heightString = cartographic.height;
      // tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});

      var textArea = getArea(tempPoints) + '平方公里'
      let area = viewer.entities.add({
        name: '多边形面积',
        position: positions[positions.length - 1],
        // point : {
        //  pixelSize : 5,
        //  color : window.XEarth.Color.RED,
        //  outlineColor : window.XEarth.Color.WHITE,
        //  outlineWidth : 2,
        //  heightReference:window.XEarth.HeightReference.CLAMP_TO_GROUND
        // },
        label: {
          text: textArea,
          font: '15px sans-serif',
          fillColor: window.XEarth.Color.GOLD,
          style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: window.XEarth.VerticalOrigin.BOTTOM,
          pixelOffset: new window.XEarth.Cartesian2(20, -40),
          heightReference: window.XEarth.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      })
      measureIds.push(area.id)
      entityLabel.label.show = false
    }, window.XEarth.ScreenSpaceEventType.RIGHT_CLICK)

    var radiansPerDegree = Math.PI / 180.0 //角度转化为弧度(rad)
    var degreesPerRadian = 180.0 / Math.PI //弧度转化为角度

    //计算多边形面积
    function getArea(points) {
      var res = 0
      //拆分三角曲面

      for (var i = 0; i < points.length - 2; i++) {
        var j = (i + 1) % points.length
        var k = (i + 2) % points.length
        var totalAngle = Angle(points[i], points[j], points[k])

        var dis_temp1 = distance(positions[i], positions[j])
        var dis_temp2 = distance(positions[j], positions[k])
        res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle))
        console.log(res)
      }

      return (res / 1000000.0).toFixed(4)
    }

    /*角度*/
    function Angle(p1, p2, p3) {
      var bearing21 = Bearing(p2, p1)
      var bearing23 = Bearing(p2, p3)
      var angle = bearing21 - bearing23
      if (angle < 0) {
        angle += 360
      }
      return angle
    }
    /*方向*/
    function Bearing(from, to) {
      var lat1 = from.lat * radiansPerDegree
      var lon1 = from.lon * radiansPerDegree
      var lat2 = to.lat * radiansPerDegree
      var lon2 = to.lon * radiansPerDegree
      var angle = -Math.atan2(
        Math.sin(lon1 - lon2) * Math.cos(lat2),
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
      )
      if (angle < 0) {
        angle += Math.PI * 2.0
      }
      angle = angle * degreesPerRadian //角度
      return angle
    }

    var PolygonPrimitive = (function () {
      function _(positions) {
        _this.options = {
          name: '多边形',
          polygon: {
            hierarchy: [],
            perPositionHeight: that.clampToGround,
            material: window.XEarth.Color.GREEN.withAlpha(0.5)
            // material: new window.XEarth.ElectricMaterialProperty4Ellipsoid({
            //   color: new window.XEarth.Color(0.1, 0.2, 0.1),
            //   speed: 2.0,
            // })
            // material: new window.XEarth.CloudMaterialProperty({
            //   // transparent: true,
            //   // flowSpeed: parseFloat(options.cloudSpeed),
            //   half: false,
            //   color: new window.XEarth.Color(0.2, 0.5, 0.3),
            //   // cloudAlpha: parseFloat(options.cloudThickness),
            //   // cloudCover: parseFloat(options.cloudDiscreteDegree),
            //   // skytint: parseFloat(options.cloudHUE),
            // })
            //   clampToGround: false,
            // heightReference:20000
          }
        }

        _this.hierarchy = { positions }
        _init()
      }

      // _.prototype._init = function () {
      const _init = function () {
        var _self = _this
        var _update = function () {
          return _self.hierarchy
        }
        //实时更新polygon.hierarchy
        _this.options.polygon.hierarchy = new window.XEarth.CallbackProperty(
          _update,
          false
        )
        let polygon = viewer.entities.add(_this.options)
        measureIds.push(polygon.id)
      }

      return _
    })()

    function distance(point1, point2) {
      var point1cartographic =
        window.XEarth.Cartographic.fromCartesian(point1)
      var point2cartographic =
        window.XEarth.Cartographic.fromCartesian(point2)
      /**根据经纬度计算出距离**/
      var geodesic = new window.XEarth.EllipsoidGeodesic()
      geodesic.setEndPoints(point1cartographic, point2cartographic)
      var s = geodesic.surfaceDistance
      //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
      //返回两点之间的距离
      s = Math.sqrt(
        Math.pow(s, 2) +
        Math.pow(point2cartographic.height - point1cartographic.height, 2)
      )
      return s
    }
  }

  // 测矩形
  const drawRectangle = () => {
    const Cesium = window.XEarth
    const viewer = window.EarthViewer
    console.log('矩形')
    let entityLabel = viewer.entities.add({
      label: {
        show: false,
        scale: 0.5,
        font: '32px monospace',
        horizontalOrigin: window.XEarth.HorizontalOrigin.LEFT,
        verticalOrigin: window.XEarth.VerticalOrigin.CENTER,
        pixelOffset: new window.XEarth.Cartesian2(20, 0),
        style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
        fillColor: window.XEarth.Color.WHITE,
        outlineColor: window.XEarth.Color.BLACK,
        outlineWidth: 5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })
    let options = {}
    let ellipsoid = viewer.scene.globe.ellipsoid
    const handler = new window.XEarth.ScreenSpaceEventHandler(
      viewer.scene.canvas
    )
    //去掉单双击的效果
    viewer.screenSpaceEventHandler.removeInputAction(
      window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
    viewer.screenSpaceEventHandler.removeInputAction(
      window.XEarth.ScreenSpaceEventType.LEFT_CLICK
    )

    let RectanglePrimitive = (function () {
      function _(id, points) {
        options = {
          id: id,
          label: {
            show: true,
            text: '',
            scale: 0.5,
            font: '32px monospace',
            style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
            fillColor: window.XEarth.Color.WHITE,
            outlineColor: window.XEarth.Color.BLACK,
            outlineWidth: 5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          show: true,
          position: '',
          rectangle: {
            coordinates: [],
            fill: true,
            material: window.XEarth.Color.AQUA.withAlpha(0.4),
            outline: true,
            outlineColor: window.XEarth.Color.AQUA,
            outlineWidth: 2,
            // height: 0,
            // extrudedHeight: 0,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        }
        let updateRectanglePosition = function () {
          let x =
            (ellipsoid.cartographicToCartesian(points[0]).x +
              ellipsoid.cartographicToCartesian(points[1]).x) /
            2
          let y =
            (ellipsoid.cartographicToCartesian(points[0]).y +
              ellipsoid.cartographicToCartesian(points[1]).y) /
            2
          let z =
            (ellipsoid.cartographicToCartesian(points[0]).z +
              ellipsoid.cartographicToCartesian(points[1]).z) /
            2
          return new window.XEarth.Cartesian3(x, y, z)
        }
        let updateRectangle = function () {
          let e = new window.XEarth.Rectangle()
          e.west = Math.min(points[0].longitude, points[1].longitude)
          e.east = Math.max(points[0].longitude, points[1].longitude)
          e.south = Math.min(points[0].latitude, points[1].latitude)
          e.north = Math.max(points[0].latitude, points[1].latitude)
          if (e.east - e.west > Math.PI) {
            e.west = Math.max(points[0].longitude, points[1].longitude)
            e.east = Math.min(points[0].longitude, points[1].longitude)
          }
          let epsilon = window.XEarth.Math.EPSILON7
          if (e.east - e.west < epsilon) {
            e.east += epsilon * 2.0
          }
          if (e.north - e.south < epsilon) {
            e.north += epsilon * 2.0
          }
          return e
        }
        //实时更新
        options.rectangle.coordinates = new window.XEarth.CallbackProperty(
          updateRectangle,
          false
        )
        options.position = new window.XEarth.CallbackProperty(
          updateRectanglePosition,
          false
        )
        instance.entity = viewer.entities.add(options)
      }
      return _
    })()
    let PointPrimitive = (function () {
      function _(id, positions) {
        options = {
          id: id,
          name: 'point',
          position: '',
          point: {
            show: true,
            color: window.XEarth.Color.AQUA,
            pixelSize: 10,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        }
        let updatePointPosition = function () {
          let x = ellipsoid.cartographicToCartesian(positions[1]).x
          let y = ellipsoid.cartographicToCartesian(positions[1]).y
          let z = ellipsoid.cartographicToCartesian(positions[1]).z
          return new window.XEarth.Cartesian3(x, y, z)
        }
        //实时更新
        options.position = new window.XEarth.CallbackProperty(
          updatePointPosition,
          false
        )
        instance.entity = viewer.entities.add(options)
      }
      return _
    })()
    let id,
      rectangle,
      points = []
    // 鼠标左键单击画点
    handler.setInputAction(function (click) {
      let cartesian = viewer.scene.camera.pickEllipsoid(
        click.position,
        ellipsoid
      )
      if (!cartesian) return
      if (points.length == 0) {
        id = new Date().getTime()
        viewer.entities.add({
          id: id + 1,
          name: 'point',
          position: cartesian,
          point: {
            show: true,
            color: window.XEarth.Color.AQUA,
            pixelSize: 10,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        })
        points.push(ellipsoid.cartesianToCartographic(cartesian))
        points.push(ellipsoid.cartesianToCartographic(cartesian))
        return
      }
      points.pop()
      points.push(ellipsoid.cartesianToCartographic(cartesian))
      handler.destroy()
      entityLabel.label.show = false
      viewer.entities.getById(id + 1)._point._show._value = false
      viewer.entities.getById(id + 2)._point._show._value = false
      viewer.entities.removeById(id + 2)
      viewer.entities.add({
        id: id + 2,
        name: 'point',
        position: cartesian,
        point: {
          show: false,
          color: window.XEarth.Color.AQUA,
          pixelSize: 10,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      })
      handler.destroy()
      entityLabel.label.show = false
    }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)
    // 鼠标移动
    handler.setInputAction(function (movement) {
      let cartesian = viewer.scene.camera.pickEllipsoid(
        movement.endPosition,
        ellipsoid
      )
      if (!cartesian) {
        entityLabel.label.show = false
        return
      }
      entityLabel.position = cartesian
      entityLabel.label.show = true
      if (points.length == 0) {
        entityLabel.label.text = '左击确定'
        return
      }
      entityLabel.label.text = '左击完成'
      points.pop()
      points.push(ellipsoid.cartesianToCartographic(cartesian))
      if (!window.XEarth.defined(rectangle)) {
        rectangle = new RectanglePrimitive(id, points)
        let p = new PointPrimitive(id + 2, points)
      }
      // 计算面积
      let polygon = turf.polygon([
        [
          [
            (points[0].longitude * 180) / Math.PI,
            (points[0].latitude * 180) / Math.PI
          ],
          [
            (points[0].longitude * 180) / Math.PI,
            (points[1].latitude * 180) / Math.PI
          ],
          [
            (points[1].longitude * 180) / Math.PI,
            (points[1].latitude * 180) / Math.PI
          ],
          [
            (points[1].longitude * 180) / Math.PI,
            (points[0].latitude * 180) / Math.PI
          ],
          [
            (points[0].longitude * 180) / Math.PI,
            (points[0].latitude * 180) / Math.PI
          ]
        ]
      ])
      let sqrt = turf.area(polygon).toFixed(2)
      if (sqrt < 1000000) {
        viewer.entities.getById(id).label._text._value =
          sqrt.toFixed(2) + '平方米'
      } else if (sqrt < 10000000000) {
        viewer.entities.getById(id).label._text._value =
          (sqrt / 1000000).toFixed(2) + '平方公里'
      } else {
        viewer.entities.getById(id).label._text._value =
          (sqrt / 10000000000).toFixed(2) + '万平方公里'
      }
    }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)
  }

  return {
    drawPolyline,
    drawRectangle,
    measureAreaSpace
  }
}
