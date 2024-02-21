import store from '@/store/index'
import * as turf from '@turf/turf'

let satellitNetArray = []
let satellitIdArray = []
let showPoseFlag = false

/**
 * 卫星组网
 * @param {*} params
 */
export function satelliteNetConnect(params) {
  // 星网唯一颜色
  let netColor
  // 类名修正
  // typeDeal(params.edges)

  // 保存组网消息到vuex
  // let nets = store.getters.getSatelliteNetArray
  // let netIndex = nets.findIndex(item => item.linkID == params.linkID)
  // if (netIndex > -1) {
  //   store.commit('removeSatelliteNetArray', params)
  // }
  // store.commit('setSatelliteNetArray', params)
  let ExitNet = []
  if (params.edges && params.edges.length > 0) {
    showPoseFlag = false
    let CloudNet = getNetSource(params) // 此数据源的名称需要传参
    if (!CloudNet) return
    //当前数据源中存在的所有实体
    let allNetEntity = CloudNet.entities
    // 获取该网颜色
    netColor = CloudNet.color
    console.log(netColor);
    // 更新网
    if (allNetEntity.length > 0) {
      // showPoseFlag = true
      let existNet = []
      //获取当前数据源中存在的实体的id
      allNetEntity.forEach((element) => {
        existNet.push({ id: element.id })
      })
      //筛选出 刷新后不存在的网
      let targetArray = params.edges
      let noExitNet = []

      noExitNet = existNet.filter(
        (sourceObj) =>
          !targetArray.some((targetObj) => {
            // let msg = targetObj.sourID + '==' + targetObj.targID
            let msg = `${targetObj.sourID}==${targetObj.sourSensorType}==${targetObj.targID}==${targetObj.targSensorType}`
            if (sourceObj.id == msg) {
              return true
            } else {
              return false
            }
          })
      )
      noExitNet = noExitNet.filter((item) => !item.id.includes('reverse'))
      ExitNet = allNetEntity.filter(item => {
        return !noExitNet.some(obj => obj.id == item.id)
      })
      ExitNet = ExitNet.filter((item) => !item.id.includes('reverse'))

      // 删除掉刷新后不存在的网
      for (let m = 0; m < noExitNet.length; m++) {
        if (!noExitNet[m].id.includes('==')) continue
        let noExitId = noExitNet[m].id.split('==')
        let sourceSource = window.EarthViewer.dataSources.getByName(noExitId[1])
        let targetSource = window.EarthViewer.dataSources.getByName(noExitId[3])
        if (sourceSource.length == 0 || targetSource.length == 0) continue
        let entity1 = sourceSource[0].entities.getById(noExitId[0])
        let entity2 = targetSource[0].entities.getById(noExitId[2])
        // let entity1 = window.EarthViewer.dataSources.getByName(noExitId[1]) ? sourceSource[0].entities.getById(noExitId[0])
        //   : window.EarthViewer.entities.getById(noExitId[0])
        // let entity2 = window.EarthViewer.dataSources.getByName(noExitId[3]) ? sourceSource[0].entities.getById(noExitId[2])
        //   : window.EarthViewer.entities.getById(noExitId[2])
        //去掉闪烁
        if (!entity1 || !entity2) continue
        satelliteStyleRecover(entity1, true)
        satelliteStyleRecover(entity2, true)
        // 删除连线
        if (CloudNet.entities.length > 0) {
          // let a = CloudNet.entities.removeById(noExitNet[m].id)
          // let b = CloudNet.entities.removeById('reverse' + noExitNet[m].id)
          let a = window.EarthViewer.entities.removeById(noExitNet[m].id)
          let b = window.EarthViewer.entities.removeById('reverse' + noExitNet[m].id)
        }
      }

      // 组网恢复闪烁  因有的卫星还在连线，但在与其他被删除卫星连线中被一同取消了闪烁
      for (let i = 0; i < ExitNet.length; i++) {
        if (!ExitNet[i].id.includes('==')) continue
        let ExitId = ExitNet[i].id.split('==')
        let sourceSource = window.EarthViewer.dataSources.getByName(ExitId[1])
        let targetSource = window.EarthViewer.dataSources.getByName(ExitId[3])
        if (sourceSource.length == 0 || targetSource.length == 0) continue
        let entity1 = sourceSource[0].entities.getById(ExitId[0])
        let entity2 = targetSource[0].entities.getById(ExitId[2])
        // let entity1 = window.EarthViewer.dataSources.getByName(ExitId[1]) ? sourceSource[0].entities.getById(ExitId[0])
        //   : window.EarthViewer.entities.getById(ExitId[0])
        // let entity2 = window.EarthViewer.dataSources.getByName(ExitId[3]) ? sourceSource[0].entities.getById(ExitId[2])
        //   : window.EarthViewer.entities.getById(ExitId[2])
        if (!entity1 || !entity2) continue
        satelliteConnectStyle(entity1)
        satelliteConnectStyle(entity2)
      }
    } else {
      // 初始网，飞行到网
      if (params.reconnect == undefined) {
        // flyToNet(params.edges[0])
      }
      // fadeSatellites(false)
      // 气泡窗
      // let source11 = window.EarthViewer.dataSources.getByName(params.edges[0].sourSensorType)
      // let entity11 = source11[0].entities.getById(params.edges[0].sourID)
      // if (entity11) {
      //   popWindow({
      //     entity: entity11,
      //     linkID: params.linkID,
      //     CloudNet: CloudNet,
      //   })
      //   if (window.linkId.indexOf(params.linkID) < 0) {
      //     window.linkId.push(params.linkID)
      //   }
      // }
      // 范围墙
      // surroundingWall(params.linkID, netColor)
      // window.EarthViewer.entities.add({
      //   id: 'GalaxyMaterial',
      //   rectangle: {
      //     coordinates: Cesium.Rectangle.fromDegrees(-180.0, -45.0, 180.0, 45.0),
      //     // extrudedHeight: 0.0,
      //     height: 2000000.0,
      //     material: new Cesium.GalaxyMaterialProperty({
      //       time2: 0.01,
      //       transparent: true
      //     })
      //   }
      // })
    }
    // 滤出新增网
    let newNet = []
    for (let index = 0; index < params.edges.length; index++) {
      const element = params.edges[index];
      let entitiId = `${element.sourID}==${element.sourSensorType}==${element.targID}==${element.targSensorType}`
      let inc = ExitNet.find(item => item.id == entitiId)
      if (!inc) {
        newNet.push(element)
      }
    }

    if (newNet.length > 0) {
      // 外围墙
      window.EarthViewer.entities.removeById(CloudNet.name + '-wall-trail')
      // surroundingWall(CloudNet, netColor)
    }

    for (let t = 0; t < newNet.length; t++) {
      let netData = newNet[t]
      let entitiId = `${netData.sourID}==${netData.sourSensorType}==${netData.targID}==${netData.targSensorType}`
      //根据关系网判断当前的数据源中的是否存在该关系网
      let netEntity = CloudNet.entities.find(item => item.linkID == entitiId)
      if (netEntity) {
        continue
      }
      showPose({
        sourID: netData.sourID,
        sourType: netData.sourSensorType,
        targID: netData.targID,
        targType: netData.targSensorType,
        net: CloudNet,
        netColor: netColor
      })
    }

    //亮相结束连线
    let showPoseListener = setInterval(() => {
      if (showPoseFlag) {
        createFlowNet({
          CloudNet: CloudNet,
          edges: newNet,
          netColor: netColor
        })
        clearInterval(showPoseListener)
      }
    }, 300)
  }
}

