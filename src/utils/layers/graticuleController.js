/**
 * 经纬网图层控制器
 */
function GraticuleController(options) {
  this.Cesium = options.Cesium
  this.viewer = options.viewer
  this.scene = options.viewer.scene
  this.tilingScheme =
    options.tilingScheme || new options.Cesium.GeographicTilingScheme()
  this.color = options.color || options.Cesium.Color.ORANGE
  this.fontColor = options.fontColor || options.Cesium.Color.WHITE
  this.weight = options.weight || 0.8
  this.zoomInterval = options.zoomInterval || [
    options.Cesium.Math.toRadians(0.05),
    options.Cesium.Math.toRadians(0.1),
    options.Cesium.Math.toRadians(0.2),
    options.Cesium.Math.toRadians(0.5),
    options.Cesium.Math.toRadians(1.0),
    options.Cesium.Math.toRadians(2.0),
    options.Cesium.Math.toRadians(5.0),
    options.Cesium.Math.toRadians(10.0)
  ]

  this.tileWidth = options.tileWidth || 256
  this.tileHeight = options.tileHeight || 256
  this.ready = true

  // 默认为十进制间隔
  this.sexagesimal = options.sexagesimal || false
  this.numLines = options.numLines || 50

  this.labels = new options.Cesium.LabelCollection()
  this.scene.primitives.add(this.labels)
  this.polylines = new options.Cesium.PolylineCollection()

  this.scene.primitives.add(this.polylines)
  this.ellipsoid = this.scene.globe.ellipsoid

  var canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  this.canvas = canvas
}

GraticuleController.prototype.makeLabel = function (
  lng,
  lat,
  text,
  top,
  color
) {
  this.labels.add({
    position: this.ellipsoid.cartographicToCartesian(
      new this.Cesium.Cartographic(lng, lat, 10.0)
    ),
    text: text,
    font: '12px normal', //文字字体
    fillColor: this.fontColor,
    style: this.Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineColor: this.Cesium.Color.BLACK,
    outlineWidth: 5,
    pixelOffset: new this.Cesium.Cartesian2(5, top ? 5 : -5),
    eyeOffset: this.Cesium.Cartesian3.ZERO,
    horizontalOrigin: this.Cesium.HorizontalOrigin.RIGHT,
    verticalOrigin: top
      ? this.Cesium.VerticalOrigin.BOTTOM
      : this.Cesium.VerticalOrigin.TOP,
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 15.0e6),
    scale: 1.0
  })
}

