//片元着色器，直接从源码复制
const SkyBoxFS = `uniform samplerCube u_cubeMap;
    varying vec3 v_texCoord;
    void main(){
        vec4 color = textureCube(u_cubeMap, normalize(v_texCoord));
        gl_FragColor = vec4(czm_gammaCorrect(color).rgb, czm_morphTime);
    }
`

//顶点着色器有修改，主要是乘了一个旋转矩阵
const SkyBoxVS = `
    attribute vec3 position;
    varying vec3 v_texCoord;
    uniform mat3 u_rotateMatrix;
    void main(){
        vec3 p = czm_viewRotation * u_rotateMatrix * (czm_temeToPseudoFixed * (czm_entireFrustum.y * position));
        gl_Position = czm_projection * vec4(p, 1.0);
        v_texCoord = position.xyz;
    }
`

// //高版本需要更改的shader如下：
// //顶点着色器有修改，主要是乘了一个旋转矩阵
// const SkyBoxVS = `
// in vec3 position;
// out vec3 v_texCoord;
// uniform mat3 u_rotateMatrix;
// void main(){
// vec3 p = czm_viewRotation * u_rotateMatrix * (czm_temeToPseudoFixed * (czm_entireFrustum.y * position));
// gl_Position = czm_projection * vec4(p, 1.0);
// v_texCoord = position.xyz;
// }
// `

// //片元着色器，直接从源码复制
// const SkyBoxFS = `
// uniform samplerCube u_cubeMap;
// in vec3 v_texCoord;
// void main(){
// vec4 color = texture(u_cubeMap, normalize(v_texCoord));
// out_FragColor = vec4(czm_gammaCorrect(color).rgb, czm_morphTime);
// }
// `

// /**
//  * 为了兼容高版本的Cesium，因为新版cesium中getRotation被移除
//  */
// if (!that.earth.defined(that.earth.Matrix4.getRotation)) {
//   that.earth.Matrix4.getRotation = that.earth.Matrix4.getMatrix3
// }

/**
 * 近景天空盒
 * @type Object
 * @default undefined
 */
export default class SkyBoxOnGround {
  constructor(options) {
    this.sources = options.sources
    this._sources = undefined
    this.earth = options.earth
    /**
     * Determines if the sky box will be shown.
     *
     * @type {Boolean}
     * @default true
     */
    this.show = this.earth.defaultValue(options.show, true)
    this._command = new this.earth.DrawCommand({
      modelMatrix: this.earth.Matrix4.clone(this.earth.Matrix4.IDENTITY),
      owner: this
    })
    this._cubeMap = undefined

    this._attributeLocations = undefined
    this._useHdr = undefined
  }

  update(frameState, useHdr) {
    const that = this

    if (!this.show) {
      return undefined
    }

    if (
      frameState.mode !== that.earth.SceneMode.SCENE3D &&
      frameState.mode !== that.earth.SceneMode.MORPHING
    ) {
      return undefined
    }

    if (!frameState.passes.render) {
      return undefined
    }

    const context = frameState.context

    if (this._sources !== this.sources) {
      this._sources = this.sources
      const sources = this.sources

      if (
        !that.earth.defined(sources.positiveX) ||
        !that.earth.defined(sources.negativeX) ||
        !that.earth.defined(sources.positiveY) ||
        !that.earth.defined(sources.negativeY) ||
        !that.earth.defined(sources.positiveZ) ||
        !that.earth.defined(sources.negativeZ)
      ) {
        throw new that.earth.DeveloperError(
          'this.sources is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties.'
        )
      }

      if (
        typeof sources.positiveX !== typeof sources.negativeX ||
        typeof sources.positiveX !== typeof sources.positiveY ||
        typeof sources.positiveX !== typeof sources.negativeY ||
        typeof sources.positiveX !== typeof sources.positiveZ ||
        typeof sources.positiveX !== typeof sources.negativeZ
      ) {
        throw new that.earth.DeveloperError(
          'this.sources properties must all be the same type.'
        )
      }

      if (typeof sources.positiveX === 'string') {
        that.earth.loadCubeMap(context, this._sources).then(function (cubeMap) {
          that._cubeMap = that._cubeMap && that._cubeMap.destroy()
          that._cubeMap = cubeMap
        })
      } else {
        this._cubeMap = this._cubeMap && this._cubeMap.destroy()
        this._cubeMap = new that.earth.CubeMap({
          context: context,
          source: sources
        })
      }
    }

    const command = this._command

    command.modelMatrix = that.earth.Transforms.eastNorthUpToFixedFrame(
      frameState.camera._positionWC
    )

    if (!that.earth.defined(command.vertexArray)) {
      command.uniformMap = {
        u_cubeMap: function () {
          return that._cubeMap
        },
        u_rotateMatrix: function () {
          /**
           * 为了兼容高版本的Cesium，因为新版cesium中getRotation被移除
           */
          if (!that.earth.defined(that.earth.Matrix4.getRotation)) {
            that.earth.Matrix4.getRotation = that.earth.Matrix4.getMatrix3
          }
          return that.earth.Matrix4.getRotation(
            command.modelMatrix,
            new that.earth.Matrix3()
          )
        }
      }

      const geometry = that.earth.BoxGeometry.createGeometry(
        that.earth.BoxGeometry.fromDimensions({
          dimensions: new that.earth.Cartesian3(2.0, 2.0, 2.0),
          vertexFormat: that.earth.VertexFormat.POSITION_ONLY
        })
      )
      const attributeLocations = (this._attributeLocations =
        that.earth.GeometryPipeline.createAttributeLocations(geometry))

      command.vertexArray = that.earth.VertexArray.fromGeometry({
        context: context,
        geometry: geometry,
        attributeLocations: attributeLocations,
        bufferUsage: that.earth.BufferUsage._DRAW
      })

      command.renderState = that.earth.RenderState.fromCache({
        blending: that.earth.BlendingState.ALPHA_BLEND
      })
    }

    if (!that.earth.defined(command.shaderProgram) || this._useHdr !== useHdr) {
      const fs = new that.earth.ShaderSource({
        defines: [useHdr ? 'HDR' : ''],
        sources: [SkyBoxFS]
      })
      command.shaderProgram = that.earth.ShaderProgram.fromCache({
        context: context,
        vertexShaderSource: SkyBoxVS,
        fragmentShaderSource: fs,
        attributeLocations: this._attributeLocations
      })
      this._useHdr = useHdr
    }

    if (!that.earth.defined(this._cubeMap)) {
      return undefined
    }
    return command
  }

  setSkyBox(viewer) {
    const that = this
    // 自带的默认天空盒
    let defaultSkybox = viewer.scene.skyBox

    // 渲染前监听并判断相机位置
    viewer.scene.preUpdate.addEventListener(() => {
      let position = viewer.scene.camera.position
      let cameraHeight = that.earth.Cartographic.fromCartesian(position).height
      if (cameraHeight < 240000) {
        viewer.scene.skyBox = this
        viewer.scene.skyAtmosphere.show = false
      } else {
        viewer.scene.skyBox = defaultSkybox
        viewer.scene.skyAtmosphere.show = true
      }
    })
  }

  isDestroyed() {
    return false
  }

  destroy() {
    const command = this._command
    command.vertexArray = command.vertexArray && command.vertexArray.destroy()
    command.shaderProgram =
      command.shaderProgram && command.shaderProgram.destroy()
    this._cubeMap = this._cubeMap && this._cubeMap.destroy()
    return that.earth.destroyObject(this)
  }
}
