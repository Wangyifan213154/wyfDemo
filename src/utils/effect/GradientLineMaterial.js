/*
 * @Description: 扩散圆效果
 * @Version: 1.0
 * @Author: Li
 * @Date: 2023-07-27 17:30:28
 * @LastEditors: Li
 * @LastEditTime: 2023-07-27 17:55:21
 */
let Cesium = require('cesium/Cesium')
export class GradientLineMaterialProperty {
  constructor(options) {
    this._definitionChanged = new Cesium.Event()
    this._color = undefined
    this._speed = undefined
    this.color = options.color
    this.speed = options.speed
  }

  get isConstant() {
    return false
  }

  get definitionChanged() {
    return this._definitionChanged
  }

  getType(time) {
    return Cesium.Material.GradientLineMaterialType
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {}
    }

    result.color = Cesium.Property.getValueOrDefault(
      this._color,
      time,
      Cesium.Color.RED,
      result.color
    )
    result.speed = Cesium.Property.getValueOrDefault(
      this._speed,
      time,
      10,
      result.speed
    )
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof GradientLineMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._speed, other._speed))
    )
  }
}

Object.defineProperties(GradientLineMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed')
})

Cesium.GradientLineMaterialProperty = GradientLineMaterialProperty
Cesium.Material.GradientLineMaterialProperty = 'GradientLineMaterialProperty'
Cesium.Material.GradientLineMaterialType = 'GradientLineMaterialType'
Cesium.Material.GradientLineMaterialSource = `
                                            uniform vec4 color;
                                            uniform float speed;

                                            czm_material czm_getMaterial(czm_materialInput materialInput){
                                            czm_material material = czm_getDefaultMaterial(materialInput);
                                            vec2 st = materialInput.st * 2.0  - 1.0;
                                            // vec2 st = materialInput.st + 0.5;
                                            // vec2 uv = st*2.0-vec2(1.0);
                                            // float l = (1.0 - length(st) + 0.1)/2.0;
                                            float l = (1.0 - abs(st.y))/1.5;
                                            // vec4 fragColor = vec4(color.rgb,1.0);
                                            material.alpha = l;
                                            material.diffuse = color.rgb;
                                            return material;
                                            }
                                            `

Cesium.Material._materialCache.addMaterial(
  Cesium.Material.GradientLineMaterialType,
  {
    fabric: {
      type: Cesium.Material.GradientLineMaterialType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
        speed: 10.0
      },
      source: Cesium.Material.GradientLineMaterialSource
    },
    translucent: function (material) {
      return true
    }
  }
)
