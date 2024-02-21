/**
 * 卫星动作控制器
 * 卫星类别：电子、可见光、红外、高光谱、SAR、雷达
 *
 */
import CreateFrustum from './customTool/CreateFrumstum'
import CreateFrustumPure from './customTool/CreateFrumstumPure'
import Prompt from './customTool/prompt/prompt.js'
export default function SatelliteSixActController(options) {
  this.Cesium = options.earth
  this.viewer = options.viewer
  this.satelliteActors = [] // 卫星所有动作数组
}

/**
 * 六类卫星侦察效果开启
 * @param {string} satelliteType 卫星类型 electric 0_1_0  0_1_5
 * @param {string} entityId 卫星id
 */
SatelliteSixActController.prototype.spyOnEffect = function (options) {
  let satType = options.satelliteType
  let dataSource = this.viewer.dataSources.getByName(satType)
  // let entityTarget = ''
  let entityTarget = dataSource.length > 0 ? dataSource[0].entities.getById(options.entityId) : this.viewer.entities.getById(options.entityId)
  // if (dataSource && dataSource.length > 0) {
    
  // }
  this.closeSpyOnEffect(options)
  if (!entityTarget) return
  // this.viewer.scene.globe.depthTestAgainstTerrain = true
  switch (satType) {
    case 'light':
      this.opticalSatelliteScan({
        czmlSource: options.satelliteType,
        scanRange: 200,
        satelliteId: options.entityId,
        entity: entityTarget
      })
      break
    case 'electric':
      this.electronicSatelliteScan({
        scanRange: 200,
        satelliteId: options.entityId,
        entity: entityTarget
      })
      break
    case 'red':
      this.redMonitoring({
        scanRange: 180,
        satelliteId: options.entityId,
        entity: entityTarget
      })
      break
    case 'highLight':
      this.hyperspectralScan(options.entityId, entityTarget)
      break
    case 'sar':
      // this.syntheticARScan({
      //   scanRange: 150,
      //   satelliteId: options.entityId,
      //   entity: entityTarget
      // })
      this.SarPitchScan({
        scanRange: 150,
        satelliteId: options.entityId,
        entity: entityTarget
      })
      break
    case 'radar':
      this.radarScan({
        satelliteId: options.entityId,
        entity: entityTarget,
        scanRange: 180
      })
      break

    default:
      break
  }
}

/**
 * 六类卫星侦察效果关闭
 * @param {string} satelliteType 卫星类型 electric 0_1_0  0_1_5
 * @param {string} CZMLName 卫星czmlName
 * @param {string} entityId 卫星id
 */
SatelliteSixActController.prototype.closeSpyOnEffect = function (options) {
  let satType = options.satelliteType
  let dataSource = this.viewer.dataSources.getByName(satType)
  let entityTarget
  if (dataSource && dataSource.length > 0) {
    entityTarget = dataSource[0].entities.getById(options.entityId)
  }
  // let entityTarget = dataSource[0].entities.getById(options.entityId)
  if (!entityTarget) return
  // console.log('删除扫描');
  switch (satType) {
    case 'light':
      this.opticalSatelliteScanEnd({
        satelliteId: options.entityId,
        entity: entityTarget
      })
      break
    case 'electric':
      this.electronicSatelliteScanEnd({
        satelliteId: options.entityId,
        entity: entityTarget
      })
      break
    case 'red':
      this.redMonitoringEnd({
        satelliteId: options.entityId,
        entity: entityTarget
      })
      break
    case 'highLight':
      this.hyperspectralScanEnd({
        satelliteId: options.entityId,
        entity: entityTarget
      })
      break
    case 'sar':
      // this.sarSatelliteScanEnd({
      //   satelliteId: options.entityId,
      //   entity: entityTarget
      // })
      this.SarPitchScanEnd({
        satelliteId: options.entityId,
        entity: entityTarget
      })
      break
    case 'radar':
      this.radarScanEnd({
        satelliteId: options.entityId,
        entity: entityTarget
      })
      break

    default:
      break
  }
}

/**
 * 光学卫星扫描
 */
SatelliteSixActController.prototype.opticalSatelliteScan = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer

  let satelliteCylinderId = options.satelliteId + '光学卫星扫描Cylinder' // 信号和扫描带
  let satelliteScan = viewer.entities.getById(satelliteCylinderId)
  // 验证已开机
  if (satelliteScan) return
  let dataSource = ''
  let satellite = options.entity

  if (!options.scanRange) {
    return
  }
  //this.setEffect(satellite, '光学载荷扫描')

  // satellite.description = '光学卫星扫描'
  // 验证实体存在

  // 计算卫星当前高度
  let currentTime = viewer.clock.currentTime
  let satellitePosition = satellite.position.getValue(currentTime)
  let satelliteCartographic =
    Cesium.Cartographic.fromCartesian(satellitePosition)
  let satelliteAlt = satelliteCartographic.height
  // 获取锥形宽度
  let width = satelliteAlt * Math.tan(Math.PI / 12) * 2

  // 信号展开callbackproperty 函数
  let initL = 100

  function changeLength() {
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)
    if (!satellitePosition) return
    let satelliteCartographic =
      Cesium.Cartographic.fromCartesian(satellitePosition)
    let satelliteAlt = satelliteCartographic.height
    return satelliteAlt
  }
  // 更新位置callbackproperty函数
  function changePosition() {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
    if (!tempPosition) return
    let tempCartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
    let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
    let tempAlt = tempCartographic.height
    let res = new Cesium.Cartesian3.fromDegrees(tempLng, tempLat, tempAlt / 2.0)
    return res
  }
  // corridor位置更新,每次更新经纬度

  let index = 0
  var heading = Cesium.Math.toRadians(60)
  var pitch = 0
  var roll = 0
  let orientation

  function changeOrientation() {
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
    let position
    // var YGEntity = viewer.entities.getById(satelliteCylinderId)
    var YGPosition = satellite.position.getValue(viewer.clock.currentTime)
    if (!YGPosition) return
    var YGCartographic = Cesium.Cartographic.fromCartesian(YGPosition)
    let starLinkLng = Cesium.Math.toDegrees(YGCartographic.longitude)
    let starLinkLat = Cesium.Math.toDegrees(YGCartographic.latitude)
    let starLinkAlt = YGCartographic.height
    position = new Cesium.Cartesian3.fromDegrees(
      starLinkLng,
      starLinkLat,
      starLinkAlt
    )
    orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr)
    return orientation
  }

  let corridorArray = []
  let corridorArrayLog = []
  //console.log("time1",time1);
  let corridorChange = true

  function changePositionArray(time) {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
    if (!tempPosition) return
    let tempCartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
    let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
    if (corridorChange) {
      // if (corridorArray.length > 2) {
      //   corridorArray.splice(2, 2)
      // }
      corridorArrayLog.push(tempLng)
      corridorArrayLog.push(tempLat)
    }
    let sp = window.EarthViewer.clock.multiplier
    let maxL = sp == 0 ? 100 : 1500 / Math.abs(sp)
    if (corridorArrayLog.length > maxL) {
      corridorArrayLog.splice(0, 2)
    }
    let len = corridorArrayLog.length
    corridorArray = [
      ...corridorArrayLog.slice(0, 2),
      ...corridorArrayLog.slice(len - 2, len)
    ]
    return Cesium.Cartesian3.fromDegreesArray(corridorArray)
  }
  let radius =
    Number(options.scanRange) > -1 ? Number(options.scanRange) * 1000 : 86000
  viewer.entities.add({
    id: satelliteCylinderId,
    position: new Cesium.CallbackProperty(changePosition, false),
    orientation: new Cesium.CallbackProperty(changeOrientation, false),
    // cylinder: {
    //   // length: 469718.0,
    //   length: new Cesium.CallbackProperty(changeLength, false),
    //   // length: satelliteAlt,
    //   topRadius: 0.0,
    //   bottomRadius: radius,
    //   showBottom: false,
    //   slices: 28,
    //   material: new this.Cesium.PulseMaterialProperty({
    //     repeat: new this.Cesium.Cartesian2(3.0, 3.0),
    //     color: new this.Cesium.Color(255 / 255, 240 / 255, 0, 1.0),
    //     flowSpeed: -50.0,
    //     transparent: true
    //   })
    // },
    corridor: {
      positions: new Cesium.CallbackProperty(changePositionArray, false),
      extrudedHeight: 100.0,
      width: width,
      // width: wid,
      cornerType: Cesium.CornerType.MITERED,
      // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      // height: 100,
      // extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      material: new this.Cesium.Color(255 / 255, 240 / 255, 0, 0.4)
    }
  })

  // 初始hpr
  heading = Cesium.Math.toRadians(45)
  // let verti = Cesium.Math.PI / 2
  pitch = Cesium.Math.toRadians(180.0)
  roll = 0.0
  let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
  // 获取初始四元数
  if (!satellitePosition) return
  let quaternion = Cesium.Transforms.headingPitchRollQuaternion(
    satellitePosition,
    hpr
  )
  let lineColor = new this.Cesium.Color(0.0, 1.0, 1.0, 1.0)

  // let has = this.satelliteActors.find(item => item.satelliteId == satelliteCylinderId)
  // if (has) {
  //   console.log('已有');
  //   return
  // }
  //  创建视锥体
  let frustumAreaMonitoring = new CreateFrustumPure({
    Cesium: Cesium,
    viewer: viewer,
    position: satellitePosition,
    orientation: quaternion,
    // new Cesium.VelocityOrientationProperty(property)
    fov: 30,
    near: 0.1,
    far: satelliteAlt,
    //aspectRatio: 0.3,
    aspectRatio: 0.08,
    radian: 20,
    lineColor: new this.Cesium.Color(255 / 255, 240 / 255, 0, 1),
    scanColor: new this.Cesium.Color(255 / 255, 240 / 255, 0, 1),
    scanColor2: new Cesium.Cartesian4(4.0, 4.0, 0.0),
    frustumName: satelliteCylinderId
  })
  let pc = satelliteCylinderId

  window[pc] = frustumAreaMonitoring

  // 根据两点计算线的走向
  let lastH = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)

  function getHeading(pointA, pointB) {
    //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA)
    //向量AB
    const positionvector = Cesium.Cartesian3.subtract(
      pointB,
      pointA,
      new Cesium.Cartesian3()
    )
    //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
    //AB为世界坐标中的向量
    //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
    const vector = Cesium.Matrix4.multiplyByPointAsVector(
      Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
      positionvector,
      new Cesium.Cartesian3()
    )
    if (vector.x == 0) {
      return lastH
    }
    //归一化
    const direction = Cesium.Cartesian3.normalize(
      vector,
      new Cesium.Cartesian3()
    )
    //heading
    // const heading = Math.atan2(direction.y, direction.x);
    const heading =
      Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO
    lastH = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
    return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
  }

  let beforeTime, position // 用来保存定时器上一次的时间和位置
  let frustumAreaMonitoringTime = setInterval(() => {
    // 获取卫星当前位置
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)
    if (!satellitePosition) {
      clearInterval(frustumAreaMonitoringTime)
      return
    }
    // 根据卫星走向获取其orientation
    // let position = new Cesium.SampledProperty(Cesium.Cartesian3);
    if (beforeTime) {
      // 视锥扫描变化的角度heading
      heading = getHeading(position, satellitePosition)
      // hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      let verti = Cesium.Math.PI / 2
      hpr = new Cesium.HeadingPitchRoll(heading - verti, pitch, roll)
      quaternion = Cesium.Transforms.headingPitchRollQuaternion(
        satellitePosition,
        hpr
      )
      frustumAreaMonitoring.update(satellitePosition, quaternion)
    }
    // 保存此次更新卫星的位置和时间
    beforeTime = currentTime
    position = satellite.position.getValue(beforeTime)
  }, 50)

  // 保存动作
  //console.log('定时器', frustumAreaMonitoringTime)
  var obj2 = Object.assign({}, frustumAreaMonitoring)
  this.satelliteActors.push({
    actorName: '可见光',
    satelliteId: options.satelliteId,
    frustum: obj2,
    interval: frustumAreaMonitoringTime
  })
}

