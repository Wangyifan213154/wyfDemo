/**
 * 添加云效果
 * @param {*} params
 */
import * as turf from '@turf/turf'

 export default function cloudEffect(params) {
  this.viewer = params.viewer
  this.Cesium = params.earth
  this.cloundArray = []
}
cloudEffect.prototype.creatCloud = function(params) {
  const scene = this.viewer.scene

  const clouds = scene.primitives.add(
    new this.Cesium.CloudCollection({
      noiseDetail: 20.0,
      noiseOffset: this.Cesium.Cartesian3.ZERO
    })
  )

  const cloudParameters = {
    scaleWithMaximumSize: true,
    scaleX: params.attr.scaleX || 35,
    scaleY: params.attr.scaleY || 20,
    maximumSizeX: params.attr.maximumSizeX || 40,
    maximumSizeY: params.attr.maximumSizeY || 26,
    maximumSizeZ: params.attr.maximumSizeZ || 35,
    renderSlice: true, // if false, renders the entire surface of the ellipsoid
    slice: params.attr.slice || 0.56,
    brightness: params.attr.brightness || 1.0,
    color: params.attr.color || this.Cesium.Color.RED,
    colors: ['White', 'Red', 'Green', 'Blue', 'Yellow', 'Gray']
  }

  const cloud = clouds.add({
    position: params.position,
    scale: new this.Cesium.Cartesian2(
      cloudParameters.scaleX,
      cloudParameters.scaleY
    ),
    maximumSize: new this.Cesium.Cartesian3(
      cloudParameters.maximumSizeX,
      cloudParameters.maximumSizeY,
      cloudParameters.maximumSizeZ
    ),
    color: cloudParameters.color,
    slice: cloudParameters.renderSlice ? cloudParameters.slice : -1.0,
    brightness: cloudParameters.brightness
  })
}
cloudEffect.prototype.createRandomCloud = function(
  numClouds,
  startLong,
  startLat,
  rangeLong,
  rangLonLat,
  minHeight,
  maxHeight,
  id
) {
  //   const clouds = new Cesium.CloudCollection()
  // const scene = this.viewer.scene

  const clouds = this.viewer.scene.primitives.add(
    new this.Cesium.CloudCollection({
      noiseDetail: 20.0,
      noiseOffset: this.Cesium.Cartesian3.ZERO
    })
  )

  this.cloundArray.push({ bid: id, primitive: clouds })
  let count = 10
  if (!rangLonLat.length || !rangLonLat.length < 0) {
    return
  }
  let minLon = rangLonLat[0][0]
  let minLat = rangLonLat[0][1]
  let maxLon = rangLonLat[0][2]
  let maxLat = rangLonLat[0][3]
  if (minLon && typeof(minLon) == 'string') {
    minLon = Number(minLon)
  }
  if (minLat && typeof(minLat) == 'string') {
    minLat = Number(minLat)
  }
  if (maxLon && typeof(maxLon) == 'string') {
    maxLon = Number(maxLon)
  }
  if (maxLat && typeof(maxLat) == 'string') {
    maxLat = Number(maxLat)
  }
  switch (numClouds) {
    case '1':
      count = 5 * (maxLon - minLon)
      break
    case '2':
      count = 10 * (maxLon - minLon)
      break
    case '3':
      count = 15 * (maxLon - minLon)
      break
    case '4':
      count = 20 * (maxLon - minLon)
      break
    case '5':
      count = 25 * (maxLon - minLon)
      break
    case '6':
      count = 30 * (maxLon - minLon)
      break
    case '7':
      count = 35 * (maxLon - minLon)
      break
    case '8':
      count = 40 * (maxLon - minLon)
      break
    case '9':
      count = 45 * (maxLon - minLon)
      break
    case '10':
      count = 50 * (maxLon - minLon)
      break
    default:
      break
  }
  // let minLon = rangLonLat[0]
  // let minLat = rangLonLat[1]
  // let maxLon = rangLonLat[2]
  // let maxLat = rangLonLat[3]
  const polygon = turf.polygon(rangLonLat[1])
  let long, lat, height, scaleX, scaleY, aspectRatio, cloudHeight, depth, slice
  for (let i = 0; i < count; i++) {
    long = this.getRandomNumberInRange(minLon, maxLon)
    lat = this.getRandomNumberInRange(minLat, maxLat)
    var pt = turf.point([long, lat])
    if (!turf.booleanPointInPolygon(pt, polygon)) {
      continue
    }
    if (minHeight && typeof(minHeight) == 'string') {
      minHeight = Number(minHeight)
    }
    if (maxHeight && typeof(maxHeight) == 'string') {
      maxHeight = Number(maxHeight)
    }
    height = this.getRandomNumberInRange(minHeight, maxHeight)
    scaleX = this.getRandomNumberInRange(150, 350)
    scaleY = scaleX / 2.0 - this.getRandomNumberInRange(0, scaleX / 4.0)
    slice = this.getRandomNumberInRange(0.3, 0.7)
    depth = this.getRandomNumberInRange(5, 20)
    aspectRatio = this.getRandomNumberInRange(1.5, 2.1)
    cloudHeight = this.getRandomNumberInRange(5, 20)
      //console.log(long,lat,scaleY);
    clouds.add({
      position: this.Cesium.Cartesian3.fromDegrees(
        long,
        lat,
        // minHeight + 250000 / 2
        height
      ),
      scale: new Cesium.Cartesian2(500000 / 2, 250000 / 2),
      maximumSize: new Cesium.Cartesian3(20.0, 12.0, 8.0),
      // scale: new this.Cesium.Cartesian2(scaleX, scaleY),
      // maximumSize: new this.Cesium.Cartesian3(
      //   aspectRatio * cloudHeight,
      //   cloudHeight,
      //   depth
      // ),
      //   color: this.Cesium.Color.RED,
      slice: slice
    })
  }

}
cloudEffect.prototype.getRandomNumberInRange = function(minValue, maxValue) {
  return minValue + this.Cesium.Math.nextRandomNumber() * (maxValue - minValue)
}
cloudEffect.prototype.deleteClound = function(id) {
  for (let k = 0; k < this.cloundArray.length; k++) {
    if (this.cloundArray[k].bid == id) {
      this.viewer.scene.primitives.remove(this.cloundArray[k].primitive)
        // 删除云数组里面的该条数据
      this.cloundArray.splice(k, 1)
      break
    }
  }
}
cloudEffect.prototype.isShowClound = function(id, boolean) {
  for (let k = 0; k < this.cloundArray.length; k++) {
    if (this.cloundArray[k].bid == id) {
      this.cloundArray[k].primitive.show = boolean
      break
    }
  }
}