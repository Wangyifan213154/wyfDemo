<template>
  <!-- cesium\Source\Shaders\PostProcessStages里添加自定义GLSL来实现自定义的特效 -->
  <div class="container">
    <div id="cesiumContainer">
      <div style="position: absolute; top: 100px; left: 100px; z-index: 99">
        <button @click="create">create</button>
        <button @click="clear">clear</button>
      </div>
    </div>
  </div>
</template>

<script>
import GLSL from './GLSL'
export default {
  components: {},
  data() {
    return {
      positions: [],
      viewPosition: null,
      viewPositionEnd: null,
      viewHeading: null,
      viewPitch: null,
      viewDistance: 100,
      horizontalViewAngle: 90,
      verticalViewAngle: 60,
      handler: null,
      lightCamera: null,
      enabled: true,
      size: 2048,
      softShadows: false,
      shadowMap: null,
      postStage: null,
      visibleAreaColor: null, // 可视区域颜色（默认值`绿色`）
      invisibleAreaColor: null, //不可视区域颜色（默认值`红色`）。
      frustumOutline: null,
      sketch: null
    }
  },
  mounted() {
    this._cesiumInit()
  },
  methods: {
    _cesiumInit() {
      let Cesium = this.Cesium
      const tiandituTk = '7711a24780452f03bb7c02fba98183b9'
      Cesium.Ion.defaultAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNGNmNjU4Yi1iMWM0LTQ5YzEtYjkyZC0wNzliODdkYzlhMWIiLCJpZCI6NDUzNTAsImlhdCI6MTYxNDkzMjg1Mn0.lt2c05x6ZZYu6-tlJ1xMUnFIbr3a7KJOZNB_Afkt9RQ'

      let tdtImageryProvider = new Cesium.WebMapTileServiceImageryProvider({
        url:
          'http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=' +
          tiandituTk,
        layer: 'img',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'w',
        credit: new Cesium.Credit('天地图全球影像服务'),
        // maximumLevel:7,
        show: false
      })
      //加载在线地形图数据
      // var worldTerrain = Cesium.createWorldTerrain({
      //   // required for water effects
      //   requestWaterMask: true,
      //   // required for terrain lighting
      //   requestVertexNormals: true,
      // });
      var terrainProvider = new Cesium.CesiumTerrainProvider({
        url: 'http://localhost:8090/api'
      })
      let viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: terrainProvider,
        imageryProvider: tdtImageryProvider,
        // 需要进行可视化的数据源的集合
        animation: false, // 是否显示动画控件
        shouldAnimate: true,
        homeButton: false, // 是否显示Home按钮
        fullscreenButton: false, // 是否显示全屏按钮
        baseLayerPicker: true, // 是否显示图层选择控件
        geocoder: false, // 是否显示地名查找控件
        timeline: false, // 是否显示时间线控件
        sceneModePicker: false, // 是否显示投影方式控件
        navigationHelpButton: false, // 是否显示帮助信息控件
        infoBox: false, // 是否显示点击要素之后显示的信息
        requestRenderMode: true, // 启用请求渲染模式
        scene3DOnly: false, // 每个几何实例将只能以3D渲染以节省GPU内存
        sceneMode: 3, // 初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
        fullscreenElement: document.body, // 全屏时渲染的HTML元素 暂时没发现用处
        selectionIndicator: false, //双击绿框
        distanceEntitise: []
      })
      window.viewer = viewer
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
        stages.add(Cesium.PostProcessStageLibrary.createBrightnessStage())
      scene.brightness.enabled = true
      scene.brightness.uniforms.brightness = Number(1.3)

      var tileset = new Cesium.Cesium3DTileset({
        url: '/api/tiles/tileset.json'
      })

      viewer.scene.primitives.add(tileset)
      viewer.zoomTo(tileset)
      // 深度开启或关闭
      // viewer.scene.globe.depthTestAgainstTerrain = true;
    },
    create() {
      let Cesium = this.Cesium
      let viewer = window.viewer
      let that = this
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      this.handler.setInputAction(function (movement) {
        let cartesian = viewer.scene.pickPosition(movement.position)
        that.viewPosition = cartesian
        if (that.positions.length < 2) {
          console.log(cartesian)
          that.positions.push(cartesian)
        } else {
          //   that.analysisVisible(that.positions); //方式1
          that.analysisVisible2(that.positions[0], that.positions[1]) //方式2
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    // * 通视分析
    analysisVisible(positions) {
      let Cesium = this.Cesium

      // * 计算射线的方向
      let direction = Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.subtract(
          positions[1],
          positions[0],
          new Cesium.Cartesian3()
        ),
        new Cesium.Cartesian3()
      )
      // 建立射线
      let ray = new Cesium.Ray(positions[0], direction)
      let result = window.viewer.scene.globe.pick(ray, window.viewer.scene) // 计算交点

      if (result !== undefined && result !== null) {
        this.drawLine(result, positions[0], Cesium.Color.GREEN) // 可视
        this.drawLine(result, positions[1], Cesium.Color.RED) // 不可视
      } else {
        this.drawLine(positions[0], positions[1], Cesium.Color.GREEN)
      }
    },

    // * 绘制线
    drawLine(viewPosition, viewPositionEnd, color) {
      window.viewer.entities.add({
        polyline: {
          positions: [viewPosition, viewPositionEnd],
          width: 1,
          material: color,
          depthFailMaterial: color
        }
      })
    },
    // 清除
    clear() {
      window.viewer.entities.removeAll()
    },
    /**
     * 射线通视分析
     * @param start  起点空间坐标
     * @param end  终点空间坐标
     */
    analysisVisible2(startPoint, endPoint) {
      let Cesium = this.Cesium
      // 1. 优先用射线求交点
      const startLLH = this.cartesianToLonLatHeight(startPoint)
      const endLLH = this.cartesianToLonLatHeight(endPoint)
      const carS = Cesium.Cartesian3.fromDegrees(
        startLLH[0],
        startLLH[1],
        startLLH[2]
      )
      const carE = Cesium.Cartesian3.fromDegrees(
        endLLH[0],
        endLLH[1],
        endLLH[2]
      )
      const direction = Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.subtract(carE, carS, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      )
      const ray = new Cesium.Ray(carS, direction)
      const result = window.viewer.scene.pickFromRay(ray)
      if (
        Cesium.defined(result) &&
        Cesium.defined(result.object) &&
        result.position
      ) {
        // 有碰到东西，碰到第一个点之前的可视，之后的不可视
        const distanceEnd = Cesium.Cartesian3.distance(result.position, carE)
        if (distanceEnd > 1) {
          this.addPolylinePrimitive(carS, result.position, Cesium.Color.GREEN)
          this.addPolylinePrimitive(result.position, carE, Cesium.Color.RED)
        } else {
          this.addPolylinePrimitive(carS, carE, Cesium.Color.GREEN)
        }
      }
    },
    addPolylinePrimitive(spoint, epoint, color, width) {
      let Cesium = this.Cesium
      if (!width) width = 2
      const polylinePrmitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: [spoint, epoint], // 坐标必须两个和两个以上
            width, // 线宽
            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color) // 绿色可见,红色不可见
          }
        }),
        appearance: new Cesium.PolylineColorAppearance({
          translucent: false
        })
      })
      window.viewer.scene.primitives.add(polylinePrmitive)
    },
    /**
     * 空间笛卡尔坐标转经纬度(角度制)
     * @param cartesian
     * @returns {*[经度，纬度，高度]}
     */
    cartesianToLonLatHeight: function (cartesian) {
      let Cesium = this.Cesium
      var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      var lon = Cesium.Math.toDegrees(cartographic.longitude)
      var lat = Cesium.Math.toDegrees(cartographic.latitude)
      return [lon, lat, cartographic.height]
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
