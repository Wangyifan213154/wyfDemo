import { Array1to2 } from '@/utils/mapTools'

function GroundObjectManage(options) {
  this.Cesium = options.Cesium
  this.viewer = options.earth
  this.objArr = [] //存放对象
}

/**
 * 构建地面站
 *
 * @param {Array} options.landStationPosition  地面站位置-必填参数-经纬高 [110.0, 20.3, 0]
 * @param {string} options.landSationId  地面站id-必填参数
 * @param {string} options.landStationText  地面站名称-必填参数
 * @param {string} options.landStationIcon  地面站图标-选填参数-默认值 './static/billboard/地面站.png'
 */
GroundObjectManage.prototype.createLandStation = function (options) {
  if (!options.landStationPosition) {
    throw new DeveloperError(
      '地面站位置 is required.' + options.landStationPosition
    )
  }
  if (!options.landStationId) {
    throw new DeveloperError('地面站id is required.' + options.landStationId)
  }
  if (!options.landStationText) {
    throw new DeveloperError(
      '地面站标记 is required.' + options.landStationText
    )
  }
  if (!options.landStationIcon) {
    options.landStationIcon = './static/billboard/地面站.png'
  }
  // 创建地面站
  let landStation = this.viewer.entities.add({
    id: options.landStationId,
    position: this.Cesium.Cartesian3.fromDegrees(
      options.landStationPosition[0],
      options.landStationPosition[1],
      options.landStationPosition[2]
    ),
    label: {
      text: options.landStationText,
      // scaleByDistance: new this.Cesium.NearFarScalar(3000000, 0.0, 5000000, 0.5),
      font: '12px bold 楷体',
      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // CLAMP_TO_GROUND:The position is clamped to the terrain  RELATIVE_TO_GROUND:The position height is the height above the terrain.
      // disableDepthTestDistance: 59000000,//Number.POSITIVE_INFINITY,
      horizontalOrigin: this.Cesium.HorizontalOrigin.LEFT,
      pixelOffset: new this.Cesium.Cartesian2(-15, 20),
      style: this.Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: this.Cesium.Color.WHITE,
      outlineColor: this.Cesium.Color.BLACK,
      outlineWidth: 5,
      // outlineColor: this.Cesium.Color.BLACK,
      // outlineWidth: 5,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 3e6)
    },
    billboard: {
      image: options.landStationIcon,
      scale: 0.5,
      // scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.1, 2.0e3, 0.7),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        10000.0,
        4e7
      )
    },
    model: {
      uri: './static/model/radar.gltf',
      minimumPixelSize: 20,
      maximumScale: 500,
      lightColor: new Cesium.Cartesian3(15.0, 15.0, 15.0),
      scale: 1.0,
      luminanceAtZenith: 1.0,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0.0,
        10000.0
      )
    }
  })
  //   let landStation2 = this.viewer.entities.add({
  //     id: options.landStationId + 'point',
  //     position: this.Cesium.Cartesian3.fromDegrees(
  //       options.landStationPosition[0],
  //       options.landStationPosition[1],
  //       options.landStationPosition[2]
  //     ),
  //     point: {
  //       pixelSize: 10.0,
  //       color:
  //         options.nationalityIndex == 0
  //           ? new this.Cesium.Color(1.0, 0.0, 0.0, 1.0)
  //           : new this.Cesium.Color.fromCssColorString('#0070ff'),
  //       distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
  //         9.5e6,
  //         Number.POSITIVE_INFINITY
  //       )
  //       // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  //       // disableDepthTestDistance: 50000000,//Number.POSITIVE_INFINITY,
  //     }
  //   })
  //   if (options.isFly) this.viewer.flyTo(landStation)
}

/**
 * 构建飞机飞行路线
 *
 * @param {Array} options  飞机相关参数
 */
