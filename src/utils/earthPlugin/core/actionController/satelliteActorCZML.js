/** 卫星动作类 */
import { Function } from 'core-js'
import CreateFrustum from './customTool/CreateFrumstum'
import Prompt from './customTool/prompt/prompt.js'
function SatelliteActorCZML(options) {
  this.viewer = options.viewer
  this.Cesium = options.earth
  // 结构: [{"actorName":"动作名称", "satelliteId":"卫星id", "frustum": "视锥体对象", "interval": "视锥体定时器"}]
  this.satelliteActors = [] // 卫星所有动作数组
  this.timer = undefined
  this.promptArray = [] //存储当前弹出框的对象
}

// 卫星翻转
/**
 * 卫星电池板翻转180度
 * @param {string} satelliteId 卫星实体id
 */
SatelliteActorCZML.prototype.satelliteRotate = function (satelliteId) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  viewer.dataSources._dataSources.forEach((item) => {
    if (item.name == satelliteId) {
      let satellite = item.entities.getById(satelliteId)
      satellite.description = '卫星翻转'
      if (!Cesium.defined(satellite)) {
        console.error('SatelliteEntity is required.')
        return
      }
      let index = 0
      var heading = 0
      var pitch = 0
      var roll = 0
      let orientation
      function changeOrientation() {
        if (index < 180) {
          pitch = Cesium.Math.toRadians(pitch + index)
          index += 0.5
        } else {
          pitch = Cesium.Math.toRadians(pitch + index)
        }
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
        let position
        var YGPosition = satellite.position.getValue(viewer.clock.currentTime)
        if (!YGPosition) {
          return
        }
        var YGCartographic = Cesium.Cartographic.fromCartesian(YGPosition)
        let starLinkLng = Cesium.Math.toDegrees(YGCartographic.longitude)
        let starLinkLat = Cesium.Math.toDegrees(YGCartographic.latitude)
        let starLinkAlt = YGCartographic.height
        position = new Cesium.Cartesian3.fromDegrees(
          starLinkLng,
          starLinkLat,
          starLinkAlt
        )
        orientation = Cesium.Transforms.headingPitchRollQuaternion(
          position,
          hpr
        )
        return orientation
      }

      satellite.orientation = new Cesium.CallbackProperty(
        changeOrientation,
        false
      )
      setTimeout(() => {
        satellite.orientation = undefined
        satellite.description = ''
      }, 5000)
    }
  })
}

/**
 * 电量耗尽
 * @param {string} satelliteId 卫星实体id
 */
SatelliteActorCZML.prototype.batteryRunsOut = function (satelliteId) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  let satelliteBox1Id = satelliteId + '电量耗尽Box1'
  // 重复点击删除当前绑定的实体
  viewer.entities.removeById(satelliteBox1Id)
  viewer.dataSources._dataSources.forEach((item) => {
    if (item.name == satelliteId) {
      // 00 获取卫星实体
      let satellite = item.entities.getById(satelliteId)
      satellite.description = '电量耗尽'

      // 01 验证实体存在
      if (!Cesium.defined(satellite)) {
        console.error('SatelliteEntity is required.')
        return
      }

      // 更新位置
      function updateBoxPosition() {
        let satellitePosition = satellite.position.getValue(
          viewer.clock.currentTime
        )
        return satellitePosition
      }

      viewer.entities.add({
        id: satelliteBox1Id,
        position: new Cesium.CallbackProperty(updateBoxPosition, false),
        box: {
          dimensions: new Cesium.Cartesian3(130000.0, 120000.0, 180000.0),
          material: new Cesium.VisualIdentityLinesMaterialProperty({
            transparent: true
          }),
          show: true //默认隐藏
        }
      })
      // 02 封装callback函数
      let silhouetteColorAlpha = 0
      let silhouetteColorControl = true
      let silhouetteColor
      function updateSilhouetteColor() {
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
          255.0 / 255.0,
          255.0 / 255.0,
          (0.0 + silhouetteColorAlpha * 100) / 250.0,
          silhouetteColorAlpha
        )
        return silhouetteColor
      }

      let silhouetteSize = 0
      let silhouetteSizeControl = true
      function updateSilhouetteSize() {
        if (silhouetteSizeControl) {
          silhouetteSize += 0.1
          if (silhouetteSize >= 12) {
            silhouetteSizeControl = false
          }
        } else {
          silhouetteSize -= 0.1
          if (silhouetteSize <= 0) {
            silhouetteSizeControl = true
          }
        }
        return silhouetteSize
      }

      let mixColorAlpha = 1.0
      let mixColorControl = true
      let mixColor
      function updateMixColor() {
        if (mixColorControl) {
          mixColorAlpha -= 0.01
          if (mixColorAlpha <= 0.8) {
            mixColorControl = false
          }
        } else {
          mixColorAlpha += 0.01
          if (mixColorAlpha >= 1.0) {
            mixColorControl = true
          }
        }
        mixColor = new Cesium.Color(
          (200.0 + mixColorAlpha * 200) / 250.0,
          (200.0 - mixColorAlpha * 200) / 250.0,
          0.0,
          1.0
        ) // 如果alpha也实时更新的话会导致闪烁
        return mixColor
      }
      // 03 配置卫星当前状态下的显示效果
      satellite.model.colorBlendMode = Cesium.ColorBlendMode.MIX
      satellite.model.color = new Cesium.CallbackProperty(updateMixColor, false)
      satellite.model.silhouetteColor = new Cesium.CallbackProperty(
        updateSilhouetteColor,
        false
      )
      satellite.model.silhouetteSize = new Cesium.CallbackProperty(
        updateSilhouetteSize,
        false
      )
      satellite.model.colorBlendAmount = 0.2 // 混合比例

      //  xxx毫秒后进入关机状态
      if (typeof this.timer != 'undefined') {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        satellite.model.silhouetteSize = 0
        satellite.model.colorBlendAmount = 0.0
        satellite.description = ''
      }, 10000)
    }
  })
}

/**
 * 电量耗尽结束
 * @param {string} param.satelliteId 卫星实体id
 *
 */
SatelliteActorCZML.prototype.batteryRunsOutEnd = function (params) {
  if (!params.satelliteId) {
    console.error('卫星id不合法.' + params.satelliteId)
    return
  }
  this.viewer.entities.removeById(params.satelliteId + 'Box1')
  let ds = this.viewer.dataSources.getByName(params.satelliteId)[0]
  if (ds) {
    ds.entities.values[0].model.silhouetteSize = 0.0
    ds.entities.values[0].model.colorBlendAmount = 0.0
  }
}
//设置开关机的样式   单独设置样式
SatelliteActorCZML.prototype.setStyleEffect = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  let ds = ''
  let satellite = ''
  satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      let allSource = viewer.dataSources.getByName(options.czmlSource)
      ds = allSource[0]
      // ds = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.getById(options.satelliteId)
    } else {
      let allSource = viewer.dataSources.getByName(options.satelliteId)
      ds = allSource[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.values[0]
    }
  }

  //  this.setEffect(satellite, '载荷开机')
  let msg = '开机扫描'
  if (options.msg) {
    msg = '载荷异常'
  }

  this.setEffect(satellite, msg)

  if (satellite && satellite.label) {
    let text = satellite.label.text._value
    if (text.indexOf('宏图') == -1) {
      text = text.split('载荷')[0] + '-' + text.split('_')[2]
    }
    this.loadPrompt({
      id: options.satelliteId,
      content: [
        { type: '名称', value: text },
        { type: '动作', value: msg }
      ],
      entityId: options.satelliteId,
      datasourceName: options.czmlSource,
      entity: satellite,
      msg: msg
    })
  }
}

