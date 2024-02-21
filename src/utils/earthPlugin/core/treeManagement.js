/**
 * 图层树管理工具. 用于管理层层面板，包括图层的初始化、更新、查询等
 * @param [x = 0.0] - The X component.
 */
import panelManagement from './treeManagement/panelManagement.js'
import messageManagement from './treeManagement/messageManagement.js'
import earthManagement from './treeManagement/earthManagement.js'
/**
 * 图层管理工具
 */
class treeManagement {
  panelManagement = undefined
  messageManagement = undefined
  earthManagement = undefined
  constructor(options) {
    this.earth = options.earth || window.MSIMEarth // 初始化Earth对象
    this.viewer = options.viewer || window.EarthViewer // 初始化viewer对象
    this.initManagement(options.type) // 按需初始化图层管理工具
  }
  /**
   * 初始化面板操控相关的图层管理工具
   */
  getPanelManagement() {
    let options = {
      earth: this.earth,
      viewer: this.viewer
    }
    this.panelManagement = new panelManagement(options)
  }
  /**
   * 初始化针对动态消息类操作的图层管理工具
   */
  getMessageManagement() {
    let options = {
      earth: this.earth,
      viewer: this.viewer
    }
    return new messageManagement(options)
  }
  /**
   * 初始化针对球上操作的图层管理工具
   */
  getEarthManagement() {
    let options = {
      earth: this.earth,
      viewer: this.viewer
    }
    return new earthManagement(options)
  }
  /**
   * 按需求初始化图层管理工具
   */
  initManagement(param) {
    switch (param) {
      case 'panel':
        this.getPanelManagement()
        break
      case 'message':
        this.getMessageManagement()
        break
      case 'earth':
        this.getEarthManagement()
        break
      default:
        break
    }
  }
  /**
   * 根据需求清除图层管理工具
   * @param {string} name 清除的图层管理工具名称
   */
  clear(name) {
    switch (name) {
      case 'panelManagement':
        this.panelManagement = null
        break
      case 'messageManagement':
        this.messageManagement = null
        break
      case 'earthManagement':
        this.earthManagement = null
        break
      default:
        break
    }
  }
}
export default treeManagement