GroundObjectManage.prototype.createFlightPath = function (options) {
  let path = options.path.filter((_, index) => index % 4 !== 0)
  var flightPath = this.viewer.entities.add({
    name: 'flight line',
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights(path),
      width: 4,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.CYAN
      })
    }
  })
}
/**
 * 构建舰艇
 *
 * @param {string} options.warShipId 舰艇id-必填参数
 * @param {string} options.warShipText 舰艇名称-必填参数
 * @param {Array} options.warShipPath 舰艇路径-必填参数 [124.1, 25.2, 122.5, 23.6, 119.5, 20.4]
 * @param {string} options.warShipIcon 舰艇图标-选填参数-默认值 './static/billboard/驱逐舰.png'
 */
GroundObjectManage.prototype.createWarShip = function (options) {
  // 应该增加根据海上目标类型选择不同模型的功能，海上目标的实体添加方式大体相同。
  if (!options.warShipId) {
    throw new DeveloperError('舰艇id is required.' + options.warShipId)
  }
  if (!options.warShipText) {
    throw new DeveloperError('舰艇标注 is required.' + options.warShipText)
  }
  if (!options.warShipPath) {
    throw new DeveloperError('舰艇路径 is required.' + options.warShipPath)
  }
  if (options.warShipPath == '') {
    options.warShipPath = []
  }
  // if (!options.warShipIcon) {
  //     options.warShipIcon = './static/billboard/驱逐舰.png';
  // }
  // 删除之前的同ID entity
  this.viewer.entities.removeById(options.warShipId)
  this.viewer.entities.removeById(options.warShipId + 'cylinder')
  let billboardScale = 1.0
  let modelScale = 1.0
  let material = new Cesium.PolylineDashMaterialProperty({
    color: Cesium.Color.DODGERBLUE.withAlpha(1.0),
    dashLength: 15
  })
  let width = 3.0
  //若数据正确则不需要此处的判断
  let pos = this.Cesium.Cartesian3.fromDegrees(
    options.warShipPath[0],
    options.warShipPath[1],
    0
  )
  if (options.warShipId.indexOf('skyTarget') != -1) {
    options.warShipIcon = 'static/billboard/airplaneblue.png'
    options.warShipModelType = 'static/model/轰炸机-B52.gltf'
    pos = this.Cesium.Cartesian3.fromDegrees(
      options.warShipPath[0],
      options.warShipPath[1],
      3000
    )
    material = Cesium.Color.BLUEVIOLET.withAlpha(1.0)
    width = 2.0
  } else {
    options.warShipIcon = 'static/billboard/驱逐舰.png'
    options.warShipModelType = 'static/model/航空母舰.gltf'
  }
  // 创建舰艇
  let warShip = this.viewer.entities.add({
    id: options.warShipId,
    position: pos, //this.Cesium.Cartesian3.fromDegrees(options.warShipPath[0], options.warShipPath[1], 0),
    billboard: {
      image: options.warShipIcon,
      // color: this.Cesium.Color.BLUE,
      scaleByDistance: new this.Cesium.NearFarScalar(1.0e3, 10.0, 2.0e3, 1.0),
      scale: billboardScale,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(3e3, 1e6)
    },
    label: {
      text: options.warShipText,
      font: '12px bold 楷体', //'11pt Lucida Console',
      horizontalOrigin: this.Cesium.HorizontalOrigin.LEFT,
      pixelOffset: new this.Cesium.Cartesian2(10, -10),
      style: this.Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: this.Cesium.Color.WHITE,
      outlineColor: this.Cesium.Color.BLACK,
      outlineWidth: 5,
      // show: true,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        100.0,
        1.0e7
      ),
      translucencyByDistance: new Cesium.NearFarScalar(1.0, 1.0, 1.5e7, 0.5)
      // horizontalOrigin: this.Cesium.HorizontalOrigin.LEFT
    },
    model: {
      uri: options.warShipModelType, //'./static/model/qzj.gltf', //模型符号
      // minimumPixelSize: 1.0,
      maximumScale: 500.0,
      scale: modelScale,
      lightColor: new Cesium.Cartesian3(15.0, 15.0, 15.0),
      luminanceAtZenith: 1.0,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 4e3)
      // show: false
    },
    point: {
      show: true,
      pixelSize: 12, // 像素大小
      heightReference: Cesium.HeightReference.NONE,
      color: new Cesium.Color(61 / 255.0, 133 / 255.0, 198 / 255.0, 1.0), // Cesium.Color.RED,
      // outlineColor: new Cesium.Color(1, 0, 0, 0.5),
      // outlineWidth: 4,
      // scaleByDistance: new Cesium.NearFarScalar(1.0e3, 10.0, 2.0e3, 1.0),
      // translucencyByDistance: new Cesium.NearFarScalar( 1.0e3,1.0, 1.5e6,0.5),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        9.0e5,
        1.0e10
      )
    },
    ellipse: {
      color: this.Cesium.Color.CYAN,
      material: new this.Cesium.PulseMaterialProperty({
        repeat: new this.Cesium.Cartesian2(8.0, 8.0),
        color: new this.Cesium.Color(0.0, 1.0, 0.7, 1.0),
        flowSpeed: 25.0,
        transparent: true
      }),
      show: false
    }
    // polyline: {
    //   show: true,
    //   // clampToGround: true,
    //   // material: new this.Cesium.ImageMaterialProperty({
    //   //     image: "./static/material/traceLine.png",
    //   //     color: new this.Cesium.Color(0.0, 1.0, 0.0, 0.8)
    //   // }),
    //   // width: 40,
    //   material: material,
    //   width: width,
    //   positions: this.Cesium.Cartesian3.fromDegreesArray(options.warShipPath)
    // }
  })
  // 信号展开callbackproperty 函数
  let initL = 100

  function changeLength() {
    if (initL < 100000) {
      initL += 5000
    }
    return initL
  }
  // 创建舰艇
  // let warShipSignal = this.viewer.entities.add({
  //   id: options.warShipId + 'cylinder',
  //   position: this.Cesium.Cartesian3.fromDegrees(
  //     options.warShipPath[0],
  //     options.warShipPath[1],
  //     100000 * 0.5
  //   ),
  //   cylinder: {
  //     // length: 469718.0,
  //     length: new this.Cesium.CallbackProperty(changeLength, false),
  //     topRadius: 18600.0,
  //     bottomRadius: 0.0,
  //     showBottom: false,
  //     slices: 28,
  //     material: new this.Cesium.PulseMaterialProperty({
  //       repeat: new this.Cesium.Cartesian2(8.0, 8.0),
  //       color: new this.Cesium.Color(0.1, 0.3, 0.9, 1.0),
  //       flowSpeed: 25.0,
  //       transparent: true
  //     }),
  //     show: false
  //   }
  // })
  // 下面的定向待模型默认路径完全匹配后再执行
  // 修改模型方向
  // var startPosition = [options.warShipPath[0], options.warShipPath[1]]
  // var endPosition = [options.warShipPath[2], options.warShipPath[3]]
  // var rotation = this.Bearing(startPosition, endPosition)
  // var position = this.Cesium.Cartesian3.fromDegrees(options.warShipPath[0], options.warShipPath[1], 0)
  // var headingPitchRoll = new this.Cesium.HeadingPitchRoll(this.Cesium.Math.toRadians(rotation), 0, 0)
  // warShip.orientation = this.Cesium.Transforms.headingPitchRollQuaternion(position, headingPitchRoll)
  // 修改图标方向(转成弧度)
  // warShip.billboard.rotation = -Math.PI / 2 - rotation * Math.PI / 180.0
}

