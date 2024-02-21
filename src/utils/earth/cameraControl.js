import { worldPosToGraphic } from '@/utils/mapTools'
import store from '@/store'
import CreateViewFrustum from '@/utils/effect/CreateViewFrustum'
// import { divLabel1 } from '@/utils/bubble/dataBubble1'
// import { loadData } from '@/views/layerList/hooks/index.js'

// const {
//   configChecked,
//   state2
// } = loadData()
let lastViewEntity = null
let frustumObject = null
export let frustumObjectArray = []
/**
 * @param {string} id entity的id或datasource的name
 * @param {boolean} value 视角类别
 */
export function changeCameraView(id, value) {
  // console.log(id, value);
  let sourceSource = window.EarthViewer.dataSources.getByName(id)
  let entity = sourceSource.length
    ? sourceSource[0].entities.values[0]
    : window.EarthViewer.entities.getById(id)
  console.log(sourceSource, entity)
  if (!entity) return
  resetView()
  entity.model.show = true
  setView(entity, value)
  lastViewEntity = entity
  store.commit('setViewEntityID', id)
}

/**
 * 设置视角
 * @param {Object} entity 跟踪entity
 * @param {boolean} value 视角类别
 */
function setView(entity, type) {
  // if (document.querySelectorAll('#lableDiv-container').length > 0) {
  //   window.clearDivLabel() //清除daodan瞄准divlabel和postRender事件监听
  // }
  if (type == 'first') {
    setFirstPersonView(entity)
    // console.log(entity.label);
    store.commit('setShowFirstDiv', true) // 开启瞄准框
    if (entity && entity.label) {
      // console.log(entity);
      // lastViewEntity.label._show._value = false
      entity.show = false // 隐藏entity
    }
  } else if (type == 'three') {
    setThirdPersonView(entity)
  } else if (type == 'free') {
    setFreeView()
  } else if (type == 'viewAngle') {
    setWatchView()
  } else if (type == 'lockEntity') {
    setLockEntityView(entity)
  } else {
    // window.EarthViewer.clock.onTick.addEventListener(adjust)
    // window.currentViewListener = adjust
  }
}