GraticuleController.prototype.drawGrid = function (extent) {
  var mins = this.zoomInterval
  if (this.currentExtent && this.currentExtent.equals(extent)) {
    return
  }
  this.currentExtent = extent

  this.polylines.removeAll()
  this.labels.removeAll()

  var minPixel = 0
  var maxPixel = this._canvasSize

  var dLat = 0,
    dLng = 0,
    index
  // get the nearest to the calculated value
  for (
    index = 0;
    index < mins.length && dLat < (extent.north - extent.south) / 10;
    index++
  ) {
    dLat = mins[index]
  }
  for (
    index = 0;
    index < mins.length && dLng < (extent.east - extent.west) / 10;
    index++
  ) {
    dLng = mins[index]
  }

  // round iteration limits to the computed grid interval
  var minLng =
    (extent.west < 0
      ? Math.ceil(extent.west / dLng)
      : Math.floor(extent.west / dLng)) * dLng
  var minLat =
    (extent.south < 0
      ? Math.ceil(extent.south / dLat)
      : Math.floor(extent.south / dLat)) * dLat
  var maxLng =
    (extent.east < 0
      ? Math.ceil(extent.east / dLat)
      : Math.floor(extent.east / dLat)) * dLat
  var maxLat =
    (extent.north < 0
      ? Math.ceil(extent.north / dLng)
      : Math.floor(extent.north / dLng)) * dLng

  // extend to make sure we cover for non refresh of tiles
  minLng = Math.max(minLng - 2 * dLng, -Math.PI)
  maxLng = Math.min(maxLng + 2 * dLng, Math.PI)
  minLat = Math.max(minLat - 2 * dLat, -Math.PI / 2)
  maxLat = Math.min(maxLat + 2 * dLng, Math.PI / 2)

  var ellipsoid = this.ellipsoid
  var lat,
    lng,
    granularity = this.Cesium.Math.toRadians(1)

  // labels positions
  var latitudeText = minLat + Math.floor((maxLat - minLat) / dLat / 2) * dLat
  for (lng = minLng; lng < maxLng; lng += dLng) {
    // draw meridian
    var path = []
    for (lat = minLat; lat < maxLat; lat += granularity) {
      path.push(new this.Cesium.Cartographic(lng, lat))
    }
    path.push(new this.Cesium.Cartographic(lng, maxLat))
    this.polylines.add({
      positions: ellipsoid.cartographicArrayToCartesianArray(path),
      width: this.weight,
      material: new this.Cesium.Material({
        fabric: {
          type: 'Color',
          uniforms: {
            color: this.color
          }
        }
      })
    })

    var degLng = this.Cesium.Math.toDegrees(lng)
    this.makeLabel(
      lng,
      latitudeText,
      this.sexagesimal
        ? this.decToSex(degLng)
        : degLng.toFixed(this.gridPrecision(dLng)),
      false
    )
  }

  // lats
  var longitudeText = minLng + Math.floor((maxLng - minLng) / dLng / 2) * dLng
  for (lat = minLat; lat < maxLat; lat += dLat) {
    // draw parallels
    var path = []
    for (lng = minLng; lng < maxLng; lng += granularity) {
      path.push(new this.Cesium.Cartographic(lng, lat))
    }
    path.push(new this.Cesium.Cartographic(maxLng, lat))
    this.polylines.add({
      positions: ellipsoid.cartographicArrayToCartesianArray(path),
      width: this.weight,
      material: new this.Cesium.Material({
        fabric: {
          type: 'Color',
          uniforms: {
            color: this.color
          }
        }
      })
    })
    var degLat = this.Cesium.Math.toDegrees(lat)
    this.makeLabel(
      longitudeText,
      lat,
      this._sexagesimal
        ? this.decToSex(degLat)
        : degLat.toFixed(this.gridPrecision(dLat)),
      true
    )
  }
}

GraticuleController.prototype.requestImage = function (x, y, level) {
  if (this.show) {
    this.drawGrid(this.getExtentView())
  }
  return this.canvas
}

GraticuleController.prototype.setVisible = function (visible) {
  this.show = visible
  if (!visible) {
    this.polylines.removeAll()
    this.labels.removeAll()
  } else {
    this.currentExtent = null
    this.drawGrid(this.getExtentView())
  }
}

GraticuleController.prototype.isVisible = function () {
  return this.show
}

GraticuleController.prototype.decToSex = function (d) {
  var degs = Math.floor(d)
  var mins = ((Math.abs(d) - degs) * 60.0).toFixed(2)
  if (mins == '60.00') {
    degs += 1.0
    mins = '0.00'
  }
  return [degs, ':', mins].join('')
}

GraticuleController.prototype.getExtentView = function () {
  var camera = this.scene.camera
  var canvas = this.scene.canvas
  var corners = [
    camera.pickEllipsoid(new Cesium.Cartesian2(0, 0), this.ellipsoid), //选择一个椭球或地图。
    camera.pickEllipsoid(
      new Cesium.Cartesian2(canvas.width, 0),
      this.ellipsoid
    ),
    camera.pickEllipsoid(
      new Cesium.Cartesian2(0, canvas.height),
      this.ellipsoid
    ),
    camera.pickEllipsoid(
      new Cesium.Cartesian2(canvas.width, canvas.height),
      this.ellipsoid
    )
  ]
  for (var index = 0; index < 4; index++) {
    if (corners[index] === undefined) {
      return this.Cesium.Rectangle.MAX_VALUE
    }
  }
  return this.Cesium.Rectangle.fromCartographicArray(
    this.ellipsoid.cartesianArrayToCartographicArray(corners)
  )
}

GraticuleController.prototype.gridPrecision = function (dDeg) {
  if (dDeg < 0.01) return 3
  if (dDeg < 0.1) return 2
  if (dDeg < 1) return 1
  return 0
}

GraticuleController.prototype.loggingMessage = function (message) {
  var logging = document.getElementById('logging')
  logging.innerHTML += message
}

export default GraticuleController