/**
 * 构建舰艇
 *
 * @param {string} options.warShipId 舰艇id-必填参数
 * @param {string} options.warShipText 舰艇名称-必填参数
 * @param {Array} options.warShipPath 舰艇路径-必填参数 [124.1, 25.2, 122.5, 23.6, 119.5, 20.4]
 * @param {string} options.warShipIcon 舰艇图标-选填参数-默认值 './static/billboard/驱逐舰.png'
 */
GroundObjectManage.prototype.createWarShip2 = function (options) {
  if (!options.warShipId) {
    throw new DeveloperError('舰艇id is required.' + options.warShipId)
  }
  if (!options.warShipText) {
    throw new DeveloperError('舰艇标注 is required.' + options.warShipText)
  }
  if (!options.warShipPath) {
    throw new DeveloperError('舰艇路径 is required.' + options.warShipPath)
  }
  // if (!options.warShipIcon) {
  //     options.warShipIcon = './static/billboard/驱逐舰.png';
  // }
  let billboardScale = 1.0
  let modelScale = 1.0
  //若数据正确则不需要此处的判断
  let pos = this.Cesium.Cartesian3.fromDegrees(
    options.warShipPath[0],
    options.warShipPath[1],
    0
  )
  // let modelurl='';
  switch (options.warShipType) {
    case 'seaTarget':
      if (!options.warShipIcon) {
        options.warShipIcon = './static/billboard/驱逐舰.png' //军标符号
      }
      if (!options.warShipModelType) {
        options.warShipModelType = './static/model/航空母舰.gltf' //军标符号
      }
      pos = this.Cesium.Cartesian3.fromDegrees(
        options.warShipPath[0],
        options.warShipPath[1],
        0
      )
      break
    case 'skyTarget':
      if (!options.warShipIcon) {
        options.warShipIcon = './static/billboard/机场.png'
      }
      if (!options.warShipModelType) {
        options.warShipModelType = './static/model/轰炸机-B52.gltf' //军标符号
      }
      pos = this.Cesium.Cartesian3.fromDegrees(
        options.warShipPath[0],
        options.warShipPath[1],
        2000
      )
      billboardScale = 0.1
      break
    case 'baseTarget':
      if (!options.warShipIcon && options.warShipText.indexOf('机场') > -1) {
        options.warShipIcon = './static/billboard/空军基地.png'
      } else if (
        !options.warShipIcon &&
        options.warShipText.indexOf('港口') > -1
      ) {
        options.warShipIcon = './static/billboard/ljb/观察哨.png'
      }
      if (!options.warShipModelType) {
        options.warShipModelType = './static/model/xxx.gltf' //军标符号
      }
      pos = this.Cesium.Cartesian3.fromDegrees(
        options.warShipPath[0],
        options.warShipPath[1],
        0
      )
      billboardScale = 0.7
      break
    case 'landTarget':
      if (options.warShipText == '萨德') {
        options.warShipIcon = './static/billboard/ljb/陆军基地.png' //军标符号
        options.warShipModelType = './static/model/萨德反导系统.gltf'
      } else if (options.warShipText == '火箭车') {
        options.warShipIcon = './static/billboard/ljb/步兵战车.png' //军标符号
        options.warShipModelType = './static/model/坦克-M1.gltf'
      } else {
        if (!options.warShipIcon) {
          options.warShipIcon = './static/billboard/空军基地.png' //军标符号
        }
        if (!options.warShipModelType) {
          options.warShipModelType = './static/model/xxxx.gltf'
        }
      }
      pos = this.Cesium.Cartesian3.fromDegrees(
        options.warShipPath[0],
        options.warShipPath[1],
        0
      )
      billboardScale = 0.5
      modelScale = 1
      break
    default:
      break
  }
  // 创建舰艇
  let warShip = this.viewer.entities.add({
    id: options.warShipId,
    position: pos, //this.Cesium.Cartesian3.fromDegrees(options.warShipPath[0], options.warShipPath[1], 0),
    label: {
      text: options.warShipText,
      font: '12px bold 楷体', //'11pt Lucida Console',
      horizontalOrigin: this.Cesium.HorizontalOrigin.LEFT,
      pixelOffset: new this.Cesium.Cartesian2(10, 0),
      style: this.Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: this.Cesium.Color.WHITE,
      outlineColor: this.Cesium.Color.BLACK,
      outlineWidth: 5,
      show: true,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        100.0,
        1.0e7
      ),
      translucencyByDistance: new Cesium.NearFarScalar(1.0, 1.0, 1.5e7, 0.5),
      horizontalOrigin: this.Cesium.HorizontalOrigin.LEFT
    },
    billboard: {
      image: options.warShipIcon,
      // color: this.Cesium.Color.BLUE,
      scaleByDistance: new this.Cesium.NearFarScalar(1.0e3, 10.0, 2.0e3, 1.0),
      scale: billboardScale,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(3e3, 1e6)
    },
    model: {
      uri: options.warShipModelType, //'./static/model/qzj.gltf', //模型符号
      minimumPixelSize: 20,
      maximumScale: 500,
      scale: modelScale,
      lightColor: new Cesium.Cartesian3(15.0, 15.0, 15.0),
      luminanceAtZenith: 1.0,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 4e3)
      // show: false
    },
    point: {
      show: true,
      pixelSize: 12, // 像素大小
      heightReference: Cesium.HeightReference.NONE,
      color: new Cesium.Color(61 / 255.0, 133 / 255.0, 198 / 255.0, 1.0), // Cesium.Color.RED,
      // outlineColor: new Cesium.Color(1, 0, 0, 0.5),
      // outlineWidth: 4,
      // scaleByDistance: new Cesium.NearFarScalar(1.0e3, 10.0, 2.0e3, 1.0),
      // translucencyByDistance: new Cesium.NearFarScalar( 1.0e3,1.0, 1.5e6,0.5),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        9.0e5,
        1.0e10
      )
    },
    polyline: {
      show: true,
      clampToGround: true,
      // material: new this.Cesium.ImageMaterialProperty({
      //     image: "./static/material/traceLine.png",
      //     color: new this.Cesium.Color(0.0, 1.0, 0.0, 0.8)
      // }),
      // width: 40,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.DODGERBLUE.withAlpha(1.0),
        dashLength: 15
      }),
      width: 2,
      positions: this.Cesium.Cartesian3.fromDegreesArray(options.warShipPath)
    },
    ellipse: {
      color: this.Cesium.Color.CYAN,
      material: new this.Cesium.PulseMaterialProperty({
        repeat: new this.Cesium.Cartesian2(8.0, 8.0),
        color: new this.Cesium.Color(0.0, 1.0, 0.7, 1.0),
        flowSpeed: 25.0,
        transparent: true
      }),
      show: false
    }
  })
  // 信号展开callbackproperty 函数
  let initL = 100

  function changeLength() {
    if (initL < 100000) {
      initL += 5000
    }
    return initL
  }
  // 创建舰艇
  let warShipSignal = this.viewer.entities.add({
    id: options.warShipId + 'cylinder',
    position: this.Cesium.Cartesian3.fromDegrees(
      options.warShipPath[0],
      options.warShipPath[1],
      100000 * 0.5
    ),
    cylinder: {
      // length: 469718.0,
      length: new this.Cesium.CallbackProperty(changeLength, false),
      topRadius: 18600.0,
      bottomRadius: 0.0,
      showBottom: false,
      slices: 28,
      material: new this.Cesium.PulseMaterialProperty({
        repeat: new this.Cesium.Cartesian2(8.0, 8.0),
        color: new this.Cesium.Color(0.1, 0.3, 0.9, 1.0),
        flowSpeed: 25.0,
        transparent: true
      }),
      show: false
    }
  })
  // 修改模型方向
  var startPosition = [options.warShipPath[0], options.warShipPath[1]]
  var endPosition = [options.warShipPath[2], options.warShipPath[3]]
  var rotation = this.Bearing(startPosition, endPosition)
  var position = this.Cesium.Cartesian3.fromDegrees(
    options.warShipPath[0],
    options.warShipPath[1],
    0
  )
  var headingPitchRoll = new this.Cesium.HeadingPitchRoll(
    this.Cesium.Math.toRadians(rotation),
    0,
    0
  )
  warShip.orientation = this.Cesium.Transforms.headingPitchRollQuaternion(
    position,
    headingPitchRoll
  )
  // 修改图标方向(转成弧度)
  warShip.billboard.rotation = -Math.PI / 2 - (rotation * Math.PI) / 180.0
}

