<template>
  <!-- cesium\Source\Shaders\PostProcessStages里添加自定义GLSL来实现自定义的特效 -->
  <div class="container">
    <div id="cesiumContainer">
      <button
        @click="remove"
        style="position: absolute; top: 100px; left: 100px; z-index: 99"
      >
        remove
      </button>
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
      viewer: null //
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
      var AllEnities = [] //储存所有绘制对象

      //测量距离
      var measureDistance = function (cesium) {
        var isDraw = false
        var polyline = new window.XEarth.Entity()
        var polylinePath = [] //点集合
        var tooltip = document.getElementById('toolTip')
        var LineEntities = [] //所有折现对象
        var disNums = [] //线路长度之和
        var StartPoint
        var temLine = null

        var handler = viewer.screenSpaceEventHandler
        /***************************鼠标移动事件***********************************/
        handler.setInputAction(function (movement) {
          var position1
          var cartographic
          var ray = viewer.scene.camera.getPickRay(movement.endPosition)
          if (ray) position1 = viewer.scene.globe.pick(ray, viewer.scene)
          if (position1)
            cartographic =
              window.XEarth.Ellipsoid.WGS84.cartesianToCartographic(position1)
          if (cartographic) {
            //海拔
            var height = viewer.scene.globe.getHeight(cartographic)
            //地理坐标（弧度）转经纬度坐标
            var point = window.XEarth.Cartesian3.fromDegrees(
              (cartographic.longitude / Math.PI) * 180,
              (cartographic.latitude / Math.PI) * 180,
              height
            )
            if (isDraw) {
              tooltip.style.left = movement.endPosition.x + 10 + 'px'
              tooltip.style.top = movement.endPosition.y + 20 + 'px'
              tooltip.style.display = 'block'
              if (polylinePath.length < 1) {
                return
              }
              if (temLine != null) {
                //清除临时线
                viewer.entities.remove(temLine)
              }
              if (polylinePath.length == 1 && point.x != null) {
                temLine = viewer.entities.add({
                  polyline: {
                    show: true,
                    positions: [polylinePath[0], point],
                    material: new window.XEarth.PolylineOutlineMaterialProperty(
                      {
                        color: window.XEarth.Color.RED
                      }
                    ),
                    width: 2
                  }
                })

                AllEnities.push(temLine)
                var distance =
                  sum(disNums) + Number(getLineDis(polylinePath[0], point)) //自己实现
                tooltip.innerHTML =
                  '<p>长度：' +
                  distance.toFixed(2) +
                  '公里</p><p>双击确定终点</p>'
              }
            }
          }
        }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)

        /***************************鼠标移动事件***********************************/

        /***************************鼠标单击事件***********************************/
        //完成画线操作
        handler.setInputAction(function (movement) {
          isDraw = true
          var position1
          var cartographic
          var ray = viewer.scene.camera.getPickRay(movement.position)
          if (ray) position1 = viewer.scene.globe.pick(ray, viewer.scene)
          if (position1)
            cartographic =
              window.XEarth.Ellipsoid.WGS84.cartesianToCartographic(position1)
          //世界坐标转地理坐标（弧度）
          if (cartographic) {
            //海拔
            var height = viewer.scene.globe.getHeight(cartographic)
            //地理坐标（弧度）转经纬度坐标
            var point = window.XEarth.Cartesian3.fromDegrees(
              (cartographic.longitude / Math.PI) * 180,
              (cartographic.latitude / Math.PI) * 180,
              height
            )

            polylinePath.push(point) //加点
            if (isDraw && polylinePath.length == 1) {
              StartPoint = point
              var strartpoint = viewer.entities.add({
                position: point,
                point: {
                  heightReference:
                    window.XEarth.HeightReference.CLAMP_TO_GROUND,
                  show: true,
                  color: window.XEarth.Color.SKYBLUE,
                  pixelSize: 3,
                  outlineColor: window.XEarth.Color.YELLOW,
                  outlineWidth: 1
                },
                label: {
                  text: '起点',
                  font: '14pt monospace',
                  color: window.XEarth.Color.RED,
                  backgroundColor: window.XEarth.Color.CORAL,
                  style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
                  outlineWidth: 2,
                  //垂直位置
                  heightReference: window.XEarth.HeightReference.NONE,
                  verticalOrigin: window.XEarth.VerticalOrigin.TOP,
                  pixelOffset: new window.XEarth.Cartesian2(50, 0)
                }
              })

              AllEnities.push(strartpoint)
            }

            if (isDraw && polylinePath.length > 1) {
              var text = 0
              text =
                sum(disNums) +
                Number(getLineDis(polylinePath[0], polylinePath[1]))
              disNums.push(getLineDis(polylinePath[0], polylinePath[1]))
              var temppoint = viewer.entities.add({
                position: point,
                point: {
                  heightReference:
                    window.XEarth.HeightReference.CLAMP_TO_GROUND,
                  show: true,
                  color: window.XEarth.Color.SKYBLUE,
                  pixelSize: 3,
                  outlineColor: window.XEarth.Color.YELLOW,
                  outlineWidth: 1
                },
                label: {
                  text: text.toFixed(2).toString() + '公里',
                  font: '14pt monospace',
                  color: window.XEarth.Color.RED,
                  backgroundColor: window.XEarth.Color.CORAL,
                  style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
                  outlineWidth: 2,
                  //垂直位置
                  heightReference: window.XEarth.HeightReference.NONE,
                  verticalOrigin: window.XEarth.VerticalOrigin.TOP,
                  pixelOffset: new window.XEarth.Cartesian2(50, 0)
                }
              })

              AllEnities.push(temppoint)

              polyline = viewer.entities.add({
                polyline: {
                  show: true,
                  positions: polylinePath,
                  material: new window.XEarth.PolylineOutlineMaterialProperty({
                    color: window.XEarth.Color.RED
                  }),
                  width: 2
                }
              })
              AllEnities.push(polyline)
              LineEntities.push(polyline) //加直线
              var lastpoint = polylinePath[polylinePath.length - 1]
              polylinePath = [lastpoint]
            }
          }
        }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)

        /***************************鼠标单击事件***********************************/

        /***************************鼠标双击事件***********************************/
        handler.setInputAction(function () {
          handler.removeInputAction(
            window.XEarth.ScreenSpaceEventType.LEFT_CLICK
          )
          handler.removeInputAction(
            window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
          )
          AllEnities.push(polyline)
          viewer.trackedEntity = undefined
          isDraw = false
          tooltip.style.display = 'none'
          polylinePath = []
          //LineEntities = [];
          // polyline = null;
        }, window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

        /***************************鼠标双击事件***********************************/
      }
      measureDistance(Cesium)
      //获取俩点的距离，返回公里单位值
      function getLineDis(startPoint, endPoint) {
        var x2 = (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x)
        var y2 = (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y)
        var dis = Math.sqrt(x2 + y2) / 1000
        return dis.toFixed(2)
      }

      function sum(arr) {
        var s = 0
        for (var i = arr.length - 1; i >= 0; i--) {
          s += Number(arr[i])
        }
        return s
      }
    },
    remove() {
      this.viewer.entities.removeById('distance')
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