// 切换第一人称视角
export function setFirstPersonView(entity) {
  entity.model.show = false
  // 创建新相机用于视锥计算
  let lightCamera = new window.XEarth.Camera(window.EarthViewer.scene)
  let cloneFru = window.EarthViewer.camera.frustum.clone()
  // 修改新视锥参数
  let fov = window.XEarth.Math.toRadians(
    window.XEarth.Math.toDegrees(cloneFru.fov) * 0.5
  )
  let cafrustumOutline = null
  let aspectRatio = 1.5
  // let aspectRatio = 1
  cloneFru.fov = fov
  cloneFru.near = 250
  cloneFru.far = 100000
  cloneFru.aspectRatio = aspectRatio
  lightCamera.frustum = cloneFru
  function drawFrustumOutline() {
    if (cafrustumOutline) {
      window.EarthViewer.scene.primitives.remove(cafrustumOutline)
    }
    const scratchRight = new window.XEarth.Cartesian3()
    const scratchRotation = new window.XEarth.Matrix3()
    const scratchOrientation = new window.XEarth.Quaternion()
    const position = lightCamera.positionWC
    const direction = lightCamera.directionWC
    const up = lightCamera.upWC
    let right = lightCamera.rightWC
    right = window.XEarth.Cartesian3.negate(right, scratchRight)
    let rotation = scratchRotation
    window.XEarth.Matrix3.setColumn(rotation, 0, right, rotation)
    window.XEarth.Matrix3.setColumn(rotation, 1, up, rotation)
    window.XEarth.Matrix3.setColumn(rotation, 2, direction, rotation)
    let orientation = window.XEarth.Quaternion.fromRotationMatrix(
      rotation,
      scratchOrientation
    )

    let instance = new window.XEarth.GeometryInstance({
      geometry: new window.XEarth.FrustumOutlineGeometry({
        frustum: lightCamera.frustum,
        origin: position,
        orientation: orientation,
        vertexFormat: window.XEarth.VertexFormat.POSITION_ONLY
      }),
      attributes: {
        color: window.XEarth.ColorGeometryInstanceAttribute.fromColor(
          window.XEarth.Color.YELLOWGREEN //new window.XEarth.Color(0.0, 1.0, 0.0, 1.0)
        )
      }
    })

    cafrustumOutline = window.EarthViewer.scene.primitives.add(
      new window.XEarth.Primitive({
        geometryInstances: [instance],
        appearance: new window.XEarth.PerInstanceColorAppearance({
          closed: true,
          flat: true
        }),
        asynchronous: false
      })
    )
  }
  function adjust() {
    // 获取当前模型方向和位置
    // entityB2 为模型对象
    if (!entity) return
    const orientation = entity.orientation
    const position = entity.position
    if (!orientation || !position) return
    // 获取偏向角
    let ori = orientation.getValue(window.EarthViewer.clock.currentTime)
    // 获取位置
    let center = position.getValue(window.EarthViewer.clock.currentTime)
    if (!center || !ori) return
    let curPos = worldPosToGraphic(center)
    // 1、由四元数计算三维旋转矩阵
    var mtx3 = window.XEarth.Matrix3.fromQuaternion(ori)
    // 2、计算四维转换矩阵：
    var mtx4 = window.XEarth.Matrix4.fromRotationTranslation(mtx3, center)
    // 3、计算角度：
    var hpr = window.XEarth.Transforms.fixedFrameToHeadingPitchRoll(mtx4)
    // 获取角度（弧度）
    const headingTemp = hpr.heading
    const pitchTemp = hpr.pitch
    let heading, pitch, range
    // 调整角度为第一人称，注意调整的角度
    heading = window.XEarth.Math.toRadians(
      window.XEarth.Math.toDegrees(headingTemp) + 90
    )
    pitch = window.XEarth.Math.toRadians(
      window.XEarth.Math.toDegrees(pitchTemp) - 0
    ) //俯仰角，减去的值越大，越下俯
    range = 1

    const speedArr = [2100, 2000, 1800, 2500, 2200, 2400]
    let speedNum =
      speedArr[
        Math.floor(Math.random() * 10) > 5 ? 0 : Math.floor(Math.random() * 10)
      ]
    store.commit('setDanInfor', {
      lng: curPos.lng,
      lat: curPos.lat,
      height: curPos.height,
      heading: (window.XEarth.Math.toDegrees(headingTemp) + 90).toFixed(15),
      pitch: (window.XEarth.Math.toDegrees(pitchTemp) - 10).toFixed(15),
      roll: window.XEarth.Math.toDegrees(hpr.pitch).toFixed(15),
      speed: speedNum ? speedNum : '2500' + 'km/h'
      //speed: '2000km/h'
    })
    // 动态改变模型视角
    window.EarthViewer.camera.lookAt(
      center,
      new window.XEarth.HeadingPitchRange(heading, pitch, range)
    )
    // 新相机姿态
    lightCamera.lookAt(
      center,
      new window.XEarth.HeadingPitchRange(heading, pitch, range)
    )
    // drawFrustumOutline()
    checkCatchedEntity(lightCamera)
    // window.EarthViewer.clock.shouldAnimate = false
  }
  window.EarthViewer.clock.onTick.addEventListener(adjust)
  window.currentViewListener = adjust
}