//取消设置开关机的样式   单独设置样式
SatelliteActorCZML.prototype.cancleStyleEffect = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  let ds = ''
  let satellite = ''
  satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      ds = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!ds) {
        console.log('卫星的数据源不正常')
        return
      }
      satellite = ds.entities.getById(options.satelliteId)
    }
  }
  if (!satellite) {
    return
  }
  this.removeEffect(satellite)
  this.removePrompt({ satelliteId: options.satelliteId, entity: satellite })
}

// 载荷异常
SatelliteActorCZML.prototype.satalliteError = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  // 重复点击删除当前satelliteBox1Id、satelliteBox2Id绑定的实体
  this.removeSingleSatelliteActor({
    actorName: '载荷异常',
    satelliteId: options.satelliteId
  })

  let ds = ''
  let satellite = ''
  satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      ds = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.getById(options.satelliteId)
    } else {
      ds = viewer.dataSources.getByName(options.satelliteId)[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.values[0]
    }
  }

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
      (150.0 + silhouetteColorAlpha * 100) / 250.0,
      0.0,
      0.0,
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
  if (satellite && satellite.model) {
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
  }
}

// 载荷开机
SatelliteActorCZML.prototype.turnOnPure = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  let satelliteBox1Id = options.satelliteId + '载荷开机Box1'
  let satelliteBox2Id = options.satelliteId + '载荷开机Box2'
  // 重复点击删除当前satelliteBox1Id、satelliteBox2Id绑定的实体
  this.removeSingleSatelliteActor({
    actorName: '载荷开机',
    satelliteId: options.satelliteId
  })

  let ds = ''
  let satellite = ''
  satellite = viewer.entities.getById(options.satelliteId)
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

  //视角定位
  // this.setPosition(options)

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
  if (satellite && satellite.model) {
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
  }

  // 保存动作
  this.satelliteActors.push({
    actorName: '载荷开机',
    satelliteId: options.satelliteId
  })
}

// 载荷开机结束
SatelliteActorCZML.prototype.turnOnPureEnd = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer

  let ds = ''
  let satellite = ''
  satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      ds = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!ds) {
        console.log('卫星的数据源不正常')
        return
      }
      satellite = ds.entities.getById(options.satelliteId)
    }
  }
  if (!satellite) {
    return
  }
  satellite.model.silhouetteSize = 0
  satellite.description = ''
  // this.removeEffect(satellite)
  // this.removePrompt({ satelliteId: options.satelliteId, entity: satellite })
}

// 载荷关机
SatelliteActorCZML.prototype.turnOffPure = function (options) {
  let ds = ''
  let satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      ds = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.getById(options.satelliteId)
    } else {
      ds = viewer.dataSources.getByName(options.satelliteId)[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.values[0]
    }
  }

  //视角定位
  // this.setPosition(options)
  // 01 卫星最多附加三个实体,id如下
  let satelliteBox1Id = options.satelliteId + '载荷关机Box1'
  let satelliteBox2Id = options.satelliteId + '载荷关机Box2'
  let SatelliteCylinderId = options.satelliteId + '载荷关机Cylinder'

  // 02 载荷关机时清楚id关联的实体
  viewer.entities.removeById(options.satelliteId + '载荷开机Box1')
  viewer.entities.removeById(options.satelliteId + '载荷关机Box2')
  viewer.entities.removeById(satelliteBox1Id)
  viewer.entities.removeById(satelliteBox2Id)
  viewer.entities.removeById(SatelliteCylinderId)

  // 03 callback封装
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
      (150.0 + silhouetteColorAlpha * 100) / 250.0,
      0.0,
      0.0,
      silhouetteColorAlpha
    )
    return silhouetteColor
  }
  let silhouetteSize = 0
  let silhouetteSizeControl = true
  function _updateSilhouetteSize() {
    if (silhouetteSizeControl) {
      silhouetteSize += 0.1
      if (silhouetteSize >= 6) {
        silhouetteSizeControl = false
      }
    } else {
      silhouetteSize -= 0.1
      if (silhouetteSize <= 0) {
        silhouetteSizeControl = true
      }
    }
    return silhouetteSize
  }
  if (satellite && satellite.model) {
    satellite.model.silhouetteColor = new Cesium.CallbackProperty(
      _updateSilhouetteColor,
      false
    )
    satellite.model.silhouetteSize = new Cesium.CallbackProperty(
      _updateSilhouetteSize,
      false
    )
    satellite.model.colorBlendAmount = 0.0 //不混合颜色
  }

  //   }
  // })
}
// 载荷关机机结束
SatelliteActorCZML.prototype.turnOffPureEnd = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer

  let ds = ''
  let satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      ds = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.getById(options.satelliteId)
    } else {
      ds = viewer.dataSources.getByName(options.satelliteId)[0]
      // 01 验证实体存在
      if (!ds) {
        console.log('卫星的数据源不正确')
        return
      }
      satellite = ds.entities.values[0]
    }
  }
  if (!satellite) {
    return
  }
  satellite.model.silhouetteSize = 0.0
  satellite.model.colorBlendAmount = 0.0
  satellite.description = ''
  // this.removePrompt({ satelliteId: options.satelliteId, entity: satellite })
  // this.removeEffect(satellite)
}

/**
 * 光学卫星扫描
 * @param {string} satelliteId  卫星实体 eg.: "YGSatellite"
 * @param {num} time 扫描时间 单位:毫秒
 */
