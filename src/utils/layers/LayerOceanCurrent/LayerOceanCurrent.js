/*
 * @FilePath: LayerOceanCurrent.js
 * @Author: chenqian
 * @Date: 2022-08-22 16:08:21
 * @LastEditors: cheniqan
 * @LastEditTime: 2022-11-21 18:09:22
 * @Descripttion:
 */
// 海流流线图
import Base from '../AbsLayerObj'
import DataModule from './DataOceanCurrent'
// import * as Cesium from "cesium";
import RenderDynamicCurrent from './current/RenderDynamicCurrent'

class LayerOceanCurrent extends Base {
  constructor(config) {
    super(config)
    this.belong = 'cesium'
    this.dataModule = new DataModule()
  }

  get currentIdx() {
    return currentIdx
  }

  async load(options = {}) {
    this.data = await this.dataModule.request(options)
    this.emit('data', this.data)
    return this
  }

  draw(option) {
    this.data = option.data || this.data
    if (!this.data) return
    if (!this.data.length) return
    this.render = new RenderDynamicCurrent(this.map, window.MSIMEarth)
    this.render.id = 'RenderDynamicCurrent_' + this.id
    this.render.parseData(this.data)
    this.render.Render()
  }

  clean() {
    if (this.render) this.render.remove()
    this.render = null
    this.dataModule.cancel()
  }
  update(options) {
    if (this.render) this.render.updateO(options)
  }
}

export default LayerOceanCurrent
