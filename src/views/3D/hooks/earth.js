import { onMounted } from 'vue'
import { useStore } from 'vuex'
// import * as pieearth from 'pieearthweb'
let Cesium = require("cesium/Cesium");
let widgets = require("cesium/Widgets/widgets.css");
import emitter from '@/utils/eventbus'
import DataControl from '@/utils/earth/dataControl.js'
import * as EarthPlugn from '@/utils/earthPlugin/earthPlugin.js'
import { GradientCircleMaterialProperty } from '@/utils/effect/GradientCircleMaterial'

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzOTMwYzE5ZS1mZDRhLTRkMzAtODUzYS1hNTU0YjU2ZTE4M2UiLCJpZCI6ODY5ODAsImlhdCI6MTcwNDE1OTQwNn0.9o0HYz056WlvrvkVuEAH-dUQJ-FYe8MYckexcztzxqg"

export default function () {
  const store = useStore()
  // 只有等元素挂载渲染后，才可以将 html元素与cesium的viewer挂载
  onMounted(() => {
    window.EarthViewer = new Cesium.Viewer("container", {
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
      distanceEntitise: [],
    });
    window.XEarth = Cesium
    window.XEarth.Ion.defaultAccessToken = token
    let baseLayer = new window.XEarth.UrlTemplateImageryProvider({
      url: `http://10.1.30.102:9000/bingmaps/{z}/{x}/{y}.jpg`,
      // tilingScheme: new window.XEarth.GeographicTilingScheme()
    })
    // let baseLayer = new window.XEarth.UrlTemplateImageryProvider({
    //   url: 'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
    // })
    window.EarthViewer.imageryLayers.addImageryProvider(baseLayer)
    window.EarthViewer.cesiumWidget.creditContainer.style.display = "none";
    window.EarthPlugn = EarthPlugn
    const sceneAction = new window.EarthPlugn.sceneAction({
      earth: window.XEarth,
      viewer: window.EarthViewer
    })
    window.sceneAction = sceneAction
    console.log(window.EarthPlugn);
    let dataController = new DataControl({
      earth: window.XEarth,
      viewer: window.EarthViewer
    })
    store.commit('setDataControl', dataController)
    // 指北针
    var options = {}
    // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和Cesium.Rectangle.
    options.defaultResetView = window.XEarth.Rectangle.fromDegrees(
      65.82077251432172,
      47.06889581479351,
      158.32151176063513,
      33.7335741260239
    )
    // window.EarthViewer.terrainProvider = window.XEarth.createWorldTerrain();
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
    // 调整底图图层参数
    let baseLayerConfig = window.EarthViewer.imageryLayers.get(1)
    baseLayerConfig.brightness = 1.0
    baseLayerConfig.contrast = 1.0
    baseLayerConfig.hue = 0
    baseLayerConfig.saturation = 1.6
    baseLayerConfig.gamma = 1
    window.EarthViewer.scene.skyBox = new window.XEarth.SkyBox({
      sources: {
        positiveX: 'static/image/skyBox/px.png',
        negativeX: 'static/image/skyBox/nx.png',
        positiveY: 'static/image/skyBox/py.png',
        negativeY: 'static/image/skyBox/ny.png',
        positiveZ: 'static/image/skyBox/pz.png',
        negativeZ: 'static/image/skyBox/nz.png'
      }
    })
    window.EarthViewer.scene.skyAtmosphere.show = true
    window.EarthViewer.scene.skyAtmosphere.perFragmentAtmosphere = true
    window.EarthViewer.scene.skyAtmosphere.saturationShift = 1.0
    var handler = new window.XEarth.ScreenSpaceEventHandler(
      window.EarthViewer.scene.canvas
    )
    //监听单击事件
    handler.setInputAction(function (movement) {
      let cartesian = window.EarthViewer.scene.pickPosition(movement.position)

      if (window.XEarth.defined(cartesian)) {
        var cartographic = window.XEarth.Cartographic.fromCartesian(cartesian)
        var lat = window.XEarth.Math.toDegrees(cartographic.latitude)
        var lng = window.XEarth.Math.toDegrees(cartographic.longitude)
        var alt = cartographic.height
        console.log(lng, lat, alt)
        // window.EarthViewer.entities.add({
        //   position: window.XEarth.Cartesian3.fromDegrees(lng, lat, alt),
        //   point: {
        //     pixelSize: 10,
        //     color: window.XEarth.Color.RED
        //   }
        // })
      }
    }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)
    // 移动事件
    handler.setInputAction(function (movement) {
      //动态经纬度视角高度
      var lngLatInfo = document.getElementById('lng-lat-info')
      //具体事件的实现
      var ellipsoid = window.EarthViewer.scene.globe.ellipsoid
      //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
      var cartesian = window.EarthViewer.camera.pickEllipsoid(
        movement.endPosition,
        ellipsoid
      )
      if (cartesian) {
        //将笛卡尔三维坐标转为地图坐标（弧度）
        var cartographic =
          window.EarthViewer.scene.globe.ellipsoid.cartesianToCartographic(
            cartesian
          )
        //将地图坐标（弧度）转为十进制的度数
        var lat_String = window.XEarth.Math.toDegrees(
          cartographic.latitude
        ).toFixed(4)
        var log_String = window.XEarth.Math.toDegrees(
          cartographic.longitude
        ).toFixed(4)
        var alti_String = (
          window.EarthViewer.camera.positionCartographic.height / 1000
        ).toFixed(2)
        // 右下角经纬度
        let lngMarker = log_String < 0 ? 'W&nbsp;&nbsp' : 'E&nbsp;&nbsp'
        let latMarker = lat_String < 0 ? 'S&nbsp;&nbsp' : 'N&nbsp;&nbsp'
        lngLatInfo.innerHTML =
          log_String +
          '° ' +
          lngMarker +
          lat_String +
          '° ' +
          latMarker +
          alti_String +
          'km'
      }
    }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)

    // LoadClouds(window.EarthViewer, window.XEarth)
    // 进入系统的第一个默认视角
    window.EarthViewer.camera.setView({
      destination: new window.XEarth.Cartesian3(
        -11181072.313712653,
        47081282.03532315,
        29141628.793828163
      ),
      orientation: {
        heading: 0.0023920759120432677,
        pitch: -1.567824697003049,
        roll: 0
      }
    })
    setTimeout(() => {
      window.EarthViewer.camera.flyTo({
        // 118.34573072478551 32.25604843382856 131.6186629187405
        destination: new window.XEarth.Cartesian3(
          -8262325.164470204,
          25680974.505449567,
          13297166.680839693
        ),
        orientation: {
          heading: 6.283185307179586, //偏航角
          pitch: -1.5696997538829982, //-0.08401170275668313, //水平俯仰角
          roll: 0.0
        },
        complete: () => {
          //this.startRotate(viewer, Cesium, { multiplier: 1000 });
        }
      })
    }, 1800)
    const setGlow = (viewModel) => {
      var bloom = window.EarthViewer.scene.postProcessStages.bloom
      bloom.enabled = Boolean(viewModel.show)
      bloom.uniforms.glowOnly = Boolean(viewModel.glowOnly)
      bloom.uniforms.contrast = Number(viewModel.contrast)
      bloom.uniforms.brightness = Number(viewModel.brightness)
      bloom.uniforms.delta = Number(viewModel.delta)
      bloom.uniforms.sigma = Number(viewModel.sigma)
      bloom.uniforms.stepSize = Number(viewModel.stepSize)
    }
    // setGlow(viewModel)
    window.EarthViewer.scene.undergroundMode = true
    window.EarthViewer.scene.sun.show = true
    window.EarthViewer.scene.fog.enabled = true
    window.EarthViewer.scene.globe.enableLighting = false
    //window.EarthViewer.scene.postProcessStages.fxaa.enabled = true //去锯齿 是文字清晰
    window.EarthViewer.scene.postProcessStages.fxaa.enabled = false
    // window.EarthViewer.scene.fxaa = false // 新版本使用上面的方式
    window.EarthViewer.scene.globe.maximumScreenSpaceError = 1.5

    // 地形
    // const terrainProvider = window.XEarth.createWorldTerrain();
    // window.EarthViewer.terrainProvider = terrainProvider;
    // window.EarthViewer.scene.terrainProvider = await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl(
    //     "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
    //   );
    

    if (window.XEarth.FeatureDetection.supportsImageRenderingPixelated()) {
      //判断是否支持图像渲染像素化处理
      window.EarthViewer.resolutionScale = window.devicePixelRatio
    }
    // 获取当前的图层
    let layer = window.EarthViewer.scene.imageryLayers.get(0)
    layer.gamma = 0.66
    layer.magnificationFilter = window.XEarth.TextureMagnificationFilter.NEAREST
    layer.minificationFilter = window.XEarth.TextureMinificationFilter.NEAREST
    let imageryProviderViewModels =
      window.EarthViewer.baseLayerPicker.viewModel.imageryProviderViewModels
    // window.EarthViewer.baseLayerPicker.viewModel.selectedImagery =
    //   window.EarthViewer.baseLayerPicker.viewModel.imageryProviderViewModels[
    //   imageryProviderViewModels.length - 1
    //   ]
    // console.log(imageryProviderViewModels);
    window.EarthViewer.baseLayerPicker.viewModel.selectedImagery = imageryProviderViewModels[1]
  })

  return {}
}