SatelliteActorCZML.prototype.opticalSatelliteScan = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  // viewer.dataSources._dataSources.forEach((item) => {
  //   let czmlData = ''
  //   if (options.czmlSource) {
  //     czmlData = options.czmlSource
  //   } else {
  //     czmlData = options.satelliteId
  //   }
  //   if (item.name == czmlData) {
  //     // 清除初始实体
  //     viewer.entities.removeById(options.satelliteId)
  //     // 创建光学卫星扫描需要的实体的id
  let satelliteCylinderId = options.satelliteId + '光学卫星扫描Cylinder' // 信号和扫描带
  viewer.entities.removeById(satelliteCylinderId)
  //     let satellite = item.entities.getById(options.satelliteId)

  let dataSource = ''
  let satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      dataSource = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!dataSource) {
        return
      }
      satellite = dataSource.entities.getById(options.satelliteId)
    } else {
      console.log('数据源不存在')
      return
    }
  }
  if (!options.scanRange) {
    return
  }
  this.setEffect(satellite, '光学扫描')
  let text = satellite.label.text._value
  if (text.indexOf('宏图') == -1) {
    text = text.split('载荷')[0] + '-' + text.split('_')[2]
  }
  this.loadPrompt({
    id: options.satelliteId,
    content: [
      { type: '名称', value: text },
      { type: '动作', value: '扫描方式1' }
    ],
    entityId: options.satelliteId,
    datasourceName: options.czmlSource,
    entity: satellite
  })
  // 验证实体存在

  // 计算卫星当前高度
  let currentTime = viewer.clock.currentTime
  let satellitePosition = satellite.position.getValue(currentTime)
  let satelliteCartographic =
    Cesium.Cartographic.fromCartesian(satellitePosition)
  let satelliteAlt = satelliteCartographic.height

  // 信号展开callbackproperty 函数
  let initL = 100
  function changeLength() {
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)
    let satelliteCartographic =
      Cesium.Cartographic.fromCartesian(satellitePosition)
    let satelliteAlt = satelliteCartographic.height
    return satelliteAlt
  }
  // 更新位置callbackproperty函数
  function changePosition() {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
    let tempCartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
    let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
    let tempAlt = tempCartographic.height
    let res = new Cesium.Cartesian3.fromDegrees(tempLng, tempLat, tempAlt / 2.0)
    return res
  }
  // corridor位置更新,每次更新经纬度
  let corridorArray = []
  function changePositionArray() {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)
    let tempCartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    let tempLng = Cesium.Math.toDegrees(tempCartographic.longitude)
    let tempLat = Cesium.Math.toDegrees(tempCartographic.latitude)
    let tempAlt = tempCartographic.height
    corridorArray.push(tempLng)
    corridorArray.push(tempLat)
    return Cesium.Cartesian3.fromDegreesArray(corridorArray)
  }

  let index = 0
  var heading = Cesium.Math.toRadians(60)
  var pitch = 0
  var roll = 0
  let orientation
  function changeOrientation() {
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
    let position
    var YGEntity = viewer.entities.getById(satelliteCylinderId)
    var YGPosition = YGEntity.position.getValue(viewer.clock.currentTime)
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

  viewer.entities.add({
    id: satelliteCylinderId,
    position: new Cesium.CallbackProperty(changePosition, false),
    orientation: new Cesium.CallbackProperty(changeOrientation, false),
    cylinder: {
      // length: 469718.0,
      length: new Cesium.CallbackProperty(changeLength, false),
      // length: satelliteAlt,
      topRadius: 0.0,
      bottomRadius:
        Number(options.scanRange) > -1
          ? Number(options.scanRange) * 1000
          : 86000,
      showBottom: false,
      slices: 28,
      material: new this.Cesium.PulseMaterialProperty({
        repeat: new this.Cesium.Cartesian2(3.0, 3.0),
        color: new this.Cesium.Color(0.8, 0.1, 0.5, 1.0),
        flowSpeed: 50.0,
        transparent: true
      })
    },
    corridor: {
      positions: new Cesium.CallbackProperty(changePositionArray, false),
      height: 10.0,
      width:
        Number(options.scanRange) > -1
          ? Number(options.scanRange) * 1000
          : 86000,
      cornerType: Cesium.CornerType.MITERED,
      material: Cesium.Color.GREEN,
      outlineColor: Cesium.Color.PINK.withAlpha(0.1),
      outline: true
    }
  })

  // if (typeof this.timer != 'undefined') {
  //   clearTimeout(this.timer)
  // }

  // this.timer = setTimeout(() => {
  //   // 清除当前czml和扫描实体
  //   viewer.entities.removeById(satelliteCylinderId)
  //   satellite.description = ''
  // }, 300 * 1000)
}

/**
 * 光学卫星扫描结束
 * @param {string} satelliteId  卫星id
 * @param {obj} params.frustum  视锥体对象
 * @param {obj} params.inteval  定时器
 */
SatelliteActorCZML.prototype.opticalSatelliteScanEnd = function (options) {
  if (!options.satelliteId) {
    console.error('卫星id不合法.' + options.satelliteId)
    return
  }
  this.viewer.entities.removeById(options.satelliteId + '光学卫星扫描Cylinder')
  // 删除视锥体、定时器
  let ds = ''
  let satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      ds = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.getById(options.satelliteId)
    } else {
      ds = viewer.dataSources.getByName(options.satelliteId)[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.values[0]
    }
  }
  this.removePrompt({ satelliteId: options.satelliteId, entity: satellite })
  this.removeEffect(satellite)
  // satellite.description = ''
  // viewer.dataSources._dataSources.forEach((item) => {
  //   if (item.name == satelliteId) {
  //     let satellite = item.entities.getById(satelliteId)
  //     satellite.description = ''
  //   }
  // })
}

/**
 * 电子卫星扫描
 * @param {string} satelliteId 卫星实体id
 */