/**
 * 连接成流动线
 * @param {*} params
 */
function createFlowNet(params) {
  let CloudNet = params.CloudNet
  for (let t = 0; t < params.edges.length; t++) {
    let netData = params.edges[t]
    creatNetToSource({
      sourID: netData.sourID,
      sourType: netData.sourSensorType,
      targID: netData.targID,
      targType: netData.targSensorType,
      net: CloudNet,
      netColor: params.netColor
    })
  }
}

/**
 * 类别校正
 * @param {*} data
 */
function typeDeal(data) {
  let typeHash = {
    1: 'electric',
    2: 'sar',
    3: 'radar',
    4: 'light',
    5: 'highLight',
    6: 'red'
  }
  for (let index = 0; index < data.length; index++) {
    const element = data[index]
    let t = element.sourSensorType
    element.sourSensorType = typeHash[t]
    let t1 = element.targSensorType
    element.targSensorType = typeHash[t1]
  }
}

/**
 * 组网定位
 * @param {*} params
 */
// function flyToNet(params) {
//   let sourceSource = window.EarthViewer.dataSources.getByName(satelliteSensorTypeNumToDSName(params.sourSensorType))
//   if (sourceSource.length == 0) return
//   //获取实体
//   let entity1 = sourceSource[0].entities.getById(params.sourID)
//   if (!entity1) return
//   window.EarthViewer.flyTo(entity1, {
//     offset: new window.XEarth.HeadingPitchRange(
//       6.283185307179585, -1.5685439448675385,
//       // -1.342200585246483,
//       5000000
//     )
//   })
// }

