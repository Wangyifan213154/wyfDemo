import { Component, createApp, getCurrentInstance } from 'vue'
import accidentLabel from './accidentPower.vue'
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
    // val.root.style.bottom = canvasHeight - windowPosition.y - 350 + "px"; //canvasHeight - windowPosition.y + 260 + "px";
    val.root.style.top = windowPosition.y - offsetY + 'px'
  //canvasHeight - windowPosition.y + 260 + "px";
  // val.root.style.bottom = canvasHeight - windowPosition.y + 260 + "px";
  else val.root.style.top = windowPosition.y - offsetY + 'px'
  const elWidth = val.root.offsetWidth
  // val.root.style.left = windowPosition.x - elWidth / 2 + "px";
  // val.root.style.left = windowPosition.x + offsetX + 'px'
  val.root.style.left = windowPosition.x - val.root.offsetWidth / 2 + 'px'
  // console.log(val.root.style)
  // console.log(val.root.offsetWidth)
  // console.log(val.offsetWidth)
  const camerPosition = val.viewer.camera.position
  let height =
    val.viewer.scene.globe.ellipsoid.cartesianToCartographic(
      camerPosition
    ).height
  height += val.viewer.scene.globe.ellipsoid.maximumRadius
  // if((!(val.Cesium.Cartesian3.distance(camerPosition,val.position) > height))&&val.viewer.camera.positionCartographic.height<50000000){
  // if (
  //   !(val.Cesium.Cartesian3.distance(camerPosition, val.position) > height) &&
  //   val.viewer.camera.positionCartographic.height < val.farDistance &&
  //   val.viewer.camera.positionCartographic.height > val.nearDistance
  // ) {
  //   val.root.style.display = 'block'
  // } else {
  //   val.root.style.display = 'none'
  // }
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
  let ccolor = val.color
  let date = val.date
  let posname = val.name
  let posInfor = val.posInfor
  let weatherData = val.weatherData
  // const vmInstance = new WindowVm({
  // 	propsData: {
  // 		title,
  // 		id
  // 	}
  // }).$mount(); //根据模板创建一个面板
  let app = null
  if (val.div == 'style1') {
    console.log('style1')
    app = createApp(Label, {
      title,
      id,
      content
    })
  } else if (val.div == 'popup') {
    app = createApp(Label3, {
      title,
      id,
      content
    })
  } else if (val.div == 'airport') {
    app = createApp(airportInfo, {
      title,
      id,
      content
    })
  } else if (val.div == 'place') {
    app = createApp(placeInfo, {
      title,
      id,
      content
    })
  } else if (val.div == 'powerStation') {
    app = createApp(accidentLabel, {
      title,
      id,
      content,
      ccolor,
      date,
      posname
    })
  } else if (val.div == 'description') {
    app = createApp(description, {
      title,
      id,
      content,
      weatherData
    })
  } else if (val.div == 'description2') {
    app = createApp(description2, {
      title,
      id,
      content,
      weatherData
    })
  } else if (val.div == 'moreInfors') {
    app = createApp(Label4, {
      title,
      id,
      content,
      posInfor
    })
  } else {
    console.log('style2')
    app = createApp(Label2, {
      title,
      id,
      content
    })
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
