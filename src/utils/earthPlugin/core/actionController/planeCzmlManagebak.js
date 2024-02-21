import TrackMatte from '@/utils/radar.js'
import store from '@/store'

/**
 * 飞行目标CZML相关动作管理工具
 * @param
 */
export default class PlaneCzmlManage {
  constructor(options) {
    this.Earth = options.earth || window.MSIMEarth // 初始化Earth对象
    this.viewer = options.viewer || window.EarthViewer // 初始化viewer对象
  }
  /**
   * 控制所有czml路径显隐
   * @param {boolean} value 显示或隐藏
   */
  showCZMLPath(value) {
    window.EarthViewer.dataSources._dataSources.forEach((item) => {
      let path = item.entities.values[0].path
      if (path) {
        path.show._value = value
      }
    })
  }
  /**
   * 控制czml或entity显隐
   * @param {string} id entity的id或datasource的name
   * @param {boolean} value 显示或隐藏
   */
  showDynamicEntity(id, value) {
    let sourceSource = window.EarthViewer.dataSources.getByName(id)
    let entity = sourceSource.length
      ? sourceSource[0].entities.values[0]
      : window.EarthViewer.entities.getById(id)
    if (!entity) return
    entity.show = value
  }
  /**
   * 控制实体尾迹
   * @param {string} id entity的id或datasource的name
   * @param {boolean} value 显示或隐藏
   */
  showCZMLWake(id, value) {
    let entity = window.EarthViewer.entities.getById(id + 'weijixian')
    if (!entity) return
    entity.show = value
  }
  /**
   * 控制实体传感器范围
   * @param {string} id entity的id或datasource的name
   * @param {boolean} value 显示或隐藏
   */
  showSensorRange(id, value) {
    let entity = window.EarthViewer.entities.getById(`SU==sensor==${id}`)
    console.log(entity)
    if (!entity) return
    entity.show = value
  }
  /**
   * 控制单个czml路径显隐
   * @param {string} id entity的id或datasource的name
   * @param {boolean} value 显示或隐藏
   */
  showSingleCZMLPath(id, value) {
    let sourceSource = window.EarthViewer.dataSources.getByName(id)
    if (sourceSource.length == 0) return
    // let entity = sourceSource.length ? sourceSource[0].entities.values[0] : window.EarthViewer.entities.getById(id)
    let entity = sourceSource[0].entities.values[0]
    if (!entity) return
    let path = entity.path
    if (path) {
      path.show._value = value
    }
  }
  // 添加尾迹先
  wjxian(czmlname, side) {
    let collection = []

    function changeHeight() {
      let targetDs = window.EarthViewer.dataSources.getByName(czmlname)
      if (targetDs.length == 0) {
        return
      }
      let targetEntity = targetDs[0].entities.getById(czmlname)

      // let proTime = window.MSIMEarth.JulianDate.addSeconds(
      //   window.EarthViewer.clock.currentTime,
      //   0.1,
      //   new window.MSIMEarth.JulianDate()
      // )
      var YGPosition = targetEntity.position.getValue(
        window.EarthViewer.clock.currentTime
      )
      if (typeof YGPosition === 'undefined') {
        return
      }
      var YGCartographic =
        window.MSIMEarth.Cartographic.fromCartesian(YGPosition)
      let starLinkLng = window.MSIMEarth.Math.toDegrees(
        YGCartographic.longitude
      )
      let starLinkLat = window.MSIMEarth.Math.toDegrees(YGCartographic.latitude)
      let starLinkAlt = YGCartographic.height
      if (typeof starLinkLng === 'undefined') {
        window.EarthViewer.entities.removeById(czmlname)
        return
      }
      // let position = new Cesium.Cartesian3.fromDegrees(
      //   starLinkLng,
      //   starLinkLat,
      //   starLinkAlt
      // )
      collection.push(starLinkLng)
      collection.push(starLinkLat)
      collection.push(starLinkAlt + 30)
      if (collection.length > 2000) {
        collection.splice(0, 3)
      }
      return window.MSIMEarth.Cartesian3.fromDegreesArrayHeights(collection)
    }
    let imageUrl = 'static/image/texture/materiallineR.png'
    if (side === 'blue') {
      imageUrl = 'static/image/texture/materialline3.png'
    }
    window.EarthViewer.entities.add({
      id: czmlname + 'weijixian',
      name: 'Wide blue dashed line with a gap color',
      show: false,
      polyline: {
        // positions: Cesium.Cartesian3.fromDegreesArrayHeights([
        //   -75, 40, 250000, -125, 40, 250000
        // ]),
        positions: new window.MSIMEarth.CallbackProperty(changeHeight, false),
        width: 45,
        material: new window.MSIMEarth.FlowLineMaterialProperty({
          image: imageUrl,
          mixColor: new window.MSIMEarth.Color(1.0, 1.0, 0.6, 1.0),
          mixRatio: 0.5,
          repeat: new window.MSIMEarth.Cartesian2(1, 1),
          flowSpeed: -0.00001,
          transparent: true
        }),
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          0,
          10e4
        )
      }
    })
  }
  /**
   * 添加路径墙
   * @param {string} id entity的id或datasource的name
   * @param {boolean} value 显示或隐藏
   */
  addPathWall(czmlname) {
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
    let side = ''
    let collection = []
    let sidecolor = new window.MSIMEarth.Color(1.0, 0.0, 0.0, 1.0)
    let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
    if (sourceSource.length == 0) return
    let entity = sourceSource[0].entities.values[0]
    if (!entity) return
    side = entity.properties.airplaneAction._value.side
    let img = 'static/image/texture/loudongRed.png'
    if (side === 'blue') {
      sidecolor = new window.MSIMEarth.Color(0.0, 1.0, 1.0, 1.0)
      img = 'static/image/texture/loudong3.png'
    }
    // entity
    function changePositions() {
      let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
      if (sourceSource.length == 0) return
      // let entity = sourceSource.length ? sourceSource[0].entities.values[0] : window.EarthViewer.entities.getById(id)
      let entity = sourceSource[0].entities.values[0]
      if (!entity) return
      let YGPosition = entity.position.getValue(
        window.EarthViewer.clock.currentTime
      )
      if (typeof YGPosition === 'undefined') return
      collection.push(YGPosition)
      return collection
    }
    window.EarthViewer.entities.add({
      id: czmlname + 'pathWall',
      wall: {
        positions: new window.MSIMEarth.CallbackProperty(
          changePositions,
          false
        ),
        // material: new window.MSIMEarth.PolylineTrailLinkMaterialProperty({
        //   mixColor: sidecolor,
        //   repeat: new window.MSIMEarth.Cartesian2(1.0, 1.0),
        //   // half: false,
        //   flowSpeed: -0.7,
        //   image: 'static/image/texture/colors2.png',
        //   mixRatio: 0.9,
        //   // image: 'static/image/texture/纵向渐变.png',
        //   transparent: true,
        //   direction: false
        // })
        material: new window.MSIMEarth.ImageMaterialProperty({
          image: img,
          color: sidecolor,
          transparent: true
        })
      }
    })
  }
  // 雷达圈
  sensorRange(params) {
    let viewer = window.EarthViewer
    viewer.entities.removeById(`${params.type}==${params.sourId}`)

    let datasource = window.EarthViewer.dataSources.getByName(params.sourId)
    // let entity = datasource[0].entities.values[0]
    let entity = datasource.length
      ? datasource[0].entities.values[0]
      : viewer.entities.getById(params.sourId)
    if (!entity) return
    // 判断类型
    let radius = params.radius || 18520
    let showref = params.show
    // let mixColor = params.color || [0,0,255]
    let mixColor = params.side == 'blue' ? [37, 209, 255] : [255, 0, 0]

    let trackMatte = new TrackMatte({
      viewer: window.EarthViewer,
      earth: window.MSIMEarth,
      id: `${params.type}==sensor==${params.sourId}`,
      shortwaveRange: Number(radius),
      entity: entity,
      speed: 2,
      color: mixColor,
      show: showref
    })
  }
  //
  changeSensorRange(params) {
    let id = params.id
    let that = this
    let sensorEn = window.EarthViewer.entities.getById(id)
    console.log(sensorEn, window.EarthViewer.entities)
    if (!sensorEn) return
    let radii = sensorEn.ellipsoid.radii._value.x
    // let newRadii = (parseFloat(radii) * 2) / 3
    let multiple = params.multiple || 2 / 3
    let newRadii = parseFloat(radii) * multiple
    let step = (radii - newRadii) / 300 //步长
    let lMaterial = sensorEn.ellipsoid.material
    let lastShow = sensorEn.show
    sensorEn.show = true
    console.log('本来的show', lastShow)
    sensorEn.ellipsoid.radii = new window.MSIMEarth.CallbackProperty(
      callbackRadii,
      false
    )
    sensorEn.ellipsoid.material =
      new window.MSIMEarth.BlingColorMaterialProperty({
        color: new window.MSIMEarth.Color(0, 255 / 255, 255 / 255, 0.5),
        speed: 5.0
      })
    that.blingLabel({
      targetId: id,
      text: params.text,
      fillColor: [0, 255, 255]
    })
    function callbackRadii() {
      let callbackRadii = new window.MSIMEarth.Cartesian3(radii, radii, radii)
      if (radii >= newRadii) {
        radii -= step
        return callbackRadii
      } else {
        sensorEn.ellipsoid.radii = callbackRadii
        sensorEn.ellipsoid.material = lMaterial
        setTimeout(() => {
          sensorEn.show = lastShow
          that.removeBlingLabel(id)
        }, 2000)
      }
    }
  }
  blingLabel(params) {
    let viewer = window.EarthViewer
    let targetSource = viewer.dataSources.getByName(params.targetId)
    let targetEntity = targetSource.length
      ? targetSource[0].entities.values[0]
      : viewer.entities.getById(params.targetId)
    console.log(targetEntity)
    if (!targetEntity) return
    let sizeNum = 1
    let fillColor = params.fillColor || [255, 128, 1]
    let outlineColor = params.outlineColor || [0, 0, 0]
    let fillColorC = new window.MSIMEarth.Color(
      fillColor[0] / 255,
      fillColor[1] / 255,
      fillColor[2] / 255,
      1.0
    )
    let outlineColorC = new window.MSIMEarth.Color(
      outlineColor[0] / 255,
      outlineColor[1] / 255,
      outlineColor[2] / 255,
      1.0
    )
    function changePos() {
      let entityPos = targetEntity.position._value
        ? targetEntity.position._value
        : targetEntity.position.getValue(viewer.clock.currentTime)
      return entityPos
    }
    function changeSize() {
      sizeNum += 0.1
      let size = 0.4 + Math.sin(sizeNum) * 0.1
      let ns = new window.MSIMEarth.NearFarScalar(
        10000,
        0.7 + size,
        20e5,
        0.2 + size
      )
      return ns
    }
    viewer.entities.add({
      id: 'blingLabel' + params.targetId,
      position: new window.MSIMEarth.CallbackProperty(changePos, false),
      label: {
        text: params.text,
        font: 'bold 32px MicroSoft YaHei',
        style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
        fillColor: fillColorC,
        outlineColor: outlineColorC,
        outlineWidth: 5,
        horizontalOrigin: window.MSIMEarth.HorizontalOrigin.CENTER,
        pixelOffset: new window.MSIMEarth.Cartesian2(0, -25),
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          0,
          100e5
        ),
        // scaleByDistance: new window.MSIMEarth.NearFarScalar(
        //   10000,
        //   0.9,
        //   20e5,
        //   0.4
        // ),
        scaleByDistance: new window.MSIMEarth.CallbackProperty(
          changeSize,
          false
        ),
        showBackground: false,
        backgroundColor: new window.MSIMEarth.Color(
          235 / 255,
          255 / 255,
          255 / 255,
          0.3
        )
      }
    })
  }
  removeBlingLabel(targetId) {
    window.EarthViewer.entities.removeById('blingLabel' + targetId)
  }
  testChange() {
    let that = this
    let po = window.EarthViewer.entities.add({
      id: `test1`,
      position: new window.MSIMEarth.Cartesian3.fromDegrees(120, 22, 100000),
      point: {
        pixelSize: 5,
        color: window.MSIMEarth.Color.RED
      }
    })
    // let trackMatte = new TrackMatte({
    //   viewer: window.EarthViewer,
    //   earth: window.MSIMEarth,
    //   id: `test1`,
    //   shortwaveRange: 200000,
    //   entity: po,
    //   speed: 2,
    //   color: [0, 255, 255]
    // })
    setTimeout(() => {
      // that.changeSensorRange({
      //   id: `test1`,
      //   multiple: 2 / 3,
      //   text: '受到干扰'
      // })
      that.planeElectronicInterfer({
        sourId: `test1`
      })
    }, 4000)
  }
  // czmlLabel飞机label
  changePlaneLabel(params) {
    let configContent = params.configContent
    let data = params.data
    let name = params.name
    // let entity = params.entity
    let config = configContent || ['姿态', '速度', '类型']
    let text = name
    if (config.find((item) => item == '姿态')) {
      text +=
        '\n' +
        'H:' +
        data.heading.toFixed(3) +
        ' ' +
        'P:' +
        data.pitch.toFixed(3) +
        ' ' +
        'R:' +
        data.roll.toFixed(3)
    }
    if (config.find((item) => item == '速度')) {
      text += '\n' + '速度：' + data.speed.toFixed(2)
    }
    if (config.find((item) => item == '类型')) {
      text += '\n' + '类型：' + data.type
    }
    let label = {
      show: true,
      font: 'normal 14px MicroSoft YaHei',
      text: text,
      style: 'FILL_AND_OUTLINE',
      showBackground: false,
      // fillColor: {
      //   rgba: [255, 255, 255, 255]
      // },
      // outlineColor: {
      //   rgba: [0, 0, 0, 255]
      // },
      // outlineWidth: 2,
      // backgroundColor: [1, 1, 1, 0.8],
      horizontalOrigin: 'LEFT',
      pixelOffset: {
        cartesian2: [20, -30]
      }

      // height: 40
    }
    return label
  }
  // 飞机开启电子干扰
  planeElectronicInterfer(params) {
    let that = this
    let sourceSource = this.viewer.dataSources.getByName(params.sourId)
    let entity = sourceSource.length
      ? sourceSource[0].entities.values[0]
      : this.viewer.entities.getById(params.sourId)
    if (!entity) return
    let radius = params.radius || 30000
    function changePos() {
      let entityPos = entity.position._value
        ? entity.position._value
        : entity.position.getValue(that.viewer.clock.currentTime)
      return entityPos
    }
    this.viewer.entities.add({
      id: params.sourId + 'ElectronicInterfer',
      position: new that.Earth.CallbackProperty(changePos, false),
      ellipsoid: {
        radii: new that.Earth.Cartesian3(radius, radius, radius),
        material: new that.Earth.EMIMaterialProperty({
          transparent: true,
          flowSpeed: 1.0,
          half: false,
          color: new that.Earth.Color(1.0, 0.0, 0.0, 1.0),
          EMITransparent: 0.3
        }),
        outline: true,
        outlineColor: new that.Earth.Color(255 / 255, 255 / 255, 255 / 255, 1),
        outlineWidth: 1
      }
    })
  }
  // 点标注
  setPointLabel(params) {
    let position = new this.Earth.Cartesian3.fromDegrees(
      params.position[0],
      params.position[1],
      params.position[2],
    )
    let outlineColor = new this.Earth.Color(
      params.color[0] / 255,
      params.color[1] / 255,
      params.color[2] / 255,
      params.color[3]
    )
    let flog = true
    let size = params.pointSize || 3
    let updateSize = function () {
      if (flog) {
        size = size - 0.4
        if (size <= 0) {
          flog = false
        }
      } else {
        size = size + 0.4
        if (size >= 6) {
          flog = true
        }
      }
      return size
    }
    this.viewer.entities.add({
      id: params.id,
      position: position,
      point: {
        scaleByDistance: new this.Earth.NearFarScalar(6e6, 1.6, 2e8, 1.2),
        pixelSize: new this.Earth.CallbackProperty(updateSize, false),
        outlineColor: outlineColor,
        outlineWidth: 2.5,
        color: this.Earth.Color.WHITE,
      },
      label: {
        text: params.text,
        font: 'bold 32px MicroSoft YaHei',
        style: this.Earth.LabelStyle.FILL_AND_OUTLINE,
        fillColor: this.Earth.Color.WHITE,
        outlineColor: outlineColor,
        outlineWidth: 2,
        horizontalOrigin: this.Earth.HorizontalOrigin.CENTER,
        pixelOffset: new this.Earth.Cartesian2(0, -25),
        distanceDisplayCondition: new this.Earth.DistanceDisplayCondition(
          0,
          100e5
        ),
        scaleByDistance: new window.MSIMEarth.NearFarScalar(
          10000,
          0.9,
          20e5,
          0.4
        ),
        // scaleByDistance: new this.Earth.CallbackProperty(
        //   changeSize,
        //   false
        // ),
        showBackground: true,
        backgroundColor: new this.Earth.Color(
          params.color[0] / 255,
          params.color[1] / 255,
          params.color[2] / 255,
          0.3
        )
      }
    })
  }
  // 删除雷达圈
  removeRange(params) {
    window.EarthViewer.entities.removeById(`${params.type}==${params.sourId}`)
    window.EarthViewer.entities.removeById(
      `${params.type}==${params.sourId}==big`
    )
    window.EarthViewer.entities.removeById(
      `${params.type}==${params.sourId}==small`
    )
  }
  // 删除路径墙
  removePathWall(czmlname) {
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = false
    window.EarthViewer.entities.removeById(czmlname + 'pathWall')
  }
  /**
   * 添加路径线
   * @param {string} id entity的id或datasource的name
   * @param {boolean} value 显示或隐藏
   */
  addPathLine(czmlname) {
    let side = ''
    let collection = []
    let sidecolor = new window.MSIMEarth.Color(1.0, 0.0, 0.0, 1.0)
    let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
    if (sourceSource.length == 0) return
    let entity = sourceSource[0].entities.values[0]
    if (!entity) return
    side = entity.properties.airplaneAction._value.side
    if (side === 'blue') {
      sidecolor = new window.MSIMEarth.Color(0.0, 1.0, 1.0, 1.0)
    }
    // entity
    function changePositions() {
      let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
      if (sourceSource.length == 0) return
      // let entity = sourceSource.length ? sourceSource[0].entities.values[0] : window.EarthViewer.entities.getById(id)
      let entity = sourceSource[0].entities.values[0]
      if (!entity) return
      let YGPosition = entity.position.getValue(
        window.EarthViewer.clock.currentTime
      )
      if (typeof YGPosition === 'undefined') return
      collection.push(YGPosition)
      return collection
    }
    window.EarthViewer.entities.add({
      id: czmlname + 'pathLine',
      polyline: {
        positions: new window.MSIMEarth.CallbackProperty(
          changePositions,
          false
        ),
        width: 1,
        material: sidecolor
      }
    })
  }
  // 删除路径线
  removePathLine(czmlname) {
    window.EarthViewer.entities.removeById(czmlname + 'pathLine')
  }
}