/**
 * 创建组网数据源
 * @param {*} params
 */
function CreatNetSource(params) {
  let Cesium = window.XEarth
  let viewer = window.viewer
  let ds = window.EarthViewer.dataSources.getByName(params.SourceName)
  let Net = ''
  if (ds.length > 0) {
    Net = ds[0]
    // console.log('已存在');
  } else {
    Net = new Cesium.CustomDataSource(params.SourceName)
    window.EarthViewer.dataSources.add(Net)
    // Net.entities.add({
    //   id: "notremove",
    //   polyline: {
    //     positions: new window.XEarth.CallbackProperty(() => [], false),
    //   }
    // });
  }
  return Net
}

/**
 * 获取存放组网数据
 * @param {*} params
 */
function getNetSource(params) {
  let Cesium = window.XEarth
  let viewer = window.viewer
  // let ds = window.EarthViewer.dataSources.getByName(params.SourceName)
  let ds = satellitNetArray.find(net => net.linkID == params.linkID)
  let Net = {}
  if (ds) {
    Net = ds
    // let targets = params.edges
    // // console.log('已存在');
    // Net.entities = []
    // for (let index = 0; index < targets.length; index++) {
    //   const element = targets[index];
    //   Net.entities.push({ id: `${element.sourID}==${element.sourType}==${element.targID}==${element.targType}` })
    // }
  } else {
    let targets = params.edges
    Net.linkID = params.linkID
    let warmColor = randomWarmColor()
    Net.color = new Cesium.Color(warmColor[0] / 255, warmColor[1] / 255, warmColor[2] / 255)
    Net.netColorRgb = warmColor
    Net.entities = []
    // for (let index = 0; index < targets.length; index++) {
    //   const element = targets[index];
    //   Net.entities.push({ id: `${element.sourID}==${element.sourType}==${element.targID}==${element.targType}` })
    // }
    satellitNetArray.push(Net)
  }
  return Net
}

/**
 * 添加关系网实体到对应组网数据源
 * @param {*} params
 */