/**
 * 电子卫星扫描
 * @param {string} satelliteId 卫星实体id
 */
SatelliteSixActController.prototype.electronicSatelliteScan = function (
  options
) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  let satelliteCylinderId = options.satelliteId + 'CylinderDZ'
  let satelliteScan = viewer.entities.getById(satelliteCylinderId)
  if (satelliteScan) return
  let dataSource = ''
  let satellite = options.entity

  satellite.description = '电子卫星扫描'

  // 更新位置
  function _updateCylinderPosition() {
    let satellitePosition = satellite.position.getValue(
      viewer.clock.currentTime
    )
    if (!satellitePosition) return
    let satelliteCartoGeographic =
      Cesium.Cartographic.fromCartesian(satellitePosition)
    let satelliteLng = Cesium.Math.toDegrees(satelliteCartoGeographic.longitude)
    let satelliteLat = Cesium.Math.toDegrees(satelliteCartoGeographic.latitude)
    let satelliteAlt = satelliteCartoGeographic.height
    let res = new Cesium.Cartesian3.fromDegrees(
      satelliteLng,
      satelliteLat,
      satelliteAlt / 2.0
    )
    return res
  }

  // 信号长度更新函数
  let initL = 100

  function changeLength() {
    let satellitePosition = satellite.position.getValue(
      viewer.clock.currentTime
    )
    if (!satellitePosition) return
    let satelliteCartoGeographic =
      Cesium.Cartographic.fromCartesian(satellitePosition)
    let satelliteAlt = satelliteCartoGeographic.height
    if (initL < satelliteAlt) {
      initL += 30000
    }
    // return initL
    return satelliteAlt
  }
  let radius =
    Number(options.scanRange) > -1 ? Number(options.scanRange) * 1000 : 86000
  // 添加电子扫描光束
  viewer.entities.add({
    id: options.satelliteId + 'CylinderDZ',
    position: new Cesium.CallbackProperty(_updateCylinderPosition, false),
    ellipse: {
      semiMinorAxis: radius,
      semiMajorAxis: radius,
      material: new Cesium.EMIMaterialProperty({
        transparent: true,
        flowSpeed: 1.0,
        half: false,
        color: new this.Cesium.Color(1.0, 0.0, 0.0, 1.0),
        EMITransparent: 0.4
      })
    },
    cylinder: {
      length: new Cesium.CallbackProperty(changeLength, false),
      topRadius: 0.0,
      bottomRadius: radius,
      showBottom: false,
      slices: 28,
      material: new Cesium.PulseMaterialProperty({
        repeat: new Cesium.Cartesian2(3.0, 3.0),
        color: new Cesium.Color(0.1, 0.1, 0.1, 1.0),
        flowSpeed: -10.0,
        transparent: true
      })
    }
  })
}

/**
 * 合成孔径雷达卫星（SAR）
 * @param {string} satelliteId 卫星实体id
 */
SatelliteSixActController.prototype.syntheticARScan = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer

  let satelliteCylinderId = options.satelliteId + 'CylinderSar' // 信号和扫描带
  let satelliteScan = viewer.entities.getById(satelliteCylinderId)
  if (satelliteScan) return
  let dataSource = ''
  let satellite = options.entity

  //this.setEffect(satellite, 'SAR扫描')

  // 更新位置
  function _updateCylinderPosition() {
    let satellitePosition = satellite.position.getValue(
      viewer.clock.currentTime
    )
    if (!satellitePosition) return
    let satelliteCartoGeographic =
      Cesium.Cartographic.fromCartesian(satellitePosition)
    let satelliteLng = Cesium.Math.toDegrees(satelliteCartoGeographic.longitude)
    let satelliteLat = Cesium.Math.toDegrees(satelliteCartoGeographic.latitude)
    let satelliteAlt = satelliteCartoGeographic.height
    let res = new Cesium.Cartesian3.fromDegrees(
      satelliteLng,
      satelliteLat,
      satelliteAlt / 2.0
    )
    return res
  }

  // 信号长度更新函数
  let initL = 100

  function changeLength() {
    let satellitePosition = satellite.position.getValue(
      viewer.clock.currentTime
    )
    if (!satellitePosition) return
    let satelliteCartoGeographic =
      Cesium.Cartographic.fromCartesian(satellitePosition)
    let satelliteAlt = satelliteCartoGeographic.height
    if (initL < satelliteAlt) {
      initL += 30000
    }
    // return initL
    return satelliteAlt
  }
  let radius =
    Number(options.scanRange) > -1 ? Number(options.scanRange) * 1000 : 86000
  // 添加光束
  viewer.entities.add({
    id: options.satelliteId + 'CylinderSar',
    position: new Cesium.CallbackProperty(_updateCylinderPosition, false),
    cylinder: {
      length: new Cesium.CallbackProperty(changeLength, false),
      topRadius: 0.0,
      bottomRadius: radius,
      showBottom: false,
      slices: 28,
      material: new Cesium.PulseMaterialProperty({
        repeat: new Cesium.Cartesian2(6.0, 6.0),
        color: new Cesium.Color(50 / 255, 50 / 255, 50 / 255, 1.0),
        flowSpeed: 10.0,
        transparent: true
      })
    }
  })
  // 反向光束
  viewer.entities.add({
    id: options.satelliteId + 'CylinderReSar',
    position: new Cesium.CallbackProperty(_updateCylinderPosition, false),
    cylinder: {
      length: new Cesium.CallbackProperty(changeLength, false),
      topRadius: 0.0,
      bottomRadius: radius,
      showBottom: false,
      slices: 28,
      material: new Cesium.PulseMaterialProperty({
        repeat: new Cesium.Cartesian2(6.0, 6.0),
        color: new Cesium.Color(50 / 255, 50 / 255, 50 / 255, 1.0),
        flowSpeed: -10.0,
        transparent: true
      })
    }
  })
  // if (typeof this.timer != 'undefined') {
  //   clearTimeout(this.timer)
  // }
  //   }
  // })
}

/**
 * 雷达载荷
 * @param {string} satelliteId 卫星实体id
 */
