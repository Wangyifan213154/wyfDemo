import createVibrationStage from './vibration.js'

class postRender {
  constructor(Earth, viewer) {
    this.Earth = Earth
    this.viewer = viewer
  }
  /**
   * 创建震动效果后处理
   * @param {*} postProcessStages 容器
   * @param {*} time 执行时长
   */
  createVibration(postProcessStages, time) {
    if (typeof time === 'undefined') {
      time = 1000
    }
    const vibration = createVibrationStage(this.Earth)
    postProcessStages.add(vibration)
    setTimeout(() => {
      postProcessStages.remove(vibration)
    }, time)
  }
}
export default postRender