/**
 * 删除舰艇或地面站
 *
 * @param {string} entityId 舰艇或地面站id
 */
GroundObjectManage.prototype.deleteEntity = function (entityId) {
  // 删除舰艇或地面站等
  if (this.viewer && entityId) {
    this.viewer.entities.removeById(entityId)
  }
}

// 计算两点的方向角
/**
 *
 * @param {*} from 起点经纬度坐标 [lng, lat]
 * @param {*} to   终点经纬度坐标 [lng, lat]
 * @returns        相对正北方向的偏角(度)
 */
GroundObjectManage.prototype.Bearing = function (from, to) {
  let radiansPerDegree = Math.PI / 180.0
  let degreesPerRadian = 180.0 / Math.PI
  let lat1 = from[1] * radiansPerDegree
  let lon1 = from[0] * radiansPerDegree
  let lat2 = to[1] * radiansPerDegree
  let lon2 = to[0] * radiansPerDegree
  let angle = -Math.atan2(
    Math.sin(lon1 - lon2) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
  )
  if (angle < 0) {
    angle += Math.PI * 2.0
  }
  angle = angle * degreesPerRadian
  return angle
}

/**
 * 构建电磁环境
 *
 * @param {string} options.warShipId 舰艇id-必填参数
 * @param {string} options.warShipText 舰艇名称-必填参数
 * @param {Array} options.warShipPath 舰艇路径-必填参数 [124.1, 25.2, 122.5, 23.6, 119.5, 20.4]
 * @param {string} options.warShipIcon 舰艇图标-必填参数
 */
