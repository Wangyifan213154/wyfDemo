<template>
  <!-- cesium\Source\Shaders\PostProcessStages里添加自定义GLSL来实现自定义的特效 -->
  <div class="container">
    <div id="cesiumContainer">
      <div style="position: absolute; top: 100px; left: 100px; z-index: 99">
        <button @click="remove">remove</button>
        <button @click="addline">add</button>
      </div>
    </div>
    <div
      id="toolTip"
      style="
        display: none;
        position: absolute;
        height: 20px;
        width: 127px;
        background: olive;
        top: 0px;
        left: 0px;
      "
    ></div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      viewer: null, //
      measureIds: []
    }
  },
  mounted() {
    this._cesiumInit()
  },
  methods: {
    _cesiumInit() {
      let Cesium = this.Cesium
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
        url: '/api/tileset.json'
      })

      viewer.scene.primitives.add(tileset)
      viewer.zoomTo(tileset)
      // 深度开启或关闭
      // viewer.scene.globe.depthTestAgainstTerrain = true;
    },
    remove() {
      console.log(this.viewer.entities)
      this.viewer.entities.removeAll()
    },
    addline() {
      let Cesium = this.Cesium
      let viewer = this.viewer
      let that = this
      measureLineSpace(viewer)
      function measureLineSpace(viewer) {
        var handler = new window.XEarth.ScreenSpaceEventHandler(
          viewer.scene.canvas
        )
        var positions = []
        var poly = null
        var tooltip = document.getElementById('toolTip')
        var distance = 0
        var cartesian = null
        var floatingPoint
        tooltip.style.display = 'block'
        //监听移动事件
        handler.setInputAction(function (movement) {
          tooltip.style.left = movement.endPosition.x + 440 + 'px'
          tooltip.style.top = movement.endPosition.y + 30 + 'px'
          tooltip.innerHTML = '<p>单击开始，双击结束</p>'
          //移动结束位置
          cartesian = viewer.scene.pickPosition(movement.endPosition)
          //判断点是否在画布上
          if (window.XEarth.defined(cartesian)) {
            if (positions.length >= 2) {
              if (!window.XEarth.defined(poly)) {
                //画线
                poly = new PolyLinePrimitive(positions)
              } else {
                positions.pop()
                // cartesian.y += (1 + Math.random());
                positions.push(cartesian)
              }
              distance = getSpaceDistance(positions)
            }
          }
        }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)
        //监听单击事件
        handler.setInputAction(function (movement) {
          let that = this
          tooltip.style.display = 'none'
          cartesian = viewer.scene.pickPosition(movement.position)

          if (window.XEarth.defined(cartesian)) {
            if (positions.length == 0) {
              positions.push(cartesian.clone())
            }
            positions.push(cartesian)
            //在三维场景中添加Label
            var textDisance = distance + '米'
            floatingPoint = viewer.entities.add({
              //   id: "distance",
              name: '空间直线距离',
              position: positions[positions.length - 1],
              point: {
                pixelSize: 5,
                color: window.XEarth.Color.RED,
                outlineColor: window.XEarth.Color.WHITE,
                outlineWidth: 2,
                heightReference: window.XEarth.HeightReference.NONE
              },
              label: {
                text: textDisance,
                font: '18px sans-serif',
                fillColor: window.XEarth.Color.GOLD,
                style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: window.XEarth.VerticalOrigin.BOTTOM,
                pixelOffset: new window.XEarth.Cartesian2(20, -20),
                heightReference: window.XEarth.HeightReference.NONE
              }
            })
            // that.distanceEntitise.push(floatingPoint);
          }
        }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)
        //监听双击事件
        handler.setInputAction(function (movement) {
          handler.destroy() //关闭事件句柄
          positions.pop() //最后一个点无效
        }, window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
      }
      //绘线效果1
      var PolyLinePrimitive = (() => {
        function drawLine(positions) {
          this.options = {
            name: '直线',
            polyline: {
              show: true,
              positions: [],
              material: window.XEarth.Color.CHARTREUSE,
              width: 2,
              clampToGround: true
            }
          }
          this.positions = positions
          this._init()
        }
        drawLine.prototype._init = function () {
          var _self = this
          var _update = function () {
            return _self.positions
          }
          //实时更新polyline.positions
          this.options.polyline.positions = new window.XEarth.CallbackProperty(
            _update,
            false
          )
          var addedEntity = viewer.entities.add(this.options)
          that.measureIds.push(addedEntity.id)
        }

        return drawLine
      })()

      //空间两点距离计算函数
      function getSpaceDistance(positions) {
        //只计算最后一截，与前面累加
        //因move和鼠标左击事件，最后两个点坐标重复
        var i = positions.length - 3
        var point1cartographic = window.XEarth.Cartographic.fromCartesian(
          positions[i]
        )
        var point2cartographic = window.XEarth.Cartographic.fromCartesian(
          positions[i + 1]
        )
        getTerrainDistance(point1cartographic, point2cartographic)
      }

      function getTerrainDistance(point1cartographic, point2cartographic) {
        var geodesic = new window.XEarth.EllipsoidGeodesic()
        geodesic.setEndPoints(point1cartographic, point2cartographic)
        var s = geodesic.surfaceDistance
        var cartoPts = [point1cartographic]
        for (var jj = 1000; jj < s; jj += 1000) {
          //分段采样计算距离
          var cartoPt = geodesic.interpolateUsingSurfaceDistance(jj)
          //                console.log(cartoPt);
          cartoPts.push(cartoPt)
        }
        cartoPts.push(point2cartographic)
        //返回两点之间的距离
        var promise = window.XEarth.sampleTerrain(
          viewer.terrainProvider,
          8,
          cartoPts
        )
        window.XEarth.when(promise, function (updatedPositions) {
          // positions height have been updated.
          // updatedPositions is just a reference to positions.
          for (var jj = 0; jj < updatedPositions.length - 1; jj++) {
            var geoD = new window.XEarth.EllipsoidGeodesic()
            geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1])
            var innerS = geoD.surfaceDistance
            innerS = Math.sqrt(
              Math.pow(innerS, 2) +
                Math.pow(
                  updatedPositions[jj + 1].height - updatedPositions[jj].height,
                  2
                )
            )
            distance += innerS
          }

          //在三维场景中添加Label
          var textDisance = distance.toFixed(2) + '米'
          if (distance > 10000)
            textDisance = (distance / 1000.0).toFixed(2) + '千米'
          floatingPoint = viewer.entities.add({
            name: '贴地距离',
            position: labelPt,
            point: {
              pixelSize: 5,
              color: window.XEarth.Color.RED,
              outlineColor: window.XEarth.Color.WHITE,
              outlineWidth: 2
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
          that.measureIds.push(floatingPoint.id)
        })
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