function creatNetToSource(params) {
  // console.log(params.sourID + params.targID)
  //此处获取datasource  是因为第一次加载卫星使用的是czml  现在已不使用czml方式
  let sourceSource = window.EarthViewer.dataSources.getByName(params.sourType)
  let targetSource = window.EarthViewer.dataSources.getByName(params.targType)
  if (sourceSource.length == 0 || targetSource.length == 0) return
  // //获取实体
  let entity1 = sourceSource[0].entities.getById(params.sourID)
  let entity2 = targetSource[0].entities.getById(params.targID)
  // let entity1 = window.EarthViewer.dataSources.getByName(params.sourType) ? sourceSource[0].entities.getById(params.sourID)
  //   : window.EarthViewer.entities.getById(params.sourID)
  // let entity2 = window.EarthViewer.dataSources.getByName(params.targType) ? sourceSource[0].entities.getById(params.targID)
  //   : window.EarthViewer.entities.getById(params.targID)
  if (!entity1 || !entity2) return

  //改变位置
  function changePos() {
    // if (!window.EarthViewer.dataSources.contains(params.net)) {
    //   window.EarthViewer.clock.shouldAnimate = true
    //   return
    // }
    let position
    let entityPos1 = entity1.position.getValue(window.EarthViewer.clock.currentTime)
    let entityPos2 = entity2.position.getValue(window.EarthViewer.clock.currentTime)
    if (!entityPos1 || !entityPos2) return

    position = [entityPos1, entityPos2]

    return position
  }
  // let mixColor =
  //   entity1.point.color._value ||
  //   new window.XEarth.Color(0 / 255, 0 / 255, 255 / 255, 1.0)
  let mixColor = params.netColor

  let lineEntity = window.EarthViewer.entities.getById(
    `${params.sourID}==${params.sourType}==${params.targID}==${params.targType}`
  )
  let polylinegraph = {
    positions: new window.XEarth.CallbackProperty(changePos, false),
    arcType: window.XEarth.ArcType.NONE,
    width: 15,
    material: new window.XEarth.FlowLineMaterialProperty({
      transparent: true,
      mixColor: mixColor,
      repeat: new window.XEarth.Cartesian2(8, 8),
      mixRatio: 0.9,
      flowSpeed: 5,
      image: require('/public/static/image/texture/materialline.png')
    })
  }
  let polylinegraphReverse = {
    positions: new window.XEarth.CallbackProperty(changePos, false),
    // arcType: window.XEarth.ArcType.NONE,
    width: 15,
    material: new window.XEarth.FlowLineMaterialProperty({
      transparent: true,
      mixColor: mixColor,
      repeat: new window.XEarth.Cartesian2(8, 8),
      mixRatio: 0.9,
      flowSpeed: -5,
      image: require('/public/static/image/texture/reverseMaterialline.png')
    })
  }
  // console.log(lineEntity)
  if (lineEntity) {
    lineEntity.polyline = polylinegraph
    let reverseId = `reverse${params.sourID}==${params.sourType}==${params.targID}==${params.targType}`
    let reverseEn = window.EarthViewer.entities.getById(reverseId)
    if (reverseEn) return
    window.EarthViewer.entities.add({
      id: reverseId,
      polyline: polylinegraphReverse
    })
    // params.net.entities.push({id: })
  }
  // else {
  //   params.net.entities.add({
  //     id: `${params.sourID}==${params.sourType}==${params.targID}==${params.targType}`,
  //     polyline: polylinegraph
  //   })
  // }

}

/**
 * 组网亮相
 * @param {*} params
 */
