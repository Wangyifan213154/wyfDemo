<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import MilitaryPlotting from './MilitaryPlotting'
import * as Cesium from 'cesium/Cesium'
import * as widgets from 'cesium/Widgets/widgets.css'
export default {
  name: 'test',
  data() {
    return {
      color: 'rgba(255, 0, 0, 0.8)',
      size: 25,
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585'
      ],
      items: [
        {
          name: '自由线',
          image: require('./images/free-line.png'),
          type: 'FreeLine'
        },
        {
          name: '折线',
          image: require('./images/polyline.png'),
          type: 'Polyline'
        },
        {
          name: '曲线',
          image: require('./images/curve.png'),
          type: 'Curve'
        },
        {
          name: '自由面',
          image: require('./images/staging-area.png'),
          type: 'FreePolygon'
        },
        {
          name: '多边形',
          image: require('./images/easy.png'),
          type: 'Polygon'
        },
        {
          name: '正多边形',
          image: require('./images/polygon.png'),
          type: 'RegularPolygon'
        },
        {
          name: '简单直线箭头',
          image: require('./images/straight-line-arrow.png'),
          type: 'StraightLineArrow'
        },
        {
          name: '简单曲线箭头',
          image: require('./images/curve-line-arrow.png'),
          type: 'CurveLineArrow'
        },
        {
          name: '直角箭头',
          image: require('./images/right-angle-arrow.png'),
          type: 'RightAngleArrow'
        },
        {
          name: '燕尾箭头',
          image: require('./images/swallowtail-arrow.png'),
          type: 'SwallowtailArrow'
        },
        {
          name: '钳击箭头',
          image: require('./images/pincer-arrow.png'),
          type: 'PincerArrow'
        },
        {
          name: '进攻箭头',
          image: require('./images/attack-arrow.png'),
          type: 'AttackArrow'
        },
        {
          name: '圆角矩形',
          image: require('./images/round-rectangle.png'),
          type: 'RoundRectangle'
        },
        {
          name: '扇形',
          image: require('./images/sector.png'),
          type: 'Sector'
        },
        {
          name: '弓形',
          image: require('./images/bow.png'),
          type: 'Bow'
        },
        {
          name: '集结地',
          image: require('./images/staging-area.png'),
          type: 'StagingArea'
        },
        {
          name: '曲线旗标',
          image: require('./images/staging-area.png'),
          type: 'CurveFlag'
        },
        {
          name: '矩形旗标',
          image: require('./images/staging-area.png'),
          type: 'RectangleFlag'
        },
        {
          name: '正三角旗标',
          image: require('./images/staging-area.png'),
          type: 'RegularTriangleFlag'
        },
        {
          name: '倒三角旗标',
          image: require('./images/staging-area.png'),
          type: 'InvertedTriangleFlag'
        },
        {
          name: '对三角旗标',
          image: require('./images/staging-area.png'),
          type: 'TriangleFlag'
        },
        {
          name: '清空',
          image: require('./images/delete.png'),
          type: 'RemoveAll'
        }
      ],
      my_MilitaryPlotting: null
    }
  },
  mounted() {
    this._cesiumInit()
  },
  methods: {
    _cesiumInit() {
      const tiandituTk = '7711a24780452f03bb7c02fba98183b9'
      window.XEarth.Ion.defaultAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNGNmNjU4Yi1iMWM0LTQ5YzEtYjkyZC0wNzliODdkYzlhMWIiLCJpZCI6NDUzNTAsImlhdCI6MTYxNDkzMjg1Mn0.lt2c05x6ZZYu6-tlJ1xMUnFIbr3a7KJOZNB_Afkt9RQ'

      // let tdtImageryProvider = new window.XEarth.WebMapTileServiceImageryProvider({
      //   url:
      //     "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
      //     tiandituTk,
      //   layer: "img",
      //   style: "default",
      //   format: "tiles",
      //   tileMatrixSetID: "w",
      //   credit: new window.XEarth.Credit("天地图全球影像服务"),
      //   // maximumLevel:7,
      //   show: false,
      // });
      //加载在线地形图数据
      // var worldTerrain = window.XEarth.createWorldTerrain({
      //   // required for water effects
      //   requestWaterMask: true,
      //   // required for terrain lighting
      //   requestVertexNormals: true,
      // });
      // http://69.230.220.76:7030/BeijingDEM/
      var terrainProvider = new window.XEarth.CesiumTerrainProvider({
        // url: "http://localhost:8090/api",
        url: 'http://69.230.220.76:7030/BeijingDEM/'
      })
      let viewer = new window.XEarth.Viewer('cesiumContainer', {
        terrainProvider: terrainProvider,
        // imageryProvider: tdtImageryProvider,
        // 需要进行可视化的数据源的集合
        animation: true, // 是否显示动画控件
        shouldAnimate: true,
        homeButton: false, // 是否显示Home按钮
        fullscreenButton: false, // 是否显示全屏按钮
        baseLayerPicker: true, // 是否显示图层选择控件
        geocoder: false, // 是否显示地名查找控件
        timeline: true, // 是否显示时间线控件
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
      // console.log(window.XEarth.Material.ColorType);
      window.viewer = viewer
      window.XEarth = Cesium
      // 指定默认底图
      // viewer.baseLayerPicker.viewModel.selectedImagery =
      //   viewer.baseLayerPicker.viewModel.imageryProviderViewModels[6];
      let scene = viewer.scene
      viewer.scene.sun.show = true //是否显示太阳

      // viewer._cesiumWidget._creditContainer.style.display = "none"; //版权控件的显示隐藏
      viewer.cesiumWidget.creditContainer.style.display = 'none' //去cesium logo水印
      scene.postProcessStages.fxaa.enabled = false //去锯齿 是文字清晰

      //取消双击事件
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      )

      //取消跟踪实体
      viewer.trackedEntityChanged.addEventListener(function () {
        viewer.trackedEntity = undefined
      })
      // let arcgisOnlineMap = new window.XEarth.ArcGisMapServerImageryProvider({
      //   url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer'
      // })
      // viewer.imageryLayers.addImageryProvider(arcgisOnlineMap)

      scene.undergroundMode = true

      this.my_MilitaryPlotting = new MilitaryPlotting(window.viewer)

      // 亮度设置
      var stages = viewer.scene.postProcessStages
      scene.brightness =
        scene.brightness ||
        stages.add(
          window.XEarth.PostProcessStageLibrary.createBrightnessStage()
        )
      scene.brightness.enabled = true
      scene.brightness.uniforms.brightness = Number(1.3)
      this.createAttackArrow()
    },
    //创建进攻箭头
    createAttackArrow() {
      let that = this
      this.my_MilitaryPlotting.CreateAttackArrowD(
        {
          color: window.window.XEarth.Color.fromCssColorString(this.color),
          id: this.setSessionid()
        },
        function (el) {
          console.log(
            '在这里执行进攻箭头绘制后回调方法',
            el,
            that.my_MilitaryPlotting
          )
        }
      )
    },
    // 移除所有绘制对象
    removeAll() {
      my_MilitaryPlotting.clearAll()
    },
    //创建随机id
    setSessionid(num) {
      var len = num || 32
      var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
      var maxPos = chars.length
      var pwd = ''
      for (var i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos))
      }
      return pwd
    },
    setColor() {
      const color = window.XEarth.Color.fromRandom()
      return color.withAlpha(1)
    }
  }
}
</script>

<style lang="scss" scoped></style>