SatelliteSixActController.prototype.radarScan = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  // 验证扫描已存在
  let satelliteCylinderId = options.satelliteId + 'radarScan' // 信号和扫描带
  let satelliteScan = viewer.entities.getById(satelliteCylinderId)
  if (satelliteScan) return
  let dataSource = ''
  let satellite = options.entity

  //this.setEffect(satellite, '高光谱扫描')

  // 更新位置
  function _updateCylinderPosition() {
    let satellitePosition = satellite.position.getValue(
      viewer.clock.currentTime
    )
    if (!satellitePosition) return
    let satelliteCartoGeographic =
      Cesium.Cartographic.fromCartesian(satellitePosition)
    let satelliteLng = Cesium.Math.toDegrees(satelliteCartoGeographic.longitude)
    let satelliteLat = Cesium.Math.toDegrees(satelliteCartoGeographic.latitude)
    let satelliteAlt = satelliteCartoGeographic.height
    let res = new Cesium.Cartesian3.fromDegrees(
      satelliteLng,
      satelliteLat,
      satelliteAlt / 2.0
    )
    return res
  }
  // 信号展开callbackproperty 函数
  let initL = 100

  function changeLength() {
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)
    if (!satellitePosition) return
    let satelliteCartographic =
      Cesium.Cartographic.fromCartesian(satellitePosition)
    let satelliteAlt = satelliteCartographic.height
    return satelliteAlt
  }

  let radius =
    Number(options.scanRange) > -1 ? Number(options.scanRange) * 1000 : 86000

  // 添加光束
  viewer.entities.add({
    id: options.satelliteId + 'radarScan',
    position: new Cesium.CallbackProperty(_updateCylinderPosition, false),
    cylinder: {
      length: new Cesium.CallbackProperty(changeLength, false),
      topRadius: 0.0,
      bottomRadius: radius,
      showBottom: false,
      slices: 28,
      material: new Cesium.PulseMaterialProperty({
        repeat: new Cesium.Cartesian2(2.0, 2.0),
        color: new Cesium.Color(50 / 255, 50 / 255, 50 / 255, 1.0),
        flowSpeed: 50.0,
        transparent: true
      })
    }
  })
  viewer.entities.add({
    id: options.satelliteId + 'radarReScan',
    position: new Cesium.CallbackProperty(_updateCylinderPosition, false),
    cylinder: {
      length: new Cesium.CallbackProperty(changeLength, false),
      topRadius: 0.0,
      bottomRadius: radius,
      showBottom: false,
      slices: 28,
      material: new Cesium.PulseMaterialProperty({
        repeat: new Cesium.Cartesian2(2.0, 2.0),
        color: new Cesium.Color(50 / 255, 50 / 255, 50 / 255, 1.0),
        flowSpeed: -50.0,
        transparent: true
      })
    }
  })
  // if (typeof this.timer != 'undefined') {
  //   clearTimeout(this.timer)
  // }
  //   }
  // })
}

/**
 * 高光谱
 * @param {string} satelliteId 卫星id
 * @param {Date} date  事件触发时间
 * @param {string} eventName 事件名称
 */
SatelliteSixActController.prototype.hyperspectralScan = function (
  satelliteId,
  entity
) {
  let viewer = this.viewer
  let Cesium = this.Cesium
  // 验证扫描已存在
  // viewer.entities.removeById(satelliteId + 'areaMonitoring')
  // let ind = this.satelliteActors.find((item) => item.satelliteId == satelliteId)
  // // console.log(ind);
  // if (ind) return

  // 获取卫星实体
  let satellite = entity
  //this.setEffect(satellite, '雷达卫星扫描')
  // 验证实体是否存在
  if (!Cesium.defined(satellite)) {
    console.error('SatelliteEntity is required.')
    return
  }
  satellite.description = 'hyperspectral'
  let satelliteCylinderId = satelliteId + 'hyperspectral'
  // // 计算条带起始位置
  // let corridorArray = []
  let tempPosition1 = satellite.position.getValue(viewer.clock.currentTime)
  if (!tempPosition1) return
  let tempCartographic1 = Cesium.Cartographic.fromCartesian(tempPosition1)
  let tempLng1 = Cesium.Math.toDegrees(tempCartographic1.longitude)
  let tempLat1 = Cesium.Math.toDegrees(tempCartographic1.latitude)
  let tempAlt1 = tempCartographic1.height
  // 获取锥形宽度
  //let width = tempAlt1 * Math.tan(Math.PI / 6) * 2
  let width = tempAlt1 * Math.tan(Math.PI / 9) * 2

  // 初始hpr
  let heading = Cesium.Math.toRadians(45)
  // let verti = Cesium.Math.PI / 2
  let pitch = Cesium.Math.toRadians(180.0)
  let roll = 0.0
  let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
  // 获取初始四元数
  let satellitePosition = satellite.position.getValue(viewer.clock.currentTime)
  if (!satellitePosition) return
  let quaternion = Cesium.Transforms.headingPitchRollQuaternion(
    satellitePosition,
    hpr
  )
  let lineColor = new this.Cesium.Color(0.0, 1.0, 1.0, 1.0)
  let corridorArray = []
  let corridorArrayLog = []
  //console.log("time1",time1);
  let corridorChange = true
  // 更新位置callbackproperty函数
  function changePosition() {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
    if (!tempPosition) return
    let tempCartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
    let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
    let tempAlt = tempCartographic.height
    let res = new Cesium.Cartesian3.fromDegrees(tempLng, tempLat, tempAlt / 2.0)
    return res
  }

  function changePositionArray(time) {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
    if (!tempPosition) return
    let tempCartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
    let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
    if (corridorChange) {
      // if (corridorArray.length > 2) {
      //   corridorArray.splice(2, 2)
      // }
      corridorArrayLog.push(tempLng)
      corridorArrayLog.push(tempLat)
    }
    let sp = window.EarthViewer.clock.multiplier
    let maxL = sp == 0 ? 100 : 1500 / Math.abs(sp)
    if (corridorArrayLog.length > maxL) {
      corridorArrayLog.splice(0, 2)
    }
    let len = corridorArrayLog.length
    corridorArray = [
      ...corridorArrayLog.slice(0, 2),
      ...corridorArrayLog.slice(len - 2, len)
    ]
    return Cesium.Cartesian3.fromDegreesArray(corridorArray)
  }
  // function changeOrientation() {
  //   var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
  //   let position
  //   // var YGEntity = viewer.entities.getById(satelliteCylinderId)
  //   var YGPosition = satellite.position.getValue(viewer.clock.currentTime)
  //   if (!YGPosition) {
  //     window.EarthViewer.scene.postRender.removeEventListener(changeOrientation)
  //     return
  //   }
  //   var YGCartographic = Cesium.Cartographic.fromCartesian(YGPosition)
  //   let starLinkLng = Cesium.Math.toDegrees(YGCartographic.longitude)
  //   let starLinkLat = Cesium.Math.toDegrees(YGCartographic.latitude)
  //   let starLinkAlt = YGCartographic.height
  //   position = new Cesium.Cartesian3.fromDegrees(
  //     starLinkLng,
  //     starLinkLat,
  //     starLinkAlt
  //   )
  //   let orientation = Cesium.Transforms.headingPitchRollQuaternion(
  //     position,
  //     hpr
  //   )
  //   frustumAreaMonitoring.update(YGPosition, orientation)
  // }
  viewer.entities.add({
    id: satelliteCylinderId,
    position: new Cesium.CallbackProperty(changePosition, false),
    corridor: {
      positions: new Cesium.CallbackProperty(changePositionArray, false),
      extrudedHeight: 100.0,
      width: width,
      cornerType: Cesium.CornerType.MITERED,
      // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      // height: 100,
      // extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      material: new this.Cesium.Color(0.0, 1.0, 0.0, 0.4)
    }
  })
  //  创建视锥体
  // let has = this.satelliteActors.find(item => item.satelliteId == satelliteId)
  // if (has) {
  //   console.log('已有');
  //   return
  // }
  let frustumAreaMonitoring = new CreateFrustum({
    Cesium: Cesium,
    viewer: viewer,
    position: satellitePosition,
    orientation: quaternion,
    // new Cesium.VelocityOrientationProperty(property)
    fov: 40,
    near: 0.1,
    far: tempAlt1,
    // aspectRatio: 0.0001,
    //aspectRatio: 0.2,
    aspectRatio: 0.08,
    radian: 30,
    lineColor: lineColor,
    scanColor: new Cesium.Cartesian4(4.0, 4.0, 0.0),
    scanColor2: new Cesium.Cartesian4(4.0, 4.0, 0.0),
    frustumName: satelliteId + 'hyperspectral'
  })
  let pc = satelliteId + 'hyperspectral'

  window[pc] = frustumAreaMonitoring

  // 根据两点计算线的走向
  let lastH = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)

  function getHeading(pointA, pointB) {
    //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA)
    //向量AB
    const positionvector = Cesium.Cartesian3.subtract(
      pointB,
      pointA,
      new Cesium.Cartesian3()
    )
    //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
    //AB为世界坐标中的向量
    //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
    const vector = Cesium.Matrix4.multiplyByPointAsVector(
      Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
      positionvector,
      new Cesium.Cartesian3()
    )
    if (vector.x == 0) {
      return lastH
    }
    //归一化
    const direction = Cesium.Cartesian3.normalize(
      vector,
      new Cesium.Cartesian3()
    )
    //heading
    // const heading = Math.atan2(direction.y, direction.x);
    const heading =
      Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO
    lastH = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
    return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
  }

  let beforeTime, position // 用来保存定时器上一次的时间和位置
  let frustumAreaMonitoringTime = setInterval(() => {
    // 获取卫星当前位置
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)
    if (!satellitePosition) {
      clearInterval(frustumAreaMonitoringTime)
      return
    }
    // 根据卫星走向获取其orientation
    // let position = new Cesium.SampledProperty(Cesium.Cartesian3);
    if (beforeTime) {
      // 视锥扫描变化的角度heading
      heading = getHeading(position, satellitePosition)
      // hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      let verti = Cesium.Math.PI / 2
      hpr = new Cesium.HeadingPitchRoll(heading - verti, pitch, roll)
      quaternion = Cesium.Transforms.headingPitchRollQuaternion(
        satellitePosition,
        hpr
      )
      frustumAreaMonitoring.update(satellitePosition, quaternion)
    }
    // 保存此次更新卫星的位置和时间
    beforeTime = currentTime
    position = satellite.position.getValue(beforeTime)
  }, 50)

  // 保存动作
  //console.log('定时器', frustumAreaMonitoringTime)
  var obj2 = Object.assign({}, frustumAreaMonitoring)
  this.satelliteActors.push({
    actorName: 'hyperspectral',
    satelliteId: satelliteId,
    frustum: obj2,
    interval: frustumAreaMonitoringTime
    // interval: changeOrientation
  })
}