function showPose(params) {
  let Cesium = window.XEarth
  //
  let sourceSource = window.EarthViewer.dataSources.getByName(params.sourType)
  let targetSource = window.EarthViewer.dataSources.getByName(params.targType)
  if (sourceSource.length == 0 || targetSource.length == 0) {
    return
  }
  // //获取实体
  let entity1 = sourceSource[0].entities.getById(params.sourID)
  let entity2 = targetSource[0].entities.getById(params.targID)
  // let entity1 = window.EarthViewer.dataSources.getByName(params.sourType) ? sourceSource[0].entities.getById(params.sourID)
  //   : window.EarthViewer.entities.getById(params.sourID)
  // let entity2 = window.EarthViewer.dataSources.getByName(params.targType) ? sourceSource[0].entities.getById(params.targID)
  //   : window.EarthViewer.entities.getById(params.targID)
  if (!entity1 || !entity2) {
    return
  }
  // 组网卫星样式恢复
  satelliteStyleRecover(entity1)
  satelliteStyleRecover(entity2)
  // 组网卫星闪烁
  satelliteConnectStyle(entity1)
  satelliteConnectStyle(entity2)

  // let mixColor =
  //   entity1.point.color._value ||
  //   new window.XEarth.Color(0 / 255, 0 / 255, 255 / 255, 1.0)
  let mixColor = params.netColor
  // window.EarthViewer.clock.shouldAnimate = false
  window.EarthViewer.entities.removeById(`${params.sourID}==${params.sourType}==${params.targID}==${params.targType}`)
  window.EarthViewer.entities.add({
    id: `${params.sourID}==${params.sourType}==${params.targID}==${params.targType}`,
    polyline: {
      positions: new window.XEarth.CallbackProperty(changePos, false),
      arcType: window.XEarth.ArcType.NONE,
      width: 10,
      material: new window.XEarth.PolylineGlowMaterialProperty({
        color: mixColor,
        glowPower: 0.1
      })
    }
  })
  params.net.entities.push({ id: `${params.sourID}==${params.sourType}==${params.targID}==${params.targType}` })

  let sp = window.EarthViewer.clock.multiplier
  let stepNum = sp < 5 ? 100 - sp * 20 : 2
  let stepIndex = 1
  //改变位置
  function changePos() {
    // if (!Cesium.defined(params.net)) return
    let position
    let entityPos1 = entity1.position.getValue(window.EarthViewer.clock.currentTime)
    let entityPos2 = entity2.position.getValue(window.EarthViewer.clock.currentTime)
    if (!entityPos1 || !entityPos2) {
      return
    }
    var entityCartographic = Cesium.Cartographic.fromCartesian(entityPos1)
    let sourceLng = Cesium.Math.toDegrees(entityCartographic.longitude)
    let sourceLat = Cesium.Math.toDegrees(entityCartographic.latitude)
    let sourceAlt = entityCartographic.height
    var entity1Cartographic = Cesium.Cartographic.fromCartesian(entityPos2)
    let destinateLng = Cesium.Math.toDegrees(entity1Cartographic.longitude)
    let destinateLat = Cesium.Math.toDegrees(entity1Cartographic.latitude)
    let destinateAlt = entity1Cartographic.height
    let lngStep = (destinateLng - sourceLng) / stepNum
    let latStep = (destinateLat - sourceLat) / stepNum
    let altStep = (destinateAlt - sourceAlt) / stepNum
    let changelng = sourceLng,
      changelat = sourceLat,
      changealt = sourceAlt
    if (stepIndex < stepNum) {
      changelng += stepIndex * lngStep
      changelat += stepIndex * latStep
      changealt += stepIndex * altStep
    } else {
      changelng = destinateLng
      changelat = destinateLat
      changealt = destinateAlt
      showPoseFlag = true
    }
    stepIndex += 1
    position = window.XEarth.Cartesian3.fromDegreesArrayHeights([
      sourceLng,
      sourceLat,
      sourceAlt,
      changelng,
      changelat,
      changealt
    ])
    return position
  }
}

/**
 * 星网气泡窗（指向任意星）
 * @param {*} entity
 * @param {*} linkID
 */
function popWindow(options) {
  let bubble = new divBubble({
    viewer: window.viewer,
    Cesium: window.XEarth,
    title: `任务规划微云`,
    id: options.linkID,
    // color: options.CloudNet.netColorRgb,
    entity: options.entity,
    content: [{
      name: '',
      value: '正在任务规划中...  ',
    }],
    distanceDisplayCondition: [0, 6e8]
  })
  options.CloudNet.bubble = bubble
}

/**
 * 卫星范围墙
 * @param {Array} positions 网中卫星id
 */
