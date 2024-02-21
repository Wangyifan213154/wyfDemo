import geojson from './geojson'
/**
 * geojson线数据的加载、更新、清除等
 * @param
 */
class PolylineGeojson extends geojson {
  constructor(config) {
    super({
      earth: config.earth,
      viewer: config.viewer
    })
  }
  /**
   * geojson线数据的加载
   * @param {String} url geojson路径
   * @param {String} id 命名
   * @param {Number} width 线宽度
   * @param {Array} color rgba颜色
   * @param {Cesium.Material} material 线材质
   * @param {Array} distanceDisplayCondition 显示距离 [0, 30e5]
   * @param {Boolean} clampToGround 是否贴地
   */
  addPolylineGeojson(options) {
    let self = this
    let promise = this.addGeojson({
      url: options.url,
      id: options.id
    })
    promise.then((dataSource) => {
      console.log(dataSource)
      const entities = dataSource.entities.values
      const distanceDis = options.distanceDisplayCondition || [0, 250e5]
      const ddc = new self.earth.DistanceDisplayCondition(...distanceDis)
      const colorRGB = options.color || [186, 105, 102, 1.0]
      const cesiumColor = new self.earth.Color(
        colorRGB[0] / 255,
        colorRGB[1] / 255,
        colorRGB[2] / 255,
        colorRGB[3]
      ) //线颜色
      const material = options.material || cesiumColor // 有材质用材质，没有则用Color
      const clampToGround = options.clampToGround || false
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        entity.polyline.width = options.width || 10
        entity.polyline.material = material
        entity.polyline.distanceDisplayCondition = ddc
        entity.polyline.clampToGround = clampToGround
      }
      if (options.addLabel) {
        let textVal = ''
        if (entity.properties.position)
          textVal = entity.properties.position._value
        entity.label = {
          text: textVal,
          font: 'normal 32px MicroSoft YaHei',
          scale: 0.5,
          fillColor: window.MSIMEarth.Color.RED,
          style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
          // outlineWidth: 2,
          horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
          verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
          pixelOffset: new window.MSIMEarth.Cartesian2(-63, -31),
          eyeOffset: new window.MSIMEarth.ConstantProperty(
            new window.MSIMEarth.Cartesian3(0, 0, -11)
          ),
          distanceDisplayCondition:
            new window.MSIMEarth.DistanceDisplayCondition(0, 100e5)
        }
      }
    })
  }
  addGuojiexian() {
    const options1 = {
      url: basicVectorData.guojiexian,
      color: [186, 105, 102, 0.7],
      distanceDisplayCondition: [20e5, 350e5],
      addLabel: false,
      width: 2,
      id: 'guojiexian'
    }
    this.addPolylineGeojson(options1)
  }
  addGuojiexian_O() {
    const options2 = {
      url: basicVectorData.guojiexian2,
      color: [217, 217, 223, 0.7],
      addLabel: false,
      distanceDisplayCondition: [20e5, 350e5],
      width: 0.7,
      id: 'guojiexian2'
    }
    this.addPolylineGeojson(options2)
    const options3 = {
      url: basicVectorData.shengjiexian,
      color: [217, 217, 223, 0.7],
      addLabel: false,
      distanceDisplayCondition: [20e5, 350e5],
      width: 1,
      id: 'shengjiexian'
    }
    this.addPolylineGeojson(options3)
  }
  addDaolian() {
    const daolians = [
      { url: basicVectorData.daolian1, id: 'daolian1' },
      { url: basicVectorData.daolian2, id: 'daolian2' },
      { url: basicVectorData.daolian3, id: 'daolian3' }
    ]
    daolians.forEach((op) => {
      const options = {
        url: op.url,
        color: [255, 0, 0, 1.0],
        addLabel: false,
        distanceDisplayCondition: [20e5, 100e5],
        width: 1,
        id: op.id
      }
      this.addPolylineGeojson(options)
    })
  }
  addZyRiver_link() {
    const options = {
      url: basicVectorData.zyRiver_link,
      material: window.MSIMEarth.Color.DODGERBLUE.withAlpha(0.5),
      addLabel: false,
      distanceDisplayCondition: [0, 100e5],
      width: 4,
      clampToGround: true,
      id: 'zyRiver_link'
    }
    this.addPolylineGeojson(options)
  }
  addYindushiquan() {
    const options = {
      url: basicVectorData.yindushiquan,
      color: [100, 180, 232, 1],
      addLabel: false,
      distanceDisplayCondition: [0, 30e5],
      width: 8,
      id: 'yindushiquan'
    }
    this.addPolylineGeojson(options)
  }
  addG219() {
    const options = {
      url: basicVectorData.g219,
      color: [186, 105, 102, 1],
      addLabel: false,
      distanceDisplayCondition: [0, 30e5],
      width: 5,
      id: 'g219'
    }
    this.addPolylineGeojson(options)
  }
}

export default PolylineGeojson
