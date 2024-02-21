// import $ from 'jquery'
import store from '@/store'

let clickEntity = {
  taperEntity: null,
  wallEntity: null
}
let clickBillboard = ''

// 地图特效
function mapEffect() {
  let viewer = window.EarthViewer
  let Cesium = window.XEarth
  // 移除cesiumLogo
  viewer._cesiumWidget._creditContainer.style.display = 'none'
  // 关闭双击实体
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  )

  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 45000000 // 相机高度的最大值
  viewer.scene.undergroundMode = true
  viewer.scene.sun.show = true
  viewer.scene.skyAtmosphere.show = true
  viewer.scene.skyAtmosphere.atmosphereRayleighScaleHeight = 20000
  viewer.scene.skyAtmosphere.atmosphereLightIntensity = 80
  viewer.scene.fog.enabled = true
  viewer.scene.globe.enableLighting = false

  let baseLayer = window.EarthViewer.scene.imageryLayers.get(0)
  baseLayer.brightness = 1.0
  baseLayer.contrast = 1
  baseLayer.hue = 0
  baseLayer.saturation = 1.6
  baseLayer.gamma = 1

  //去锯齿 是文字清晰
  viewer.scene.postProcessStages.fxaa.enabled = true
  if (window.XEarth.FeatureDetection.supportsImageRenderingPixelated()) {
    //判断是否支持图像渲染像素化处理
    viewer.resolutionScale = window.devicePixelRatio
  }

  // 亮度设置
  var stages = viewer.scene.postProcessStages
  viewer.scene.brightness =
    viewer.scene.brightness ||
    stages.add(window.XEarth.PostProcessStageLibrary.createBrightnessStage())
  viewer.scene.brightness.enabled = true
  viewer.scene.brightness.uniforms.brightness = Number(1.1)
  // updatePostProcess(viewer);

  function updatePostProcess(viewer) {
    var viewModel = {
      show: true,
      glowOnly: false,
      contrast: 128,
      brightness: -0.3,
      delta: 1.5,
      sigma: 3.78,
      stepSize: 2.0
    }
    var bloom = viewer.scene.postProcessStages.bloom
    bloom.enabled = Boolean(viewModel.show)
    bloom.uniforms.glowOnly = Boolean(viewModel.glowOnly)
    bloom.uniforms.contrast = Number(viewModel.contrast)
    bloom.uniforms.brightness = Number(viewModel.brightness)
    bloom.uniforms.delta = Number(viewModel.delta)
    bloom.uniforms.sigma = Number(viewModel.sigma)
    bloom.uniforms.stepSize = Number(viewModel.stepSize)
  }
}

