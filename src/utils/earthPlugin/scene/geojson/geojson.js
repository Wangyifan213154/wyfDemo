/**
 * geojson数据的加载、更新、清除等
 * @param
 */
class geojson {
  constructor(config) {
    this.earth = config.earth
    this.viewer = config.viewer
  }
  /**
   * geojson数据的加载
   * @param
   */
  addGeojson(options) {
    let self = this
    const promise = window.MSIMEarth.GeoJsonDataSource.load(options.url)
    // console.log(options)
    promise.then(function (dataSource) {
      dataSource.name = options.id
      window.EarthViewer.dataSources.add(dataSource)
    })
    return promise
  }
  // 更新
  // 删除
  removeGeojson(options) {
    window.EarthViewer.dataSources._dataSources.forEach((dataSource) => {
      if (dataSource._name == options.id) {
        window.EarthViewer.dataSources.remove(dataSource)
      }
    })
  }
}

export default geojson
