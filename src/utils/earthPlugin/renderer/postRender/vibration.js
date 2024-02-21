import vibrationGLSL from '../../glsl/postRenderGLSL/vibration'
/**
 * 屏幕震动效果
 * @param {*} Earth
 * @returns
 */
function createVibrationStage(Earth) {
  var e = new Earth.PostProcessStage({
    name: 'czm_vibration',
    fragmentShader: vibrationGLSL
  })
  return e
}
export default createVibrationStage
