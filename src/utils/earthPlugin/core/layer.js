import PointGeojson from '../scene/geojson/pointGeojson'
import PolylineGeojson from '../scene/geojson/polylineGeojson'
import PolygonGeojson from '../scene/geojson/polygonGeojson'

/**
 * 球上数据管理工具，包括各类数据的添加、更新、清除等
 * @param
 */
export default class layer {
  pointGeojsonManagement = undefined
  polylineGeojsonManagement = undefined
  polygonGeojsonManagement = undefined
  constructor(options) {
    this.earth = options.earth || window.MSIMEarth // 初始化Earth对象
    this.viewer = options.viewer || window.EarthViewer // 初始化viewer对象
    this.initLayer()
  }
  /**
   * 初始化数据管理工具
   */
  initLayer() {
    this.initPointGeojsonManagement()
    this.initPolylineGeojsonManagement()
    this.initPolygonGeojsonManagement()
  }
  initPointGeojsonManagement() {
    const option = {
      earth: this.earth,
      viewer: this.viewer
    }
    this.pointGeojsonManagement = new PointGeojson(option)
  }
  initPolylineGeojsonManagement() {
    const option = {
      earth: this.earth,
      viewer: this.viewer
    }
    this.polylineGeojsonManagement = new PolylineGeojson(option)
  }
  initPolygonGeojsonManagement() {
    const option = {
      earth: this.earth,
      viewer: this.viewer
    }
    this.polygonGeojsonManagement = new PolygonGeojson(option)
  }
}
