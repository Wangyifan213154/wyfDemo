import * as Cesium from 'cesium/Cesium'
export default function measureLineSpace(viewer) {
  var handler = new window.XEarth.ScreenSpaceEventHandler(
    viewer.scene.canvas
  )
  var positions = []
  var poly = null
  var tooltip = document.getElementById('toolTip')
  var distance = 0
  var cartesian = null
  var floatingPoint
  tooltip.style.display = 'block'
  //监听移动事件
  handler.setInputAction(function (movement) {
    tooltip.style.left = movement.endPosition.x + 440 + 'px'
    tooltip.style.top = movement.endPosition.y + 30 + 'px'
    tooltip.innerHTML = '<p>单击开始，双击结束</p>'
    //移动结束位置
    cartesian = viewer.scene.pickPosition(movement.endPosition)
    //判断点是否在画布上
    if (window.XEarth.defined(cartesian)) {
      if (positions.length >= 2) {
        if (!window.XEarth.defined(poly)) {
          //画线
          poly = new PolyLinePrimitive(positions)
        } else {
          positions.pop()
          // cartesian.y += (1 + Math.random());
          positions.push(cartesian)
        }
        distance = getSpaceDistance(positions)
      }
    }
  }, window.XEarth.ScreenSpaceEventType.MOUSE_MOVE)
  //监听单击事件
  handler.setInputAction(function (movement) {
    tooltip.style.display = 'none'
    cartesian = viewer.scene.pickPosition(movement.position)

    if (window.XEarth.defined(cartesian)) {
      if (positions.length == 0) {
        positions.push(cartesian.clone())
      }
      positions.push(cartesian)
      //在三维场景中添加Label
      var textDisance = distance + '米'
      floatingPoint = viewer.entities.add({
        name: '空间直线距离',
        position: positions[positions.length - 1],
        point: {
          pixelSize: 5,
          color: window.XEarth.Color.RED,
          outlineColor: window.XEarth.Color.WHITE,
          outlineWidth: 2,
          heightReference: window.XEarth.HeightReference.NONE
        },
        label: {
          text: textDisance,
          font: '18px sans-serif',
          fillColor: window.XEarth.Color.GOLD,
          style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: window.XEarth.VerticalOrigin.BOTTOM,
          pixelOffset: new window.XEarth.Cartesian2(20, -20),
          heightReference: window.XEarth.HeightReference.NONE
        }
      })
    }
  }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)
  //监听双击事件
  handler.setInputAction(function (movement) {
    handler.destroy() //关闭事件句柄
    positions.pop() //最后一个点无效
  }, window.XEarth.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
}
//绘线效果1
var PolyLinePrimitive = (function () {
  function _(positions) {
    this.options = {
      name: '直线',
      polyline: {
        show: true,
        positions: [],
        material: window.XEarth.Color.CHARTREUSE,
        width: 2
      }
    }
    this.positions = positions
    this._init()
  }
  _.prototype._init = function () {
    var _self = this
    var _update = function () {
      return _self.positions
    }
    //实时更新polyline.positions
    this.options.polyline.positions = new window.XEarth.CallbackProperty(
      _update,
      false
    )
    viewer.entities.add(this.options)
  }

  return _
})()
