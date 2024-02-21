export default class cMethods {
  constructor(options) {
    // this.XEarth = options.XEarth
  }
  flyto() {
    window.EarthViewer.camera.flyTo({
      // 118.34573072478551 32.25604843382856 131.6186629187405
      destination: new window.XEarth.Cartesian3(
        -3256536.7530607134,
        5535123.835935885,
        2379617.9794710083
      ),
      orientation: {
        heading: 0.12823678050250908, //偏航角
        pitch: -0.9706026460708577, //-0.08401170275668313, //水平俯仰角
        roll: 6.282739312712233
      }
      // complete: () => {
      //   this.startRotate(viewer, Cesium, { multiplier: 1000 });
      // }
    })
  }
  reset() {
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
      }
      // complete: () => {
      //   this.startRotate(viewer, Cesium, { multiplier: 1000 });
      // }
    })
  }
}