/**
 * 红外
 * @param {string} satelliteId 卫星id
 * @param {Date} date  事件触发时间
 * @param {string} eventName 事件名称
 */
SatelliteSixActController.prototype.redMonitoring = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  // 验证动作已存在
  let satelliteCylinderId = options.satelliteId + '红外扫描Cylinder' // 信号和扫描带
  let satelliteScan = viewer.entities.getById(satelliteCylinderId)
  if (satelliteScan) return

  let dataSource = ''
  let satellite = options.entity
  if (!satellite) return
  //this.setEffect(satellite, '红外载荷扫描')
  // 验证实体存在

  // 计算卫星当前高度
  let currentTime = viewer.clock.currentTime
  let satellitePosition = satellite.position.getValue(currentTime)
  let satelliteCartographic =
    Cesium.Cartographic.fromCartesian(satellitePosition)
  let satelliteAlt = satelliteCartographic.height
  // 获取锥形宽度
  let width = satelliteAlt * Math.tan(Math.PI / 24) * 2

  // 信号展开callbackproperty 函数
  let initL = 100

  function changeLength() {
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)
    if (!satellitePosition) return
    let satelliteCartographic =
      Cesium.Cartographic.fromCartesian(satellitePosition)
    let satelliteAlt = satelliteCartographic.height
    return satelliteAlt
  }
  // 更新位置callbackproperty函数
  function changePosition() {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
    if (!tempPosition) return
    let tempCartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
    let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
    let tempAlt = tempCartographic.height
    let res = new Cesium.Cartesian3.fromDegrees(tempLng, tempLat, tempAlt / 2.0)
    return res
  }
  // corridor位置更新,每次更新经纬度

  let index = 0
  var heading = Cesium.Math.toRadians(60)
  var pitch = 0
  var roll = 0
  let orientation

  function changeOrientation() {
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
    let position
    // var YGEntity = viewer.entities.getById(satelliteCylinderId)
    var YGPosition = satellite.position.getValue(viewer.clock.currentTime)
    if (!YGPosition) return
    var YGCartographic = Cesium.Cartographic.fromCartesian(YGPosition)
    let starLinkLng = Cesium.Math.toDegrees(YGCartographic.longitude)
    let starLinkLat = Cesium.Math.toDegrees(YGCartographic.latitude)
    let starLinkAlt = YGCartographic.height
    position = new Cesium.Cartesian3.fromDegrees(
      starLinkLng,
      starLinkLat,
      starLinkAlt
    )
    orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr)
    return orientation
  }

  let corridorArray = []
  let corridorArrayLog = []
  //console.log("time1",time1);
  let corridorChange = true

  function changePositionArray(time) {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
    if (!tempPosition) return
    let tempCartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
    let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
    if (corridorChange) {
      // if (corridorArray.length > 2) {
      //   corridorArray.splice(2, 2)
      // }
      corridorArrayLog.push(tempLng)
      corridorArrayLog.push(tempLat)
    }
    let sp = window.EarthViewer.clock.multiplier
    let maxL = sp == 0 ? 100 : 1500 / Math.abs(sp)
    if (corridorArrayLog.length > maxL) {
      corridorArrayLog.splice(0, 2)
    }
    let len = corridorArrayLog.length
    corridorArray = [
      ...corridorArrayLog.slice(0, 2),
      ...corridorArrayLog.slice(len - 2, len)
    ]
    return Cesium.Cartesian3.fromDegreesArray(corridorArray)
  }

  let radius =
    Number(options.scanRange) > -1 ? Number(options.scanRange) * 1000 : 86000
  viewer.entities.add({
    id: satelliteCylinderId,
    position: new Cesium.CallbackProperty(changePosition, false),
    orientation: new Cesium.CallbackProperty(changeOrientation, false),
    corridor: {
      positions: new Cesium.CallbackProperty(changePositionArray, false),
      extrudedHeight: 100.0,
      width: width,
      // width: wid,
      cornerType: Cesium.CornerType.MITERED,
      // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      // height: 100,
      // extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      material: new this.Cesium.Color(1.0, 0.0, 0.0, 0.4)
    }
  })

  // 初始hpr
  heading = Cesium.Math.toRadians(45)
  // let verti = Cesium.Math.PI / 2
  pitch = Cesium.Math.toRadians(180.0)
  roll = 0.0
  let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
  // 获取初始四元数
  if (!satellitePosition) return
  let quaternion = Cesium.Transforms.headingPitchRollQuaternion(
    satellitePosition,
    hpr
  )
  let lineColor = new this.Cesium.Color(0.0, 1.0, 1.0, 1.0)
  // let has = this.satelliteActors.find(item => item.satelliteId == satelliteCylinderId)
  // if (has) {
  //   console.log('已有');
  //   return
  // }
  //  创建视锥体
  let frustumAreaMonitoring = new CreateFrustumPure({
    Cesium: Cesium,
    viewer: viewer,
    position: satellitePosition,
    orientation: quaternion,
    // new Cesium.VelocityOrientationProperty(property)
    fov: 15,
    near: 0.1,
    far: satelliteAlt,
    aspectRatio: 0.3,
    radian: 20,
    lineColor: new this.Cesium.Color(1, 0.0, 0.0, 1),
    scanColor: new this.Cesium.Color(1, 0.0, 0.0, 1),
    scanColor2: new Cesium.Cartesian4(4.0, 0.0, 0.0),
    frustumName: satelliteCylinderId
  })
  let pc = satelliteCylinderId

  window[pc] = frustumAreaMonitoring

  // 根据两点计算线的走向
  let lastH = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)

  function getHeading(pointA, pointB) {
    //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA)
    //向量AB
    const positionvector = Cesium.Cartesian3.subtract(
      pointB,
      pointA,
      new Cesium.Cartesian3()
    )
    //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
    //AB为世界坐标中的向量
    //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
    const vector = Cesium.Matrix4.multiplyByPointAsVector(
      Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
      positionvector,
      new Cesium.Cartesian3()
    )
    if (vector.x == 0) {
      return lastH
    }
    //归一化
    const direction = Cesium.Cartesian3.normalize(
      vector,
      new Cesium.Cartesian3()
    )
    //heading
    // const heading = Math.atan2(direction.y, direction.x);
    const heading =
      Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO
    lastH = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
    return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
  }

  let beforeTime, position // 用来保存定时器上一次的时间和位置
  let frustumAreaMonitoringTime = setInterval(() => {
    // 获取卫星当前位置
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)
    if (!satellitePosition) {
      clearInterval(frustumAreaMonitoringTime)
      return
    }
    // 根据卫星走向获取其orientation
    // let position = new Cesium.SampledProperty(Cesium.Cartesian3);
    if (beforeTime) {
      // 视锥扫描变化的角度heading
      heading = getHeading(position, satellitePosition)
      // hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      let verti = Cesium.Math.PI / 2
      hpr = new Cesium.HeadingPitchRoll(heading - verti, pitch, roll)
      quaternion = Cesium.Transforms.headingPitchRollQuaternion(
        satellitePosition,
        hpr
      )
      frustumAreaMonitoring.update(satellitePosition, quaternion)
    }
    // 保存此次更新卫星的位置和时间
    beforeTime = currentTime
    position = satellite.position.getValue(beforeTime)
  }, 20)

  // 保存动作
  var obj2 = Object.assign({}, frustumAreaMonitoring)
  this.satelliteActors.push({
    actorName: '红外',
    satelliteId: options.satelliteId,
    frustum: obj2,
    interval: frustumAreaMonitoringTime
  })
}

/**
 * SAR 角度偏移
 * @param {string} satelliteId 卫星实体id
 */