// 切换锁定实体视角
export function setLockEntityView(entity) {
  // entity.viewFrom = new window.XEarth.Cartesian3(-1000, 1000, 1000.0)
  // window.EarthViewer.trackedEntity = entity
  const orientation = entity.orientation
  const position = entity.position
  if (!orientation || !position) {
    entity.viewFrom = new window.XEarth.Cartesian3(1000, 1000, 1000)
    window.EarthViewer.trackedEntity = entity
    return
  }
  let ori = orientation.getValue(window.EarthViewer.clock.currentTime)
  let center = position.getValue(window.EarthViewer.clock.currentTime)
  if (!center || !ori) {
    entity.viewFrom = new window.XEarth.Cartesian3(1000, 1000, 1000)
    window.EarthViewer.trackedEntity = entity
    return
  }
  // let curPos = worldPosToGraphic(center)
  // 1、由四元数计算三维旋转矩阵
  var mtx3 = window.XEarth.Matrix3.fromQuaternion(ori)
  var mtx4 = window.XEarth.Matrix4.fromRotationTranslation(mtx3, center)

  var hpr = window.XEarth.Transforms.fixedFrameToHeadingPitchRoll(mtx4)
  // 获取角度（弧度）
  const headingTemp = hpr.heading
  const pitchTemp = hpr.pitch
  let heading, pitch, range
  // 调整角度为第一人称，注意调整的角度
  heading = window.XEarth.Math.toRadians(
    window.XEarth.Math.toDegrees(headingTemp) + 90
  )
  pitch = window.XEarth.Math.toRadians(
    window.XEarth.Math.toDegrees(pitchTemp) - 12
  ) //俯仰角，减去的值越大，越下俯
  range = 4000
  window.EarthViewer.camera.lookAt(
    center,
    new window.XEarth.HeadingPitchRange(heading, pitch, range)
  )
  // 根据当前视角设置viewfrom偏移量
  let pwc = window.EarthViewer.camera.positionWC
  var entityCartographic = window.XEarth.Cartographic.fromCartesian(pwc)
  let sourceLng = window.XEarth.Math.toDegrees(entityCartographic.longitude)
  let sourceLat = window.XEarth.Math.toDegrees(entityCartographic.latitude)
  let sourceAlt = entityCartographic.height
  var entity1Cartographic = window.XEarth.Cartographic.fromCartesian(center)
  let destinateLng = window.XEarth.Math.toDegrees(
    entity1Cartographic.longitude
  )
  let destinateLat = window.XEarth.Math.toDegrees(
    entity1Cartographic.latitude
  )
  let destinateAlt = entity1Cartographic.height
  let xx = (sourceLng - destinateLng) * 111000
  let yy = (sourceLat - destinateLat) * 111000
  let zz = sourceAlt - destinateAlt
  // let tc = window.EarthViewer.camera.worldToCameraCoordinatesPoint(center)
  window.EarthViewer.camera.lookAtTransform(window.XEarth.Matrix4.IDENTITY)
  entity.viewFrom = new window.XEarth.Cartesian3(xx, yy, zz)
  window.EarthViewer.trackedEntity = entity
  // thirdSightFrame1(entity)
  // thirdSightFrame(entity)
  // sightedTarget(entity)
}

// 切换第三人称视角
export function setThirdPersonView(entity) {
  // createFrustumFun(entity)
  function adjust() {
    // 获取当前模型方向和位置
    // entityB2 为模型对象
    if (!entity) return
    const orientation = entity.orientation
    const position = entity.position
    if (!orientation || !position) return
    // 获取偏向角
    let ori = orientation.getValue(window.EarthViewer.clock.currentTime)
    // 获取位置
    let center = position.getValue(window.EarthViewer.clock.currentTime)
    if (!center || !ori) return
    let curPos = worldPosToGraphic(center)
    // 1、由四元数计算三维旋转矩阵
    var mtx3 = window.XEarth.Matrix3.fromQuaternion(ori)
    // 2、计算四维转换矩阵：
    var mtx4 = window.XEarth.Matrix4.fromRotationTranslation(mtx3, center)
    // 3、计算角度：
    var hpr = window.XEarth.Transforms.fixedFrameToHeadingPitchRoll(mtx4)
    // 获取角度（弧度）
    const headingTemp = hpr.heading
    const pitchTemp = hpr.pitch
    let heading, pitch, range
    //第三人称俯视视角
    heading = window.XEarth.Math.toRadians(
      window.XEarth.Math.toDegrees(headingTemp) + 90
    )
    pitch = window.XEarth.Math.toRadians(
      window.XEarth.Math.toDegrees(pitchTemp) - 12
    ) //俯仰角，减去的值越大，越下俯、
    // 视角高度，根据模型大小调整
    // range = 10000.0
    range = 4000
    // 动态改变模型视角
    window.EarthViewer.camera.lookAt(
      center,
      new window.XEarth.HeadingPitchRange(heading, pitch, range)
    )
  }
  window.EarthViewer.clock.onTick.addEventListener(adjust)
  window.currentViewListener = adjust
}

// 切换自由视角
export function setFreeView() {
  store.commit('setViewEntityID', '')
  window.EarthViewer.camera.lookAtTransform(window.XEarth.Matrix4.IDENTITY)
}

