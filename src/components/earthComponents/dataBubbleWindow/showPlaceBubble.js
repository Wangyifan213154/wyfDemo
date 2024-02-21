import { Component, createApp, getCurrentInstance } from 'vue'
import Label from './taskResultDetails.vue'

// let instance = null, unmount = null;
// // 创建一个loading组件
// export function addPostRender() {
// 	({ instance, unmount } = mountComponent(Loading));
// 	console.log(instance);
// }
//场景渲染事件 实时更新窗口的位置 使其与笛卡尔坐标一致

// const instance = getCurrentInstance()
// const _this = instance.appContext.config.globalProperties

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
  if (val.viewer.scene.canvas.width > 1920)
    val.root.style.top = windowPosition.y - offsetY + 'px'
  else val.root.style.top = windowPosition.y - val.root.offsetHeight - 30 + 'px'
  const elWidth = val.root.offsetWidth
  val.root.style.left = windowPosition.x - val.root.offsetWidth / 2 + 'px'
  // const camerPosition = val.viewer.camera.position
  // let height =
  //   val.viewer.scene.globe.ellipsoid.cartesianToCartographic(
  //     camerPosition
  //   ).height
  // height += val.viewer.scene.globe.ellipsoid.maximumRadius
}

export function divLabel(val) {
  const Cesium = val.Cesium
  const viewer = val.viewer
  const height = val.height || 100
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
  let placeDetail = val.placeDetail

  // const vmInstance = new WindowVm({
  // 	propsData: {
  // 		title,
  // 		id
  // 	}
  // }).$mount(); //根据模板创建一个面板
  let app = null
  app = createApp(Label, {
    placeDetail,
    title,
  })
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

export function deleteDivLabel() {
  var divs = document.querySelectorAll(".Task-Result-Details");

  // console.log(divs);
  if (divs && divs.length !== 0) {
    divs.forEach(item => {
      item.parentNode.removeChild(item);
    })
  }
  // 
}
