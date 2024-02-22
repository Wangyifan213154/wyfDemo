/**
 *
 */
import { useStore } from 'vuex'
import {
  reactive,
  toRefs,
  ref,
  onUnmounted,
  onMounted,
  watch,
  getCurrentInstance
} from 'vue'
import * as turf from '@turf/turf'
import GLSL from './viewable/GLSL'

export default function () {
  const instance = getCurrentInstance()
  const _this = instance.appContext.config.globalProperties

  const Cesium = window.XEarth
  const viewer = window.EarthViewer
  let handler = null
  let viewPosition = null
  let positions = []
  let viewPositionEnd = null
  let viewHeading = null
  let viewPitch = null
  let viewDistance = 1000
  let horizontalViewAngle = 90
  let verticalViewAngle = 60
  let lightCamera = null
  let enabled = true
  let size = 2048
  let softShadows = false
  let shadowMap = null
  let postStage = null
  let visibleAreaColor = null // 可视区域颜色（默认值`绿色`）
  let invisibleAreaColor = null //不可视区域颜色（默认值`红色`）。
  let frustumOutline = null
  let sketch = null
  let entities_point = []

  const VisibilityArange = () => {
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
    console.log(window.EarthViewer)
    handler = new window.XEarth.ScreenSpaceEventHandler(window.EarthViewer.scene.canvas)
    handler.setInputAction(function (movement) {
      let cartesian = window.EarthViewer.scene.pickPosition(movement.position)
      viewPosition = cartesian
      if (positions.length < 2) {
        console.log(cartesian)
        positions.push(cartesian)
        createPoint(cartesian)
      } else {
        console.log('结束')
        handler.destroy()
        viewPosition = positions[0]
        viewPositionEnd = positions[1]
        viewHeading = getHeading(viewPosition, viewPositionEnd)
        viewPitch = getPitch(viewPosition, viewPositionEnd)
        update()
      }
    }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)
  }

  const createLightCamera = () => {
    let lightCamera1 = new window.XEarth.Camera(window.EarthViewer.scene)
    console.log(lightCamera1)
    lightCamera1.position = viewPosition
    // if (viewPositionEnd) {
    //     let direction = window.XEarth.Cartesian3.normalize(window.XEarth.Cartesian3.subtract(viewPositionEnd, viewPosition, new window.XEarth.Cartesian3()), new window.XEarth.Cartesian3());
    //     lightCamera.direction = direction; // direction是相机面向的方向
    // }
    lightCamera1.frustum.near = viewDistance * 0.001
    lightCamera1.frustum.far = viewDistance
    const hr = window.XEarth.Math.toRadians(horizontalViewAngle)
    const vr = window.XEarth.Math.toRadians(verticalViewAngle)
    const aspectRatio =
      (viewDistance * Math.tan(hr / 2) * 2) /
      (viewDistance * Math.tan(vr / 2) * 2)
    console.log(aspectRatio)
    lightCamera1.frustum.aspectRatio = aspectRatio
    if (hr > vr) {
      lightCamera1.frustum.fov = hr
    } else {
      lightCamera1.frustum.fov = vr
    }
    console.log(lightCamera1.frustum.fov)
    lightCamera1.setView({
      destination: viewPosition,
      orientation: {
        heading: window.XEarth.Math.toRadians(viewHeading || 0),
        pitch: window.XEarth.Math.toRadians(viewPitch || 0),
        roll: 0
      }
    })
    lightCamera = lightCamera1
  }

  const createShadowMap = () => {
    let shadowMap1 = new window.XEarth.ShadowMap({
      context: window.EarthViewer.scene.context,
      lightCamera: lightCamera,
      enabled: enabled,
      isPointLight: true,
      pointLightRadius: viewDistance,
      cascadesEnabled: false,
      size: size,
      softShadows: softShadows,
      normalOffset: false,
      fromLightSource: false
    })
    shadowMap = shadowMap1
    window.EarthViewer.scene.shadowMap = shadowMap
  }

  const createPostStage = () => {
    visibleAreaColor = window.XEarth.Color.GREEN
    invisibleAreaColor = new window.XEarth.Color(0.165, 0.165, 0.165, 0.8)
    const fs = GLSL
    const postStage1 = new window.XEarth.PostProcessStage({
      fragmentShader: fs,
      uniforms: {
        shadowMap_textureCube: () => {
          shadowMap.update(Reflect.get(window.EarthViewer.scene, '_frameState'))
          return Reflect.get(shadowMap, '_shadowMapTexture')
        },
        shadowMap_matrix: () => {
          shadowMap.update(Reflect.get(window.EarthViewer.scene, '_frameState'))
          return Reflect.get(shadowMap, '_shadowMapMatrix')
        },
        shadowMap_lightPositionEC: () => {
          shadowMap.update(Reflect.get(window.EarthViewer.scene, '_frameState'))
          return Reflect.get(shadowMap, '_lightPositionEC')
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
          shadowMap.update(Reflect.get(window.EarthViewer.scene, '_frameState'))
          const bias = shadowMap._pointBias
          return window.XEarth.Cartesian4.fromElements(
            bias.normalOffsetScale,
            shadowMap._distance,
            shadowMap.maximumDistance,
            0.0,
            new window.XEarth.Cartesian4()
          )
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
          shadowMap.update(Reflect.get(window.EarthViewer.scene, '_frameState'))
          const bias = shadowMap._pointBias
          const scratchTexelStepSize = new window.XEarth.Cartesian2()
          const texelStepSize = scratchTexelStepSize
          texelStepSize.x = 1.0 / shadowMap._textureSize.x
          texelStepSize.y = 1.0 / shadowMap._textureSize.y

          return window.XEarth.Cartesian4.fromElements(
            texelStepSize.x,
            texelStepSize.y,
            bias.depthBias,
            bias.normalShadingSmooth,
            new window.XEarth.Cartesian4()
          )
        },
        camera_projection_matrix: lightCamera.frustum.projectionMatrix,
        camera_view_matrix: lightCamera.viewMatrix,
        helsing_viewDistance: () => {
          return viewDistance
        },
        helsing_visibleAreaColor: visibleAreaColor,
        helsing_invisibleAreaColor: invisibleAreaColor
      }
    })
    postStage = window.EarthViewer.scene.postProcessStages.add(postStage1)
  }

  const drawFrustumOutline = () => {
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
    console.log(rotation)
    let orientation = window.XEarth.Quaternion.fromRotationMatrix(
      rotation,
      scratchOrientation
    )

    let instance = new window.XEarth.GeometryInstance({
      geometry: new window.XEarth.FrustumOutlineGeometry({
        frustum: lightCamera.frustum,
        origin: viewPosition,
        orientation: orientation
      }),
      id: Math.random().toString(36).substr(2),
      attributes: {
        color: window.XEarth.ColorGeometryInstanceAttribute.fromColor(
          window.XEarth.Color.YELLOWGREEN //new window.XEarth.Color(0.0, 1.0, 0.0, 1.0)
        ),
        show: new window.XEarth.ShowGeometryInstanceAttribute(true)
      }
    })

    frustumOutline = window.EarthViewer.scene.primitives.add(
      new window.XEarth.Primitive({
        geometryInstances: [instance],
        appearance: new window.XEarth.PerInstanceColorAppearance({
          flat: true,
          translucent: false
        })
      })
    )
  }

  const drawSketch = () => {
    console.log('skech')
    console.log(viewPosition)
    console.log(viewDistance)
    sketch = window.EarthViewer.entities.add({
      name: 'sketch',
      position: viewPosition,
      orientation: window.XEarth.Transforms.headingPitchRollQuaternion(
        viewPosition,
        window.XEarth.HeadingPitchRoll.fromDegrees(
          viewHeading - horizontalViewAngle,
          viewPitch,
          0.0
        )
      ),
      ellipsoid: {
        radii: new window.XEarth.Cartesian3(
          viewDistance,
          viewDistance,
          viewDistance
        ),
        // innerRadii: new window.XEarth.Cartesian3(2.0, 2.0, 2.0),
        minimumClock: window.XEarth.Math.toRadians(-horizontalViewAngle / 2),
        maximumClock: window.XEarth.Math.toRadians(horizontalViewAngle / 2),
        minimumCone: window.XEarth.Math.toRadians(verticalViewAngle + 7.75),
        maximumCone: window.XEarth.Math.toRadians(
          180 - verticalViewAngle - 7.75
        ),
        // fill: false,
        outline: true,
        subdivisions: 256,
        stackPartitions: 64,
        slicePartitions: 10,
        outlineColor: window.XEarth.Color.YELLOWGREEN
        // material: window.XEarth.Color.RED.withAlpha(0.5),
      }
    })
  }

  const clear = () => {
    if (sketch) {
      window.EarthViewer.entities.removeById(sketch.id)
      sketch = null
    }
    if (frustumOutline) {
      frustumOutline.destroy()
      frustumOutline = null
    }
    if (postStage) {
      window.EarthViewer.scene.postProcessStages.remove(postStage)
      postStage = null
    }
  }

  const update = () => {
    clear()
    add()
  }

  const add = () => {
    createLightCamera()
    createShadowMap()
    createPostStage()
    drawFrustumOutline()
    drawSketch()
  }

  const getHeading = (fromPosition, toPosition) => {
    let finalPosition = new window.XEarth.Cartesian3()
    let matrix4 =
      window.XEarth.Transforms.eastNorthUpToFixedFrame(fromPosition)
    window.XEarth.Matrix4.inverse(matrix4, matrix4)
    window.XEarth.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
    window.XEarth.Cartesian3.normalize(finalPosition, finalPosition)
    return window.XEarth.Math.toDegrees(
      Math.atan2(finalPosition.x, finalPosition.y)
    )
  }

  const getPitch = function (fromPosition, toPosition) {
    let finalPosition = new window.XEarth.Cartesian3()
    let matrix4 =
      window.XEarth.Transforms.eastNorthUpToFixedFrame(fromPosition)
    window.XEarth.Matrix4.inverse(matrix4, matrix4)
    window.XEarth.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
    window.XEarth.Cartesian3.normalize(finalPosition, finalPosition)
    return window.XEarth.Math.toDegrees(Math.asin(finalPosition.z))
  }

  const createPoint = function (cartesian) {
    let point = window.EarthViewer.entities.add({
      position: cartesian,
      point: {
        pixelSize: 10,
        color: window.XEarth.Color.YELLOW
      }
    })
    entities_point.push(point)
    return point
  }

  const addHeading = function () {
    viewHeading += 1
  }

  return {
    VisibilityArange
  }
}