SatelliteSixActController.prototype.SarPitchScan = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer

  let satelliteCylinderId = options.satelliteId + 'CylinderSar' // 信号和扫描带
  let satelliteScan = viewer.entities.getById(satelliteCylinderId)
  if (satelliteScan) return
  let satellite = options.entity

  // 计算卫星当前高度
  let currentTime = viewer.clock.currentTime
  let satellitePosition = satellite.position.getValue(currentTime)
  let satelliteCartographic =
    Cesium.Cartographic.fromCartesian(satellitePosition)
  let satelliteAlt = satelliteCartographic.height

  // corridor位置更新,每次更新经纬度

  let index = 0
  var heading = Cesium.Math.toRadians(60)
  var pitch = 0
  var roll = 0
  let orientation

  // 初始hpr
  heading = Cesium.Math.toRadians(45)
  // let verti = Cesium.Math.PI / 2
  pitch = Cesium.Math.toRadians(180.0)
  roll = 0.0
  let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
  // 获取初始四元数
  if (!satellitePosition) return
  let quaternion = Cesium.Transforms.headingPitchRollQuaternion(
    satellitePosition,
    hpr
  )
  let lineColor = new this.Cesium.Color(0.0, 1.0, 1.0, 1.0)
  let has = this.satelliteActors.find(
    (item) => item.satelliteId == satelliteCylinderId
  )
  if (has) {
    console.log('已有')
    return
  }
  //  创建视锥体
  let frustumAreaMonitoring = new CreateFrustumPure({
    Cesium: Cesium,
    viewer: viewer,
    position: satellitePosition,
    orientation: quaternion,
    // new Cesium.VelocityOrientationProperty(property)
    fov: 15,
    near: 0.1,
    far: satelliteAlt * 2,
    aspectRatio: 2,
    radian: 20,
    flowSpeed: -2,
    lineColor: new this.Cesium.Color(0.9, 0.9, 0.9, 1),
    scanColor: new this.Cesium.Color(0.9, 0.9, 0.9, 1),
    scanColor2: new Cesium.Cartesian4(4.0, 4.0, 4.0),
    frustumName: satelliteCylinderId
  })
  let pc = satelliteCylinderId

  window[pc] = frustumAreaMonitoring

  // 根据两点计算线的走向
  let lastH = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)

  function getHeading(pointA, pointB) {
    //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA)
    //向量AB
    const positionvector = Cesium.Cartesian3.subtract(
      pointB,
      pointA,
      new Cesium.Cartesian3()
    )
    //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
    //AB为世界坐标中的向量
    //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
    const vector = Cesium.Matrix4.multiplyByPointAsVector(
      Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
      positionvector,
      new Cesium.Cartesian3()
    )
    if (vector.x == 0) {
      return lastH
    }
    //归一化
    const direction = Cesium.Cartesian3.normalize(
      vector,
      new Cesium.Cartesian3()
    )
    //heading
    // const heading = Math.atan2(direction.y, direction.x);
    const heading =
      Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO
    lastH = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
    return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
  }
  // viewer.scene.globe.depthTestAgainstTerrain = true
  let fovCenter = satellite.position.getValue(viewer.clock.currentTime)
  let beforeTime, position // 用来保存定时器上一次的时间和位置
  let frustumAreaMonitoringTime = setInterval(() => {
    // 获取卫星当前位置
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)
    if (!satellitePosition) {
      clearInterval(frustumAreaMonitoringTime)
      return
    }
    // 根据卫星走向获取其orientation
    // let position = new Cesium.SampledProperty(Cesium.Cartesian3);
    if (beforeTime) {
      // 视锥扫描变化的角度heading
      heading = getHeading(position, satellitePosition)
      // hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      let verti = Cesium.Math.PI / 2
      hpr = new Cesium.HeadingPitchRoll(
        heading,
        pitch + Cesium.Math.toRadians(30.0),
        roll
      )
      quaternion = Cesium.Transforms.headingPitchRollQuaternion(
        satellitePosition,
        hpr
      )
      frustumAreaMonitoring.update(satellitePosition, quaternion)
    }
    // 保存此次更新卫星的位置和时间
    beforeTime = currentTime
    position = satellite.position.getValue(beforeTime)

    let hpr1 = new Cesium.HeadingPitchRoll(
      heading,
      pitch + Cesium.Math.toRadians(120),
      roll
    )
    const orientation1 = Cesium.Transforms.headingPitchRollQuaternion(
      satellitePosition,
      hpr1
    )
    const matrix3 = Cesium.Matrix3.fromQuaternion(orientation1)
    let direction = Cesium.Matrix3.multiplyByVector(
      matrix3,
      Cesium.Cartesian3.UNIT_X,
      new Cesium.Cartesian3()
    )
    let ray = new Cesium.Ray(satellitePosition, direction)
    fovCenter = viewer.scene.globe.pick(ray, viewer.scene)
  }, 20)
  // 获取锥形宽度
  let bigwidth = satelliteAlt * Math.tan(Math.PI / 4)
  let smallwidth = satelliteAlt * Math.tan(Math.PI / 6)
  let width = bigwidth - smallwidth
  let corridorArray = []
  let corridorArrayLog = []
  //console.log("time1",time1);
  let corridorChange = true

  function changePositionArray(time) {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
    if (!tempPosition) return
    let tempCartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
    let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
    if (corridorChange) {
      // if (corridorArray.length > 2) {
      //   corridorArray.splice(2, 2)
      // }
      corridorArrayLog.push(tempLng)
      corridorArrayLog.push(tempLat)
    }
    let sp = window.EarthViewer.clock.multiplier
    let maxL = sp == 0 ? 100 : 1500 / Math.abs(sp)
    if (corridorArrayLog.length > maxL) {
      corridorArrayLog.splice(0, 2)
    }
    let len = corridorArrayLog.length
    corridorArray = [
      ...corridorArrayLog.slice(0, 2),
      ...corridorArrayLog.slice(len - 2, len)
    ]
    return Cesium.Cartesian3.fromDegreesArray(corridorArray)
  }

  // viewer.entities.add({
  //   id: satelliteCylinderId,
  //   corridor: {
  //     positions: new Cesium.CallbackProperty(changePositionArray, false),
  //     extrudedHeight: 100.0,
  //     width: width,
  //     cornerType: Cesium.CornerType.MITERED,
  //     material: new this.Cesium.Color(1.0, 1.0, 1.0, 0.4)
  //   }
  // })

  // 保存动作
  var obj2 = Object.assign({}, frustumAreaMonitoring)
  this.satelliteActors.push({
    actorName: 'SAR',
    satelliteId: options.satelliteId,
    frustum: obj2,
    interval: frustumAreaMonitoringTime
  })
}

/**
 * 详查
 * @param {string} satelliteId 卫星实体id
 * @param {Date} date 事件触发时间
 *
 */
SatelliteSixActController.prototype.closelookreconnaissance = function (
  satelliteId,
  entity
) {
  let Cesium = this.Cesium
  let viewer = this.viewer

  // 清除三角锥、条带和定时器
  this.removeSingleSatelliteActor({
    actorName: '详查',
    satelliteId: satelliteId
  })
  viewer.entities.removeById(satelliteId + 'closelookreconnaissance')

  // 获取卫星实体
  let satellite = entity
  // 验证对象是否存在
  if (!Cesium.defined(satellite)) {
    console.error('SatelliteEntity is required.')
    return
  }
  // satellite.description = eventName

  viewer.entities.removeById(satelliteId + 'closelookreconnaissance')

  // 计算条带起始位置
  let corridorArray = []
  let tempPosition1 = satellite.position.getValue(viewer.clock.currentTime)
  let tempCartographic1 = Cesium.Cartographic.fromCartesian(tempPosition1)
  let tempLng1 = Cesium.Math.toDegrees(tempCartographic1.longitude)
  let tempLat1 = Cesium.Math.toDegrees(tempCartographic1.latitude)
  let tempAlt1 = tempCartographic1.height
  corridorArray.push(tempLng1)
  corridorArray.push(tempLat1)

  // 初始hpr
  let heading = Cesium.Math.toRadians(90)
  let pitch = Cesium.Math.toRadians(180.0)
  let roll = 0.0
  let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
  // 获取初始四元数
  let satellitePosition = satellite.position.getValue(viewer.clock.currentTime)
  let quaternion = Cesium.Transforms.headingPitchRollQuaternion(
    satellitePosition,
    hpr
  )
  let lineColor = new this.Cesium.Color(1.0, 0.0, 1.0, 1.0)
  //  创建视锥体
  let frustumCloselookreconnaissance = new CreateFrustum({
    Cesium: Cesium,
    viewer: viewer,
    position: satellitePosition,
    orientation: quaternion,
    fov: 40,
    near: 10,
    far: tempAlt1,
    aspectRatio: 0.001,
    radian: 30,
    lineColor: lineColor,
    scanColor: new this.Cesium.Cartesian4(2.0, 4.0, 2.0),
    scanColor2: new this.Cesium.Cartesian4(2.0, 4.0, 2.0),
    frustumName: satelliteId + 'xiangcha'
  })
  let xc = satelliteId + 'xiangcha'
  window[xc] = frustumCloselookreconnaissance

  // 根据两点计算线的走向
  let lastH

  function getHeading(pointA, pointB) {
    //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA)
    //向量AB
    const positionvector = Cesium.Cartesian3.subtract(
      pointB,
      pointA,
      new Cesium.Cartesian3()
    )
    //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
    //AB为世界坐标中的向量
    //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
    const vector = Cesium.Matrix4.multiplyByPointAsVector(
      Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
      positionvector,
      new Cesium.Cartesian3()
    )
    if (vector.x == 0) {
      return lastH
    }
    //归一化
    const direction = Cesium.Cartesian3.normalize(
      vector,
      new Cesium.Cartesian3()
    )
    //heading
    // const heading = Math.atan2(direction.y, direction.x);
    const heading =
      Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO
    lastH = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
    return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
  }

  let beforeTime, position // 用来保存定时器上一次的时间和位置
  let closelookreconnaissanceTime = setInterval(() => {
    // 获取卫星当前位置
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)

    // 根据卫星走向获取其orientation
    // let position = new Cesium.SampledProperty(Cesium.Cartesian3);
    if (beforeTime) {
      // 视锥扫描变化的角度heading
      heading = getHeading(position, satellitePosition)
      // hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      hpr = new Cesium.HeadingPitchRoll(
        heading - (Math.PI / 180) * 90,
        pitch,
        roll
      )
      quaternion = Cesium.Transforms.headingPitchRollQuaternion(
        satellitePosition,
        hpr
      )
      frustumCloselookreconnaissance.update(satellitePosition, quaternion)
    }
    // 保存此次更新卫星的位置和时间
    beforeTime = currentTime
    position = satellite.position.getValue(beforeTime)
  }, 20)

  // 获取锥形宽度
  let corridorChange = true
  let width = tempCartographic1.height * Math.tan(Math.PI / 6) * 2.0

  function changePositionArray() {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
    if (!tempPosition) return
    let tempCartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
    let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
    if (corridorChange) {
      if (corridorArray.length > 2) {
        corridorArray.splice(2, 2)
      }
      corridorArray.push(tempLng)
      corridorArray.push(tempLat)
    }
    return Cesium.Cartesian3.fromDegreesArray(corridorArray)
  }
  viewer.entities.removeById(satelliteId + 'closelookreconnaissance')
  // 创建条带
  viewer.entities.add({
    id: satelliteId + 'closelookreconnaissance',
    // position: new this.Cesium.CallbackProperty(changePosition, false),
    // orientation: new this.Cesium.CallbackProperty(changeOrientation, false),
    corridor: {
      positions: new Cesium.CallbackProperty(changePositionArray, false),
      // height: 100,
      width: width,
      extrudedHeight: 10.0,
      cornerType: Cesium.CornerType.MITERED,
      material: new Cesium.ImageMaterialProperty({
        image: 'static/image/绿色矩形2.png'
        // color: Cesium.Color.YELLOW,
        // repeat : new Cesium.Cartesian2(1, 1)
      })
      // outlineColor: Cesium.Color.PINK.withAlpha(0.1),
      // outline: true, // height required for outlines to display
    }
  })
  // 保存动作
  var obj2 = Object.assign({}, frustumCloselookreconnaissance)
  this.satelliteActors.push({
    actorName: '详查',
    satelliteId: satelliteId,
    frustum: obj2,
    interval: closelookreconnaissanceTime
  })
}

