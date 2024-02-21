// 导弹瞄准框
import { Component, createApp, getCurrentInstance } from 'vue'
import Label from './firstDiv.vue'
import { worldPosToGraphic } from '@/utils/mapTools'
// let instance = null, unmount = null;
// // 创建一个loading组件
// export function addPostRender() {
// 	({ instance, unmount } = mountComponent(Loading));
// 	console.log(instance);
// }
//场景渲染事件 实时更新窗口的位置 使其与笛卡尔坐标一致

// const instance = getCurrentInstance()
// const _this = instance.appContext.config.globalProperties

window.postRender2 = function (val) {
  if (!val || !val.root.style) return
  val.root.style.position = 'absolute'
  const canvasHeight = val.viewer.scene.canvas.height
  const windowPosition = new val.Cesium.Cartesian2()
  val.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
    val.viewer.scene,
    val.position,
    windowPosition
  )

  // val.root.style.bottom =
  // canvasHeight - windowPosition.y + val.height + "px";
  let offsetY = val.offsetY ? val.offsetY : 0
  if (val.viewer.scene.canvas.width >= 1920)
    // val.root.style.bottom = canvasHeight - windowPosition.y - 350 + "px"; //canvasHeight - windowPosition.y + 260 + "px";
    val.root.style.top = windowPosition.y - offsetY + 'px'
  //canvasHeight - windowPosition.y + 260 + "px";
  // val.root.style.bottom = canvasHeight - windowPosition.y + 260 + "px";
  else val.root.style.top = windowPosition.y - offsetY + 'px'
  const elWidth = val.root.offsetWidth
  // val.root.style.left = windowPosition.x - elWidth / 2 + "px";
  val.root.style.left = windowPosition.x - val.root.offsetWidth / 2 + 'px'
  //console.log(elWidth)
  const camerPosition = val.viewer.camera.position
  let height =
    val.viewer.scene.globe.ellipsoid.cartesianToCartographic(
      camerPosition
    ).height
  height += val.viewer.scene.globe.ellipsoid.maximumRadius
  // if((!(val.Cesium.Cartesian3.distance(camerPosition,val.position) > height))&&val.viewer.camera.positionCartographic.height<50000000){
  if (
    val.viewer.camera.positionCartographic.height < val.farDistance &&
    val.viewer.camera.positionCartographic.height > val.nearDistance
  ) {
    val.root.style.display = 'block'
  } else {
    val.root.style.display = 'none'
  }
}

export function divLabel1(val) {
  var lablediv = document.getElementById('lableDiv1-container')
  if (lablediv) {
    document.body.removeChild(lablediv)
  }

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
  const offsetY = val.offsetY
  // const vmInstance = new WindowVm({
  // 	propsData: {
  // 		title,
  // 		id
  // 	}
  // }).$mount(); //根据模板创建一个面板
  const app = createApp(Label, {
    title,
    id
  })
  // const
  const root = document.createElement('div')
  root.id = 'lableDiv-container'
  document.body.appendChild(root)

  app.mount(root)
  //console.log(root);

  const option = {
    Cesium,
    viewer,
    height,
    nearDistance,
    farDistance,
    position,
    root,
    offsetY
  }

  function listentEvent() {
    if (
      window.currentEntity &&
      window.currentEntity._position.getValue(viewer.clock.currentTime)
    ) {
      let degrees = worldPosToGraphic(
        window.currentEntity._position.getValue(viewer.clock.currentTime)
      )
      option.position = Cesium.Cartesian3.fromDegrees(
        degrees.lng,
        degrees.lat,
        degrees.height > 0 ? degrees.height : 10
      )
    }
    window.postRender2(option)
  }
  viewer.scene.postRender.addEventListener(listentEvent)
  //清除divlabel
  window.clearDivLabel = function () {
    if (document.querySelectorAll('#lableDiv-container').length > 0) {
      for (
        let i = document.querySelectorAll('#lableDiv-container').length - 1;
        i > -1;
        i--
      ) {
        document.querySelectorAll('#lableDiv-container')[i].remove()
      }
    }
    for (let k = viewer.scene.postRender.numberOfListeners - 1; k > -1; k--) {
      if (
        viewer.scene.postRender._listeners[k].name &&
        viewer.scene.postRender._listeners[k].name == 'listentEvent'
      ) {
        viewer.scene.postRender.removeEventListener(
          viewer.scene.postRender._listeners[k]
        )
      }
    }
  }
}