SatelliteActorCZML.prototype.electronicSatelliteScan = function (options) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  viewer.entities.removeById(options.satelliteId + 'CylinderDZ')

  let dataSource = ''
  let satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      dataSource = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!dataSource) {
        return
      }
      satellite = dataSource.entities.getById(options.satelliteId)
    } else {
      console.log('数据源不存在')
      return
    }
  }

  // viewer.dataSources._dataSources.forEach((item) => {
  //   let czmlData = ''
  //   if (options.czmlSource) {
  //     czmlData = options.czmlSource
  //   } else {
  //     czmlData = options.satelliteId
  //   }
  //   if (item.name == czmlData) {
  //     let satellite = item.entities.getById(options.satelliteId)
  //     // 验证实体存在
  //     if (!satellite) {
  //       // console.error('SatelliteEntity is required.')
  //       return
  //     }
  if (satellite && satellite.label) {
    let text = satellite.label.text._value
    if (text.indexOf('宏图') == -1) {
      text = text.split('载荷')[0] + '-' + text.split('_')[2]
    }
    this.loadPrompt({
      id: options.satelliteId,
      content: [
        { type: '名称', value: text },
        { type: '动作', value: '扫描方式2' }
      ],
      entityId: options.satelliteId,
      datasourceName: options.czmlSource,
      entity: satellite
    })
  }

  this.setEffect(satellite, '电子卫星扫描')
  // satellite.description = '电子卫星扫描'
  // var updateCylinderPosition = function () {
  //   var satellitePosition = satellite.position.getValue(
  //     viewer.clock.currentTime
  //   )
  //   let satelliteCartographic =
  //     Cesium.Cartographic.fromCartesian(satellitePosition)
  //   let satelliteLng = Cesium.Math.toDegrees(satelliteCartographic.longitude)
  //   let satelliteLat = Cesium.Math.toDegrees(satelliteCartographic.latitude)
  //   return new Cesium.Cartesian3.fromDegrees(satelliteLng, satelliteLat)
  // }

  // let sEntity = viewer.entities.add({
  //   id: satelliteId + '电子卫星扫描Ellipse',
  //   position: new Cesium.CallbackProperty(updateCylinderPosition, false),
  //   ellipse: {
  //     semiMinorAxis: 500000,
  //     semiMajorAxis: 500000,
  //     color: Cesium.Color.CYAN,
  //     material: new Cesium.ImageMaterialProperty({
  //       image: require('@/assets/imgs/electronicSatelliteScan.png')
  //     }),
  //     show: false
  //   }
  // })
  // setTimeout(() => {
  //   sEntity.ellipse.show = true
  // }, 500)
  // 更新位置
  function _updateCylinderPosition() {
    let satellitePosition = satellite.position.getValue(
      viewer.clock.currentTime
    )
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
    let satelliteCartoGeographic =
      Cesium.Cartographic.fromCartesian(satellitePosition)
    let satelliteAlt = satelliteCartoGeographic.height
    if (initL < satelliteAlt) {
      initL += 30000
    }
    // return initL
    return satelliteAlt
  }
  // 添加电子扫描光束
  viewer.entities.add({
    id: options.satelliteId + 'CylinderDZ',
    position: new Cesium.CallbackProperty(_updateCylinderPosition, false),
    cylinder: {
      length: new Cesium.CallbackProperty(changeLength, false),
      topRadius: 0.0,
      bottomRadius:
        Number(options.scanRange) > -1
          ? Number(options.scanRange) * 1000
          : 86000,
      showBottom: false,
      slices: 28,
      material: new Cesium.PulseMaterialProperty({
        repeat: new Cesium.Cartesian2(3.0, 3.0),
        color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
        flowSpeed: 25.0,
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
 * 电子扫描结束
 * @param {string} satelliteId 卫星id
 */
SatelliteActorCZML.prototype.electronicSatelliteScanEnd = function (options) {
  if (!options.satelliteId) {
    console.error('卫星id不合法.' + options.satelliteId)
    return
  }

  this.viewer.entities.removeById(options.satelliteId + 'CylinderDZ')
  this.viewer.entities.removeById(options.satelliteId + 'Ellipse')

  // let ds = this.viewer.dataSources.getByName(satelliteId)[0]
  // if (ds) {
  //   ds.entities.values[0].model.silhouetteSize = 0.0
  // }

  let ds = ''
  let satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      ds = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.getById(options.satelliteId)
    } else {
      ds = viewer.dataSources.getByName(options.satelliteId)[0]
      // 01 验证实体存在
      if (!ds) {
        return
      }
      satellite = ds.entities.values[0]
    }
  }
  this.removePrompt({ satelliteId: options.satelliteId, entity: satellite })
  this.removeEffect(satellite)
  // satellite.model.silhouetteSize = 0.0
}

/**
 * 目标跟踪
 * @param {string} params.satelliteId  卫星实体id
 * @param {string} params.eventName 事件名称
 * @param {Date}  params.date 事件开始时间
 */
SatelliteActorCZML.prototype.targetTracking = function (params) {
  let Cesium = this.Cesium
  let viewer = this.viewer

  // 删除定时器
  this.removeSingleSatelliteActor({
    actorName: '目标跟踪',
    satelliteId: params.satelliteId
  })

  // 获取卫星位置
  let satellite = viewer.dataSources
    .getByName(params.satelliteId)[0]
    .entities.getById(params.satelliteId)
  // 验证实体存在
  if (!Cesium.defined(satellite)) {
    console.error('SatelliteEntity is required.')
    return
  }
  viewer.entities.removeById(params.satelliteId + 'targetTracking')
  satellite.description = params.eventName

  // let corridorTime = Cesium.JulianDate.fromDate(params.date) //获取条带开始时间
  // // 持续时间
  // let duration = Cesium.JulianDate.addSeconds(
  //   corridorTime,
  //   60,
  //   new Cesium.JulianDate()
  // )

  //获取条带开始时间
  // let corridorTime = Cesium.JulianDate.fromDate(params.date);

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
  let frustumAreaMonitoring = new CreateFrustum({
    Cesium: Cesium,
    viewer: viewer,
    position: satellitePosition,
    orientation: quaternion,
    fov: 15,
    near: 10,
    far: tempAlt1,
    aspectRatio: 0.001,
    radian: 30,
    lineColor: lineColor,
    scanColor: new this.Cesium.Cartesian4(2.0, 4.0, 2.0),
    scanColor2: new this.Cesium.Cartesian4(2.0, 4.0, 2.0)
  })

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
  let frustumAreaMonitoringTime = setInterval(() => {
    // 获取卫星当前位置
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)
    // 根据卫星走向获取其orientation
    // let position = new Cesium.SampledProperty(Cesium.Cartesian3);
    if (beforeTime) {
      // 视锥扫描变化的角度heading
      heading = getHeading(position, satellitePosition)
      // hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      let verti = Cesium.Math.PI / 2
      hpr = new this.Cesium.HeadingPitchRoll(heading - verti, pitch, roll)
      quaternion = Cesium.Transforms.headingPitchRollQuaternion(
        satellitePosition,
        hpr
      )
      if (!isNaN(quaternion.x)) {
        frustumAreaMonitoring.update(satellitePosition, quaternion)
      }
      // frustumAreaMonitoring.update(satellitePosition, quaternion);
    }
    // 保存此次更新卫星的位置和时间
    beforeTime = currentTime
    position = satellite.position.getValue(beforeTime)
  }, 20)

  // 获取锥形宽度
  let width = tempCartographic1.height * Math.tan(Math.PI / 12)

  let startTime = viewer.clock.currentTime
  //console.log("time1",time1);
  let corridorChange = true
  function changePositionArray(time) {
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)

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
  // 创建条带
  viewer.entities.removeById(params.satelliteId + 'targetTracking')
  viewer.entities.add({
    id: params.satelliteId + 'targetTracking',
    corridor: {
      positions: new Cesium.CallbackProperty(changePositionArray, false),
      extrudedHeight: 10.0,
      width: width,
      // width: wid,
      cornerType: Cesium.CornerType.MITERED,
      material: new Cesium.ImageMaterialProperty({
        image: 'static/image/绿色矩形2.png'
        // color: Cesium.Color.YELLOW,
        // repeat : new Cesium.Cartesian2(1, 1)
      })
    }
  })
  // 保存动作
  this.satelliteActors.push({
    actorName: '目标跟踪',
    satelliteId: params.satelliteId,
    frustum: frustumAreaMonitoring,
    interval: frustumAreaMonitoringTime
  })
  // let viewerClockL = viewer.clock.onTick.addEventListener(() => {
  //   let res = Cesium.JulianDate.compare(viewer.clock.currentTime, duration)
  //   if (res >= 0) {
  //    console.log(params.satelliteId + '目标追踪结束')
  //     clearInterval(frustumAreaMonitoringTime)
  //     frustumAreaMonitoring.clear()
  //     corridorChange = false
  //     satellite.description = ''
  //     viewerClockL()
  //   }
  // })
}

/**
 * 目标跟踪结束
 * @param {string} params.satelliteId 卫星id
 * @param {obj} params.interval 定时器
 */
SatelliteActorCZML.prototype.targetTrackingEnd = function (params) {
  if (!params.satelliteId) {
    console.error('卫星id不合法.' + params.satelliteId)
    return
  }
  this.viewer.entities.removeById(params.satelliteId + 'Rectangle')
  if (params.interval) {
    clearInterval(params.interval)
  }
}

/**
 * 普查
 * @param {string} satelliteId 卫星id
 * @param {Date} date  事件触发时间
 * @param {string} eventName 事件名称
 */
SatelliteActorCZML.prototype.areaMonitoring = function (options) {
  let viewer = this.viewer
  let Cesium = this.Cesium

  // 删除定时器、视锥体、条带
  // this.removeSingleSatelliteActor({
  //   actorName: '普查',
  //   satelliteId: satelliteId
  // })

  viewer.entities.removeById(options.satelliteId + 'areaMonitoring')

  // //获取条带开始时间
  // let corridorTime = Cesium.JulianDate.fromDate(date)
  // // 持续时间
  // let duration = Cesium.JulianDate.addSeconds(
  //   corridorTime,
  //   180,
  //   new Cesium.JulianDate()
  // )

  // 获取卫星实体
  // viewer.dataSources._dataSources.forEach((item) => {
  //   if (item.name == satelliteId) {
  //     let satellite = item.entities.getById(satelliteId)
  //     // 验证实体是否存在
  //     if (!Cesium.defined(satellite)) {
  //       console.error('SatelliteEntity is required.')
  //       return
  //     }

  let dataSource = ''
  let satellite = viewer.entities.getById(options.satelliteId)
  if (!satellite) {
    if (options.czmlSource) {
      dataSource = viewer.dataSources.getByName(options.czmlSource)[0]
      // 01 验证实体存在
      if (!dataSource) {
        return
      }
      satellite = dataSource.entities.getById(options.satelliteId)
    } else {
      console.log('数据源不存在')
      return
    }
  }

  satellite.description = '普查'

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
  let lineColor = new this.Cesium.Color(0.0, 1.0, 1.0, 1.0)
  //  创建视锥体
  let frustumAreaMonitoring = new CreateFrustum({
    Cesium: Cesium,
    viewer: viewer,
    position: satellitePosition,
    orientation: quaternion,
    fov: 60,
    near: 0.1,
    far: tempAlt1,
    aspectRatio: 0.0001,
    radian: 30,
    lineColor: lineColor,
    scanColor: new Cesium.Cartesian4(4.0, 4.0, 0.0),
    scanColor2: new Cesium.Cartesian4(4.0, 4.0, 0.0),
    frustumName: options.satelliteId + 'pucha'
  })
  let pc = options.satelliteId + 'pucha'
  window[pc] = frustumAreaMonitoring

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
  let frustumAreaMonitoringTime = setInterval(() => {
    // 获取卫星当前位置
    let currentTime = viewer.clock.currentTime
    let satellitePosition = satellite.position.getValue(currentTime)

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

  // 获取锥形宽度
  let width = tempCartographic1.height * Math.tan(Math.PI / 6) * 2

  let corridorChange = true
  function changePositionArray() {
    // 判断时间轴改变的时间是否是初始时间
    let tempPosition = satellite.position.getValue(viewer.clock.currentTime)

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
  viewer.entities.removeById(options.satelliteId + 'areaMonitoring')
  viewer.entities.add({
    id: options.satelliteId + 'areaMonitoring',
    corridor: {
      positions: new Cesium.CallbackProperty(changePositionArray, false),
      extrudedHeight: 10.0,
      width: width,
      // width: wid,
      cornerType: Cesium.CornerType.MITERED,
      // material: new Cesium.ImageMaterialProperty({
      //     image: 'static/image/绿色矩形2.png',
      //     // color: Cesium.Color.YELLOW,
      //     // repeat : new Cesium.Cartesian2(1, 1)
      // }),
      material: new Cesium.EMIMaterialProperty({
        transparent: true,
        flowSpeed: 1.0,
        half: false,
        color: new this.Cesium.Color(1.0, 0.0, 0.0, 1.0),
        EMITransparent: 0.4
      })
    }
  })
  // 保存动作
  //console.log('定时器', frustumAreaMonitoringTime)
  var obj2 = Object.assign({}, frustumAreaMonitoring)
  //  this.satelliteActors.push({
  //    actorName: '区域扫描',
  //    satelliteId: config.satelliteId,
  //    frustum: obj2,
  //    interval: frustumTimer
  //  })
  this.satelliteActors.push({
    actorName: '普查',
    satelliteId: options.satelliteId,
    frustum: obj2,
    interval: frustumAreaMonitoringTime
  })
  // let viewerClockLXC = viewer.clock.onTick.addEventListener(() => {
  //   let res = Cesium.JulianDate.compare(viewer.clock.currentTime, duration)
  //   if (res >= 0) {
  //    console.log(satelliteId + '普查结束')
  //     clearInterval(frustumAreaMonitoringTime)
  //     frustumAreaMonitoring.clear()
  //     corridorChange = false
  //     satellite.description = ''
  //     viewerClockLXC()
  //   }
  // })
  //   }
  // })
}

/**
 * 普查结束
 * @param {string} params.satelliteId  卫星实体id
 * @param {obj} params.frustum  视锥体对象
 * @param {obj} params.inteval  定时器
 */
SatelliteActorCZML.prototype.areaMonitoringEnd = function (options) {
  for (let t = 0; t < this.satelliteActors.length; t++) {
    if (options.satelliteId == this.satelliteActors[t].satelliteId) {
      let params = this.satelliteActors[t]
      if (!params.satelliteId) {
        console.error('卫星id不合法.' + params.satelliteId)
        return
      }
      let a = this.viewer.entities.getById(
        params.satelliteId + 'areaMonitoring'
      )
      if (a) {
        this.viewer.entities.removeById(params.satelliteId + 'areaMonitoring')
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
        let bs = params.satelliteId + 'pucha'
        window[bs].clear()
      }
    }
  }

  // if (!params.satelliteId) {
  //   console.error('卫星id不合法.' + params.satelliteId)
  //   return
  // }
  // this.viewer.entities.removeById(params.satelliteId + 'areaMonitoring')
  // if (params.frustum) {
  //   clearInterval(params.interval)
  //   params.frustum.clear()
  // }
}

/**
 * 详查
 * @param {string} satelliteId 卫星实体id
 * @param {Date} date 事件触发时间
 *
 */
SatelliteActorCZML.prototype.closelookreconnaissance = function (
  satelliteId,
  date,
  eventName
) {
  let Cesium = this.Cesium
  let viewer = this.viewer

  // 清除三角锥、条带和定时器
  this.removeSingleSatelliteActor({
    actorName: '详查',
    satelliteId: satelliteId
  })
  viewer.entities.removeById(satelliteId + 'closelookreconnaissance')

  // let corridorTime = Cesium.JulianDate.fromDate(date) //获取条带开始时间
  // // 持续时间
  // let duration = Cesium.JulianDate.addSeconds(
  //   corridorTime,
  //   180,
  //   new Cesium.JulianDate()
  // )
  // 获取卫星实体
  viewer.dataSources._dataSources.forEach((item) => {
    if (item.name == satelliteId) {
      let satellite = item.entities.getById(satelliteId)
      // 验证对象是否存在
      if (!Cesium.defined(satellite)) {
        console.error('SatelliteEntity is required.')
        return
      }
      satellite.description = eventName

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
      let satellitePosition = satellite.position.getValue(
        viewer.clock.currentTime
      )
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
      // let viewerClockLPC = viewer.clock.onTick.addEventListener(() => {
      //   let res = Cesium.JulianDate.compare(viewer.clock.currentTime, duration)
      //   if (res >= 0) {
      //    console.log(satelliteId + '详查结束')
      //     clearInterval(closelookreconnaissanceTime)
      //     frustumCloselookreconnaissance.clear()
      //     corridorChange = false
      //     satellite.description = ''
      //     viewerClockLPC()
      //   }
      // })
    }
  })
}

/**
 * 详查结束
 * @param {string} params.satelliteId  卫星实体id
 * @param {obj} params.frustum  视锥体对象
 * @param {obj} params.interval  定时器
 */
SatelliteActorCZML.prototype.closelookreconnaissanceEnd = function (options) {
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
 * 区域扫描
 * @param {string} config.satelliteId  卫星id
 * @param {Date} config.startTime  事件开始时间
 * @param {string} config.eventName  事件名称
 * @param {Number} config.scanRadian  扫描角度-可选参数-默认值15
 * @param {Number} config.fov  视锥的视场角度-可选参数-默认值15
 * @param {Number} config.scanSpeed 扫描速度-可选参数-默认值0.01
 */
SatelliteActorCZML.prototype.areaScan = function (config) {
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
  // this.viewer.dataSources._dataSources.forEach((item) => {

  let dataSource = ''
  let satellite = viewer.entities.getById(config.satelliteId)
  if (!satellite) {
    if (config.czmlSource) {
      dataSource = viewer.dataSources.getByName(config.czmlSource)[0]
      // 01 验证实体存在
      if (!dataSource) {
        return
      }
      satellite = dataSource.entities.getById(config.satelliteId)
    } else {
      console.log('数据源不存在')
      return
    }
  }

  // if (item.name == config.satelliteId) {
  // let satellite = item.entities.getById(config.satelliteId)
  // // 验证实体是否存在
  // if (!this.Cesium.defined(satellite)) {
  //   console.error('SatelliteEntity is required.')
  //   return
  // }
  satellite.description = '区域扫描'
  // 事件开始时间
  // let startTime = Cesium.JulianDate.fromDate(config.startTime)

  // let actorStartTime = Cesium.JulianDate.fromDate(date);  //获取动作开始时间
  let startPositiontrack = satellite.position.getValue(viewer.clock.currentTime)
  let startCartographic = Cesium.Cartographic.fromCartesian(startPositiontrack)
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
  let satellitePosition = satellite.position.getValue(viewer.clock.currentTime)
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
      let diff = Cesium.JulianDate.secondsDifference(currentTime, beforeTime) //cesium 距上次时间差
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
  //   }
  // })
}

/**
 * 区域扫描结束
 * @param {string} params.satelliteId  卫星id
 * @param {obj} params.frustum  视锥体对象
 * @param {obj} params.interval  定时器
 */
SatelliteActorCZML.prototype.areaScanEnd = function (options) {
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

/**
 * 卫星指令上注
 * @param {string} params.posA 地面站bId
 * @param {string} params.posB 卫星bId
 * @param {Array} params.satelliteArray 场景中卫星信息列表
 * @param {Array} params.landStationArray 场景中地面站信息列表
 * @param {Array} params.date 开始时间
 */
SatelliteActorCZML.prototype.transmissionInvert = function (params) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  // 获取目标UUID
  let targetSatelliteUUID, targetLandStationUUID
  //  console.log(params.satelliteArray)
  params.satelliteArray.forEach((satelliteActor) => {
    if (satelliteActor.actorInfo.bId == params.posB) {
      targetSatelliteUUID = satelliteActor.actorInfo.UUID
    }
  })
  //  console.log(params.landStationArray)
  params.landStationArray.forEach((landStationActor) => {
    if (landStationActor.actorInfo.bId == params.posA) {
      targetLandStationUUID = landStationActor.actorInfo.UUID
    }
  })
  if (targetSatelliteUUID == undefined) {
    console.log('指令上注卫星id不存在!' + targetSatelliteUUID)
    return
  }
  if (targetLandStationUUID == undefined) {
    console.log('指令上注地面站id不存在!' + targetLandStationUUID)
    return
  }
  let satellite = viewer.dataSources
    .getByName(targetSatelliteUUID)[0]
    .entities.getById(targetSatelliteUUID)
  let landStation = viewer.entities.getById(targetLandStationUUID)
  landStation.description = '指令上注'
  function changeLength() {
    var YGPosition = satellite.position.getValue(viewer.clock.currentTime)
    var stationPosition = landStation.position.getValue(
      viewer.clock.currentTime
    )
    let satelliteCartographic =
      viewer.scene.globe.ellipsoid.cartesianToCartographic(YGPosition)
    let satellitelat = Cesium.Math.toDegrees(satelliteCartographic.latitude)
    let satellitelng = Cesium.Math.toDegrees(satelliteCartographic.longitude)
    let satellitealt = satelliteCartographic.height
    let stationCartographic =
      viewer.scene.globe.ellipsoid.cartesianToCartographic(stationPosition)
    let stationlat = Cesium.Math.toDegrees(stationCartographic.latitude)
    let stationlng = Cesium.Math.toDegrees(stationCartographic.longitude)
    let stationalt = stationCartographic.height
    let p = Cesium.Cartesian3.fromDegreesArrayHeights([
      stationlng,
      stationlat,
      stationalt,
      satellitelng,
      satellitelat,
      satellitealt
    ])
    return p
  }
  viewer.entities.removeById(targetSatelliteUUID + 'zlsz')
  let zlsz = viewer.entities.add({
    id: targetSatelliteUUID + 'zlsz',
    polyline: {
      positions: new Cesium.CallbackProperty(changeLength, false),
      width: 20,
      material: new Cesium.FlowLineMaterialProperty({
        transparent: true,
        mixColor: new Cesium.Color(0.0, 1.0, 1.0, 1.0),
        mixRatio: 0.9,
        flowSpeed: 4.0,
        image: require('@/assets/image/materials/green_line_1.png')
      })
    }
  })

  setTimeout(() => {
    //  console.log(targetSatelliteUUID + '指令上注结束')
    viewer.entities.remove(zlsz)
    satellite.description = ''
  }, params.time * 1000)
  let corridorTime = Cesium.JulianDate.fromDate(new Date(params.date)) //获取指令上注开始时间
  // 持续时间
  let lastTime = params.time || 15
  let duration = Cesium.JulianDate.addSeconds(
    corridorTime,
    lastTime,
    new Cesium.JulianDate()
  )
  let viewerClockLZLSZ = viewer.clock.onTick.addEventListener(() => {
    let res = Cesium.JulianDate.compare(viewer.clock.currentTime, duration)
    if (res >= 0) {
      //  console.log(targetSatelliteUUID + '指令上注结束')
      viewer.entities.remove(zlsz)
      satellite.description = ''
      viewerClockLZLSZ()
    }
  })
}

/**
 * 卫星指令上注结束
 * @param {obj} params.posB 是要删除的指令上注效果的卫星bId
 * @param {Array} params.satelliteArray 场景中卫星信息列表
 */
SatelliteActorCZML.prototype.transmissionInvertEnd = function (params) {
  // 获取目标UUID
  let targetSatelliteUUID
  params.satelliteArray.forEach((satelliteActor) => {
    if (satelliteActor.actorInfo.bId == params.posB) {
      targetSatelliteUUID = satelliteActor.actorInfo.UUID
    }
  })
  this.viewer.entities.removeById(targetSatelliteUUID + 'zlsz')
}

/**
 * 卫星数据回传
 * @param {string} params.posA 卫星bId
 * @param {string} params.posB 地面站bId
 * @param {Array} params.satelliteArray 场景中卫星信息列表
 * @param {Array} params.landStationArray 场景中地面站信息列表
 * @param {string} params.date 动作开始时间
 */
SatelliteActorCZML.prototype.transmission = function (params) {
  let Cesium = this.Cesium
  let viewer = this.viewer
  // 获取目标UUID
  let targetSatelliteUUID, targetLandStationUUID
  params.satelliteArray.forEach((satelliteActor) => {
    if (satelliteActor.actorInfo.bId == params.posA) {
      targetSatelliteUUID = satelliteActor.actorInfo.UUID
    }
  })
  params.landStationArray.forEach((landStationActor) => {
    if (landStationActor.actorInfo.bId == params.posB) {
      targetLandStationUUID = landStationActor.actorInfo.UUID
    }
  })
  if (targetSatelliteUUID == undefined) {
    console.log('数据回传卫星id不存在!' + targetSatelliteUUID)
    return
  }
  if (targetLandStationUUID == undefined) {
    console.log('数据回传地面站id不存在!' + targetLandStationUUID)
    return
  }
  let satellite = viewer.dataSources
    .getByName(targetSatelliteUUID)[0]
    .entities.getById(targetSatelliteUUID)
  satellite.description = '数据回传'
  let landStation = viewer.entities.getById(targetLandStationUUID)
  function changeLength() {
    var YGPosition = satellite.position.getValue(viewer.clock.currentTime)
    var stationPosition = landStation.position.getValue(
      viewer.clock.currentTime
    )
    let satelliteCartographic =
      viewer.scene.globe.ellipsoid.cartesianToCartographic(YGPosition)
    let satellitelat = Cesium.Math.toDegrees(satelliteCartographic.latitude)
    let satellitelng = Cesium.Math.toDegrees(satelliteCartographic.longitude)
    let satellitealt = satelliteCartographic.height
    let stationCartographic =
      viewer.scene.globe.ellipsoid.cartesianToCartographic(stationPosition)
    let stationlat = Cesium.Math.toDegrees(stationCartographic.latitude)
    let stationlng = Cesium.Math.toDegrees(stationCartographic.longitude)
    let stationalt = stationCartographic.height
    let p = Cesium.Cartesian3.fromDegreesArrayHeights([
      satellitelng,
      satellitelat,
      satellitealt,
      stationlng,
      stationlat,
      stationalt
    ])
    return p
  }
  viewer.entities.removeById(targetSatelliteUUID + 'sjhc')
  let sjhc = viewer.entities.add({
    name: 'Glowing blue line on the surface',
    id: targetSatelliteUUID + 'sjhc',
    polyline: {
      positions: new Cesium.CallbackProperty(changeLength, false),
      width: 20,
      material: new Cesium.FlowLineMaterialProperty({
        transparent: true,
        mixColor: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
        mixRatio: 0.9,
        flowSpeed: 4.0,
        image: require('@/assets/image/materials/green_line_1.png')
      })
    }
  })

  let corridorTime = Cesium.JulianDate.fromDate(new Date(params.date)) //获取数据回传开始时间
  // 持续时间
  let lastTime = params.time || 15
  let duration = Cesium.JulianDate.addSeconds(
    corridorTime,
    lastTime,
    new Cesium.JulianDate()
  )
  let viewerClockLSJHC = viewer.clock.onTick.addEventListener(() => {
    let res = Cesium.JulianDate.compare(viewer.clock.currentTime, duration)
    if (res >= 0) {
      console.log(targetSatelliteUUID + '指令数据回传结束')
      viewer.entities.remove(sjhc)
      satellite.description = ''
      viewerClockLSJHC()
    }
  })
}

/**
 * 卫星数据回传结束
 * @param {string} params.posA 要删除的数据回传效果的卫星bId
 * @param {Array} params.satelliteArray 场景中卫星信息列表
 */
SatelliteActorCZML.prototype.transmissionEnd = function (params) {
  // 获取目标UUID
  let targetSatelliteUUID
  params.satelliteArray.forEach((satelliteActor) => {
    if (satelliteActor.actorInfo.bId == params.posA) {
      targetSatelliteUUID = satelliteActor.actorInfo.UUID
    }
  })
  this.viewer.entities.removeById(targetSatelliteUUID + 'sjhc')
}

// 清除所有动作(每次事件跳转时会用到)
/**
 * 删除所有卫星动作
 */
SatelliteActorCZML.prototype.removeAllSatelliteActors = function () {
  if (this.satelliteActors && this.satelliteActors.length > 0) {
    for (let i = this.satelliteActors.length - 1; i >= 0; i--) {
      let satelliteActorInfo = this.satelliteActors[i]
      let actorName = this.satelliteActors[i].actorName
      // 结束动作不处理,它没有动画
      switch (actorName) {
        case '指令上注':
          this.viewer.entities.removeById(
            satelliteActorInfo.satelliteId + 'zlsz'
          )
          break
        case '数据回传':
          this.viewer.entities.removeById(
            satelliteActorInfo.satelliteId + 'sjhc'
          )
          break
        case '卫星姿态异常':
          break
        case '电量耗尽异常':
          this.batteryRunsOutEnd(satelliteActorInfo)
          break
        case '电子载荷开机':
          this.turnOffEnd(satelliteActorInfo)
          break
        case '光学载荷扫描':
          this.opticalSatelliteScanEnd(satelliteActorInfo)
          break
        case '普查':
          this.areaMonitoringEnd(satelliteActorInfo)
          break
        case '详查':
          this.closelookreconnaissanceEnd(satelliteActorInfo)
          break
        case '区域扫描':
          this.areaScanEnd(satelliteActorInfo)
          break
        case '目标跟踪':
          this.targetTrackingEnd(satelliteActorInfo)
          break
        case '详查':
          this.closelookreconnaissanceEnd(satelliteId)
          break
        case '普查':
          this.areaMonitoringEnd(satelliteId)
          break
      }
      // 修改description
      this.viewer.dataSources._dataSources.forEach((item) => {
        if (item.name == satelliteActorInfo.satelliteId) {
          let satellite = item.entities.getById(satelliteActorInfo.satelliteId)
          satellite.description._value = ''
        }
      })
      // 从卫星动作数组中删除动作
      this.satelliteActors.pop()
    }
  }
}

// 删除单个动作(解决不同卫星设置同一个动作的情况)
/**
 * @param {string} params.actorName 动作名称
 * @param {string} params.satelliteId 卫星id
 */
SatelliteActorCZML.prototype.removeSingleSatelliteActor = function (params) {
  if (this.satelliteActors && this.satelliteActors.length > 0) {
    for (let i = this.satelliteActors.length - 1; i >= 0; i--) {
      if (
        this.satelliteActors[i].actorName == params.actorName &&
        this.satelliteActors[i].satelliteId == params.satelliteId
      ) {
        // 删除动作
        let satelliteActorInfo = this.satelliteActors[i]
        //  console.log(params.actorName)
        switch (params.actorName) {
          case '指令上注':
            this.viewer.entities.removeById(
              satelliteActorInfo.satelliteId + 'zlsz'
            )
            break
          case '数据回传':
            this.viewer.entities.removeById(
              satelliteActorInfo.satelliteId + 'sjhc'
            )
            break
          case '卫星姿态异常':
            break
          case '电量耗尽异常':
            this.batteryRunsOutEnd(satelliteActorInfo)
            break
          case '电子载荷开机':
            this.turnOffEnd(satelliteActorInfo)
            break
          case '光学载荷扫描':
            this.opticalSatelliteScanEnd(satelliteActorInfo)
            break
          case '普查':
            this.areaMonitoringEnd(satelliteActorInfo)
            break
          case '详查':
            this.closelookreconnaissanceEnd(satelliteActorInfo)
            break
          case '区域扫描':
            this.areaScanEnd(satelliteActorInfo)
            break
          case '目标跟踪':
            this.targetTrackingEnd(satelliteActorInfo)
            break
          case '详查':
            this.closelookreconnaissanceEnd(satelliteId)
            break
          case '普查':
            this.areaMonitoringEnd(satelliteId)
            break
        }
        // 修改description
        this.viewer.dataSources._dataSources.forEach((item) => {
          if (item.name == satelliteActorInfo.satelliteId) {
            let satellite = item.entities.getById(
              satelliteActorInfo.satelliteId
            )
            satellite.description._value = ''
          }
        })
        // 从卫星动作数组中删除动作
        this.satelliteActors.pop()
      }
    }
  }
}

//设置点闪光 以及字体效果
SatelliteActorCZML.prototype.setEffect = function (satellite, name) {
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

  let outlineColor = Cesium.Color.AQUA
  if (name == '载荷异常') {
    outlineColor = Cesium.Color.RED
  }
  if (satellite.point) {
    satellite.point.pixelSize = new Cesium.CallbackProperty(updateSize, false)
    satellite.point.outlineColor = outlineColor
    satellite.point.outlineWidth = 2
  }
}

//取消设置点闪光 以及字体效果
SatelliteActorCZML.prototype.removeEffect = function (satellite) {
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
    satellite.point.pixelSize = 1.5
    satellite.point.outlineColor = Cesium.Color.AQUA
    satellite.point.outlineWidth = 0
  }
}

//定点扫描
SatelliteActorCZML.prototype.fixedPointScan = function (params) {
  let Cesium = this.Cesium
  let viewer = this.viewer

  //先清除
  viewer.entities.removeById(params.sourceId + 'fixedPointScan')
  //获取实体
  let sourceEntity = viewer.entities.getById(params.sourceId)
  let targetEntity = new Cesium.Cartesian3.fromDegrees(
    params.targetEntity.lon,
    params.targetEntity.lat,
    params.targetEntity.alt
  ) //viewer.entities.getById(params.targetId)
  if (!sourceEntity || !targetEntity) {
    return
  }
  this.setEffect(sourceEntity, '扫描')
  // sourceEntity.description = '扫描'
  viewer.entities.add({
    id: params.sourceId + 'fixedPointScan',
    orientation: new Cesium.CallbackProperty((e) => {
      let sourcePosition = sourceEntity.position.getValue(
        viewer.clock.currentTime
      )
      let targetPosition = targetEntity
      // .position.getValue(
      //   viewer.clock.currentTime
      // )
      let m = this.getModelMatrix(sourcePosition, targetPosition)
      let hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(m)
      hpr.pitch = hpr.pitch + 3.14 / 2 + 3.14
      return Cesium.Transforms.headingPitchRollQuaternion(sourcePosition, hpr)
    }, false),
    position: new Cesium.CallbackProperty((e) => {
      let sourcePosition = sourceEntity.position.getValue(
        viewer.clock.currentTime
      )
      let targetPosition = targetEntity
      // .position.getValue(
      //   viewer.clock.currentTime
      // )
      return Cesium.Cartesian3.midpoint(
        sourcePosition,
        targetPosition,
        new Cesium.Cartesian3()
      )
    }, false),
    cylinder: {
      length: new Cesium.CallbackProperty((e) => {
        let sourcePosition = sourceEntity.position.getValue(
          viewer.clock.currentTime
        )
        let targetPosition = targetEntity
        // .position.getValue(
        //   viewer.clock.currentTime
        // )
        return Cesium.Cartesian3.distance(sourcePosition, targetPosition)
      }, false),
      topRadius: Number(params.scanRange) * 1000,
      bottomRadius: 10.0,
      material: new Cesium.PulseMaterialProperty({
        repeat: new Cesium.Cartesian2(3.0, 3.0),
        color: new Cesium.Color(0.8, 0.4, 0.2, 1.0),
        flowSpeed: 120.0,
        transparent: true
      })
      // new Cesium.CylinderWaveMaterialProperty({
      //   color: Cesium.Color.YELLOW,
      //   repeat: 30.0,
      //   offset: 0.8,
      //   thickness: 0.3
      // })
    }
  })
}
SatelliteActorCZML.prototype.getModelMatrix = function (
  originPosition,
  targetPosition
) {
  //向量AB
  let vector2 = Cesium.Cartesian3.subtract(
    targetPosition,
    originPosition,
    new Cesium.Cartesian3()
  )
  //归一化
  let normal = Cesium.Cartesian3.normalize(vector2, new Cesium.Cartesian3())
  //旋转矩阵 rotationMatrixFromPositionVelocity源码中有，并未出现在cesiumAPI中
  let rotationMatrix3 = Cesium.Transforms.rotationMatrixFromPositionVelocity(
    originPosition,
    normal
  )
  let orientation = Cesium.Quaternion.fromRotationMatrix(rotationMatrix3)
  const modelMatrix4 = Cesium.Matrix4.fromRotationTranslation(
    rotationMatrix3,
    originPosition
  )
  //点B的模型矩阵
  //const modelMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix3, pointB);
  const hpr = Cesium.HeadingPitchRoll.fromQuaternion(orientation)
  var orientation2 = Cesium.Transforms.headingPitchRollQuaternion(
    originPosition,
    hpr
  )
  return modelMatrix4
}

//定点扫描结束
SatelliteActorCZML.prototype.fixedPointScanEnd = function (options) {
  //删除扫描体
  viewer.entities.removeById(options.sourceId + 'fixedPointScan')
  //去除label
  let entity = viewer.entities.getById(options.sourceId)
  this.removeEffect(entity)
}

//添加信息提示框
SatelliteActorCZML.prototype.loadPrompt = function (options) {
  if (!options.entity) {
    return
  }
  let style = {
    background: '#38e1ff4a',
    color: 'ivory'
  }
  if (options.msg == '载荷异常') {
    style = {
      background: '#ff00008d',
      color: 'ivory'
    }
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
    }, // 点击关闭按钮的回调函数
    style: style
  })
  // options.entity.viewFrom = new Cesium.Cartesian3(-42080, -35715, 38079)
}
//删除信息提示框
SatelliteActorCZML.prototype.removePrompt = function (options) {
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

SatelliteActorCZML.prototype.setPosition = function (options) {
  // let obj = options.satellite
  let ds = ''
  let satellite = ''
  satellite = viewer.entities.getById(options.satelliteId)
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
  if (!satellite) {
    return
  }
  let virwerPosition = satellite.position.getValue(viewer.clock.currentTime)
  let cartographic = Cesium.Cartographic.fromCartesian(virwerPosition)
  let longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
  let latitudeString = Cesium.Math.toDegrees(cartographic.latitude)
  let heightString = cartographic.height
  viewer.camera.flyTo({
    destination: new Cesium.Cartesian3.fromDegrees(
      longitudeString,
      latitudeString,
      9e5
    ),
    duration: 3, // 以秒为单位的飞行持续时间。
    maximumHeight: 20000, // 飞行高峰时（切换视角时）的最大高度。
    complete: function () {
      satellite.viewFrom = new Cesium.Cartesian3(-42080, -35715, 38079)
      viewer.trackedEntity = satellite
    }
  })
}

export default SatelliteActorCZML