// 切换观看视角
export function setWatchView() {
  store.commit('setViewEntityID', '')
  window.EarthViewer.camera.lookAtTransform(window.XEarth.Matrix4.IDENTITY)
  window.EarthViewer.camera.flyTo({
    destination: new window.XEarth.Cartesian3(
      -3490406.4880014705,
      5573184.257218434,
      2889223.697240534
    ),
    orientation: {
      heading: 6.283185307179581,
      pitch: -1.5701233071606704,
      roll: 0
    }
  })
}

export function resetView() {
  if (window.currentViewListener) {
    window.EarthViewer.clock.onTick.removeEventListener(
      window.currentViewListener
    )
    window.currentViewListener = null
  }
  store.commit('setShowFirstDiv', false)
  window.EarthViewer.camera.lookAtTransform(window.XEarth.Matrix4.IDENTITY)
  if (lastViewEntity) {
    // lastViewEntity.label._show._value = true
    lastViewEntity.show = true // 显示上个视角被隐藏的entity
    // lastViewEntity.plane = null // 清除上个目标瞄准标
    removeSightTarget(lastViewEntity.id)
    clearFrustum(lastViewEntity.id)
  }
  removeSightedFrame()
  window.EarthViewer.trackedEntity = null //取消追踪实体
}

// 第三人称瞄准框
export function thirdSightFrame(entity) {
  if (!entity) return
  function changePositions() {
    if (!entity) return
    // let toTime = new window.XEarth.JulianDate()
    // window.XEarth.JulianDate.addSeconds(window.EarthViewer.clock.currentTime, 30, toTime)
    let YGPosition = entity.position.getValue(
      window.EarthViewer.clock.currentTime
    )
    if (typeof YGPosition === 'undefined') return
    return YGPosition
  }
  function changeOrientation() {
    if (!entity) return
    // let toTime = window.XEarth.JulianDate.addSeconds(window.EarthViewer.clock.currentTime, 3)
    let YGPosition = entity.orientation.getValue(
      window.EarthViewer.clock.currentTime
    )
    if (typeof YGPosition === 'undefined') return
    return YGPosition
  }
  window.EarthViewer.entities.add({
    id: entity.id + 'thirdSight',
    orientation: new window.XEarth.CallbackProperty(
      changeOrientation,
      false
    ),
    position: new window.XEarth.CallbackProperty(changePositions, false),
    plane: {
      show: true, //是否显示
      plane: new window.XEarth.Plane(
        window.XEarth.Cartesian3.UNIT_X,
        -700
      ),
      dimensions: new window.XEarth.Cartesian2(100.0, 100.0), //二维平面
      material: new window.XEarth.ImageMaterialProperty({
        image: 'static/image/billboard/飞机HUD/定位.PNG',
        transparent: true
      })
    }
  })
}

// 锁敌瞄准框
export function thirdSightFrame1(entity) {
  let img = 'static/billboard/省会.png'
  function changePositions() {
    if (!entity) return
    // let toTime = new window.XEarth.JulianDate()
    // window.XEarth.JulianDate.addSeconds(window.EarthViewer.clock.currentTime, 30, toTime)
    let YGPosition = entity.position.getValue(
      window.EarthViewer.clock.currentTime
    )

    if (typeof YGPosition === 'undefined') return
    return YGPosition
  }
  function changeOrientation() {
    if (!entity) return
    // let toTime = window.XEarth.JulianDate.addSeconds(window.EarthViewer.clock.currentTime, 3)
    let YGPosition = entity.orientation.getValue(
      window.EarthViewer.clock.currentTime
    )
    if (typeof YGPosition === 'undefined') return
    return YGPosition
  }
  window.EarthViewer.entities.add({
    id: entity.id + 'thirdSight1',
    orientation: new window.XEarth.CallbackProperty(
      changeOrientation,
      false
    ),
    position: new window.XEarth.CallbackProperty(changePositions, false),
    plane: {
      show: true, //是否显示
      plane: new window.XEarth.Plane(
        window.XEarth.Cartesian3.UNIT_X,
        -500
      ), //朝向屏幕
      dimensions: new window.XEarth.Cartesian2(1200, 1200), //二维平面
      // material: new window.XEarth.ImageMaterialProperty({
      //   image: img,
      //   transparent: true,
      // }),//材质
      material: new window.XEarth.HUD1MaterialProperty({
        time2: 0.01,
        mixColor: window.XEarth.Color.RED,
        mixRatio: 0.9,
        transparent: true
      }) //材质
    }
    // plane: new window.XEarth.CallbackProperty(changeNormal, false),
  })
}