GroundObjectManage.prototype.CreateEMIPolygon = function (options) {
  let viewer = this.viewer
  let Cesium = this.Cesium
  viewer.entities.removeById(options.EMIId)
  if (typeof options.EMIPositions == 'undefined') return
  let EMIPositions = []
  options.EMIPositions.forEach((element) => {
    EMIPositions.push(parseFloat(element))
  })
  viewer.entities.add({
    id: options.EMIId,
    name: '电磁干扰区域',
    position: Cesium.Cartesian3.fromDegrees(
      EMIPositions[EMIPositions.length - 2],
      EMIPositions[EMIPositions.length - 1]
    ),
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(EMIPositions),
      // perPositionHeight: that.clampToGround,
      material: new Cesium.EMIMaterialProperty({
        transparent: true,
        flowSpeed: options.EMISpeed,
        half: false,
        color: options.EMIColor,
        EMITransparent: options.EMITransparent
      }),
      //   clampToGround: false,
      // heightReference:20000.0,
      extrudedHeight: parseFloat(options.EMIHeight)
    },
    label: {
      text: options.EMIText,
      font: '18px sans-serif',
      fillColor: Cesium.Color.GOLD,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(20, -40),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 9.5e6)
    }
  })
}

/**
 * 构建云量环境
 *
 * @param {string} options.warShipId 舰艇id-必填参数
 * @param {string} options.warShipText 舰艇名称-必填参数
 * @param {Array} options.warShipPath 舰艇路径-必填参数 [124.1, 25.2, 122.5, 23.6, 119.5, 20.4]
 * @param {string} options.warShipIcon 舰艇图标-必填参数
 */
