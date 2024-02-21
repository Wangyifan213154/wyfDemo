/*
 * @Author: yanyuqi 1297092186@qq.com
 * @Date: 2023-05-23 10:23:04
 * @LastEditors: yanyuqi 1297092186@qq.com
 * @LastEditTime: 2023-05-24 15:47:44
 * @FilePath: \LVCSystem\src\utils\layers\LayerTileImage\LayerTileImage.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @FilePath: LayerTileImage.js
 * @Author: chenqian
 * @Date: 2022-08-22 16:17:39
 * @LastEditors: cheniqan
 * @LastEditTime: 2022-09-29 13:31:58
 * @Descripttion:
 */
// Url瓦片图层
import Base from '../AbsLayerObj'
import DataModule from './DataTileImage'
// import * as window.MSIMEarth from "window.MSIMEarth";

class LayerTileImage extends Base {
  constructor(config) {
    super(config)
    this.belong = 'window.MSIMEarth'
    this.dataModule = new DataModule()
    this.layer = null
  }

  async load(options = {}) {
    this.data = await this.dataModule.request(options)
    this.emit('data', options)
    return this
  }

  draw(option) {
    this.option = option
    this.data = option.data || this.data
    this.loadLayer(option)
  }

  loadLayer(option) {
    let cfg = this.data
    let options = {
      url: cfg.url,
      minimumLevel: cfg.minimumLevel || 0,
      maximumLevel: cfg.maximumLevel || 18
      // rectangle: window.MSIMEarth.Rectangle.MAX_VALUE
    }
    if (cfg.assess_token) options.url += `&assess_token=${cfg.assess_token}`
    let tilingScheme = new window.MSIMEarth.WebMercatorTilingScheme()
    if (cfg.epsg == '3857')
      tilingScheme = new window.MSIMEarth.WebMercatorTilingScheme()
    if (cfg.epsg == '4326')
      tilingScheme = new window.MSIMEarth.GeographicTilingScheme()
    if (cfg.epsg && cfg.epsg != '3857' && cfg.epsg != '4326')
      returnconsole.log('epsg目前仅支持3857、4326')
    options.tilingScheme = tilingScheme
    if (cfg.bbox)
      options.rectangle = window.MSIMEarth.Rectangle.fromDegrees(
        cfg.bbox[0],
        cfg.bbox[1],
        cfg.bbox[2],
        cfg.bbox[3]
      )
    if (cfg.customTags) options.customTags = cfg.customTags
    if (cfg.pickFeaturesUrl) options.pickFeaturesUrl = cfg.pickFeaturesUrl
    if (cfg.urlSchemeZeroPadding)
      options.urlSchemeZeroPadding = cfg.urlSchemeZeroPadding
    if (cfg.subdomains) options.subdomains = cfg.subdomains
    if (cfg.ellipsoid) options.ellipsoid = cfg.ellipsoid
    if (cfg.tileWidth) options.tileWidth = cfg.tileWidth
    if (cfg.tileHeight) options.tileHeight = cfg.tileHeight
    if (cfg.getFeatureInfoFormats)
      options.getFeatureInfoFormats = cfg.getFeatureInfoFormats
    if (cfg.enablePickFeatures)
      options.enablePickFeatures = cfg.enablePickFeatures
    let index = option.zIndex ? option.zIndex : undefined

    let provider = new window.MSIMEarth.UrlTemplateImageryProvider(options)
    this.layer = window.viewer.imageryLayers.addImageryProvider(provider, index)

    // 透明化设置
    if (option.colorToAlpha) {
      const color = option.colorToAlpha
      this.layer.colorToAlpha = new window.window.MSIMEarth.Color(
        color[0],
        color[1],
        color[2]
      )
    }
    if (option.colorToAlphaThreshold) {
      this.layer.colorToAlphaThreshold = option
    }
  }

  clean() {
    if (this.layer) window.viewer.imageryLayers.remove(this.layer)
    this.layer = null
  }

  location() {
    // flyTo({
    //     heading: 359.0159758112535,
    //     pitch: -88.176016630067,
    //     roll: 0,
    //     x: 114.27327678602491,
    //     y: 30.136565522213047,
    //     z: 5318709.379593507
    // }, window.viewer)
  }
}

export default LayerTileImage
