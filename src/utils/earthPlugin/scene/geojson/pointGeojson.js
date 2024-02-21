import { dataSource } from '../dataSource/dataSource'
import geojson from './geojson'
/**
 * geojson点数据的加载、更新、清除等
 * @param
 */
class PointGeojson extends geojson {
  constructor(config) {
    super({
      earth: config.earth,
      viewer: config.viewer
    })
  }
  /**
   * geojson点数据的加载
   * @param {String} url geojson路径
   * @param {String} id 命名
   * @param {Boolean} point 是否绘制点
   * @param {Array} pointColor rgba颜色
   * @param {Number} pixelSize 点像素大小
   * @param {Array} distanceDisplayCondition 显示距离 [0, 30e5]
   * @param {Function} billboardLabelFn 绘制label和billboard的回调函数，传入参数为entity
   * @param {Object} cluster 聚合参数，不传则不聚合
   */
  addPointGeojson(options) {
    let self = this
    let promise = this.addGeojson({
      url: options.url,
      id: options.id
    })
    promise.then((dataSource) => {
      console.log(dataSource)
      const entities = dataSource.entities.values
      const creatPoint = options.point == undefined ? true : options.point
      const distanceDis = options.distanceDisplayCondition || [0, 250e5]
      const ddc = new self.earth.DistanceDisplayCondition(...distanceDis)
      const colorRGB = options.color || [186, 105, 102, 1.0]
      const cesiumColor = new self.earth.Color(
        colorRGB[0] / 255,
        colorRGB[1] / 255,
        colorRGB[2] / 255,
        colorRGB[3]
      )
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        entity.billboard = undefined
        if (creatPoint) {
          entity.point = {
            color: cesiumColor,
            pixelSize: options.pixelSize || 5,
            distanceDisplayCondition: ddc
            // disableDepthTestDistance: Number.POSITIVE_INFINITY,
            // heightReference: self.earth.HeightReference.CLAMP_TO_GROUND
          }
        }
        if (options.billboardLabelFn) {
          options.billboardLabelFn(entity)
        }
        // if (options.label) {
        // 	entity.label = options.label
        // }
        // if (options.billboard) {
        // 	entity.billboard = options.billboard
        // }
      }
      if (options.cluster) {
        self.handleCluster(
          dataSource,
          options.cluster.range,
          options.cluster.minSize
        )
      }
    })
    return promise
  }
  /**
   * label结合billboard
   * @param {Object} val 标牌参数 坐标 图片路径 宽高 偏移等
   */
  createBillboardLabel_DC(val) {
    const self = this
    const billboard = {
      distanceDisplayCondition: new self.earth.DistanceDisplayCondition(
        0,
        // 2e5
        30e5
      ),
      image: val.img || 'static/image/billboard/border_bg01.png',
      name: 'singleWarning',
      show: true,
      width: val.width || 18,
      height: 4,
      eyeOffset: new self.earth.ConstantProperty(
        new self.earth.Cartesian3(0, 0, -1)
      ),
      pixelOffset: val.offset,
      scale: val.billboardScale || 6
    }
    const label = {
      distanceDisplayCondition: new self.earth.DistanceDisplayCondition(
        0,
        // 2e5
        30e5
      ),
      // text: '财政局西门',
      text: val.name,
      // backgroundColor: new self.earth.Color(1.0, 153 / 255, 18 / 255, 1.0),
      // showBackground: false,
      font: 'normal 32px MicroSoft YaHei',
      scale: val.labelScale || 0.4,
      fillColor: val.color || self.earth.Color.AQUA,
      style: self.earth.LabelStyle.FILL_AND_OUTLINE,
      // outlineWidth: 2,
      horizontalOrigin: self.earth.HorizontalOrigin.LEFT, //水平位置
      verticalOrigin: self.earth.VerticalOrigin.BOTTOM,
      pixelOffset: val.pixelOffset || new self.earth.Cartesian2(-43, -30),
      eyeOffset: new self.earth.ConstantProperty(
        new self.earth.Cartesian3(0, 0, -1)
      )
    }
    return { billboard, label }
  }
  addFangkong() {
    const self = this
    function createBillboardLabel(entity) {
      const { billboard, label } = self.createBillboardLabel_DC({
        text: entity.properties.position._value,
        offset: new window.MSIMEarth.Cartesian2(0, -40),
        img: 'static/image/billboard/border_bg_red.png'
      })
      entity.billboard = billboard
      entity.label = label
    }
    const options = {
      url: 'static/data/geojson/FK识别区/DH防空识别点数据.json',
      color: [255, 0, 0, 1], //152, 56, 93
      distanceDisplayCondition: [0, 350e5],
      pixelSize: 5,
      id: '防空1',
      billboardLabelFn: createBillboardLabel
    }
    this.addPointGeojson(options)
  }
  addMainCity() {
    const self = this
    function cityLabel(e) {
      e.billboard = {
        image: 'static/image/billboard/省会2.png',
        show: true,
        width: 2,
        height: 2,
        rotation: 0.0,
        eyeOffset: new self.earth.ConstantProperty(
          new self.earth.Cartesian3(0, 0, -1)
        ),
        // pixelOffset: new self.earth.Cartesian2(0.0, -20),
        scaleByDistance: new self.earth.NearFarScalar(1.5e2, 6.0, 1.5e7, 3.5),
        distanceDisplayCondition: new self.earth.DistanceDisplayCondition(
          10e5,
          70e5
        )
      }
      e.label = {
        //文字标签
        text: e.properties._市._value,
        font: '16px Lucida Console',
        fillColor: self.earth.Color.WHITE,
        style: self.earth.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: self.earth.HorizontalOrigin.LEFT,
        verticalOrigin: self.earth.VerticalOrigin.CENTER,
        pixelOffset: new self.earth.Cartesian2(-20, -20),
        outlineColor: self.earth.Color.BLACK,
        outlineWidth: 2,
        // showBackground: true,
        backgroundColor: new self.earth.Color.fromBytes(235, 155, 33),
        distanceDisplayCondition: new self.earth.DistanceDisplayCondition(
          10e5,
          70e5
        )
      }
    }
    function cityLabel2(e) {
      e.label = {
        text: e.name,
        font: '100 18px MicroSoft YaHei',
        fillColor: self.earth.Color.WHITE,
        style: self.earth.LabelStyle.FILL,
        horizontalOrigin: self.earth.HorizontalOrigin.LEFT,
        verticalOrigin: self.earth.VerticalOrigin.CENTER,
        // pixelOffset: new self.earth.Cartesian2(-20, -20),
        // showBackground: true,
        backgroundColor: new self.earth.Color.fromBytes(235, 155, 33),
        distanceDisplayCondition: new self.earth.DistanceDisplayCondition(
          0,
          100e5
        )
      }
    }
    const options = {
      url: 'static/data/geojson/mainCity.geojson',
      point: false,
      id: 'city1',
      billboardLabelFn: cityLabel,
      cluster: true
    }
    const options2 = {
      url: 'static/data/geojson/国家点.geojson',
      point: false,
      id: 'city2',
      billboardLabelFn: cityLabel2
    }
    this.addPointGeojson(options)
    this.addPointGeojson(options2)
  }
  /**
   * 聚合
   * @param {DataSource} 要聚合的数据源
   * @param {Number} range 聚合距离
   * @param {Number} minSize 每个聚合点的最小聚合个数
   */
  handleCluster(data, range, minSize) {
    const self = this
    // 聚合
    const pixelRange = range || 20
    const minimumClusterSize = minSize || 2
    //clustering 获取或设置此数据源的群集选项。此对象可以在多个数据源之间共享。
    data.clustering.enabled = true //获取或设置是否启用群集。
    data.clustering.pixelRange = pixelRange //pixelRange 是聚合距离，也就是小于这个距离就会被聚合,以像素为单位
    data.clustering.minimumClusterSize = minimumClusterSize //minimumClusterSize是每个聚合点的最小聚合个数，这个值最好是设置为2，因为两个图标也可能叠压。
    let removeListener

    function customStyle() {
      if (self.earth.defined(removeListener)) {
        removeListener()
        removeListener = undefined
      } else {
        removeListener = data.clustering.clusterEvent.addEventListener(
          function (clusteredEntities, cluster) {
            cluster.label.show = false
            cluster.billboard.show = true
            cluster.billboard.width = 0
            cluster.billboard.height = 0
          }
        )
      }
      // force a re-cluster with the new styling
      const pixelRange = data.clustering.pixelRange
      data.clustering.pixelRange = 0
      data.clustering.pixelRange = pixelRange
    }
    customStyle()
  }
}

export default PointGeojson