/**
 * 区域扫描
 * @param {string} config.satelliteId  卫星id
 * @param {Date} config.startTime  事件开始时间
 * @param {string} config.eventName  事件名称
 * @param {Number} config.scanRadian  扫描角度-可选参数-默认值15
 * @param {Number} config.fov  视锥的视场角度-可选参数-默认值15
 * @param {Number} config.scanSpeed 扫描速度-可选参数-默认值0.01
 */
SatelliteSixActController.prototype.areaScan = function (config) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  let that = this
  // 删除视锥体、定时器
  this.removeSingleSatelliteActor({
    actorName: '区域扫描',
    satelliteId: config.satelliteId
  })
  // 持续时间
  // let duration = Cesium.JulianDate.addSeconds(
  //   corridorTime,
  //   180,
  //   new Cesium.JulianDate()
  // )

  // 获取卫星实体
  this.viewer.dataSources._dataSources.forEach((item) => {
    if (item.name == config.satelliteId) {
      let satellite = item.entities.getById(config.satelliteId)
      // 验证实体是否存在
      if (!this.Cesium.defined(satellite)) {
        console.error('SatelliteEntity is required.')
        return
      }
      satellite.description = '区域扫描'
      // 事件开始时间
      // let startTime = Cesium.JulianDate.fromDate(config.startTime)

      // let actorStartTime = Cesium.JulianDate.fromDate(date);  //获取动作开始时间
      let startPositiontrack = satellite.position.getValue(
        viewer.clock.currentTime
      )
      let startCartographic =
        Cesium.Cartographic.fromCartesian(startPositiontrack)
      let startLng = Cesium.Math.toDegrees(startCartographic.longitude)
      let startLat = Cesium.Math.toDegrees(startCartographic.latitude)
      let startAlt = startCartographic.height

      let r = config.scanRadian ? config.scanRadian / 2 : 15 //扫描角度的一半
      let fov = config.fov ? config.fov : 15 //视锥的视场角度
      let scanSpeed = config.scanSpeed ? config.scanSpeed / 100 : 0.01 // 度/秒换算为度/0.01秒 扫描速度

      let heading = Cesium.Math.toRadians(0.0)
      let pitch = Cesium.Math.toRadians(180.0)
      let roll = 0.0
      let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
      // 获取初始四元数
      let satellitePosition = satellite.position.getValue(
        viewer.clock.currentTime
      )
      let quaternion = Cesium.Transforms.headingPitchRollQuaternion(
        satellitePosition,
        hpr
      )
      //  创建视锥体
      let createFrustum = new CreateFrustum({
        viewer: viewer,
        Cesium: Cesium,
        position: satellitePosition,
        // position: frustumPosition,
        // orientation: new Cesium.CallbackProperty(frustumOri, false),
        orientation: quaternion,
        fov: fov,
        near: 10,
        far: startAlt,
        aspectRatio: 0.001,
        frustumName: config.satelliteId + 'frustum'
      })
      let bs = config.satelliteId + 'frustum'
      window[bs] = createFrustum

      // 根据两点计算线的走向
      let lastH

      function getHeading(pointA, pointB) {
        //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA)
        //向量AB
        const positionvector = Cesium.Cartesian3.subtract(
          pointB,
          pointA,
          new Cesium.Cartesian3()
        )
        //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
        //AB为世界坐标中的向量
        //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
        const vector = Cesium.Matrix4.multiplyByPointAsVector(
          Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
          positionvector,
          new Cesium.Cartesian3()
        )
        if (vector.x == 0) {
          return lastH
        }
        //归一化
        const direction = Cesium.Cartesian3.normalize(
          vector,
          new Cesium.Cartesian3()
        )
        //heading
        const heading =
          Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO
        lastH = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
        return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
      }
      let corridorArray = []
      // 视锥路径
      function corrArray() {
        let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
        if (!tempPosition && corridorArray) {
          if (corridorArray == false) return
          return Cesium.Cartesian3.fromDegreesArray(corridorArray)
        }

        let hpr = new Cesium.HeadingPitchRoll(
          heading,
          pitch + Cesium.Math.toRadians(90),
          roll
        )
        let orientation = Cesium.Transforms.headingPitchRollQuaternion(
          tempPosition,
          hpr
        )
        let matrix3 = Cesium.Matrix3.fromQuaternion(orientation)
        let direction = Cesium.Matrix3.multiplyByVector(
          matrix3,
          Cesium.Cartesian3.UNIT_X,
          new Cesium.Cartesian3()
        )
        let ray = new Cesium.Ray(tempPosition, direction)
        let origin = viewer.scene.globe.pick(ray, viewer.scene)
        if (!origin) {
          if (corridorArray == false) return
          return Cesium.Cartesian3.fromDegreesArray(corridorArray)
        }
        let tempCartographic = Cesium.Cartographic.fromCartesian(origin)
        let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
        let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
        corridorArray.push(tempLng)
        corridorArray.push(tempLat)
        return Cesium.Cartesian3.fromDegreesArray(corridorArray)
      }
      viewer.entities.add({
        id: config.satelliteId + 'scan1',
        corridor: {
          positions: new Cesium.CallbackProperty(corrArray, false),
          extrudedHeight: 10.0,
          width: 5000.0,
          cornerType: Cesium.CornerType.MITERED,
          material: Cesium.Color.YELLOW
          // outlineColor: Cesium.Color.PINK.withAlpha(0.1),
          // outline: true, // height required for outlines to display
        }
      })
      // let frustumTimer = ''
      // 保存动作

      let r1 = 0 // 每次变化角度
      let flagadd = true // 判断扫描方向
      let beforePosition, beforeTime // 用来保存定时器上一次的位置和时间
      let frustumTimer = setInterval(() => {
        let currentTime = viewer.clock.currentTime
        // 获取视锥体当前位置、姿态
        if (beforeTime) {
          let diff = Cesium.JulianDate.secondsDifference(
            currentTime,
            beforeTime
          ) //cesium 距上次时间差
          let diffchange = (diff / 0.01) * scanSpeed //此次变化角度  时间差换算单位  时间*速度 度/10微秒
          // 判断摆动方向
          if (r1 <= -1 * r) {
            flagadd = true
          } else if (r1 >= r) {
            flagadd = false
          }
          if (flagadd) {
            r1 += diffchange
            pitch = Cesium.Math.toRadians(180.0 + r1)
          } else {
            r1 -= diffchange
            pitch = Cesium.Math.toRadians(180.0 + r1)
          }
          // pitch = Cesium.Math.toRadians(r1);
          // pitch += 0.01;
          // 获取卫星当前位置
          let satellitePosition = satellite.position.getValue(currentTime)
          // 视锥扫描变化的角度heading
          // heading = getHeading(position, satellitePosition);
          heading = getHeading(beforePosition, satellitePosition)
          hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
          // heading = Cesium.HeadingPitchRoll.fromQuaternion(satellite.orientation.getValue(currentTime)).heading;
          // hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
          quaternion = Cesium.Transforms.headingPitchRollQuaternion(
            satellitePosition,
            hpr
          )
          // 更新视锥体
          createFrustum.update(satellitePosition, quaternion)
        }
        // 保存此次更新卫星的位置和时间
        beforeTime = currentTime
        beforePosition = satellite.position.getValue(beforeTime)
      }, 10)
      console.log('定时器', frustumTimer)
      var obj2 = Object.assign({}, createFrustum)
      this.satelliteActors.push({
        actorName: '区域扫描',
        satelliteId: config.satelliteId,
        frustum: obj2,
        interval: frustumTimer
      })
      console.log(this.satelliteActors)
      // let viewerClockL = viewer.clock.onTick.addEventListener(() => {
      //   let res = Cesium.JulianDate.compare(viewer.clock.currentTime, duration)
      //   if (res >= 0) {
      //    console.log(satelliteId + '区域扫描结束')
      //     clearInterval(frustumTimer)
      //     createFrustum.clear()
      //     // corridorChange = false;
      //     satellite.description = ''
      //     viewerClockL()
      //   }
      // })
    }
  })
}