function surroundingWall(CloudNet, netColor) {
  if (!CloudNet) return
  let Cesium = window.XEarth
  let viewer = window.viewer
  let sourceAlt = 0
  let centerP = []
  let distance = 0
  let options = { steps: 40, units: 'kilometers', properties: { foo: 'bar' } };
  let options1 = { units: 'kilometers' };
  let maxAlt = 0
  let minAlt = 0
  let turfPoints
  let entities
  let centerHeight = 0
  let heightSpan = 80000
  let maximumHeights = []
  let minimumHeights = []
  let wallpp = []

  function callbackWallPositions() {
    turfPoints = []
    entities = CloudNet.entities
    if (!entities || entities.length < 1) {
      return
    }
    for (let index = 0; index < entities.length; index++) {
      const element = entities[index];
      let ExitId = element.id.split('==')
      let sourceSource1 = window.EarthViewer.dataSources.getByName(ExitId[1])
      let sourceSource2 = window.EarthViewer.dataSources.getByName(ExitId[3])
      if (sourceSource1.length == 0 || sourceSource2.length == 0) continue
      let entity1 = sourceSource1[0].entities.getById(ExitId[0])
      let entity2 = sourceSource2[0].entities.getById(ExitId[2])
      // let entity1 = window.EarthViewer.dataSources.getByName(ExitId[1]) ? sourceSource1[0].entities.getById(ExitId[0])
      //   : window.EarthViewer.entities.getById(ExitId[0])
      // let entity2 = window.EarthViewer.dataSources.getByName(ExitId[3]) ? sourceSource2[0].entities.getById(ExitId[2])
      //   : window.EarthViewer.entities.getById(ExitId[2])
      if (!entity1 || !entity2) continue
      let entityPos1 = entity1.position.getValue(window.EarthViewer.clock.currentTime)
      let entityPos2 = entity2.position.getValue(window.EarthViewer.clock.currentTime)
      let entityCartographic1 = Cesium.Cartographic.fromCartesian(entityPos1)
      let entityCartographic2 = Cesium.Cartographic.fromCartesian(entityPos2)
      let longitude1 = Cesium.Math.toDegrees(entityCartographic1.longitude)
      let latitude1 = Cesium.Math.toDegrees(entityCartographic1.latitude)
      let longitude2 = Cesium.Math.toDegrees(entityCartographic2.longitude)
      let latitude2 = Cesium.Math.toDegrees(entityCartographic2.latitude)
      sourceAlt = entityCartographic1.height
      // 取出最大最小高度
      if (index == 0) {
        maxAlt = sourceAlt
        minAlt = sourceAlt
      } else {
        maxAlt = maxAlt > sourceAlt ? maxAlt : sourceAlt
        minAlt = minAlt > sourceAlt ? sourceAlt : minAlt
      }
      let turfPoint = turf.point([longitude1, latitude1])
      let turfPoint1 = turf.point([longitude2, latitude2])
      turfPoints.push(turfPoint, turfPoint1)
    }
    let features = turf.featureCollection(turfPoints);
    let enveloped = turf.envelope(features);
    centerP = [(enveloped.bbox[0] + enveloped.bbox[2]) / 2, (enveloped.bbox[1] + enveloped.bbox[3]) / 2]
    centerHeight = (maxAlt + minAlt) / 2
    heightSpan = maxAlt - minAlt > 80000 ? maxAlt - minAlt : 80000
    let borderP = [enveloped.bbox[0], enveloped.bbox[1]]
    distance = turf.distance(centerP, borderP);

    let circle = turf.circle(centerP, distance, options);
    wallpp = []
    let cpp = circle.geometry.coordinates[0]
    // console.log(cpp.length);
    for (let index = 0; index < cpp.length; index++) {
      const element = cpp[index]
      wallpp.push(...element, maxAlt)
    }
    return Cesium.Cartesian3.fromDegreesArrayHeights(wallpp)
  }

  function callbackMaxHeight() {
    maximumHeights = Array(41).fill(centerHeight + heightSpan / 2)
    return maximumHeights
  }

  function callbackMinHeight() {
    minimumHeights = Array(41).fill(centerHeight - heightSpan / 2)
    return minimumHeights
  }
  let mixColor = netColor

  let entity = window.EarthViewer.entities.add({
    id: CloudNet.linkID + '-wall-trail',
    wall: {
      positions: new window.XEarth.CallbackProperty(callbackWallPositions, false),
      maximumHeights: new window.XEarth.CallbackProperty(callbackMaxHeight, false),
      minimumHeights: new window.XEarth.CallbackProperty(callbackMinHeight, false),
      material: new Cesium.PolylineTrailLinkMaterialPropertyExtend({
        color: mixColor || new Cesium.Color(
          255 / 255,
          0 / 255,
          0 / 255,
          1
        ),
        repeat: 1,
        speed: 1,
        image: 'static/material/colors2.png',
        duration: 2000
      })
    },
    // ellipse: {
    //   semiMinorAxis: 20000.0,
    //   semiMajorAxis: 20000.0,
    //   material: new Cesium.EllipsoidMaterial({
    //     mixColor: new Cesium.Color(1, 0, 0),
    //     mixRatio: 0.9
    //   })
    // }
  })
}

/**
 * 获取随机暖色
 * @param alpha 透明度
 * @returns {string} 返回rgba颜色
 */