GroundObjectManage.prototype.CreateCloudPolygon = function (options) {
  let viewer = this.viewer
  let Cesium = this.Cesium
  viewer.entities.removeById(options.cloudId)
  if (typeof options.cloudPositions == 'undefined') return
  let cloudPositions = []
  options.cloudPositions.forEach((element) => {
    cloudPositions.push(parseFloat(element))
  })
  viewer.entities.add({
    id: options.cloudId,
    name: '云量区域',
    position: Cesium.Cartesian3.fromDegrees(
      cloudPositions[cloudPositions.length - 2],
      cloudPositions[cloudPositions.length - 1]
    ),
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(cloudPositions),
      // perPositionHeight: that.clampToGround,
      material: new Cesium.CloudMaterialProperty({
        transparent: true,
        flowSpeed: parseFloat(options.cloudSpeed),
        half: false,
        color: new Cesium.Color(0.2, 0.5, 0.3),
        cloudAlpha: parseFloat(options.cloudThickness),
        cloudCover: parseFloat(options.cloudDiscreteDegree),
        skytint: parseFloat(options.cloudHUE)
      }),
      //   clampToGround: false,
      // heightReference:20000.0,
      extrudedHeight: parseFloat(options.cloudHeight) - 1,
      height: parseFloat(options.cloudHeight)
    },
    label: {
      text: options.cloudText,
      font: '18px sans-serif',
      fillColor: Cesium.Color.GOLD,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(20, -40),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 9.5e6)
    }
  })
}
//添加面
GroundObjectManage.prototype.CreatePolygon = function (options) {
  let viewer = this.viewer
  let Cesium = this.Cesium
  viewer.entities.removeById(options.EMIId)
  if (typeof options.EMIPositions == 'undefined') return
  let EMIPositions = []
  let polygonPos = []
  options.EMIPositions.forEach((element) => {
    EMIPositions.push(parseFloat(element))
    polygonPos.push(parseFloat(element))
  })
  let arr = Array1to2(EMIPositions, 2)
  let firstArr = arr[0]
  arr.push(firstArr)
  var polygon = turf.polygon([arr])
  var geocenter = turf.centerOfMass(polygon)
  let entity = viewer.entities.add({
    id: options.EMIId,
    position: Cesium.Cartesian3.fromDegrees(
      // EMIPositions[EMIPositions.length - 2],
      // EMIPositions[EMIPositions.length - 1],
      geocenter.geometry.coordinates[0],
      geocenter.geometry.coordinates[1],
      options.height
    ),
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(polygonPos),
      height: options.height, // 多边形相对于椭球面的高度
      material: new Cesium.ImageMaterialProperty({
        image: options.image,
        color: options.color ? options.color : Cesium.Color.WHITE
        // repeat : new Cesium.Cartesian2(9, 11)
      }),
      distanceDisplayCondition: options.polygonDistanceDisplay
        ? options.polygonDistanceDisplay
        : new Cesium.DistanceDisplayCondition(100000.0, 9.5e6)
    },
    label: {
      text: options.EMIText,
      font: '18px sans-serif',
      fillColor: Cesium.Color.GOLD,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(20, -40),
      //   heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 9.5e6)
    }
    // billboard: {
    //   show:
    //   image: options.landStationIcon,
    //   scaleByDistance: new Cesium.NearFarScalar(), //new this.Cesium.NearFarScalar(3000000, 0.1, 5000000, 0.7),
    //   distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
    //       10000.0,
    //       9.5e6
    //     )
    //     // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //     // disableDepthTestDistance:59000000,//Number.POSITIVE_INFINITY,
    // },
  })
  if (options.billboardUrl) {
    entity.billboard = {
      image: options.billboardUrl,
      scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1, 2.0e6, 0.5), //new this.Cesium.NearFarScalar(3000000, 0.1, 5000000, 0.7),
      distanceDisplayCondition: options.billboardDistanceDisplay
        ? options.billboardDistanceDisplay
        : new Cesium.DistanceDisplayCondition(100000.0, 9.5e6)
      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      // disableDepthTestDistance:59000000,//Number.POSITIVE_INFINITY,
    }
  }
}

