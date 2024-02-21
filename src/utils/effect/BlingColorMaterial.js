/*
 * @Description: 扩散圆效果
 * @Version: 1.0
 * @Author: Li
 * @Date: 2023-07-27 17:30:28
 * @LastEditors: Li
 * @LastEditTime: 2023-07-27 17:55:21
 */
let Cesium = require('cesium/Cesium')
export class BlingColorMaterialProperty {
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
    return Cesium.Material.BlingColorMaterialType
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
      (other instanceof BlingColorMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._speed, other._speed))
    )
  }
}

Object.defineProperties(BlingColorMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed')
})

Cesium.BlingColorMaterialProperty = BlingColorMaterialProperty
Cesium.Material.BlingColorMaterialProperty = 'BlingColorMaterialProperty'
Cesium.Material.BlingColorMaterialType = 'BlingColorMaterialType'
Cesium.Material.BlingColorMaterialSource = `
                                            uniform vec4 color;
                                            uniform float speed;

                                            czm_material czm_getMaterial(czm_materialInput materialInput){
                                            czm_material material = czm_getDefaultMaterial(materialInput);
                                            vec2 st = materialInput.st * 2.0  - 1.0;
                                            float iTime = czm_frameNumber/60.0;
                                            // vec2 uv = st*2.0-vec2(1.0);
                                            // float l = (1.0 - length(st) + 0.1)/2.0;
                                            float l = (length(st) / 4.0) + 0.10;
                                            float alpha = abs(sin(iTime * speed)) * color.a;
                                            // vec4 fragColor = vec4(color.rgb,1.0);
                                            material.alpha = alpha;
                                            material.diffuse = color.rgb;
                                            return material;
                                            }
                                            `

Cesium.Material._materialCache.addMaterial(
  Cesium.Material.BlingColorMaterialType,
  {
    fabric: {
      type: Cesium.Material.BlingColorMaterialType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
        speed: 5.0
      },
      source: Cesium.Material.BlingColorMaterialSource
    },
    translucent: function (material) {
      return true
    }
  }
)