//创建侦察视锥
export function createDetectFrustumFun(czmlname, rollpa) {
  let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
  if (sourceSource.length == 0) return
  let entity = sourceSource[0].entities.values[0]
  if (!entity || !entity.position) return
  let origin = entity.position.getValue(window.EarthViewer.clock.currentTime)
  // 确定相对于视点的旋转矩阵
  let side = entity.properties.airplaneAction._value.side
  let outlineColor = [200, 220, 230]
  // let enu = window.XEarth.Transforms.eastNorthUpToFixedFrame(origin);
  // let rotation = window.XEarth.Matrix3.getRotation(enu, new window.XEarth.Matrix3());
  // let orientation = window.XEarth.Quaternion.fromRotationMatrix(rotation);
  let orientation = entity.orientation.getValue(
    window.EarthViewer.clock.currentTime
  )
  if (origin && orientation) {
    // 创建视锥体
    let createFrustum = new CreateViewFrustum({
      viewer: window.EarthViewer,
      Cesium: window.XEarth,
      position: origin,
      orientation: orientation,
      outlineColor: outlineColor,
      fov: 20,
      near: 300,
      // near: 50,
      far: 100000,
      aspectRatio: 700 / 100
    })

    function updateFrustum() {
      let origin = entity.position.getValue(
        window.EarthViewer.clock.currentTime
      )
      let orientation = entity.orientation.getValue(
        window.EarthViewer.clock.currentTime
      )
      if (origin && orientation) {
        // window.createFrustum.update(origin, orientation)

        var mtx3 = window.XEarth.Matrix3.fromQuaternion(orientation)
        // 2、计算四维转换矩阵：
        var mtx4 = window.XEarth.Matrix4.fromRotationTranslation(
          mtx3,
          origin
        )
        // 3、计算角度：
        let hpr = window.XEarth.Transforms.fixedFrameToHeadingPitchRoll(mtx4)
        let heading = window.XEarth.Math.toDegrees(hpr.heading)
        let pitch = window.XEarth.Math.toDegrees(hpr.pitch)
        let roll = window.XEarth.Math.toDegrees(hpr.roll)
        // let tempHeading = window.XEarth.Math.toRadians(
        //   heading
        // )
        let tempHeading = window.XEarth.Math.toRadians(heading)
        let tempHeading1 = window.XEarth.Math.toRadians(heading + 90)
        // let tempPitch = window.XEarth.Math.toRadians(pitch - 90)
        let tempPitch = window.XEarth.Math.toRadians(pitch - 180)
        let tempPitch1 = window.XEarth.Math.toRadians(pitch)
        // let roll = window.XEarth.Math.toDegrees(hpr.roll)
        let tempRoll = window.XEarth.Math.toRadians(roll + rollpa)
        // const hpr1 = new window.XEarth.HeadingPitchRoll(tempHeading, tempPitch, hpr.roll) //heading,pitch,roll以0.1单位调整
        const hpr1 = new window.XEarth.HeadingPitchRoll(
          tempHeading,
          tempPitch,
          tempRoll
        ) //heading,pitch,roll以0.1单位调整
        const orientation1 =
          window.XEarth.Transforms.headingPitchRollQuaternion(origin, hpr1)
        createFrustum.update(
          origin,
          orientation1,
          tempHeading1,
          tempPitch1,
          hpr.roll
        )
        // checkCatchedEntity(createFrustum.lightCamera)
      }
    }
    window.EarthViewer.scene.postRender.addEventListener(updateFrustum)
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
    // frustumObject = {
    //   frustum: createFrustum,
    //   eventListener: updateFrustum
    // }
    frustumObjectArray.push({
      id: czmlname + 'detect',
      frustum: createFrustum,
      eventListener: updateFrustum
    })
    return createFrustum
  }
}

