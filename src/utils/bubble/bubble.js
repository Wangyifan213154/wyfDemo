import { Component, createApp, getCurrentInstance } from 'vue'
import redSituation from '@/views/earthComp/redSituation/index.vue'
import threatTrendAnalysis from '@/views/earthComp/threatTrendAnalysis/index.vue'

window.postRender1 = function (val) {
  if (!val || !val.root.style) return
  val.root.style.position = 'absolute'
  const canvasHeight = val.viewer.scene.canvas.height
  const windowPosition = new val.Cesium.Cartesian2()
  val.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
    val.viewer.scene,
    val.position,
    windowPosition
  )

  let offsetX = val.offsetX ? val.offsetX : 0
  let offsetY = val.offsetY ? val.offsetY : 0
  let lv = document.querySelector('body')
  val.root.style.top = windowPosition.y + 'px'
  const elWidth = val.root.offsetWidth
  val.root.style.left = windowPosition.x - val.root.offsetWidth / 2 + 'px'
  const camerPosition = val.viewer.camera.position
  let height =
    val.viewer.scene.globe.ellipsoid.cartesianToCartographic(
      camerPosition
    ).height
  height += val.viewer.scene.globe.ellipsoid.maximumRadius
}

export function divLabel(val) {
  const Cesium = val.Cesium
  const viewer = val.viewer
  const height = val.height
  const nearDistance =
    val.distanceDisplayCondition[0] == undefined
      ? 0
      : val.distanceDisplayCondition[0]
  const farDistance =
    val.distanceDisplayCondition[1] == undefined
      ? 50000000
      : val.distanceDisplayCondition[1]
  const position = val.Cesium.Cartesian3.fromDegrees(
    val.position[0],
    val.position[1],
    val.height
  )
  let title = val.title
  let id = val.id
  let content = val.content

  let app = null
  if (val.div == 'style1') {
    console.log('style1')
    app = createApp(threatTrendAnalysis)
  }
  // const
  const root = document.createElement('div')
  document.body.appendChild(root)

  app.mount(root)
  // console.log(root);

  const option = {
    Cesium,
    viewer,
    height,
    nearDistance,
    farDistance,
    position,
    root,
    offsetX: val.offsetX,
    offsetY: val.offsetY
  }

  viewer.scene.postRender.addEventListener(function () {
    window.postRender1(option)
  })
}