export function randomWarmColor() {
  const r = 255;
  // const r = getRandomNum(180, 250);
  const g = getRandomNum(0, 230);
  const b = 50;
  return [r, g, b];
}

/**
 * 获取随机冷色
 * 颜色设计思路：R值 === 50，0 <= G值 <= 255, 150 <= B值 <= 255,这样随机出来的冷色更加柔和，不会产生刺眼的感觉
 * @param alpha 透明度
 * @returns {string} 返回rgba颜色
 */
export function randomCoolColor(alpha) {
  const r = 50;
  const g = getRandomNum(0, 255);
  const b = getRandomNum(150, 255);
  return [r, g, b];
}

/**
 * 获取指定闭区间的随机数
 * @param min 最小值
 * @param max 最大值
 * @returns {number}
 */
export function getRandomNum(min, max) {
  let result;
  if (min <= max) {
    result = Math.floor(Math.random() * (max - min + 1) + min);
  } else {
    result = Math.floor(Math.random() * (min - max + 1) + max);
  }
  return result;
}

/**
 * 无关星样式开闭  model.silhouetteSize = 4
 * @param {*} flag
 */
export function fadeSatellites(flag) {
  let alpha = flag ? 1 : 0.3
  let nearDistance = flag ? 6e6 : 2000
  let tts = ['light', 'sar', 'radar', 'highLight', 'red', 'electric']
  for (let index = 0; index < tts.length; index++) {
    const element = tts[index]
    let dataSource = window.EarthViewer.dataSources.getByName(element)
    if (dataSource.length == 0) continue
    let entities = dataSource[0].entities._entities._array
    for (let index = 0; index < entities.length; index++) {
      const element = entities[index]
      // 关闭时，跳过已经开启效果的星
      let blingId = window.EarthViewer.entities.getById(element.id + 'pointBling')
      if (!flag && element.point && element.point.outlineWidth == 2 || !flag && blingId) {
        continue
      }
      if (element.billboard) {
        element.billboard.show._value = flag
      }
      if (element.point) {
        element.point.distanceDisplayCondition =
          new Cesium.DistanceDisplayCondition(nearDistance, 2e9)
        element.point.scaleByDistance = new Cesium.NearFarScalar(
          nearDistance,
          1.6,
          2e8,
          1.2
        )
      }
    }
  }
}

/**
 * 卫星label point billboard恢复到初始状态
 * @param {*} entity
 * @param {boolean} fade 为true则卫星只显示point
 */
function satelliteStyleRecover(entity, fade) {
  let Cesium = window.XEarth
  let sc = new Cesium.NearFarScalar(2e2, 1.3, 6e6, 0.8)
  let dc = new Cesium.DistanceDisplayCondition(6e6, 2e9)
  let nearDistance = fade ? 2000 : 6e6
  let sbd = new Cesium.NearFarScalar(6e6, 1.6, 2e8, 1.2)
  if (entity.billboard) {
    entity.billboard.show._value = !fade
    entity.billboard.scaleByDistance = sc
  } else {
    // console.log(entity);
  }
  window.EarthViewer.entities.removeById(entity.id + 'pointBling')

  if (entity.point) {
    entity.point.show = true
    // entity.point.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(nearDistance, 2e9)
    // entity.point.scaleByDistance = new Cesium.NearFarScalar(nearDistance, 1.6, 2e8, 1.2)
    // entity.point.pixelSize = undefined
    // entity.point.outlineColor = undefined
    // entity.point.outlineWidth = undefined
  }
}


/**
 * 卫星开启连线闪烁效果
 * @param {*} entity
 */