/**
 * 载荷开机
 * @param {string} config.satelliteId  卫星id
 */
SatelliteSixActController.prototype.turnOnPure = function (options) {
  //  console.log(options)
  let Cesium = this.Cesium
  let viewer = this.viewer
  let satelliteBox1Id = options.satelliteId + '载荷开机Box1'
  let satelliteBox2Id = options.satelliteId + '载荷开机Box2'

  let ds = ''
  let satellite = ''
  let dataSource = viewer.dataSources.getByName(options.satelliteType)
  satellite = dataSource[0].entities.getById(options.satelliteId)
  console.log(satellite)
  if (!satellite) {
    if (options.czmlSource) {
      ds = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      // ds = viewer.dataSources.getByName(options.satelliteId)[0]
      if (!ds) {
        return
      }
      satellite = ds.entities.getById(options.satelliteId)
    } else {
      ds = viewer.dataSources.getByName(options.satelliteId)[0]
      // 01 验证实体存在
      // ds = viewer.dataSources.getByName(options.satelliteId)[0]
      if (!ds) {
        return
      }
      satellite = ds.entities.values[0]
    }
  }

  //  satellite = ds.entities.values[0]
  // if (!Cesium.defined(satellite)) {
  //   console.error('SatelliteEntity is required.' + options.satelliteId)
  //   return
  // }
  // this.blingLabel({
  //   entity: satellite,
  //   satelliteId: options.satelliteId,
  //   color: new Cesium.Color(0 / 255, 255 / 255, 0, 1)
  // })
  //this.setEffect(satellite, '载荷开机')
  satellite.description = '载荷开机'
  // 02 封装callback函数
  let silhouetteColorAlpha = 0
  let silhouetteColorControl = true
  let silhouetteColor
  var _updateSilhouetteColor = function () {
    if (silhouetteColorControl) {
      silhouetteColorAlpha += 0.01
      if (silhouetteColorAlpha >= 1) {
        silhouetteColorControl = false
      }
    } else {
      silhouetteColorAlpha -= 0.01
      if (silhouetteColorAlpha <= 0) {
        silhouetteColorControl = true
      }
    }
    silhouetteColor = new Cesium.Color(
      138.0 / 255.0,
      (227.0 + silhouetteColorAlpha * 23.0) / 250.0,
      (227.0 + silhouetteColorAlpha * 23.0) / 250.0,
      silhouetteColorAlpha
    )
    return silhouetteColor
  }
  let silhouetteSize = 0
  let silhouetteSizeControl = true

  function _updateSilhouetteSize() {
    if (silhouetteSizeControl) {
      silhouetteSize += 0.5
      if (silhouetteSize >= 12) {
        silhouetteSizeControl = false
      }
    } else {
      silhouetteSize -= 0.5
      if (silhouetteSize <= 0) {
        silhouetteSizeControl = true
      }
    }
    return silhouetteSize
  }
  // 03 配置卫星当前状态下的显示效果
  satellite.model.silhouetteColor = new Cesium.CallbackProperty(
    _updateSilhouetteColor,
    false
  )
  satellite.model.silhouetteSize = new Cesium.CallbackProperty(
    _updateSilhouetteSize,
    false
  ) //设置模型外轮廓线宽度
  satellite.model.colorBlendAmount = 0.0 //不混合颜色

  // 保存动作
  this.satelliteActors.push({
    actorName: '载荷开机',
    satelliteId: options.satelliteId
  })
}

/**
 * 文字闪烁
 * @param {string} config.color  颜色
 * @param {Cesium.color} config.satelliteId  卫星id
 */
SatelliteSixActController.prototype.blingLabel = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  let fillColor = options.color || new Cesium.Color(255 / 255, 0 / 255, 0, 1)
  let labelId = options.satelliteId + 'blingLabel'
  let labelText = options.text || '载荷开机'
  let entity = options.entity
  let duration = options.duration || 6000
  viewer.entities.add({
    id: labelId,
    position: entity.position,
    label: {
      text: labelText,
      show: new Cesium.CallbackProperty(changeShow(), false),
      font: 'bold 100px MicroSoft YaHei',
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: fillColor,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 5,
      pixelOffset: new Cesium.Cartesian2(0, -25),
      scaleByDistance: new Cesium.NearFarScalar(10000, 0.9, 20e5, 0.2),
      showBackground: true,
      backgroundColor: new Cesium.Color(255 / 255, 0 / 255, 0 / 255, 0.1)
    }
  })
  setTimeout(() => {
    viewer.entities.removeById(labelId)
    //this.removeEffect(entity)
  }, duration)

  function changeShow() {
    let number = 1
    let flag = true

    const show1 = () => {
      if (flag) {
        number -= 0.08
        if (number <= 0) {
          flag = false
        }
      } else {
        number += 0.08
        if (number >= 1) {
          flag = true
        }
      }
      return number >= 0.5
    }
    return show1
  }
}

/**
 * 光学卫星扫描结束
 * @param {string} satelliteId  卫星id
 */
SatelliteSixActController.prototype.opticalSatelliteScanEnd = function (
  options
) {
  if (!options.satelliteId) {
    console.error('卫星id不合法.' + options.satelliteId)
    return
  }
  this.viewer.entities.removeById(options.satelliteId + '光学卫星扫描Cylinder')
  // 删除视锥体、定时器
  let ds = ''
  let satellite = options.entity
  if (!satellite) {
    return
  }
  //this.removeEffect(satellite)
  satellite.description = ''
  let satelliteActorInfo = this.satelliteActors.find((item) => {
    return item.satelliteId == options.satelliteId
  })
  let infoIndex = this.satelliteActors.findIndex((item) => {
    return item.satelliteId == options.satelliteId
  })
  if (!satelliteActorInfo) return
  //this.removeEffect(satellite)
  if (satelliteActorInfo.frustum) {
    clearInterval(satelliteActorInfo.interval)
    // let wea = this.viewer.scene.postRender.removeEventListener(
    //   satelliteActorInfo.interval
    // )
    // console.log(wea);
    let bs = satelliteActorInfo.satelliteId + '光学卫星扫描Cylinder'
    // console.log(window[bs].clear)
    if (window[bs].clear) {
      window[bs].clear()
    }
    this.satelliteActors.splice(infoIndex, 1)
  }
}

/**
 * 合成孔径雷达扫描结束
 * @param {string} satelliteId  卫星id
 */
SatelliteSixActController.prototype.sarSatelliteScanEnd = function (options) {
  if (!options.satelliteId) {
    console.error('卫星id不合法.' + options.satelliteId)
    return
  }
  this.viewer.entities.removeById(options.satelliteId + 'CylinderSar')
  this.viewer.entities.removeById(options.satelliteId + 'CylinderReSar')
  // 删除视锥体、定时器
  let ds = ''
  let satellite = options.entity
  if (!satellite) {
    return
  }
  //this.removeEffect(satellite)
  satellite.description = ''
  // viewer.dataSources._dataSources.forEach((item) => {
  //   if (item.name == satelliteId) {
  //     let satellite = item.entities.getById(satelliteId)
  //     satellite.description = ''
  //   }
  // })
}

/**
 * 电子扫描结束
 * @param {string} satelliteId 卫星id
 */
SatelliteSixActController.prototype.electronicSatelliteScanEnd = function (
  options
) {
  if (!options.satelliteId) {
    console.error('卫星id不合法.' + options.satelliteId)
    return
  }

  this.viewer.entities.removeById(options.satelliteId + 'CylinderDZ')
  this.viewer.entities.removeById(options.satelliteId + 'Ellipse')

  let ds = ''
  let satellite = options.entity
  if (!satellite) {
    return
  }
  //this.removeEffect(satellite)
  satellite.model.silhouetteSize = 0.0
}

/**
 * 红外扫描结束
 * @param {string} satelliteId 卫星id
 */
SatelliteSixActController.prototype.redMonitoringEnd = function (options) {
  if (!options.satelliteId) {
    console.error('卫星id不合法.' + options.satelliteId)
    return
  }

  this.viewer.entities.removeById(options.satelliteId + '红外扫描Cylinder')

  let ds = ''
  let satellite = options.entity
  if (!satellite) {
    return
  }
  let satelliteActorInfo = this.satelliteActors.find((item) => {
    return item.satelliteId == options.satelliteId
  })
  let infoIndex = this.satelliteActors.findIndex((item) => {
    return item.satelliteId == options.satelliteId
  })
  if (!satelliteActorInfo) return
  //this.removeEffect(satellite)
  if (satelliteActorInfo.frustum) {
    clearInterval(satelliteActorInfo.interval)
    // let wea = this.viewer.scene.postRender.removeEventListener(
    //   satelliteActorInfo.interval
    // )
    // console.log(wea);
    let bs = satelliteActorInfo.satelliteId + '红外扫描Cylinder'
    // console.log(window[bs].clear)
    if (window[bs].clear) {
      window[bs].clear()
    }
    this.satelliteActors.splice(infoIndex, 1)
  }
  //this.removeEffect(satellite)
  satellite.model.silhouetteSize = 0.0
}