//创建无人侦察视锥
export function createNoManDetectFrustumFun(czmlname) {
  let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
  if (sourceSource.length == 0) return
  let entity = sourceSource[0].entities.values[0]
  if (!entity || !entity.position) return
  let origin = entity.position.getValue(window.EarthViewer.clock.currentTime)
  // 确定相对于视点的旋转矩阵
  let side = entity.properties.airplaneAction._value.side
  let outlineColor = [200, 220, 230]
  // let enu = window.XEarth.Transforms.eastNorthUpToFixedFrame(origin);
  // let rotation = window.XEarth.Matrix3.getRotation(enu, new window.XEarth.Matrix3());
  // let orientation = window.XEarth.Quaternion.fromRotationMatrix(rotation);
  let orientation = entity.orientation.getValue(
    window.EarthViewer.clock.currentTime
  )
  var mtx3 = window.XEarth.Matrix3.fromQuaternion(orientation)
  // 2、计算四维转换矩阵：
  var mtx4 = window.XEarth.Matrix4.fromRotationTranslation(mtx3, origin)
  // 3、计算角度：
  let hpr = window.XEarth.Transforms.fixedFrameToHeadingPitchRoll(mtx4)
  let heading = window.XEarth.Math.toDegrees(hpr.heading)
  let pitch = window.XEarth.Math.toDegrees(hpr.pitch)
  let roll = window.XEarth.Math.toDegrees(hpr.roll)
  let tempHeading = window.XEarth.Math.toRadians(heading)
  let tempPitch = window.XEarth.Math.toRadians(pitch - 180)
  let tempRoll = window.XEarth.Math.toRadians(roll)
  const hpr1 = new window.XEarth.HeadingPitchRoll(
    tempHeading,
    tempPitch,
    tempRoll
  ) //heading,pitch,roll以0.1单位调整
  const orientation1 = window.XEarth.Transforms.headingPitchRollQuaternion(
    origin,
    hpr1
  )
  if (origin && orientation) {
    // 创建视锥体
    let createFrustum = new CreateViewFrustum({
      viewer: window.EarthViewer,
      Cesium: window.XEarth,
      position: origin,
      orientation: orientation1,
      outlineColor: outlineColor,
      fov: 60,
      near: 300,
      // near: 50,
      far: 100000,
      aspectRatio: 30 / 100
    })

    function updateFrustum() {
      let origin = entity.position.getValue(
        window.EarthViewer.clock.currentTime
      )
      let orientation = entity.orientation.getValue(
        window.EarthViewer.clock.currentTime
      )
      if (origin && orientation) {
        // window.createFrustum.update(origin, orientation)

        var mtx3 = window.XEarth.Matrix3.fromQuaternion(orientation)
        // 2、计算四维转换矩阵：
        var mtx4 = window.XEarth.Matrix4.fromRotationTranslation(
          mtx3,
          origin
        )
        // 3、计算角度：
        let hpr = window.XEarth.Transforms.fixedFrameToHeadingPitchRoll(mtx4)
        let heading = window.XEarth.Math.toDegrees(hpr.heading)
        let pitch = window.XEarth.Math.toDegrees(hpr.pitch)
        let roll = window.XEarth.Math.toDegrees(hpr.roll)
        // let tempHeading = window.XEarth.Math.toRadians(
        //   heading
        // )
        let tempHeading = window.XEarth.Math.toRadians(heading)
        let tempHeading1 = window.XEarth.Math.toRadians(heading + 90)
        // let tempPitch = window.XEarth.Math.toRadians(pitch - 90)
        let tempPitch = window.XEarth.Math.toRadians(pitch - 180)
        let tempPitch1 = window.XEarth.Math.toRadians(pitch)
        // let roll = window.XEarth.Math.toDegrees(hpr.roll)
        let tempRoll = window.XEarth.Math.toRadians(roll)
        // const hpr1 = new window.XEarth.HeadingPitchRoll(tempHeading, tempPitch, hpr.roll) //heading,pitch,roll以0.1单位调整
        const hpr1 = new window.XEarth.HeadingPitchRoll(
          tempHeading,
          tempPitch,
          tempRoll
        ) //heading,pitch,roll以0.1单位调整
        const orientation1 =
          window.XEarth.Transforms.headingPitchRollQuaternion(origin, hpr1)
        createFrustum.update(
          origin,
          orientation1,
          tempHeading1,
          tempPitch1,
          hpr.roll
        )
        // checkCatchedEntity(createFrustum.lightCamera)
      }
    }
    window.EarthViewer.scene.postRender.addEventListener(updateFrustum)
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
    // frustumObject = {
    //   frustum: createFrustum,
    //   eventListener: updateFrustum
    // }
    frustumObjectArray.push({
      id: czmlname + 'detect',
      frustum: createFrustum,
      eventListener: updateFrustum
    })
    return createFrustum
  }
}

