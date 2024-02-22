<template>
  <!-- cesium\Source\Shaders\PostProcessStages里添加自定义GLSL来实现自定义的特效 -->
  <div class="container">
    <div id="cesiumContainer">
      <div style="position: absolute; top: 100px; left: 100px; z-index: 99">
        <button @click="VisibilityAnalysis">create</button>
        <button @click="clear">clear</button>
        <button @click="addHeading">heading</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as Cesium from 'cesium/Cesium'
import * as widgets from 'cesium/Widgets/widgets.css'
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
      sketch: null,
      entities_point: []
    }
  },
  mounted() {
    this._cesiumInit()
  },
  methods: {
    _cesiumInit() {
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
      // var terrainProvider = new Cesium.CesiumTerrainProvider({
      //   url: 'http://localhost:8090/api'
      // })
      let viewer = new Cesium.Viewer('cesiumContainer', {
        // terrainProvider: terrainProvider,
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
        url: 'http://localhost:8090/api/3dtiles/tileset.json'
      })

      viewer.scene.primitives.add(tileset)
      viewer.zoomTo(tileset)
      // 深度开启或关闭
      // viewer.scene.globe.depthTestAgainstTerrain = true;

      // var options = {};
      // // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和Cesium.Rectangle.
      // options.defaultResetView = this.Cesium.Cartographic.fromDegrees(115, 30, 2000000);
      // // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
      // options.enableCompass = true;
      // // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件 将不会添加到地图中。
      // options.enableZoomControls = true;
      // // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
      // options.enableDistanceLegend = true;
      // // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
      // options.enableCompassOuterRing = true;
      // this.CesiumNavigation(viewer, options);
    },
    VisibilityAnalysis() {
      let viewer = window.viewer
      let that = this
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      this.handler.setInputAction(function (movement) {
        let cartesian = viewer.scene.pickPosition(movement.position)
        that.viewPosition = cartesian
        if (that.positions.length < 2) {
          that.positions.push(cartesian)
          that.createPoint(cartesian)
        } else {
          that.handler.destroy()
          that.viewPosition = that.positions[0]
          that.viewPositionEnd = that.positions[1]
          that.viewHeading = that.getHeading(
            that.viewPosition,
            that.viewPositionEnd
          )
          that.viewPitch = that.getPitch(
            that.viewPosition,
            that.viewPositionEnd
          )
          that.update()
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    createLightCamera() {
      let viewer = window.viewer
      let lightCamera = new Cesium.Camera(viewer.scene)
      lightCamera.position = this.viewPosition
      // if (this.viewPositionEnd) {
      //     let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.viewPositionEnd, this.viewPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3());
      //     this.lightCamera.direction = direction; // direction是相机面向的方向
      // }
      lightCamera.frustum.near = this.viewDistance * 0.001
      lightCamera.frustum.far = this.viewDistance
      const hr = Cesium.Math.toRadians(this.horizontalViewAngle)
      const vr = Cesium.Math.toRadians(this.verticalViewAngle)
      const aspectRatio =
        (this.viewDistance * Math.tan(hr / 2) * 2) /
        (this.viewDistance * Math.tan(vr / 2) * 2)
      // console.log(aspectRatio)
      lightCamera.frustum.aspectRatio = aspectRatio
      if (hr > vr) {
        lightCamera.frustum.fov = hr
      } else {
        lightCamera.frustum.fov = vr
      }
      // console.log(lightCamera.frustum.fov)
      lightCamera.setView({
        destination: this.viewPosition,
        orientation: {
          heading: Cesium.Math.toRadians(this.viewHeading || 0),
          pitch: Cesium.Math.toRadians(this.viewPitch || 0),
          roll: 0
        }
      })
      this.lightCamera = lightCamera
    },
    createShadowMap() {
      let viewer = window.viewer
      let shadowMap = new Cesium.ShadowMap({
        context: viewer.scene.context,
        lightCamera: this.lightCamera,
        enabled: this.enabled,
        isPointLight: true,
        pointLightRadius: this.viewDistance,
        cascadesEnabled: false,
        size: this.size,
        softShadows: this.softShadows,
        normalOffset: false,
        fromLightSource: false
      })
      this.shadowMap = shadowMap
      viewer.scene.shadowMap = shadowMap
    },
    createPostStage() {
      let viewer = window.viewer
      let that = this
      this.visibleAreaColor = Cesium.Color.GREEN
      this.invisibleAreaColor = new Cesium.Color(0.165, 0.165, 0.165, 0.8)
      const fs = GLSL
      const postStage = new Cesium.PostProcessStage({
        fragmentShader: fs,
        uniforms: {
          shadowMap_textureCube: () => {
            that.shadowMap.update(Reflect.get(viewer.scene, '_frameState'))
            return Reflect.get(that.shadowMap, '_shadowMapTexture')
          },
          shadowMap_matrix: () => {
            that.shadowMap.update(Reflect.get(viewer.scene, '_frameState'))
            return Reflect.get(that.shadowMap, '_shadowMapMatrix')
          },
          shadowMap_lightPositionEC: () => {
            that.shadowMap.update(Reflect.get(viewer.scene, '_frameState'))
            return Reflect.get(that.shadowMap, '_lightPositionEC')
          },
          shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
            that.shadowMap.update(Reflect.get(viewer.scene, '_frameState'))
            const bias = that.shadowMap._pointBias
            return Cesium.Cartesian4.fromElements(
              bias.normalOffsetScale,
              that.shadowMap._distance,
              that.shadowMap.maximumDistance,
              0.0,
              new Cesium.Cartesian4()
            )
          },
          shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
            that.shadowMap.update(Reflect.get(viewer.scene, '_frameState'))
            const bias = that.shadowMap._pointBias
            const scratchTexelStepSize = new Cesium.Cartesian2()
            const texelStepSize = scratchTexelStepSize
            texelStepSize.x = 1.0 / that.shadowMap._textureSize.x
            texelStepSize.y = 1.0 / that.shadowMap._textureSize.y

            return Cesium.Cartesian4.fromElements(
              texelStepSize.x,
              texelStepSize.y,
              bias.depthBias,
              bias.normalShadingSmooth,
              new Cesium.Cartesian4()
            )
          },
          camera_projection_matrix: that.lightCamera.frustum.projectionMatrix,
          camera_view_matrix: that.lightCamera.viewMatrix,
          helsing_viewDistance: () => {
            return that.viewDistance
          },
          helsing_visibleAreaColor: that.visibleAreaColor,
          helsing_invisibleAreaColor: that.invisibleAreaColor
        }
      })
      this.postStage = viewer.scene.postProcessStages.add(postStage)
    },
    drawFrustumOutline() {
      let viewer = window.viewer
      const scratchRight = new Cesium.Cartesian3()
      const scratchRotation = new Cesium.Matrix3()
      const scratchOrientation = new Cesium.Quaternion()
      const position = this.lightCamera.positionWC
      const direction = this.lightCamera.directionWC
      const up = this.lightCamera.upWC
      let right = this.lightCamera.rightWC
      right = Cesium.Cartesian3.negate(right, scratchRight)
      let rotation = scratchRotation
      Cesium.Matrix3.setColumn(rotation, 0, right, rotation)
      Cesium.Matrix3.setColumn(rotation, 1, up, rotation)
      Cesium.Matrix3.setColumn(rotation, 2, direction, rotation)
      // console.log(rotation)
      let orientation = Cesium.Quaternion.fromRotationMatrix(
        rotation,
        scratchOrientation
      )

      let instance = new Cesium.GeometryInstance({
        geometry: new Cesium.FrustumOutlineGeometry({
          frustum: this.lightCamera.frustum,
          origin: this.viewPosition,
          orientation: orientation
        }),
        id: Math.random().toString(36).substr(2),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.YELLOWGREEN //new Cesium.Color(0.0, 1.0, 0.0, 1.0)
          ),
          show: new Cesium.ShowGeometryInstanceAttribute(true)
        }
      })

      this.frustumOutline = viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: [instance],
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false
          })
        })
      )
    },
    drawSketch() {
      let viewer = window.viewer
      let that = this
      this.sketch = viewer.entities.add({
        name: 'sketch',
        position: that.viewPosition,
        orientation: Cesium.Transforms.headingPitchRollQuaternion(
          that.viewPosition,
          Cesium.HeadingPitchRoll.fromDegrees(
            that.viewHeading - that.horizontalViewAngle,
            that.viewPitch,
            0.0
          )
        ),
        ellipsoid: {
          radii: new Cesium.Cartesian3(
            that.viewDistance,
            that.viewDistance,
            that.viewDistance
          ),
          // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
          minimumClock: Cesium.Math.toRadians(-that.horizontalViewAngle / 2),
          maximumClock: Cesium.Math.toRadians(that.horizontalViewAngle / 2),
          minimumCone: Cesium.Math.toRadians(that.verticalViewAngle + 7.75),
          maximumCone: Cesium.Math.toRadians(
            180 - that.verticalViewAngle - 7.75
          ),
          // fill: false,
          outline: true,
          subdivisions: 256,
          stackPartitions: 64,
          slicePartitions: 10,
          outlineColor: Cesium.Color.YELLOWGREEN
          // material: Cesium.Color.RED.withAlpha(0.5),
        }
      })
    },
    add() {
      this.createLightCamera()
      this.createShadowMap()
      this.createPostStage()
      this.drawFrustumOutline()
      this.drawSketch()
    },
    update() {
      this.clear()
      this.add()
    },
    clear() {
      let viewer = window.viewer
      if (this.sketch) {
        viewer.entities.removeById(this.sketch.id)
        this.sketch = null
      }
      if (this.frustumOutline) {
        this.frustumOutline.destroy()
        this.frustumOutline = null
      }
      if (this.postStage) {
        viewer.scene.postProcessStages.remove(this.postStage)
        this.postStage = null
      }
    },
    getHeading(fromPosition, toPosition) {
      let finalPosition = new Cesium.Cartesian3()
      let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y))
    },
    getPitch(fromPosition, toPosition) {
      let finalPosition = new Cesium.Cartesian3()
      let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.asin(finalPosition.z))
    },
    createPoint(cartesian) {
      let point = window.viewer.entities.add({
        position: cartesian,
        point: {
          pixelSize: 10,
          color: Cesium.Color.YELLOW
        }
      })
      this.entities_point.push(point)
      return point
    },
    addHeading() {
      this.viewHeading += 1
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