//添加海浪
GroundObjectManage.prototype.creatSeawave = function (options) {
  let Cesium = this.Cesium
  let riverPoint = options.seaWavePositions
  if (!riverPoint) {
    return
  }
  let polygon = new Cesium.PolygonGeometry({
    polygonHierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray(riverPoint)
    ),
    extrudedHeight: 1,
    height: Number(options.waveHeight),
    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
  })
  let riverMaterial = new Cesium.Material({
    fabric: {
      type: 'Water',
      uniforms: {
        normalMap: 'static/image/waterNormals.jpg',
        frequency: 1000.0,
        animationSpeed: 0.01,
        amplitude: 10.0
      }
    }
  })
  let river = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: polygon
    }),
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      aboveGround: true,
      material: riverMaterial
    }),
    show: true
  })
  viewer.scene.primitives.add(river)
  this.objArr.push({ bId: options.bId, object: river })
}
//删除目标物
GroundObjectManage.prototype.removeObj = function (options) {
  let viewer = this.viewer
  let Cesium = this.Cesium
  if (this.objArr.length > 0) {
    this.objArr.forEach((element) => {
      if (element.bId == options.bId) {
        viewer.scene.primitives.remove(element.object)
        viewer.entities.remove(element.object)
      }
    })
  }
}