// 删除侦察视锥
export function removeDetectFrustum(id) {
  // window.EarthViewer.scene.globe.depthTestAgainstTerrain = false
  let frustumIndex = frustumObjectArray.findIndex(
    (item) => item.id == id + 'detect'
  )
  // console.log(frustumIndex, frustumObjectArray[frustumIndex]);
  if (frustumIndex > -1) {
    let frustum = frustumObjectArray[frustumIndex]
    window.EarthViewer.scene.postRender.removeEventListener(
      frustum.eventListener
    )
    frustum.frustum.clear()
    frustumObjectArray.splice(frustumIndex, 1)
    // configChecked(state2.clickNode) // 选项卡刷新勾选状态
  }
}

//创建视椎体
export function createFrustumFun(czmlname) {
  let sourceSource = window.EarthViewer.dataSources.getByName(czmlname)
  if (sourceSource.length == 0) return
  let entity = sourceSource[0].entities.values[0]
  if (!entity || !entity.position) return
  let origin = entity.position.getValue(window.EarthViewer.clock.currentTime)
  // 确定相对于视点的旋转矩阵
  let side = entity.properties.airplaneAction._value.side
  let outlineColor = side == 'blue' ? [37, 209, 255] : [255, 0, 0]
  // let enu = window.XEarth.Transforms.eastNorthUpToFixedFrame(origin);
  // let rotation = window.XEarth.Matrix3.getRotation(enu, new window.XEarth.Matrix3());
  // let orientation = window.XEarth.Quaternion.fromRotationMatrix(rotation);
  let orientation = entity.orientation.getValue(
    window.EarthViewer.clock.currentTime
  )
  if (origin && orientation) {
    // 创建视锥体
    let createFrustum = new CreateViewFrustum({
      viewer: window.EarthViewer,
      Cesium: window.XEarth,
      position: origin,
      orientation: orientation,
      outlineColor: outlineColor,
      fov: 30,
      near: 300,
      // near: 50,
      far: 100000,
      aspectRatio: 100 / 100
    })

    function updateFrustum() {
      let origin = entity.position.getValue(
        window.EarthViewer.clock.currentTime
      )
      let orientation = entity.orientation.getValue(
        window.EarthViewer.clock.currentTime
      )
      if (origin && orientation) {
        // window.createFrustum.update(origin, orientation)

        var mtx3 = window.XEarth.Matrix3.fromQuaternion(orientation)
        // 2、计算四维转换矩阵：
        var mtx4 = window.XEarth.Matrix4.fromRotationTranslation(
          mtx3,
          origin
        )
        // 3、计算角度：
        let hpr = window.XEarth.Transforms.fixedFrameToHeadingPitchRoll(mtx4)
        let heading = window.XEarth.Math.toDegrees(hpr.heading)
        let pitch = window.XEarth.Math.toDegrees(hpr.pitch)
        let tempHeading = window.XEarth.Math.toRadians(heading)
        let tempHeading1 = window.XEarth.Math.toRadians(heading + 90)
        let tempPitch = window.XEarth.Math.toRadians(pitch - 90)
        let tempPitch1 = window.XEarth.Math.toRadians(pitch)
        let roll = window.XEarth.Math.toDegrees(hpr.roll)
        const hpr1 = new window.XEarth.HeadingPitchRoll(
          tempHeading,
          tempPitch,
          hpr.roll
        ) //heading,pitch,roll以0.1单位调整
        const orientation1 =
          window.XEarth.Transforms.headingPitchRollQuaternion(origin, hpr1)
        createFrustum.update(
          origin,
          orientation1,
          tempHeading1,
          tempPitch1,
          hpr.roll
        )
        checkCatchedEntity(createFrustum.lightCamera)
      }
    }
    window.EarthViewer.scene.postRender.addEventListener(updateFrustum)
    // frustumObject = {
    //   frustum: createFrustum,
    //   eventListener: updateFrustum
    // }
    frustumObjectArray.push({
      id: czmlname,
      frustum: createFrustum,
      eventListener: updateFrustum
    })
    return createFrustum
  }
}

