/**
 * 语音交互球上方法
 * @type Object
 * @default undefined
 */
export default class pieearthMethods {
  constructor(options) {
    // this.XEarth = options.XEarth
  }

  flyToTW() {
    window.pieViewer.camera.flyTo({
      destination: Earth.Cartesian3.fromDegrees(121.5, 25.05, 5962635.78648007),
      orientation: {
        heading: 3.5634171447781187,
        pitch: Earth.Math.toRadians(0),
        roll: Earth.Math.toRadians(0)
      },
      duration: 2,
      complete: () => {
        console.log('complete')
      }
    })
  }

  reset() {}

  setSkyBox(viewer) {
    // 自带的默认天空盒
    let defaultSkybox = viewer.scene.skyBox

    // 渲染前监听并判断相机位置
    viewer.scene.preUpdate.addEventListener(() => {
      let position = viewer.scene.camera.position
      let cameraHeight = Cesium.Cartographic.fromCartesian(position).height
      if (cameraHeight < 240000) {
        viewer.scene.skyBox = this
        viewer.scene.skyAtmosphere.show = false
      } else {
        viewer.scene.skyBox = defaultSkybox
        viewer.scene.skyAtmosphere.show = true
      }
    })
  }
}