/**
 * 构建沙尘
 *
 */
GroundObjectManage.prototype.CreateSandPolygon = function (options) {
  let viewer = this.viewer
  let Cesium = this.Cesium
  viewer.entities.removeById(options.sandId)
  if (typeof options.sandPositions == 'undefined') return
  let sandPositions = []
  options.sandPositions.forEach((element) => {
    sandPositions.push(parseFloat(element))
  })
  let sandEntity = viewer.entities.add({
    id: options.sandId,
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(sandPositions), //层次结构
      // perPositionHeight: that.clampToGround,
      //material: new Cesium.Color(0.2, 0.5, 0.3, 0.5),
      material: options.material
        ? options.material
        : new Cesium.Color(0.2, 0.5, 0.3, 0.5),
      outlineColor: Cesium.Color.RED
    }
  })
  let sandPos = sandEntity.polygon.hierarchy.getValue(
    Cesium.JulianDate.now()
  ).positions
  let sandCenter = Cesium.BoundingSphere.fromPoints(sandPos).center // 中心点
  sandEntity.position = sandCenter
  sandEntity.label = new Cesium.LabelGraphics({
    text: options.sandText,
    font: '18px sans-serif',
    fillColor: Cesium.Color.GOLD,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER, //水平位置
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    translucencyByDistance: new Cesium.NearFarScalar(0.5e7, 1.0, 1.5e7, 0.0)
  })
}
/**
 * 构建ZC环境
 *
 */
GroundObjectManage.prototype.CreateEnvironmentPolygon = function (options) {
  let viewer = this.viewer
  let Cesium = this.Cesium
  viewer.entities.removeById(options.envId)
  if (typeof options.polygonPositions == 'undefined') return
  let polygonPositions = []
  options.polygonPositions.forEach((element) => {
    polygonPositions.push(parseFloat(element))
  })
  let entity = viewer.entities.add({
    id: options.envId,
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(polygonPositions), //层次结构
      // perPositionHeight: that.clampToGround,
      material: new Cesium.Color(0.2, 0.5, 0.3, 0.5),
      outlineColor: Cesium.Color.RED
    }
  })
  let Pos = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions
  let Center = Cesium.BoundingSphere.fromPoints(Pos).center // 中心点
  entity.position = Center
  entity.label = new Cesium.LabelGraphics({
    text: options.text,
    font: '18px sans-serif',
    fillColor: Cesium.Color.GOLD,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER, //水平位置
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    translucencyByDistance: new Cesium.NearFarScalar(0.5e7, 1.0, 1.5e7, 0.0)
  })
}
export default GroundObjectManage
