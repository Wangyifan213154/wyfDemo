<template>
  <!-- cesium\Source\Shaders\PostProcessStages里添加自定义GLSL来实现自定义的特效 -->
  <div class="container">
    <div id="cesiumContainer">
      <div style="position: absolute; top: 100px; left: 100px; z-index: 99">
        <button @click="measureHeight">add</button>
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
      handler: null,
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
      var terrainProvider = new window.XEarth.CesiumTerrainProvider({
        url: 'http://localhost:8090/api'
      })
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
        terrainProvider: terrainProvider,
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

      var tileset = new window.XEarth.Cesium3DTileset({
        url: '/api/tiles/tileset.json'
      })

      viewer.scene.primitives.add(tileset)
      viewer.zoomTo(tileset)
      // 深度开启或关闭
      // viewer.scene.globe.depthTestAgainstTerrain = true;
    },
    remove() {
      if (this.handler != null) {
        let tooltip = document.getElementById('toolTip')
        if (tooltip) {
          tooltip.style.display = 'none'
        }
        this.handler.destroy()
      }
      let parentEntity = this.viewer.entities.getById('parent')
      if (parentEntity) {
        let entities = parentEntity._children
        if (entities) {
          entities.forEach((element) => {
            this.viewer.entities.remove(element)
          })
          this.viewer.entities.removeById('parent')
        }
      }
    },
    //****************************高度测量 第一个点的经纬度，第二个点的高度，两点水平距离为半径************************************************//
    measureHeight() {
      let viewer = this.viewer
      let that = this
      var measure_entities = viewer.entities.add(
        new window.XEarth.Entity({
          id: 'parent'
        })
      )
      this.handler = new window.XEarth.ScreenSpaceEventHandler(
        // viewer.scene._imageryLayerCollection
        viewer.scene.canvas
      )
      var positions = []
      var poly = null
      var poly2 = null
      var tooltip = document.getElementById('toolTip')
      var height = 0
      var cartesian = null
      var floatingPoint
      tooltip.style.display = 'block'

      this.handler.setInputAction(function (movement) {
        tooltip.style.left = movement.endPosition.x + 40 + 'px'
        tooltip.style.top = movement.endPosition.y - 30 + 'px'
        tooltip.innerHTML = '<p>单击开始，双击结束</p>'
        cartesian = viewer.scene.pickPosition(movement.endPosition)
        // cartesian =viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        // let cartesian2 = viewer.scene.pickPosition(movement.endPosition);

        if (cartesian) {
          if (positions.length >= 2) {
            if (!window.XEarth.defined(poly)) {
              poly = new PolyLinePrimitive(positions)
              poly2 = new PolyLinePrimitive2(positions)
            } else {
              positions.pop()
              positions.push(cartesian)
            }
            height = getHeight(positions)
          }
        }
      }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)

      this.handler.setInputAction(function (movement) {
        tooltip.style.display = 'none'

        cartesian = viewer.scene.pickPosition(movement.position)

        if (positions.length == 0) {
          positions.push(cartesian.clone())
          positions.push(cartesian)

          floatingPoint = viewer.entities.add({
            parent: measure_entities,
            name: '高度',
            position: positions[0],
            point: {
              pixelSize: 5,
              color: window.XEarth.Color.RED,
              outlineColor: window.XEarth.Color.WHITE,
              outlineWidth: 2,
              heightReference: window.XEarth.HeightReference.NONE
            },
            label: {
              text: '0米',
              font: '18px sans-serif',
              fillColor: window.XEarth.Color.GOLD,
              style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: window.XEarth.VerticalOrigin.BOTTOM,
              pixelOffset: new window.XEarth.Cartesian2(20, -40)
            }
          })
        }
      }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)

      this.handler.setInputAction(function (movement) {
        that.handler.destroy() // 下面的代码相当于callback
        //positions.pop();//清除移动点
        tooltip.style.display = 'none'
        //viewer_g.entities.remove(floatingPoint);
        // console.log(positions);
        //在三维场景中添加Label

        var textDisance = height + '米'

        var point1cartographic = window.XEarth.Cartographic.fromCartesian(
          positions[0]
        )
        var point2cartographic = window.XEarth.Cartographic.fromCartesian(
          positions[1]
        )
        var point_temp = window.XEarth.Cartesian3.fromDegrees(
          window.XEarth.Math.toDegrees(point1cartographic.longitude),
          window.XEarth.Math.toDegrees(point1cartographic.latitude),
          point2cartographic.height
        )
        viewer.entities.removeById('upPoint')
        viewer.entities.add({
          parent: measure_entities,
          name: '直线距离',
          position: point_temp,
          point: {
            pixelSize: 5,
            color: window.XEarth.Color.RED,
            outlineColor: window.XEarth.Color.WHITE,
            outlineWidth: 2,
            heightReference: window.XEarth.HeightReference.none
          },
          label: {
            text: textDisance,
            font: '18px sans-serif',
            fillColor: window.XEarth.Color.GOLD,
            style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: window.XEarth.VerticalOrigin.BOTTOM,
            pixelOffset: new window.XEarth.Cartesian2(20, -20)
          }
        })
      }, window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

      function getHeight(_positions) {
        var cartographic = window.XEarth.Cartographic.fromCartesian(
          _positions[0]
        )
        var cartographic1 = window.XEarth.Cartographic.fromCartesian(
          _positions[1]
        )
        var height_temp = cartographic1.height - cartographic.height
        return height_temp.toFixed(2)
      }
      function getEllipseHeight(_positions) {
        var cartographic = window.XEarth.Cartographic.fromCartesian(
          _positions[0]
        )
        var cartographic1 = window.XEarth.Cartographic.fromCartesian(
          _positions[1]
        )
        var height_temp = cartographic1.height - cartographic.height
        // height_temp = cartographic1.height;
        return cartographic1.height.toFixed(2) //height_temp.toFixed(2);
      }

      var PolyLinePrimitive = (function () {
        function _(positions) {
          this.options = {
            parent: measure_entities,
            name: '直线',
            polyline: {
              show: true,
              positions: [],
              material: window.XEarth.Color.AQUA,
              width: 2
            },
            ellipse: {
              show: true,
              // semiMinorAxis : 30.0,
              // semiMajorAxis : 30.0,
              // height: 20.0,
              material: window.XEarth.Color.RED.withAlpha(0.3),
              outline: true // height must be set for outline to display
            }
          }
          this.positions = positions
          this._init()
        }

        _.prototype._init = function () {
          var _self = this
          var _update = function () {
            var temp_position = []
            temp_position.push(_self.positions[0])
            var point1cartographic = window.XEarth.Cartographic.fromCartesian(
              _self.positions[0]
            )
            var point2cartographic = window.XEarth.Cartographic.fromCartesian(
              _self.positions[1]
            )
            var point_temp = window.XEarth.Cartesian3.fromDegrees(
              window.XEarth.Math.toDegrees(point1cartographic.longitude),
              window.XEarth.Math.toDegrees(point1cartographic.latitude),
              point2cartographic.height
            )
            temp_position.push(point_temp)
            return temp_position
          }
          var _update_ellipse = function () {
            return _self.positions[0]
          }
          var _semiMinorAxis = function () {
            var point1cartographic = window.XEarth.Cartographic.fromCartesian(
              _self.positions[0]
            )
            var point2cartographic = window.XEarth.Cartographic.fromCartesian(
              _self.positions[1]
            )
            /**根据经纬度计算出距离**/
            var geodesic = new window.XEarth.EllipsoidGeodesic()
            geodesic.setEndPoints(point1cartographic, point2cartographic)
            var s = geodesic.surfaceDistance
            return s
          }
          // 绘制圆盘时需要获取基于椭球表面的高度
          var _height = function () {
            var height_temp = getEllipseHeight(_self.positions)
            return height_temp
          }
          // 实时显示高度测量值时需要实时计算起点和终点的高度差
          var _heightDifference = function () {
            var height_temp = getHeight(_self.positions)
            return height_temp
          }
          //实时更新polyline.positions
          this.options.polyline.positions = new window.XEarth.CallbackProperty(
            _update,
            false
          )
          this.options.position = new window.XEarth.CallbackProperty(
            _update_ellipse,
            false
          )
          this.options.ellipse.semiMinorAxis =
            new window.XEarth.CallbackProperty(_semiMinorAxis, false)
          this.options.ellipse.semiMajorAxis =
            new window.XEarth.CallbackProperty(_semiMinorAxis, false)
          this.options.ellipse.height = new window.XEarth.CallbackProperty(
            _height,
            false
          )
          viewer.entities.add(this.options)
        }

        return _
      })()
      var PolyLinePrimitive2 = (function () {
        function _(positions) {
          this.options = {
            parent: measure_entities,
            name: '上位点',
            id: 'upPoint',
            // position: positions[1],
            point: {
              pixelSize: 5,
              color: window.XEarth.Color.RED,
              outlineColor: window.XEarth.Color.WHITE,
              outlineWidth: 2,
              heightReference: window.XEarth.HeightReference.none
            },
            label: {
              text: '',
              font: '18px sans-serif',
              fillColor: window.XEarth.Color.GOLD,
              style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: window.XEarth.VerticalOrigin.BOTTOM,
              pixelOffset: new window.XEarth.Cartesian2(20, -20)
            }
          }
          this.positions = positions
          this._init()
        }

        _.prototype._init = function () {
          var _self = this
          var _update = function () {
            var temp_position = []
            var point1cartographic = window.XEarth.Cartographic.fromCartesian(
              _self.positions[0]
            )
            var point2cartographic = window.XEarth.Cartographic.fromCartesian(
              _self.positions[1]
            )
            var point_temp = window.XEarth.Cartesian3.fromDegrees(
              window.XEarth.Math.toDegrees(point1cartographic.longitude),
              window.XEarth.Math.toDegrees(point1cartographic.latitude),
              point2cartographic.height
            )
            temp_position.push(point_temp)
            return point_temp
          }
          // 实时显示高度测量值时需要实时计算起点和终点的高度差
          var _heightDifference = function () {
            var height_temp = getHeight(_self.positions)
            return height_temp + '米'
          }
          //实时更新上位点position和label的text
          this.options.position = new window.XEarth.CallbackProperty(
            _update,
            false
          )
          this.options.label.text = new window.XEarth.CallbackProperty(
            _heightDifference,
            false
          )
          viewer.entities.add(this.options)
        }

        return _
      })()
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
<style lang="scss" scoped>
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