//地球自转
function Callback(e) {
  if (!e) {
    window.EarthViewer.clock.shouldAnimate = false
    window.EarthViewer.clock.onTick.removeEventListener(onTickCallback)
    return
  }
  window.EarthViewer.clock.multiplier = store.state.sceneModule.sceneTestTime //速度
  window.EarthViewer.clock.shouldAnimate = true
  window.previousTime = window.EarthViewer.clock.currentTime.secondsOfDay

  window.EarthViewer.clock.onTick.addEventListener(onTickCallback)
}
const onTickCallback = () => {
  var spinRate = 1
  var currentTime = window.EarthViewer.clock.currentTime.secondsOfDay
  var delta = (currentTime - window.previousTime) / 1000
  window.previousTime = currentTime
  window.EarthViewer.scene.camera.rotate(
    window.XEarth.Cartesian3.UNIT_Z,
    -spinRate * delta
  )
}
// 地球光照  不应该放这里，应该从scene或randerer文件内引入
function illumination(e) {
  if (e) {
    window.EarthViewer.scene.globe.enableLighting = true
    window.EarthViewer.shadows = true
    window.EarthViewer.terrainShadows = window.XEarth.ShadowMode.RECEIVE_ONLY
    window.EarthViewer.shadowMap.darkness = 0.02 // 阴影透明度--越大越透明
  } else {
    window.EarthViewer.scene.globe.enableLighting = false
    window.EarthViewer.shadows = false
    window.EarthViewer.terrainShadows = window.XEarth.ShadowMode.DISABLED
  }
}
// 添加热力图
let heatMap
async function addHeatMap(type) {
  let data = store.getters.getGridData
  let hotArr
  if ((data == undefined || Object.getOwnPropertyNames(data).length) == 0) {
    await axios({
      url: 'static/data/geojson/网格热力图数据.json',
      method: 'get'
    }).then((res) => {
      hotArr = res.data.data
    })
  } else {
    hotArr = data.data
  }

  if (type) {
    /** 加载网格热力图 */
    let heatList = []
    for (let i = 0; i < hotArr.length; i++) {
      // 构建热力图数据
      let item = hotArr[i]
      let param = {
        lnglat: [item.centerLongitude, item.centerLatitude],
        value: item.heatingPower
      }
      heatList.push(param)
    }
    // 加载热力图
    heatMap = new Heatmap3d(viewer, {
      list: heatList,
      gradient: {
        '.3': 'blue',
        '.5': 'green',
        '.7': 'yellow',
        '.95': 'red'
      }
    })
    // 加载网格
    for (let i = 0; i < hotArr.length; i++) {
      let opacity = 0.1
      let item = hotArr[i]
      let arr = []
      let heatingPower = item.heatingPower
      if (heatingPower <= 1) {
        opacity = 0.1
      } else if (heatingPower > 1 && heatingPower <= 4) {
        opacity = 0.8
      } else if (heatingPower > 4) {
        opacity = 1.0
      }
      item.positions.forEach((e) => {
        arr.push(e[0])
        arr.push(e[1])
        arr.push(1000)
      })
      //坐标首尾相接
      arr.push(arr[0])
      arr.push(arr[1])
      arr.push(arr[2])
      viewer.entities.add({
        id: item.id + 'FWRL',
        // polyline: {
        polygon: {
          // positions: window.XEarth.Cartesian3.fromDegreesArrayHeights(arr),
          hierarchy: window.XEarth.Cartesian3.fromDegreesArrayHeights(arr),
          outlineWidth: 0.5,
          height: 1,
          extrudedHeight: 1,
          fill: true,
          outline: true,
          // outlineColor: new window.XEarth.PolylineOutlineMaterialProperty({
          //   color: new window.XEarth.Color(1.0, 1.0, 0.5, opacity),
          //   outlineWidth: 1,
          //   outlineColor: new window.XEarth.Color(1.0, 1.0, 1.0, opacity)
          // }),
          outlineColor: window.XEarth.Color.WHITE.withAlpha(opacity),
          material: window.XEarth.Color.WHITE.withAlpha(0.05),
          distanceDisplayCondition:
            new window.XEarth.DistanceDisplayCondition(0.0, 10e6)
        },
        properties: {
          heatingPower: heatingPower,
          centerLongitude: item.centerLongitude,
          centerLatitude: item.centerLatitude
        }
      })
    }
  } else {
    // 删除网格
    for (let i = 0; i < hotArr.length; i++) {
      let item = hotArr[i]
      viewer.entities.removeById(item.id + 'FWRL')
    }
    // 删除热力图
    if (heatMap) heatMap.destroy()
  }
}
// 单个世界坐标转经纬度坐标
function worldPosToGraphic(position) {
  let viewer = window.EarthViewer
  let Cesium = window.SmartEarth
  let ellipsoid = viewer.scene.globe.ellipsoid
  let cartographic = ellipsoid.cartesianToCartographic(position)
  let lat = window.XEarth.Math.toDegrees(cartographic.latitude)
  let lng = window.XEarth.Math.toDegrees(cartographic.longitude)
  let alt = cartographic.height
  return {
    lng: lng,
    lat: lat,
    height: alt
  }
}

function handleCluster(data) {
  // 聚合
  const pixelRange = 0.5
  const minimumClusterSize = 2
  //clustering 获取或设置此数据源的群集选项。此对象可以在多个数据源之间共享。
  data.clustering.enabled = true //获取或设置是否启用群集。
  data.clustering.pixelRange = pixelRange //pixelRange 是聚合距离，也就是小于这个距离就会被聚合,以像素为单位
  data.clustering.minimumClusterSize = minimumClusterSize //minimumClusterSize是每个聚合点的最小聚合个数，这个值最好是设置为2，因为两个图标也可能叠压。
  let removeListener

  function customStyle() {
    if (window.XEarth.defined(removeListener)) {
      removeListener()
      removeListener = undefined
    } else {
      removeListener = data.clustering.clusterEvent.addEventListener(function (
        clusteredEntities,
        cluster
      ) {
        cluster.label.show = false
        cluster.billboard.show = true
        cluster.billboard.width = 0
        cluster.billboard.height = 0
      })
    }
    // force a re-cluster with the new styling
    const pixelRange = data.clustering.pixelRange
    data.clustering.pixelRange = 0
    data.clustering.pixelRange = pixelRange
  }
  customStyle()
}

//一维数组转二维
function Array1to2(arr, number) {
  var arr2 = []
  let len = arr.length
  for (let i = 0, j = 0; i < len; i += number, j++) {
    arr2[j] = arr.splice(0, number)
  }
  return arr2
}

export {
  // addLLH,
  mapEffect,
  Callback,
  addHeatMap,
  worldPosToGraphic,
  handleCluster,
  illumination,
  Array1to2
}
