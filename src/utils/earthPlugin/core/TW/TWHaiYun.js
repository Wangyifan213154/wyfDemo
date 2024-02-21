//  海运线添加和清除方法  viewTaiHYX   removeTaiHYX
//  海运拒止添加和清除方法  viewTaiHYJZ   removeTaiHYJZ
//  通信网添加和清除方法   viewTaiTXW   removeTaiTXW

// 初始化方法：
// let twhy = new TWHY({
//   earth: window.MSIMEarth,
//   viewer: window.EarthViewer
// })
class TWHY {
  constructor(config) {
    this.earth = config.earth
    this.viewer = config.viewer
  }
  // 查看TW海运航线
  viewTaiHYX() {
    let earth = this.earth
    let viewer = this.viewer
    let that = this
    that.removeTaiHYX()
    // that.loadTWHYPath()
    viewer.camera.flyTo({
      destination: new earth.Cartesian3(
        -3458813.895454278,
        5781550.034114407,
        2929028.2304659183
      ),
      orientation: {
        heading: 6.164207376288082, //偏航角
        pitch: -1.5424107973690484, //-0.08401170275668313, //水平俯仰角
        roll: 0
      },
      duration: 4,
      complete: () => {
        that.loadTWHYPath()
      }
    })
  }
  // 球上添加海运线的方法
  loadTWHYPath() {
    let earth = this.earth
    let viewer = this.viewer
    const pathName = []
    earth.GeoJsonDataSource.load(
      // 'static/geojson/taiwan/海运.geojson'
      basicVectorData.haiyun
    ).then((dataSource) => {
      const entities = dataSource.entities.values
      dataSource.name = '海运'
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        if (entity.billboard) {
          entity.billboard = null
          entity.label = {
            text: `${entity.properties.name._value}港`,
            font: '400 45px MicroSoft YaHei',
            style: earth.LabelStyle.FILL_AND_OUTLINE,
            fillColor: new earth.Color(1 / 255, 1 / 255, 1, 1),
            outlineColor: earth.Color.WHITE,
            outlineWidth: 5,
            verticalOrigin: earth.VerticalOrigin.BOTTOM,
            horizontalOrigin: earth.HorizontalOrigin.CENTER,
            pixelOffset: new earth.Cartesian2(0, -25),
            distanceDisplayCondition: new earth.DistanceDisplayCondition(
              0,
              30e5
            ),
            scaleByDistance: new earth.NearFarScalar(10000, 0.9, 20e5, 0.2),
            showBackground: true,
            backgroundColor: new earth.Color(0 / 255, 0 / 255, 0 / 255, 0.2)
          }
        }
        if (entity.polyline) {
          let positions = entity.polyline.positions._value
          let center =
            positions.length % 2 == 0
              ? positions[positions.length / 2]
              : positions[(positions.length + 1) / 2]
          entity.polyline.width = 5
          pathName.push(entity.properties.name._value)
          entity.position = center
          entity.label = {
            text: entity.properties.name._value,
            font: '600 45px MicroSoft YaHei',
            style: earth.LabelStyle.FILL_AND_OUTLINE,
            fillColor: earth.Color.WHITE,
            outlineColor: earth.Color.CORNFLOWERBLUE, //new earth.Color(0, 255, 255, 1),
            outlineWidth: 3,
            distanceDisplayCondition: new earth.DistanceDisplayCondition(
              0,
              30e5
            ),
            scaleByDistance: new earth.NearFarScalar(10000, 0.9, 20e5, 0.2),
            showBackground: true,
            backgroundColor: new earth.Color(0 / 255, 0 / 255, 0 / 255, 0.3),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
          entity.polyline.material = new earth.FlowLineMaterialProperty({
            transparent: true,
            mixColor: new earth.Color(240 / 255, 248 / 255, 255 / 255, 1.0),
            repeat: new earth.Cartesian2(10, 1),
            mixRatio: 0.5,
            flowSpeed: 10,
            image: './static/image/texture/materiallineF.png'
          })
          entity.polyline.distanceDisplayCondition =
            new earth.DistanceDisplayCondition(0, 30e5)
          entity.polyline.width = 15
        }
        if (entity.polygon) {
          entity.polygon = null
        }
      }
      viewer.dataSources.add(dataSource)
    })
  }
  // 当海运线没有加载时为了海运拒止提供的海运线加载方法
  loadTWHYPathFroJZ() {
    let earth = this.earth
    let viewer = this.viewer
    const pathName = []
    earth.GeoJsonDataSource.load(
      // 'static/geojson/taiwan/海运.geojson'
      basicVectorData.haiyun
    ).then((dataSource) => {
      const entities = dataSource.entities.values
      dataSource.name = '海运'
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        if (entity.billboard) {
          entity.billboard = null
          entity.label = {
            text: `${entity.properties.name._value}港`,
            font: '400 45px MicroSoft YaHei',
            style: earth.LabelStyle.FILL_AND_OUTLINE,
            fillColor: new earth.Color(1 / 255, 1 / 255, 1, 1),
            outlineColor: earth.Color.WHITE,
            outlineWidth: 5,
            verticalOrigin: earth.VerticalOrigin.BOTTOM,
            horizontalOrigin: earth.HorizontalOrigin.CENTER,
            pixelOffset: new earth.Cartesian2(0, -25),
            distanceDisplayCondition: new earth.DistanceDisplayCondition(
              0,
              30e5
            ),
            scaleByDistance: new earth.NearFarScalar(10000, 0.9, 20e5, 0.2),
            showBackground: true,
            backgroundColor: new earth.Color(0 / 255, 0 / 255, 0 / 255, 0.2)
          }
        }
        if (entity.polyline) {
          let positions = entity.polyline.positions._value
          let center =
            positions.length % 2 == 0
              ? positions[positions.length / 2]
              : positions[(positions.length + 1) / 2]
          entity.polyline.width = 5
          pathName.push(entity.properties.name._value)
          entity.position = center
          entity.label = {
            text: entity.properties.name._value,
            font: '600 45px MicroSoft YaHei',
            style: earth.LabelStyle.FILL_AND_OUTLINE,
            fillColor: earth.Color.WHITE,
            outlineColor: earth.Color.CORNFLOWERBLUE, //new earth.Color(0, 255, 255, 1),
            outlineWidth: 3,
            distanceDisplayCondition: new earth.DistanceDisplayCondition(
              0,
              30e5
            ),
            scaleByDistance: new earth.NearFarScalar(10000, 0.9, 20e5, 0.2),
            showBackground: true,
            backgroundColor: new earth.Color(0 / 255, 0 / 255, 0 / 255, 0.3),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
          entity.polyline.material = new earth.PolylineDashMaterialProperty({
            color: earth.Color.RED
          })
          entity.polyline.distanceDisplayCondition =
            new earth.DistanceDisplayCondition(0, 30e5)
          entity.polyline.width = 1
          entity.polyline.show = false
        }
        if (entity.polygon) {
          entity.polygon = null
        }
      }
      viewer.dataSources.add(dataSource)
    })
  }
  // TW海运清除
  removeTaiHYX() {
    let viewer = this.viewer
    viewer.dataSources._dataSources.forEach((e) => {
      if (e.name == '海运') {
        viewer.dataSources.remove(e)
      }
    })
  }
  // 海运拒止效果
  viewTaiHYJZ() {
    let earth = this.earth
    let viewer = this.viewer
    this.removeTaiHYJZ()
    earth.GeoJsonDataSource.load(basicVectorData.haiyunfsq).then(
      (dataSource) => {
        dataSource.name = 'TH拒止区域'
        viewer.dataSources.add(dataSource)
        const entities = dataSource.entities.values
        let number = 1
        let flag = true

        function changeShow() {
          if (flag) {
            number -= 0.01
            if (number <= 0) {
              flag = false
            }
          } else {
            number += 0.01
            if (number >= 1) {
              flag = true
            }
          }
          return number >= 0.5
        }
        for (let i = 0; i < entities.length; i++) {
          let entity = entities[i]
          entity.polygon.material = new earth.GridMaterialProperty({
            color: earth.Color.RED,
            lineThickness: new earth.Cartesian2(0.5, 0.5),
            cellAlpha: 0.15
          })
          let positions = entity.polygon.hierarchy._value.positions
          let center = earth.BoundingSphere.fromPoints(positions).center // 中心点
          entity.position = center
          entity.label = {
            text: '禁航区',
            font: 'bold 32px MicroSoft YaHei',
            style: earth.LabelStyle.FILL_AND_OUTLINE,
            fillColor: new earth.Color(255 / 255, 128 / 255, 1 / 255, 1.0),
            outlineColor: earth.Color.BLACK,
            outlineWidth: 5,
            horizontalOrigin: earth.HorizontalOrigin.CENTER,
            pixelOffset: new earth.Cartesian2(0, -25),
            distanceDisplayCondition: new earth.DistanceDisplayCondition(
              0,
              30e5
            ),
            scaleByDistance: new earth.NearFarScalar(10000, 0.9, 20e5, 0.4),
            showBackground: true,
            backgroundColor: new earth.Color(
              235 / 255,
              255 / 255,
              255 / 255,
              0.3
            ),
            show: new earth.CallbackProperty(changeShow, false)
          }
          // createGrid(entity.polygon.hierarchy._value.positions)
        }
      }
    )
    this.changeSeaPath()
  }
  // 海运拒止效果球上方法
  changeSeaPath() {
    let earth = this.earth
    let viewer = this.viewer
    let a = viewer.dataSources.getByName('海运')[0]
    if (typeof a === 'undefined') {
      this.loadTWHYPathFroJZ()
    } else {
      a.entities.values.forEach((item) => {
        if (item.polyline) {
          item.polyline.width = 1
          item.polyline.material = new earth.PolylineDashMaterialProperty({
            color: earth.Color.RED
          })
          item.polyline.show = false
        }
      })
    }
  }
  // TW海运拒止效果清除
  removeTaiHYJZ() {
    let viewer = this.viewer
    viewer.dataSources._dataSources.forEach((e) => {
      if (e.name == '海运') {
        viewer.dataSources.remove(e)
      }
    })
    viewer.dataSources._dataSources.forEach((e) => {
      if (e.name == 'TH拒止区域') {
        viewer.dataSources.remove(e)
      }
    })
  }
  // 查看TW通信网
  viewTaiTXW() {
    let earth = this.earth
    let viewer = this.viewer
    this.removeTaiTXW()
    this.loadPowerData().then((dataSource) => {
      viewer.dataSources._dataSources.forEach((e) => {
        if (e.name == '台湾电厂点线') {
          viewer.dataSources.remove(e)
        }
      })
      // viewer.dataSources.add(dataSource)
      const entities = dataSource.entities.values
      dataSource.name = '台湾电厂点线'
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        if (entity.billboard) {
          entity.billboard = null
        } else if (entity.polyline) {
          let polylineType = entity.properties.type._value
          entity.polyline.width = 5
          switch (polylineType) {
            case '一次输电线161KV':
              entity.polyline.material = new earth.PolylineGlowMaterialProperty(
                {
                  color: new earth.Color(0 / 255, 255 / 255, 255 / 255),
                  glowPower: 0.1
                }
              )
              entity.polyline.width = 10
              entity.polyline.distanceDisplayCondition =
                new earth.DistanceDisplayCondition(0, 30e5)
              break
            case '超高压输电线345KV':
              entity.polyline.material = new earth.PolylineGlowMaterialProperty(
                {
                  color: new earth.Color(255 / 255, 255 / 255, 255 / 255),
                  glowPower: 0.1
                  // taperPower: 0.5
                }
              )
              entity.polyline.width = 13
              entity.polyline.distanceDisplayCondition =
                new earth.DistanceDisplayCondition(0, 30e5)
              break

            default:
              break
          }
        }
      }
    })
  }
  // TW通信网数据加载球上方法
  loadPowerData = function () {
    let earth = this.earth
    let viewer = this.viewer
    const p = new Promise((resolve, reject) => {
      earth.GeoJsonDataSource.load(basicVectorData.dianwang).then(
        (dataSource) => {
          const entities = dataSource.entities.values
          for (let i = 0; i < entities.length; i++) {
            let entity = entities[i]
            if (entity.properties.Name) {
              entity._id = entity.properties.Name._value
            }
          }
          viewer.dataSources.add(dataSource)
          let data = dataSource
          resolve(data)
        }
      )
    })
    return p
  }
  // TW通信网清除
  removeTaiTXW() {
    let viewer = this.viewer
    viewer.dataSources._dataSources.forEach((e) => {
      if (e.name == '台湾电厂点线') {
        viewer.dataSources.remove(e)
      }
    })
  }
}
export default TWHY
