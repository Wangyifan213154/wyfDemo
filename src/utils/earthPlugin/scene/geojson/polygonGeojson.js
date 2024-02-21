import geojson from './geojson'
/**
 * geojson多边形数据的加载、更新、清除等
 * @param
 */
class PolygonGeojson extends geojson {
  constructor(config) {
    super({
      earth: config.earth,
      viewer: config.viewer
    })
  }
  /**
   * geojson多边形数据的加载
   * @param {String} url geojson路径
   * @param {String} id 命名
   * @param {CesiumColor} outlineColor 边颜色
   * @param {Cesium.Material} material 填充材质
   * @param {Array} distanceDisplayCondition 显示距离 [0, 30e5]
   * @param {Array} optionsArray 多种多边形配置
   * @param {Number} height 离地高度
   * @param {HeightReference} HeightReference 相对高度类型
   */
  addPolygonGeojson(options) {
    const self = this
    let promise = this.addGeojson({
      url: options.url,
      id: options.id
    })
    promise.then((dataSource) => {
      console.log(dataSource)
      const entities = dataSource.entities.values
      const distanceDis = options.distanceDisplayCondition || [0, 250e5]
      const ddc = new self.earth.DistanceDisplayCondition(...distanceDis)
      const outlineColorRGB = options.outlineColor || [186, 105, 102, 1.0]
      const cesiumOutlineColor = new self.earth.Color(
        outlineColorRGB[0] / 255,
        outlineColorRGB[1] / 255,
        outlineColorRGB[2] / 255,
        outlineColorRGB[3]
      )
      const fillColorRGB = options.fillColor || [186, 105, 102, 1.0]
      const cesiumFillColor = new self.earth.Color(
        fillColorRGB[0] / 255,
        fillColorRGB[1] / 255,
        fillColorRGB[2] / 255,
        fillColorRGB[3]
      )
      const fillMaterial = options.material || cesiumFillColor
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        entity.polygon.outline = options.outlineColor ? true : false
        entity.polygon.outlineColor = options.outlineColor
          ? cesiumOutlineColor
          : undefined
        entity.polygon.outlineWidth = options.outlineWidth || 1
        entity.polygon.fill = options.fillColor ? true : false
        entity.polygon.material = fillMaterial
        entity.polygon.distanceDisplayCondition = ddc
        entity.polygon.height = options.height || 0
        entity.polygon.heightReference =
          options.HeightReference || window.MSIMEarth.HeightReference.NONE
        // 若传入参数optionsArray，则根据要素name单独配置
        if (options.optionsArray == undefined) continue
        let targetOption = options.optionsArray.find((op) => {
          return entity._name.indexOf(op.id) > -1
        })
        if (!targetOption) continue //optionsArray中未设置该name要素，跳过
        entity.polygon.outline = targetOption.outlineColor ? true : false
        entity.polygon.fill = targetOption.fillColor ? true : false
        if (targetOption.outlineColor) {
          entity.polygon.outlineColor = new self.earth.Color(
            targetOption.outlineColor[0] / 255,
            targetOption.outlineColor[1] / 255,
            targetOption.outlineColor[2] / 255,
            targetOption.outlineColor[3]
          )
        }
        if (targetOption.fillColor) {
          entity.polygon.material = new self.earth.Color(
            targetOption.fillColor[0] / 255,
            targetOption.fillColor[1] / 255,
            targetOption.fillColor[2] / 255,
            targetOption.fillColor[3]
          )
        }
        entity.polygon.outlineWidth = targetOption.outlineWidth || 1
      }
    })
  }
  addGuojiexian() {
    const options = {
      url: basicVectorData.guojiexian,
      outlineColor: [255, 255, 0, 1],
      distanceDisplayCondition: [20e5, 250e5],
      id: 'guojiexian'
    }
    this.addPolygonGeojson(options)
  }
  // 例，geojson中指定name要素配置特定样式，
  add4H2B() {
    const optionsArray = [
      {
        id: '中印',
        outlineColor: [0, 255, 255, 0.7],
        fillColor: [0, 255, 255, 0.2]
      },
      {
        id: '中朝',
        outlineColor: [0, 255, 255, 0.7],
        fillColor: [0, 255, 255, 0.2]
      },
      {
        id: '海',
        outlineColor: [220, 20, 60, 0.7],
        fillColor: [220, 20, 60, 0.2]
      }
    ]
    const options = {
      url: basicVectorData.fourSeaTwoBorder,
      distanceDisplayCondition: [20e5, 250e5],
      id: '4H2B',
      outlineColor: [255, 255, 0, 0.2],
      optionsArray: optionsArray
    }
    this.addPolygonGeojson(options)
  }
}

export default PolygonGeojson
