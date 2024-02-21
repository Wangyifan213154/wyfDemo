/*
 * 卫星扫描（高空）效果
 * @Author: Wang jianLei
 * @Date: 2022-06-27 17:30:32
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2022-06-27 22:52:14
 */
import { StatelliteData, starPath } from './customTool/satellitePath'
import { satelliteNetConnect } from './customTool/satelliteConnect'
class SatelliteSimulateController {
  constructor(option) {
    this.viewer = option.viewer;
    this.Earth = option.earth
    this.satelliteCollection = this.viewer.entities.add(new this.Earth.Entity());
  }
  addSatellite(data) {
    const that = this
    let viewer = this.viewer;
    let start = new this.Earth.JulianDate.fromDate(new Date());
    start = this.Earth.JulianDate.addHours(start, 8, new this.Earth.JulianDate()); //东八区时间
    // 结束时间
    let stop = this.Earth.JulianDate.addSeconds(
      start,
      data.time,
      new this.Earth.JulianDate()
    );
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = this.Earth.ClockRange.LOOP_STOP; //循环结束时
    viewer.clock.multiplier = 1; //速率
    //给时间线设置边界
    // viewer.timeline.zoomTo(start, stop);
    let trackPositions = computeCirclularFlight(data, 2); //轨道位置点
    // let ScanningCircle = viewer.entities.add({
    //   parent: this.satelliteCollection,
    //   availability: new this.Earth.TimeIntervalCollection([
    //     new this.Earth.TimeInterval({
    //       start: start,
    //       stop: stop,
    //     }),
    //   ]),
    //   position: trackPositions, //轨道高度
    //   orientation: new this.Earth.VelocityOrientationProperty(trackPositions),
    //   cylinder: {
    //     HeightReference: this.Earth.HeightReference.CLAMP_TO_GROUND,
    //     length: data.height,
    //     topRadius: 0,
    //     bottomRadius: data.height / 2,
    //     material: this.Earth.Color.RED.withAlpha(0.2),
    //     outline: true,
    //     numberOfVerticalLines: 0,
    //     outlineWidth: 20,
    //     outlineColor: this.Earth.Color.YELLOW.withAlpha(0.8),
    //   },
    // });
    // ScanningCircle.position.setInterpolationOptions({
    //   interpolationDegree: 5,
    //   interpolationAlgorithm: this.Earth.LagrangePolynomialApproximation,
    // });
    let satellitePositions = computeCirclularFlight(data, 1);
    let satelliteObj = viewer.entities.add({
      // parent: this.satelliteCollection,
      id: data.id,
      availability: new this.Earth.TimeIntervalCollection([
        new this.Earth.TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),
      position: satellitePositions, //计算实体位置属性
      //基于位置移动自动计算方向.
      orientation: new this.Earth.VelocityOrientationProperty(satellitePositions),
      model: {
        uri: "static/data/gltf/wxModel/SAR.gltf",
        minimumPixelSize: 64,
      },
      //路径
      path: {
        resolution: 1,
        material: new this.Earth.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: this.Earth.Color.PINK,
        }),
        width: 15,
      },
    });
    //差值器
    satelliteObj.position.setInterpolationOptions({
      interpolationDegree: 5,
      interpolationAlgorithm: this.Earth.LagrangePolynomialApproximation,
    });
    this.viewer.clockViewModel.shouldAnimate = true;
    function computeCirclularFlight(source, type) {
      let property = new that.Earth.SampledPositionProperty();
      if (type == 1) {
        //卫星位置
        for (let i = 0; i < source.values.length; i++) {
          let time = that.Earth.JulianDate.addSeconds(
            start,
            source.values[i].time,
            new that.Earth.JulianDate()
          );
          let position = that.Earth.Cartesian3.fromDegrees(
            source.values[i].lon,
            source.values[i].lat,
            source.height
          );
          property.addSample(time, position);
        }
      } else if (type == 2) {
        //轨道位置
        for (let i = 0; i < source.values.length; i++) {
          let time = that.Earth.JulianDate.addSeconds(
            start,
            source.values[i].time,
            new that.Earth.JulianDate()
          );
          let position = that.Earth.Cartesian3.fromDegrees(
            source.values[i].lon,
            source.values[i].lat,
            source.perHeight
          );
          property.addSample(time, position);
        }
      }
      return property;
    }
  }
  addSatellites() {
    StatelliteData.forEach(item => {
      this.addSatellite(item)
    })
    setTimeout(() => {
      this.addEffect()
      console.log(window.EarthViewer.dataSources);
    }, 4000);
  }
  removeAll() {
    this.satelliteCollection._children.forEach((element) => {
      this.viewer.entities.remove(element);
    });
    this.viewer.entities.remove(this.satelliteCollection);
  }
  addEffect() {
    window.sceneAction.satelliteSixActController.spyOnEffect({
      satelliteType: 'light',
      entityId: 's1',
    })
    window.sceneAction.satelliteSixActController.spyOnEffect({
      satelliteType: 'electric',
      entityId: 's2',
    })
    window.sceneAction.satelliteSixActController.spyOnEffect({
      satelliteType: 'highLight',
      entityId: 's3',
    })
  }
  test() {
    var points = window.EarthViewer.scene.primitives.add(
      new this.Earth.PointPrimitiveCollection({
        modelMatrix: this.Earth.Matrix4.IDENTITY,
        debugShowBoundingVolume: false,
        // OPAQUE 完全不透明；TRANSLUCENT 完全透明；OPAQUE_AND_TRANSLUCENT 不透明和半透明
        blendOption: this.Earth.BlendOption.OPAQUE_AND_TRANSLUCENT,
      })
    );
    // add PointPrimitive
    points.add({
      position: this.Earth.Cartesian3.fromDegrees(120.59777, 25.53883, 10000.0),
      color: this.Earth.Color.YELLOW,
    });
    points.add({
      position: this.Earth.Cartesian3.fromDegrees(120.59777, 10.53883, 10000.0),
      color: this.Earth.Color.CYAN,
    });

    var instance = new this.Earth.GeometryInstance({
      geometry: new this.Earth.RectangleGeometry({
        rectangle: this.Earth.Rectangle.fromDegrees(-100.0, 20.0, -90.0, 30.0),
        vertexFormat: this.Earth.EllipsoidSurfaceAppearance.VERTEX_FORMAT
      })
    });

    window.EarthViewer.scene.primitives.add(new this.Earth.Primitive({
      geometryInstances: instance,
      appearance: new this.Earth.EllipsoidSurfaceAppearance({
        material: this.Earth.Material.fromType('Stripe')
      })
    }));
  }
  createCzml(czmlname, offset) {
    const czml = [
      {
        "description": "CZML Document",
        "id": "document",
        "name": czmlname,
        "availability": "2025-04-01T04:00:00Z/2025-06-01T14:00:00Z",
        "clock": {
          "currentTime": "2025-06-01T10:00:00",
          "multiplier": 1,
          "range": "LOOP_STOP",
          "interval": "2025-06-01T10:00:00/2025-06-01T20:00:00",
          "step": "SYSTEM_CLOCK_MULTIPLIER",//"SYSTEM_CLOCK",//"TICK_DEPENDENT",//"SYSTEM_CLOCK_MULTIPLIER"
        },
        "version": "1.0"
      },
      {
        "id": "YAOGAN24",
        "model": {
          "gltf": 'static/data/gltf/wxModel/SAR.gltf',
          "scale": 64,
          "luminanceAtZenith": 1.0,
        },
        "position": {
          "interpolationAlgorithm": "LAGRANGE",
          "epoch": "2025-06-01T10:00:00",
          "cartographicDegrees": [],
          "interpolationDegree": 20
        },
      }
    ]

    offset.forEach(item => {
      const newPosition = []
      for (let index = 1; index < starPath.length; index += 4) {
        const time = starPath[index - 1]
        const lng = starPath[index] + item.lng;
        const lat = starPath[index + 1] + item.lat;
        const height = 700000
        newPosition.push(time)
        newPosition.push(lng)
        newPosition.push(lat)
        newPosition.push(height)
      }
      const newStar = {
        "id": item.id,
        "point": {

        },
        "color": {

        },
        // "label": {
        //   "text": czmlname
        // },
        // "billboard": {
        //   "image": "static/data/gltf/wxModel/SAR.gltf"
        // },
        "model": {
          "gltf": 'static/data/gltf/wxModel/SAR.gltf',
          "scale": 64,
          "luminanceAtZenith": 1.0,
        },
        "position": {
          "interpolationAlgorithm": "LAGRANGE",
          "epoch": "2025-06-01T10:00:00",
          "cartographicDegrees": newPosition,
          "interpolationDegree": 2
        },
      }
      czml.push(newStar)
    })
    let that = this
    this.viewer.dataSources
      .add(this.Earth.CzmlDataSource.load(czml))
      .then(data => {
        that.czmlConfig(data, czmlname)
        console.log(data);
      })
  }
  createCzmlGroup() {
    const offset1 = [
      {
        id: 'YAOGAN1',
        lng: 0,
        lat: 0
      },
      {
        id: 'YAOGAN2',
        lng: -3,
        lat: 5
      },
      {
        id: 'YAOGAN3',
        lng: 3,
        lat: 5
      }
    ]
    const offset2 = [
      {
        id: 'YAOGAN4',
        lng: -3,
        lat: -5
      },
      {
        id: 'YAOGAN5',
        lng: 3,
        lat: -5
      },
    ]
    const offset3 = [
      {
        id: 'YAOGAN6',
        lng: -3,
        lat: 7
      },
      {
        id: 'YAOGAN7',
        lng: 3,
        lat: 7
      },
      {
        id: 'YAOGAN8',
        lng: -4,
        lat: 8
      },
    ]
    this.createCzml('electric', offset1)
    this.createCzml('red', offset2)
    this.createCzml('light', offset3)
  }
  czmlConfig(ds, czmlname) {
    const colorHash = {
      'light': [224, 171, 24],
      'red': [225, 82, 88],
      'electric': [125, 102, 158],
      'radar': [81, 180, 109],
      'sar': [48, 121, 171],
      'highLight': [224, 171, 24],
    }
    const colorRGB = colorHash[czmlname]
    const color = new window.XEarth.Color(colorRGB[0] / 255, colorRGB[1] / 255, colorRGB[2] / 255, 1)
    ds.entities._entities._array.forEach((element) => {
      if (typeof element.billboard != 'undefined') {
        let name = element.label.text._value
        let lab = name
        if (name.indexOf('宏图') == -1) {
          lab = name.split('载荷')[0] + '-' + name.split('_')[2]
        }
        const canvas = document.createElement('canvas')
        canvas.width = 100
        canvas.height = 100
        const ctx = canvas.getContext('2d')

        // 绘制图标
        const icon = new Image()
        icon.src = element.billboard.image
        icon.onload = () => {
          ctx.drawImage(icon, 10, 10, 80, 80)
          // 绘制文字
          // ctx.font = '1.2rem Open Sans,Microsoft YaHei'
          ctx.font = '1.2rem Microsoft YaHei'
          var gradient = ctx.createLinearGradient(0, 0, 100, 0)
          gradient.addColorStop('0', 'magenta')
          gradient.addColorStop('0.5', 'yellow')
          gradient.addColorStop('1.0', 'red')
          ctx.fillStyle = gradient
          // ctx.fillStyle = 'white'
          // ctx.fillText(lab, 10, 20)
          element.billboard.image = canvas
        }
        // element.billboard.pixelOffset = new window.XEarth.Cartesian2(27, 0)
        element.billboard.distanceDisplayCondition =
          new window.XEarth.DistanceDisplayCondition(4e2, 6e6)
        element.billboard.scale = 0.5
        // element.billboard.color = color
        element.billboard.scaleByDistance = new window.XEarth.NearFarScalar(
          2e2,
          1.3,
          6e6,
          1
        )
      }
      // if (typeof element.model != 'undefined') {
      //   element.model.show = false
      //   if (
      //     element.label.text._value.indexOf('红外') > -1 ||
      //     element.label.text._value.indexOf('高光谱') > -1
      //   ) {
      //     element.model.scale = 12
      //   } else {
      //     element.model.scale = 5
      //   }

      //   element.model.distanceDisplayCondition =
      //     new window.XEarth.DistanceDisplayCondition(0, 6e6)
      // }
      if (typeof element.label != 'undefined') {
        element.label.show = false
        element.label.font = '16px Lucida Console'
        element.label.scale = 0.7
        element.label.style = window.XEarth.LabelStyle.FILL
        // element.label.backgroundColor = window.XEarth.Color.DARKGREY.withAlpha(0.7)
        element.label.fillColor = color
        // element.label.outlineWidth = 0.2
        element.label.pixelOffset = new window.XEarth.Cartesian2(15, -11) //偏移量
        // element.label.showBackground = true
        // element.label.backgroundColor = new window.XEarth.Color.fromCssColorString(
        //   '#6ab4fff2'
        // )
        // element.label.maximumScale = 1.1
        // element.label.minimumScale = 0.7
        element.label.eyeOffset = new window.XEarth.Cartesian3(0, 0, -100)
        element.label.distanceDisplayCondition =
          new window.XEarth.DistanceDisplayCondition(0, 6e6)
      }

      if (typeof element.path != 'undefined') {
        element.path.width = 1
        element.path.distanceDisplayCondition =
          new window.XEarth.DistanceDisplayCondition(0, 2e6)
      }

      if (typeof element.point != 'undefined') {
        element.point.pixelSize = 1.5
        element.point.color = color
        element.point.distanceDisplayCondition =
          new window.XEarth.DistanceDisplayCondition(6e6, 2e9)
        element.point.scaleByDistance = new window.XEarth.NearFarScalar(
          6e6,
          1.6,
          2e8,
          1.2
        )
      }
    })
    //
  }
  connect() {
    const testData = [
      {
        linkID: '1',
        edges: [
          {
            "sourID": "YAOGAN1",
            "sourSensorType": 'electric',
            "targID": "YAOGAN4",
            "targSensorType": 'red'
          },
          {
            "sourID": "YAOGAN8",
            "sourSensorType": 'light',
            "targID": "YAOGAN4",
            "targSensorType": 'red'
          }
        ]
      }
    ]
    testData.forEach(item => {
      satelliteNetConnect(item)
    })
    const testData1 = [
      {
        linkID: '1',
        edges: [
          {
            "sourID": "YAOGAN1",
            "sourSensorType": 'electric',
            "targID": "YAOGAN4",
            "targSensorType": 'red'
          },
          {
            "sourID": "YAOGAN8",
            "sourSensorType": 'light',
            "targID": "YAOGAN4",
            "targSensorType": 'red'
          },
          {
            "sourID": "YAOGAN7",
            "sourSensorType": 'light',
            "targID": "YAOGAN6",
            "targSensorType": 'light'
          },
        ]
      }
    ]
    setTimeout(() => {
      testData1.forEach(item => {
        satelliteNetConnect(item)
      })
    }, 3000);
    const testData2 = [
      {
        linkID: '1',
        edges: [
          {
            "sourID": "YAOGAN1",
            "sourSensorType": 'electric',
            "targID": "YAOGAN4",
            "targSensorType": 'red'
          },
          {
            "sourID": "YAOGAN8",
            "sourSensorType": 'light',
            "targID": "YAOGAN4",
            "targSensorType": 'red'
          },
          {
            "sourID": "YAOGAN7",
            "sourSensorType": 'light',
            "targID": "YAOGAN6",
            "targSensorType": 'light'
          },
          {
            "sourID": "YAOGAN3",
            "sourSensorType": 'electric',
            "targID": "YAOGAN5",
            "targSensorType": 'red'
          },
        ]
      }
    ]
    setTimeout(() => {
      testData2.forEach(item => {
        satelliteNetConnect(item)
      })
    }, 6000);
  }
}

export default SatelliteSimulateController;