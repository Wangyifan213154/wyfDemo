/**
 * 图层树管理工具. 用于管理层层面板，包括图层的初始化、更新、查询等
 * @param [x = 0.0] - The X component.
 */
import SkyBoxOnGround from './SkyBoxOnGround.js'
/**
 * 图层管理工具
 */
class extend {
  skyBoxOnGround = undefined
  // constructor(options) {
  //   this.earth = options.earth || window.MSIMEarth // 初始化Earth对象
  //   this.viewer = options.viewer || window.EarthViewer // 初始化viewer对象
  // }
  /**
   * 初始化面板操控相关的图层管理工具
   */
  getSkyBoxOnGround(options) {
    this.skyBoxOnGround = new SkyBoxOnGround(options)
  }
}
export default extend