/**
 * SAR()结束
 * @param {string} satelliteId 卫星id
 */
SatelliteSixActController.prototype.SarPitchScanEnd = function (options) {
  if (!options.satelliteId) {
    console.error('卫星id不合法.' + options.satelliteId)
    return
  }

  this.viewer.entities.removeById(options.satelliteId + 'CylinderSar')

  let ds = ''
  let satellite = options.entity
  if (!satellite) {
    return
  }
  let satelliteActorInfo = this.satelliteActors.find((item) => {
    return item.satelliteId == options.satelliteId
  })
  let infoIndex = this.satelliteActors.findIndex((item) => {
    return item.satelliteId == options.satelliteId
  })
  if (!satelliteActorInfo) return
  //this.removeEffect(satellite)
  if (satelliteActorInfo.frustum) {
    clearInterval(satelliteActorInfo.interval)
    // let wea = this.viewer.scene.postRender.removeEventListener(
    //   satelliteActorInfo.interval
    // )
    // console.log(wea);
    let bs = satelliteActorInfo.satelliteId + 'CylinderSar'
    // console.log(window[bs].clear)
    if (window[bs].clear) {
      window[bs].clear()
    }
    this.satelliteActors.splice(infoIndex, 1)
  }
  //this.removeEffect(satellite)
  satellite.model.silhouetteSize = 0.0
}

/**
 * 结束
 * @param {string} satelliteId 卫星id
 */
SatelliteSixActController.prototype.radarScanEnd = function (options) {
  if (!options.satelliteId) {
    console.error('卫星id不合法.' + options.satelliteId)
    return
  }

  this.viewer.entities.removeById(options.satelliteId + 'radarScan')
  this.viewer.entities.removeById(options.satelliteId + 'radarReScan')

  let ds = ''
  let satellite = options.entity
  if (!satellite) {
    return
  }
  //this.removeEffect(satellite)
  satellite.model.silhouetteSize = 0.0
}

/**
 * 结束
 * @param {string} params.satelliteId  卫星实体id
 * @param {obj} params.frustum  视锥体对象
 * @param {obj} params.inteval  定时器
 */
SatelliteSixActController.prototype.hyperspectralScanEnd = function (options) {
  if (!options.satelliteId) {
    console.error('卫星id不合法.' + options.satelliteId)
    return
  }
  this.viewer.entities.removeById(options.satelliteId + 'hyperspectral')
  let satellite = options.entity
  // 验证实体是否存在
  if (!Cesium.defined(satellite)) {
    console.error('SatelliteEntity is required.')
    return
  }
  satellite.description = ''
  let satelliteActorInfo = this.satelliteActors.find((item) => {
    return item.satelliteId == options.satelliteId
  })
  let infoIndex = this.satelliteActors.findIndex((item) => {
    return item.satelliteId == options.satelliteId
  })
  if (!satelliteActorInfo) return
  //this.removeEffect(satellite)
  if (satelliteActorInfo.frustum) {
    clearInterval(satelliteActorInfo.interval)
    // let wea = this.viewer.scene.postRender.removeEventListener(
    //   satelliteActorInfo.interval
    // )
    // console.log(wea);
    let bs = satelliteActorInfo.satelliteId + 'hyperspectral'
    // console.log(window[bs].clear)
    if (window[bs].clear) {
      window[bs].clear()
    }
    this.satelliteActors.splice(infoIndex, 1)
  }
}

/**
 * 详查结束
 * @param {string} params.satelliteId  卫星实体id
 * @param {obj} params.frustum  视锥体对象
 * @param {obj} params.interval  定时器
 */
SatelliteSixActController.prototype.closelookreconnaissanceEnd = function (
  options
) {
  for (let t = 0; t < this.satelliteActors.length; t++) {
    if (options.satelliteId == this.satelliteActors[t].satelliteId) {
      let params = this.satelliteActors[t]
      if (!params.satelliteId) {
        console.error('卫星id不合法.' + params.satelliteId)
        return
      }
      let a = this.viewer.entities.getById(
        params.satelliteId + 'closelookreconnaissance'
      )
      if (a) {
        this.viewer.entities.removeById(
          params.satelliteId + 'closelookreconnaissance'
        )
      }
      viewer.dataSources._dataSources.forEach((item) => {
        if (item.name == options.satelliteId) {
          let satellite = item.entities.getById(options.satelliteId)
          // 验证实体是否存在
          if (!Cesium.defined(satellite)) {
            console.error('SatelliteEntity is required.')
            return
          }
          satellite.description = ''
        }
      })
      if (params.frustum) {
        clearInterval(params.interval)
        let bs = params.satelliteId + 'xiangcha'
        window[bs].clear()
      }
    }
  }

  // if (!params.satelliteId) {
  //   console.error('卫星id不合法.' + params.satelliteId)
  //   return
  // }
  // this.viewer.entities.removeById(
  //   params.satelliteId + 'closelookreconnaissance'
  // )
  // if (params.frustum) {
  //   clearInterval(params.interval)
  //   params.frustum.clear()
  // }
}

/**
 * 区域扫描结束
 * @param {string} params.satelliteId  卫星id
 * @param {obj} params.frustum  视锥体对象
 * @param {obj} params.interval  定时器
 */
SatelliteSixActController.prototype.areaScanEnd = function (options) {
  for (let t = 0; t < this.satelliteActors.length; t++) {
    if (options.satelliteId == this.satelliteActors[t].satelliteId) {
      let params = this.satelliteActors[t]
      if (!params.satelliteId) {
        console.error('卫星id不合法.' + params.satelliteId)
        return
      }
      let a = this.viewer.entities.getById(params.satelliteId + 'scan1')
      if (a) {
        this.viewer.entities.removeById(params.satelliteId + 'scan1')
      }
      viewer.dataSources._dataSources.forEach((item) => {
        if (item.name == options.satelliteId) {
          let satellite = item.entities.getById(options.satelliteId)
          // 验证实体是否存在
          if (!Cesium.defined(satellite)) {
            console.error('SatelliteEntity is required.')
            return
          }
          satellite.description = ''
        }
      })
      if (params.frustum) {
        //  console.log(params.frustum)
        clearInterval(params.interval)
        let bs = params.satelliteId + 'frustum'
        window[bs].clear()
        // window.createFrustum.clear()
        // params.frustum.clear()
      }
    }
  }
}

//设置点闪光 以及字体效果
SatelliteSixActController.prototype.setEffect = function (satellite, name) {
  if (!satellite) {
    return
  }
  let flog = true
  let size = 3
  var updateSize = function () {
    if (flog) {
      size = size - 0.5
      if (size <= 0) {
        flog = false
      }
    } else {
      size = size + 0.5
      if (size >= 6) {
        flog = true
      }
    }
    return size
  }

  //设置样式
  // if (satellite.label) {
  //   satellite.label.show = true
  //   satellite.label.text = name //satellite.label.text + '-\n' + name
  //   // satellite.label.showBckground = true
  //   // satellite.label.backgroundColor = Cesium.Color.BLUE
  //   ;(satellite.label.showBackground = true),
  //     (satellite.label.backgroundColor = Cesium.Color.BLUE),
  //     (satellite.label.backgroundPadding = new Cesium.Cartesian2(7, 5)),
  //     (satellite.label.distanceDisplayCondition =
  //       new Cesium.DistanceDisplayCondition(1.0e3, 2e9))
  // }

  if (satellite.point) {
    satellite.point.pixelSize = new Cesium.CallbackProperty(updateSize, false)
    satellite.point.outlineColor = Cesium.Color.AQUA
    satellite.point.outlineWidth = 2
  }
}

//取消设置点闪光 以及字体效果
SatelliteSixActController.prototype.removeEffect = function (satellite) {
  if (!satellite) {
    return
  }
  // if (satellite.label) {
  //   let text = satellite.label.text
  //   satellite.label.text = text._value.split('-')[0]
  //   satellite.label.showBckground = false
  //   satellite.label.distanceDisplayCondition =
  //     new Cesium.DistanceDisplayCondition(0, 6e6)
  // }
  if (satellite.point) {
    satellite.point.pixelSize = 1
    satellite.point.outlineColor = Cesium.Color.AQUA
    satellite.point.outlineWidth = 0
  }
}

//添加信息提示框
SatelliteSixActController.prototype.loadPrompt = function (options) {
  if (!options.entity) {
    return
  }
  options.entity.model.show = true
  let pro = new Prompt(viewer, {
    type: 2,
    id: options.entityId,
    content: options.content,
    entityId: options.entityId,
    datasourceName: options.datasourceName,
    close: function () {
      return false
    } // 点击关闭按钮的回调函数
  })
  // options.entity.viewFrom = new Cesium.Cartesian3(-42080, -35715, 38079)
}
//删除信息提示框
SatelliteSixActController.prototype.removePrompt = function (options) {
  if (!options.entity) {
    return
  }
  options.entity.model.show = false
  //  viewer.trackedEntity =''
  let div = window.document.getElementById('prompt-' + options.satelliteId)
  if (div) {
    window.document.getElementById(viewer.container.id).removeChild(div)
  }
}