function satelliteConnectStyle(entity) {
  let Cesium = window.XEarth
  // 组网卫星放大
  let sc = new Cesium.NearFarScalar(2e2, 2.3, 6e6, 1)

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
  let pointBling = window.EarthViewer.entities.getById(entity.id + 'pointBling')
  if (!pointBling) {
    // console.log(entity);
    let a = window.EarthViewer.entities.add({
      id: entity.id + 'pointBling',
      position: entity.position,
      point: {
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(6e6, 2e9),
        scaleByDistance: new Cesium.NearFarScalar(6e6, 1.6, 2e8, 1.2),
        pixelSize: new Cesium.CallbackProperty(updateSize, false),
        outlineColor: entity.point.color._value,
        outlineWidth: 2.5,
        color: Cesium.Color.WHITE,
        // disableDepthTestDistance: 99
      }
    })
    entity.point.show = false
  }
  // if (entity.point) {
  //   entity.point.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(6e6, 2e9)
  //   entity.point.scaleByDistance = new Cesium.NearFarScalar(6e6, 1.6, 2e8, 1.2)
  //   entity.point.pixelSize = new Cesium.CallbackProperty(updateSize, false)
  //   entity.point.outlineColor = Cesium.Color.CYAN
  //   entity.point.outlineWidth = 2
  // }
  if (entity.billboard) {
    entity.billboard.show._value = true
    entity.billboard.scaleByDistance = sc
  }
  if (entity.model) {
    entity.model.silhouetteColor = Cesium.Color.GREEN
    entity.model.silhouetteSize = 4
  }
}

// 根据指令删除微云组网
export function removeCloudNet(linkID) {
  let viewer = window.viewer
  let Cesium = window.XEarth
  // window.EarthViewer.entities.removeById(linkID + '-wall-trail')
  let CloudNetIndex = satellitNetArray.findIndex(item => item.linkID == linkID)
  if (CloudNetIndex == -1) {
    console.log('没找到linkid', linkID);
  }
  let CloudNet = satellitNetArray[CloudNetIndex]
  // console.log(linkID, CloudNet);
  if (!CloudNet) return
  if (CloudNet.bubble) {
    CloudNet.bubble.windowClose() // 清除气泡窗
  }
  let allNetEntity = CloudNet.entities
  // console.log(allNetEntity);
  let entityArray = allNetEntity.map(item => item)
  // console.log(entityArray);
  // console.log(`删除网${linkID}:${a}`);
  for (let index = 0; index < entityArray.length; index++) {
    const element = entityArray[index];
    let noExitId = element.id.split('==')
    // console.log(noExitId);
    let sourceSource = window.EarthViewer.dataSources.getByName(noExitId[1])
    let targetSource = window.EarthViewer.dataSources.getByName(noExitId[3])
    // console.log(element.id, satellitNetArray);
    if (sourceSource.length == 0 || targetSource.length == 0) continue
    let entity1 = sourceSource[0].entities.getById(noExitId[0])
    let entity2 = targetSource[0].entities.getById(noExitId[2])
    // let entity1 = window.EarthViewer.dataSources.getByName(noExitId[1]) ? sourceSource[0].entities.getById(noExitId[0])
    //   : window.EarthViewer.entities.getById(noExitId[0])
    // let entity2 = window.EarthViewer.dataSources.getByName(noExitId[3]) ? sourceSource[0].entities.getById(noExitId[2])
    //   : window.EarthViewer.entities.getById(noExitId[2])
    if (!entity1 || !entity2) continue
    //去掉闪烁
    satelliteStyleRecover(entity1)
    satelliteStyleRecover(entity2)

    let a = window.EarthViewer.entities.removeById(element.id)
    window.EarthViewer.entities.removeById('reverse' + element.id)
  }
  satellitNetArray.splice(CloudNetIndex, 1)
}

export function removeCloudNetsData(datas) {
  console.log('删除微云网消息', datas, satellitNetArray);
  if (datas.info && datas.info.length > 0) {
    datas.info.forEach((element) => {
      let params = {
        linkId: element.linkID
      }
      removeCloudNet(element.linkID)
      // store.commit('removeNetLinkData', params)
    })
  }
}


/**
 * 添加关系网实体到对应组网数据源 全球版
 * @param {*} params
 */
function createGlobalFlowNet(params) {
  let CloudNet = params.CloudNet
  for (let t = 0; t < params.edges.length; t++) {
    let netData = params.edges[t]
    // showPoseEnd({
    // 	sourID: netData.sourID,
    // 	targID: netData.targID,
    // })
    creatGlobalNetToSource({
      sourID: netData.sourID,
      sourType: netData.sourSensorType,
      targID: netData.targID,
      targType: netData.targSensorType,
      net: CloudNet,
      lineColor: Cesium.Color.CYAN
    })
  }
}