<template>
  <!-- cesium\Source\Shaders\PostProcessStages里添加自定义GLSL来实现自定义的特效 -->
  <div class="container">
    <div id="cesiumContainer">
      <div style="position: absolute; top: 100px; left: 100px; z-index: 99">
        <button @click="measureAreaSpace">add</button>
        <button @click="remove">remove</button>
        <button @click="changeClamp">change</button>
        <button @click="toogleHeightReference(0)">模式1</button>
        <button @click="toogleHeightReference(1)">模式2</button>
        <button @click="toogleHeightReference(2)">模式3</button>
      </div>
    </div>
    <div
      id="toolTip"
      style="
        display: none;
        position: absolute;
        height: 29px;
        width: 130px;
        border: 1px solid #99ff99;
        backgroundcolor: #99ff99;
        border-radius: 5px;
        box-shadow: 2px 2px 5px #ffff77;
        top: 0px;
        left: 0px;
        line-height: 4px;
        font-size: 14px;
        color: #f03;
        font-weight: bold;
      "
    ></div>
  </div>
</template>

<script>
import * as Cesium from 'cesium/Cesium'
import * as widgets from 'cesium/Widgets/widgets.css'
export default {
  components: {},
  data() {
    return {
      viewer: null, //
      measureIds: [],
      clampToGround: false, //是否贴地测量
      heightReference: null
    }
  },
  mounted() {
    this._cesiumInit()
  },
  methods: {
    _cesiumInit() {
      window.XEarth.Ion.defaultAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNGNmNjU4Yi1iMWM0LTQ5YzEtYjkyZC0wNzliODdkYzlhMWIiLCJpZCI6NDUzNTAsImlhdCI6MTYxNDkzMjg1Mn0.lt2c05x6ZZYu6-tlJ1xMUnFIbr3a7KJOZNB_Afkt9RQ'

      let tdtImageryProvider =
        new window.XEarth.WebMapTileServiceImageryProvider({
          url: 'http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=7711a24780452f03bb7c02fba98183b9',
          layer: 'img',
          style: 'default',
          format: 'tiles',
          tileMatrixSetID: 'w',
          credit: new window.XEarth.Credit('天地图全球影像服务'),
          // maximumLevel:7,
          show: false
        })
      //加载在线地形图数据
      // var worldTerrain = window.XEarth.createWorldTerrain({
      //   // required for water effects
      //   requestWaterMask: true,
      //   // required for terrain lighting
      //   requestVertexNormals: true,
      // });
      // var terrainProvider = new window.XEarth.CesiumTerrainProvider({
      //   url: 'http://localhost:8090/api'
      // })
      let viewer = new window.XEarth.Viewer('cesiumContainer', {
        // imageryProvider: new window.XEarth.WebMapTileServiceImageryProvider({
        //   url:
        //     "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles" +
        //     "&tk=token",
        //   layer: "tdtBasicLayer",
        //   style: "default",
        //   format: "image/jpeg",
        //   maximumLevel: 18, //天地图的最大缩放级别
        //   tileMatrixSetID: "GoogleMapsCompatible",
        //   show: false,
        // }),
        // terrainProvider: terrainProvider,
        imageryProvider: tdtImageryProvider,
        // 需要进行可视化的数据源的集合
        animation: false, // 是否显示动画控件
        shouldAnimate: true,
        homeButton: false, // 是否显示Home按钮
        fullscreenButton: false, // 是否显示全屏按钮
        baseLayerPicker: false, // 是否显示图层选择控件
        geocoder: false, // 是否显示地名查找控件
        timeline: false, // 是否显示时间线控件
        sceneModePicker: false, // 是否显示投影方式控件
        navigationHelpButton: false, // 是否显示帮助信息控件
        infoBox: false, // 是否显示点击要素之后显示的信息
        requestRenderMode: true, // 启用请求渲染模式
        scene3DOnly: false, // 每个几何实例将只能以3D渲染以节省GPU内存
        sceneMode: 3, // 初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  window.XEarth.SceneMode
        fullscreenElement: document.body, // 全屏时渲染的HTML元素 暂时没发现用处
        selectionIndicator: false, //双击绿框
        distanceEntitise: []
      })
      this.viewer = viewer
      let scene = viewer.scene
      viewer.scene.sun.show = true //是否显示太阳

      // viewer._cesiumWidget._creditContainer.style.display = "none"; //版权控件的显示隐藏
      viewer.cesiumWidget.creditContainer.style.display = 'none' //去cesium logo水印
      scene.postProcessStages.fxaa.enabled = false //去锯齿 是文字清晰

      //取消双击跟踪实体
      viewer.trackedEntityChanged.addEventListener(function () {
        viewer.trackedEntity = undefined
      })

      scene.undergroundMode = true

      // 亮度设置
      var stages = viewer.scene.postProcessStages
      scene.brightness =
        scene.brightness ||
        stages.add(
          window.XEarth.PostProcessStageLibrary.createBrightnessStage()
        )
      scene.brightness.enabled = true
      scene.brightness.uniforms.brightness = Number(1.3)

      // var tileset = new window.XEarth.Cesium3DTileset({
      //   url: '/api/tiles/tileset.json'
      // })

      // viewer.scene.primitives.add(tileset)
      // viewer.zoomTo(tileset)
      // 深度开启或关闭
      // viewer.scene.globe.depthTestAgainstTerrain = true;
    },
    remove() {
      this.measureIds.forEach((element) => {
        this.viewer.entities.removeById(element)
      })
    },
    measureAreaSpace() {
      let viewer = this.viewer
      let that = this
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

      handler.setInputAction(function (movement) {
        tooltip.style.left = movement.endPosition.x + 40 + 'px'
        tooltip.style.top = movement.endPosition.y - 30 + 'px'
        tooltip.innerHTML = '<p>单击开始，双击结束</p>'
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
        var latitudeString = window.XEarth.Math.toDegrees(cartographic.latitude)
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
        that.measureIds.push(floatingPoint.id)
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
            font: '18px sans-serif',
            fillColor: window.XEarth.Color.GOLD,
            style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: window.XEarth.VerticalOrigin.BOTTOM,
            pixelOffset: new window.XEarth.Cartesian2(20, -40),
            heightReference: window.XEarth.HeightReference.CLAMP_TO_GROUND
          }
        })
        that.measureIds.push(area.id)
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
          this.options = {
            name: '多边形',
            polygon: {
              hierarchy: [],
              perPositionHeight: that.clampToGround,
              material: window.XEarth.Color.GREEN.withAlpha(0.5)
              //   clampToGround: false,
              // heightReference:20000
            }
          }

          this.hierarchy = { positions }
          this._init()
        }

        _.prototype._init = function () {
          var _self = this
          var _update = function () {
            return _self.hierarchy
          }
          //实时更新polygon.hierarchy
          this.options.polygon.hierarchy = new window.XEarth.CallbackProperty(
            _update,
            false
          )
          let polygon = viewer.entities.add(this.options)
          that.measureIds.push(polygon.id)
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
    },
    // 切换贴地模式
    changeClamp() {
      if (this.clampToGround) {
        return (this.clampToGround = false)
      }
      this.clampToGround = true
    },
    toogleHeightReference(param) {
      switch (param) {
        case 0:
          this.HeightReference = window.XEarth.HeightReference.NONE
          break
        case 1:
          this.HeightReference = window.XEarth.HeightReference.CLAMP_TO_GROUND
          break
        case 2:
          this.HeightReference =
            window.XEarth.HeightReference.RELATIVE_TO_GROUND
          break
        default:
          break
      }
    }
  }
}
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
// @import "~cesium/Build/Cesium/Widgets/widgets.css";
.container {
  width: 100%;
  height: 100%;
}
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