// 检查视锥中被探测实体，套上锁定框
export function checkCatchedEntity(camera) {
  if (!camera) return
  // const allds = window.EarthViewer.dataSources._dataSources.concat(window.EarthViewer.entities.values)
  const allds = window.EarthViewer.dataSources._dataSources
  for (let index = 0; index < allds.length; index++) {
    const element = allds[index]
    let entity = element.entities ? element.entities.values[0] : element
    if (!entity || !entity.position) continue
    // let side = entity.properties.airplaneAction._value.side
    // if (side !== 'blue') return
    // let YGPosition = entity.position.getValue(window.EarthViewer.clock.currentTime)
    let YGPosition = entity.position._value
      ? entity.position._value
      : entity.position.getValue(window.EarthViewer.clock.currentTime)
    if (!YGPosition) continue
    let bs = new window.XEarth.BoundingSphere(YGPosition, 100)
    // let camera = frustum.lightCamera

    const cullingVolume = camera.frustum.computeCullingVolume(
      camera.positionWC,
      camera.directionWC,
      camera.upWC
    )
    const intersect = cullingVolume.computeVisibility(bs)
    if (intersect !== -1) {
      // console.log('里', intersect);
      sightedTarget(entity)
    } else {
      window.EarthViewer.entities.removeById(entity.id + 'sightedTarget')
    }
  }
}

//清除视椎体
export function clearFrustum(id) {
  let frustumIndex = frustumObjectArray.findIndex((item) => item.id == id)
  // console.log(frustumIndex, frustumObjectArray[frustumIndex]);
  if (frustumIndex > -1) {
    let frustum = frustumObjectArray[frustumIndex]
    window.EarthViewer.scene.postRender.removeEventListener(
      frustum.eventListener
    )
    frustum.frustum.clear()
    frustumObjectArray.splice(frustumIndex, 1)
    // configChecked(state2.clickNode) // 选项卡刷新勾选状态
  }
}

// 被瞄准目标框
function sightedTarget(entity) {
  let existSight = window.EarthViewer.entities.getById(
    entity.id + 'sightedTarget'
  )
  if (existSight) return
  function changePositions() {
    if (!entity) return
    // let toTime = new window.XEarth.JulianDate()
    // window.XEarth.JulianDate.addSeconds(window.EarthViewer.clock.currentTime, 30, toTime)
    let YGPosition = entity.position.getValue(
      window.EarthViewer.clock.currentTime
    )
    if (typeof YGPosition === 'undefined') return
    return YGPosition
  }
  window.EarthViewer.entities.add({
    id: entity.id + 'sightedTarget',
    // orientation: new window.XEarth.CallbackProperty(changeOrientation, false),
    position: new window.XEarth.CallbackProperty(changePositions, false),
    billboard: {
      show: new window.XEarth.CallbackProperty(changeShow(), false),
      // scale: 0.5,
      image: 'static/image/billboard/飞机HUD/rectangle.png',
      scaleByDistance: new window.XEarth.NearFarScalar(1000, 4.0, 100000, 1)
    }
    // plane: new window.XEarth.CallbackProperty(changeNormal, false),
  })
  // entity.billboard = billboard1
}

// 清除瞄准框
export function removeSightTarget(id) {
  window.EarthViewer.entities.removeById(id + 'thirdSight')
  window.EarthViewer.entities.removeById(id + 'thirdSight1')
  // const allds = window.EarthViewer.entities.values
  // allds.map(item => {
  //   if (item.id.includes('sightedTarget')) {
  //     window.EarthViewer.entities.removeById(item.id)
  //   }
  // })
  // window.EarthViewer.entities.removeById(entity.id + 'sightedTarget')
}

// 清除被瞄准框
export function removeSightedFrame() {
  const allds = window.EarthViewer.entities.values
  for (let index = 0; index < allds.length; index++) {
    const element = allds[index]
    if (element.id.includes('sightedTarget')) {
      window.EarthViewer.entities.removeById(element.id)
      index--
    }
  }
}

// 闪烁
function changeShow() {
  let number = 1
  let flag = true

  const show1 = () => {
    if (flag) {
      number -= 0.06
      if (number <= 0) {
        flag = false
      }
    } else {
      number += 0.06
      if (number >= 1) {
        flag = true
      }
    }
    return number >= 0.5
  }
  return show1
}
