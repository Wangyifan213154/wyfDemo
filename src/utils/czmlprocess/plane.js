let collection = []

function changeHeight() {
  let targetDs = viewer.dataSources.getByName('PursuitFighter')
  if (targetDs.length == 0) {
    return
  }
  let targetEntity = targetDs[0].entities.getById('PursuitFighter')

  let ttt = Cesium.JulianDate.toIso8601(viewer.clock.currentTime)
  console.log(viewer.clock.currentTime)
  let proTime = Cesium.JulianDate.addSeconds(
    viewer.clock.currentTime,
    0.1,
    new Cesium.JulianDate()
  )
  var YGPosition = targetEntity.position.getValue(proTime)
  var YGCartographic = Cesium.Cartographic.fromCartesian(YGPosition)
  let starLinkLng = Cesium.Math.toDegrees(YGCartographic.longitude)
  let starLinkLat = Cesium.Math.toDegrees(YGCartographic.latitude)
  let starLinkAlt = YGCartographic.height
  let position = new Cesium.Cartesian3.fromDegrees(
    starLinkLng,
    starLinkLat,
    starLinkAlt
  )
  collection.push(starLinkLng)
  collection.push(starLinkLat)
  collection.push(starLinkAlt + 30)
  if (collection.length > 5000) {
    collection.splice(0, 3)
  }
  return Cesium.Cartesian3.fromDegreesArrayHeights(collection)
}
