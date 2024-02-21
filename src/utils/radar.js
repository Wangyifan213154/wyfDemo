/**
 *
 * @param {Viewer} viewer
 * @param {Cartesian3} position 经纬度
 * @param {String} id
 * @param {number} shortwaveRange 半径
 * @return {*}
 *
 */
// 调用方式
// import TrackMatte from '@/utils/earth/XEarth/radar.js'
// let trackMatte = new TrackMatte({
//   viewer: window.XEarthViewer,
//   earth: window.PieEarthX,
//   id: 1,
//   shortwaveRange: 100000.0,
//   position: [119.329814, 26.012482],
//   speed: 2
// })
import store from '@/store'

export default class TrackMatte {
  constructor(val) {
    this.viewer = val.viewer
    this.Earth = val.earth
    this.id = val.id
    this.shortwaveRange = val.shortwaveRange
    this.speed = -val.speed
    this.radarColor = val.color || [2, 240, 240]
    this.show = val.show
    // ; (this.longitude = val.position[0]),
    //   (this.latitude = val.position[1]),
    //   (this.position = this.Earth.Cartesian3.fromDegrees(
    //     val.position[0],
    //     val.position[1]
    //   ))
    this.heading = 0
    this.entity = val.entity
    this.positionArr = [] //储存脏数据
    this.addEntities()
  }

  addEntities() {
    let that = this
    function callbackCenterPos() {
      if (!that.entity.position) return
      let entityPos = that.entity.position._value
        ? that.entity.position._value
        : that.entity.position.getValue(that.viewer.clock.currentTime)
      if (!entityPos) return
      return entityPos
    }
    function callbackWallPositions() {
      that.heading += that.speed || 2 //可调节转动速度
      let entityPos = callbackCenterPos()
      if (!entityPos) return
      let entityCartographic = that.Earth.Cartographic.fromCartesian(entityPos)
      let longitude = that.Earth.Math.toDegrees(entityCartographic.longitude)
      let latitude = that.Earth.Math.toDegrees(entityCartographic.latitude)
      let posArr = that.calcPoints(
        longitude,
        latitude,
        that.shortwaveRange,
        that.heading
      )
      return that.Earth.Cartesian3.fromDegreesArrayHeights(posArr)
    }
    this.viewer.entities.removeById(this.id)
    let entity = this.viewer.entities.add({
      id: this.id,
      show: this.show,
      position: new window.XEarth.CallbackProperty(callbackCenterPos, false),
      // wall: {
      //   positions: new window.XEarth.CallbackProperty(
      //     callbackWallPositions,
      //     false
      //   ),
      //   material: new window.XEarth.Color(
      //     this.radarColor[0] / 255,
      //     this.radarColor[1] / 255,
      //     this.radarColor[2] / 255,
      //     1
      //   ),
      //   distanceDisplayCondition: new this.Earth.DistanceDisplayCondition(
      //     0.0,
      //     10.5e6
      //   )
      // },
      ellipsoid: {
        radii: new this.Earth.Cartesian3(
          this.shortwaveRange,
          this.shortwaveRange,
          this.shortwaveRange
        ),
        maximumCone: this.Earth.Math.toRadians(90),
        // material: new this.Earth.Color.fromCssColorString('#00dcff82'),
        material: new window.XEarth.Color(
          this.radarColor[0] / 255,
          this.radarColor[1] / 255,
          this.radarColor[2] / 255,
          0.2
        ),
        // outline: true,
        outlineColor: new window.XEarth.Color(
          this.radarColor[0] / 255,
          this.radarColor[1] / 255,
          this.radarColor[2] / 255,
          0.3
        ),
        // outlineColor: this.Earth.Color.WHITE,
        outlineWidth: 1,
        distanceDisplayCondition: new this.Earth.DistanceDisplayCondition(
          0.0,
          10.5e6
        )
      }
    })
    // this.addPostRender()
  }
  addPostRender() {
    this.viewer.clock.onTick.addEventListener(() => {
      this.heading += this.speed || 2 //可调节转动速度
      let entityPos = this.entity.position.getValue(
        this.viewer.clock.currentTime
      )
      if (!entityPos) return
      let entityCartographic = this.Earth.Cartographic.fromCartesian(entityPos)
      let longitude = this.Earth.Math.toDegrees(entityCartographic.longitude)
      let latitude = this.Earth.Math.toDegrees(entityCartographic.latitude)
      this.positionArr = this.calcPoints(
        longitude,
        latitude,
        this.shortwaveRange,
        this.heading
      )
    })
  }
  calcPoints(x1, y1, radius, heading) {
    let that = this
    var m = that.Earth.Transforms.eastNorthUpToFixedFrame(
      that.Earth.Cartesian3.fromDegrees(x1, y1)
    )
    var rx = radius * Math.cos((heading * Math.PI) / 180.0)
    var ry = radius * Math.sin((heading * Math.PI) / 180.0)
    var translation = that.Earth.Cartesian3.fromElements(rx, ry, 0)
    var d = that.Earth.Matrix4.multiplyByPoint(
      m,
      translation,
      new that.Earth.Cartesian3()
    )
    var c = that.Earth.Cartographic.fromCartesian(d)
    var x2 = that.Earth.Math.toDegrees(c.longitude)
    var y2 = that.Earth.Math.toDegrees(c.latitude)
    return that.computeCirclularFlight(x1, y1, x2, y2, 0, 90)
  }
  computeCirclularFlight(x1, y1, x2, y2, fx, angle) {
    let that = this
    let positionArr = []
    positionArr.push(x1)
    positionArr.push(y1)
    positionArr.push(0)
    var radius = that.Earth.Cartesian3.distance(
      that.Earth.Cartesian3.fromDegrees(x1, y1),
      that.Earth.Cartesian3.fromDegrees(x2, y2)
    )
    for (let i = fx; i <= fx + angle; i++) {
      let h = radius * Math.sin((i * Math.PI) / 180.0)
      let r = Math.cos((i * Math.PI) / 180.0)
      let x = (x2 - x1) * r + x1
      let y = (y2 - y1) * r + y1
      positionArr.push(x)
      positionArr.push(y)
      positionArr.push(h)
    }
    return positionArr
  }
}
