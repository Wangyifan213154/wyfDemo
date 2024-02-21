import { loadGLSL } from '@/utils/postProcess/load.js'
import { galaxyLineGLSL } from '@/utils/postProcess/galaxyline.js'
import store from '@/store'
import SuperGif from '@/utils/libgif.js'

class DataControl {
  constructor(config) {
    this.Cesium = config.Cesium
    this.viewer = config.viewer
  }

  // 地面和船显隐
  showGroundTargetOrResource(actorId, flag) {
    let viewer = window.EarthViewer
    let entity = viewer.entities.getById(actorId)
    if (!entity) {
      let ds = viewer.dataSources.getByName(actorId)
      if (ds.length > 0) {
        entity = ds[0].entities.getById(actorId)
      }
    }
    if (entity) {
      entity.show = flag
    }
  }

  // 热力图显隐
  addHeatMap(type) {
    let data = store.getters.getGridData
    // if (Object.getOwnPropertyNames(data).length == 0) {
    //   ElMessage({
    //     message: '当前没有接到热力图数据',
    //     grouping: true,
    //     type: 'error'
    //   })
    //   return
    // }
    let heatMap = store.getters.getHeatMap
    if (type) {
      let heatList = []
      for (let i = 0; i < JSON.parse(data).data.length; i++) {
        let item = JSON.parse(data).data[i]
        let param = {
          lnglat: [item.centerLongitude, item.centerLatitude],
          value: item.heatingPower
        }
        heatList.push(param)
      }

      // JSON.parse(data).data.forEach((item) => {
      //   let param = {
      //     lnglat: [item.centerLongitude, item.centerLatitude],
      //     value: item.heatingPower
      //   }
      //   heatList.push(param)
      // })

      heatMap = new Heatmap3d(viewer, {
        list: heatList,
        raduis: 15,
        baseHeight: 800,
        // primitiveType: "TRNGLE",
        primitiveType: 'LINES',
        gradient: {
          '.3': 'blue',
          '.5': 'green',
          '.7': 'yellow',
          '.95': 'red'
        }
      })
      // store.commit('setHeatMap',heatMap)// ？
    } else {
      heatMap.destroy()
    }
  }

  //加载geojson数据 （暂时不用这个
  addGeojsonData(options) {
    let viewer = window.EarthViewer
    let Cesium = window.MSIMEarth
    var promise = window.MSIMEarth.GeoJsonDataSource.load(options.url)
    if (!options.geoType) return
    promise.then(function (dataSource) {
      dataSource.name = options.id
      viewer.dataSources.add(dataSource).then
      var entities = dataSource.entities.values
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        entity.billboard = undefined
        let geoType = options.geoType
        switch (geoType) {
          case 'point':
            entity.point = {
              color: options.color,
              pixelSize: options.size || 5
            }
            break
          case 'polyline':
            // entity.polyline.material = options.color
            entity.polyline.material =
              new window.MSIMEarth.PolylineGlowMaterialProperty({
                glowPower: 0.1,
                color: options.color
              })
            entity.polyline.width = options.width || 12
            break
          case 'polygon':
            // if (entity._name == '中印' || entity._name == '中朝') {
            //   entity.polygon.material = window.MSIMEarth.Color.CYAN.withAlpha(0.2)
            //   entity.polygon.outlineColor = window.MSIMEarth.Color.CYAN.withAlpha(0.7)
            // } else if (entity._name.indexOf('海') > -1) {
            //   entity.polygon.material = window.MSIMEarth.Color.CRIMSON.withAlpha(0.2)
            //   entity.polygon.outlineColor = window.MSIMEarth.Color.CRIMSON.withAlpha(0.7)
            // } else {
            //   entity.polygon.material = options.color
            // }
            entity.polygon.material = window.MSIMEarth.Color.CYAN.withAlpha(0.2)
            entity.polygon.outlineColor =
              window.MSIMEarth.Color.CYAN.withAlpha(0.6)
            entity.polyline = {
              positions: entity.polygon.hierarchy._value.positions,
              width: 10,
              material: new window.MSIMEarth.AreaLineBMaterialProperty({
                color: window.MSIMEarth.Color.CYAN,
                duration: 400
              })
            }
            break
          default:
            break
        }
        if (options.addLabel) {
          let textVal = ''
          if (entity.properties) {
            textVal = entity.properties.zhname || entity.properties.NAME
            let nearDis = options.nearDis || 1e2
            let farDis = options.farDis || 1e6
            let color = window.MSIMEarth.Color.WHITE
            if (textVal == '中华人民共和国') {
              color = window.MSIMEarth.Color.RED
            }
            entity.label = {
              text: textVal,
              font: 'normal 29px MicroSoft YaHei',
              scale: options.scale || 0.5,
              fillColor: color,
              outlineColor: color,
              outlineWidth: 1,
              style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
              horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
              verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
              pixelOffset: new window.MSIMEarth.Cartesian2(-33, -11),
              eyeOffset: new window.MSIMEarth.ConstantProperty(
                new window.MSIMEarth.Cartesian3(0, 0, -11)
              ),
              distanceDisplayCondition:
                new window.MSIMEarth.DistanceDisplayCondition(nearDis, farDis)
            }
          }
        }
      }
    })
  }

  delGeojsonData() {}

  //卫星显隐控制 {dataSourceName:"czml的name",isVisible:true/false,entityId:""}
  satelliteIsvisible(params) {
    console.log(params)
    let dataSource = viewer.dataSources.getByName(params.dataSourceName)
    if (params.entityId) {
      let es = dataSource.getByName(params.entityId)
      es.forEach((element) => {
        element.show = params.isVisible
      })
    } else {
      if (dataSource.length > 0) {
        for (let k = 0; k < dataSource.length; k++) {
          dataSource[k].show = params.isVisible
        }
      }
    }
  }

  // 添加海岸基线
  _addHAJX() {
    const options = {
      url: 'static/data/geojson/FK识别区/海基线线数据.json',
      color: window.MSIMEarth.Color.RED,
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      id: '海岸'
    }
    this.addGeojson(options)
  }
  // 添加防空识别区
  _addDHFKSBQ() {
    const options = {
      url: 'static/data/geojson/FK识别区/DH防空识别点数据.json',
      color: window.MSIMEarth.Color.RED, //152, 56, 93
      addLabel: false,
      dataType: 'vector',
      geoType: 'point',
      id: '防空1'
    }
    const options2 = {
      url: 'static/data/geojson/FK识别区/东海防空识别线数据.json',
      color: window.MSIMEarth.Color.RED,
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      id: '防空2'
    }
    // this.addGeojson(options)
    this.addGeojson(options2)
    // 东海防空识别区的标识
    let center = new window.MSIMEarth.Cartesian3.fromDegrees(
      124.56142578414978,
      29.088438770842423
    )
    let centerTW = new window.MSIMEarth.Cartesian3.fromDegrees(
      120.83108755879553,
      23.589335002507163
    )
    var heading = -window.MSIMEarth.Math.PI_OVER_TWO
    var pitch = window.MSIMEarth.Math.PI_OVER_FOUR
    var roll = 0.0
    var hpr = new window.MSIMEarth.HeadingPitchRoll(heading, pitch, roll)
    var quaternion = window.MSIMEarth.Transforms.headingPitchRollQuaternion(
      centerTW,
      hpr
    )
    window.EarthViewer.entities.add({
      id: 'dhfksbq_name_id',
      name: 'dhfksbq_name',
      position: center,
      orientation: quaternion,
      label: {
        // text: '财政局西门',
        text: '东海防空识别区',
        // backgroundColor: new window.MSIMEarth.Color(1.0, 153 / 255, 18 / 255, 1.0),
        // showBackground: false,
        font: 'normal 46px MicroSoft YaHei',
        scale: 0.5,
        fillColor: window.MSIMEarth.Color.RED,
        style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
        // outlineWidth: 2,
        horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
        verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
        pixelOffset: new window.MSIMEarth.Cartesian2(-63, 11),
        eyeOffset: new window.MSIMEarth.ConstantProperty(
          new window.MSIMEarth.Cartesian3(0, 0, -11)
        ),
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          20e5,
          60e5
        )
      }
    })
  }
  /**
   * 台湾防空识别区
   */
  addTWFKSBQ() {
    window.EarthViewer.entities.add({
      name: 'Blue dashed line',
      polyline: {
        positions: window.MSIMEarth.Cartesian3.fromDegreesArray([
          117.5, 29.0, 123.0, 29.0, 123, 22.5, 121.5, 21, 117.5, 21, 117.5, 29
        ]),
        width: 2,
        material: window.MSIMEarth.Color.BLUE.withAlpha(1),
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          20e5,
          100e5
        )
      }
    })
    let centerTW = new window.MSIMEarth.Cartesian3.fromDegrees(
      120.83108755879553,
      23.589335002507163
    )
    var heading = -window.MSIMEarth.Math.PI_OVER_TWO
    var pitch = window.MSIMEarth.Math.PI_OVER_FOUR
    var roll = 0.0
    var hpr = new window.MSIMEarth.HeadingPitchRoll(heading, pitch, roll)
    var quaternion = window.MSIMEarth.Transforms.headingPitchRollQuaternion(
      centerTW,
      hpr
    )
    window.EarthViewer.entities.add({
      id: 'twfksbq_name_id',
      name: 'twfksbq_name',
      position: centerTW,
      orientation: quaternion,
      label: {
        // text: '财政局西门',
        text: '台湾防空识别区',
        // backgroundColor: new window.MSIMEarth.Color(1.0, 153 / 255, 18 / 255, 1.0),
        // showBackground: false,
        font: 'normal 46px MicroSoft YaHei',
        scale: 0.5,
        fillColor: window.MSIMEarth.Color.BLUE,
        style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
        // outlineWidth: 2,
        horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
        verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
        pixelOffset: new window.MSIMEarth.Cartesian2(-73, 11),
        eyeOffset: new window.MSIMEarth.ConstantProperty(
          new window.MSIMEarth.Cartesian3(0, 0, -11)
        ),
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          20e5,
          60e5
        )
      }
    })
  }
  /**
   * 添加四海两边
   */
  _add4H2B() {
    const options = {
      url: basicVectorData.fourSeaTwoBorder,
      color: window.MSIMEarth.Color.RED,
      addLabel: false,
      dataType: 'vector',
      geoType: 'polygon',
      id: '4H2B'
    }
    this.addGeojson(options)
  }
  /**
   * 添加岛链数据
   */
  _addDaoLian() {
    const options1 = {
      url: basicVectorData.daolian1,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      id: 'daolian1'
    }
    this.addGeojson(options1)
    const options2 = {
      url: basicVectorData.daolian2,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      id: 'daolian2'
    }
    this.addGeojson(options2)
    // const options3 = {
    //   url: basicVectorData.daolian3,
    //   color: window.MSIMEarth.Color.YELLOW,
    //   addLabel: false,
    //   dataType: 'vector',
    //   geoType: 'polyline',
    //   id: 'daolian3'
    // }
    // this.addGeojson(options3)
  }
  // 添加geojson
  addGeojson(options) {
    let self = this
    window.EarthViewer.dataSources._dataSources.forEach((dataSource) => {
      if (dataSource._name == options.id) {
        // 移除czml路径
        window.EarthViewer.dataSources.remove(dataSource)
      }
    })
    var promise = window.MSIMEarth.GeoJsonDataSource.load(options.url)
    // console.log(options)
    if (!options.geoType) return
    promise.then(function (dataSource) {
      dataSource.name = options.id
      var entities = dataSource.entities.values
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        entity.billboard = undefined
        let geoType = options.geoType
        switch (geoType) {
          case 'point':
            entity.point = {
              color: options.color,
              pixelSize: 5
              // disableDepthTestDistance: Number.POSITIVE_INFINITY,
              // heightReference: window.MSIMEarth.HeightReference.CLAMP_TO_GROUND
            }
            if (options.id == '防空1') {
              // console.log(entity)
              self.createBillboardLabel_DC({
                cartesian3: entity.position._value,
                text: entity.properties.position._value,
                offset: new window.MSIMEarth.Cartesian2(0, -40),
                img: 'static/image/billboard/border_bg_red.png'
              })
            } else if (options.id == 'ZY_elevation_point') {
              self.createElevationLabel({
                cartesian3: entity.position._value,
                text: entity.properties.z._value.toString(),
                offset: new window.MSIMEarth.Cartesian2(0, -40),
                img: 'static/image/billboard/border_bg_red.png'
              })
            } else if (
              options.id == 'debris' ||
              options.id == 'landslide' ||
              options.id == 'earthquake'
            ) {
              let imageUrl = ''
              let color = window.MSIMEarth.Color.RED
              switch (options.id) {
                case 'debris':
                  imageUrl = 'static/image/billboard/危险源_hp.png'
                  color = window.MSIMEarth.Color.YELLOW
                  break
                case 'landslide':
                  imageUrl = 'static/image/billboard/危险源_nsl.png'
                  color = window.MSIMEarth.Color.BLUEVIOLET
                  break
                case 'earthquake':
                  imageUrl = 'static/image/billboard/危险源_dz.png'
                  break
                default:
                  break
              }
              entity.billboard = {
                image: imageUrl,
                show: true,
                width: 5,
                height: 5,
                rotation: 0.0,
                eyeOffset: new window.MSIMEarth.ConstantProperty(
                  new window.MSIMEarth.Cartesian3(0, 0, -1)
                ),
                pixelOffset: new window.MSIMEarth.Cartesian2(0.0, -25),
                scaleByDistance: new window.MSIMEarth.NearFarScalar(
                  1.5e2,
                  6.0,
                  1.5e7,
                  3.5
                ),
                heightReference:
                  window.MSIMEarth.HeightReference.CLAMP_TO_GROUND,
                distanceDisplayCondition:
                  new window.MSIMEarth.DistanceDisplayCondition(0, 100e5),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
              }
              entity.point = undefined
              entity.point = {
                color: color,
                pixelSize: 5
              }
              entity.ellipse = {
                semiMinorAxis: 3520.0,
                semiMajorAxis: 3520.0,
                material: new window.MSIMEarth.PulseMaterialProperty({
                  color: color,
                  mixColor: new window.MSIMEarth.Color(
                    227 / 255,
                    62 / 255,
                    49 / 255,
                    1.0
                  ),
                  repeat: new window.MSIMEarth.Cartesian2(1.0, 1.0),
                  // half: false,
                  flowSpeed: 45,
                  transparent: true
                }),
                distanceDisplayCondition:
                  new window.MSIMEarth.DistanceDisplayCondition(0, 100e5),
                height: 100
              }
              // label: {
              //   //文字标签
              //   text: element.name,
              //   font: '15px sans-serif',
              //   style: window.MSIMEarth.LabelStyle.FILL,
              //   horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
              //   verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
              //   pixelOffset: new window.MSIMEarth.Cartesian2(20, -60),
              //   // showBackground: true,
              //   backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
              //   distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
              //     0,
              //     100e5
              //   )
              // }
            } else if (options.id === 'zy_QixiangPositions') {
              entity.point = undefined
              entity.label = {
                text: entity.properties.Field1._value,
                font: '18px black',
                fillColor: window.MSIMEarth.Color.WHITE,
                style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
                horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
                verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
                pixelOffset: new window.MSIMEarth.Cartesian2(0, -40),
                outlineColor: window.MSIMEarth.Color.BLACK,
                outlineWidth: 2,
                // showBackground: true,
                backgroundColor: new window.MSIMEarth.Color.fromBytes(
                  235,
                  155,
                  33
                ),
                heightReference:
                  window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND,
                distanceDisplayCondition:
                  new window.MSIMEarth.DistanceDisplayCondition(0, 10e5),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
              }
            } else {
              if (typeof entity.properties.position != 'undefined') {
                self.createBillboardLabel_DC({
                  cartesian3: entity.position._value,
                  text: entity.properties.position._value,
                  name: entity.properties.type._value,
                  offset: new window.MSIMEarth.Cartesian2(0, -40),
                  img: 'static/image/billboard/border_bg_red.png'
                })
              } else if (
                typeof entity.properties.x != 'undefined' &&
                typeof entity.properties.y != 'undefined'
              ) {
                self.createBillboardLabel_DC({
                  cartesian3: entity.position._value,
                  text: entity.properties.template_n._value,
                  name: entity.properties.template_n._value,
                  color: window.MSIMEarth.Color.GREENYELLOW,
                  labelScale: 0.6,
                  offset: new window.MSIMEarth.Cartesian2(0, -40),
                  img: 'static/image/billboard/border_bg_yellow.png'
                })
              } else {
              }
            }
            // console.log(entity.point)
            break
          case 'polyline':
            entity.polyline.material = options.color
            entity.polyline.distanceDisplayCondition =
              new window.MSIMEarth.DistanceDisplayCondition(20e5, 100e5)
            entity.billboard = undefined
            if (options.id == 'guojiexian') {
              entity.polyline.width = options.width
              entity.polyline.material = new window.MSIMEarth.Color(
                186 / 255,
                105 / 255,
                102 / 255,
                0.7
              )
              entity.polyline.distanceDisplayCondition =
                new window.MSIMEarth.DistanceDisplayCondition(20e5, 350e5)
            } else if (options.id === 'zyRiver_link') {
              entity.polyline.width = options.width
              entity.polyline.material =
                window.MSIMEarth.Color.DODGERBLUE.withAlpha(0.5)
              entity.polyline.distanceDisplayCondition =
                new window.MSIMEarth.DistanceDisplayCondition(0, 100e5)
              entity.polyline.width = options.width
              // entity.polyline.height = 100
              entity.polyline.clampToGround = true
              // entity.polyline.heightReference =
              //   window.MSIMEarth.HeightReference.CLAMP_TO_GROUND
            } else if (options.id == 'guojiexian2') {
              entity.polyline.width = options.width
              entity.polyline.material = new window.MSIMEarth.Color(
                217 / 255,
                217 / 255,
                223 / 255,
                0.7
              )
              entity.polyline.distanceDisplayCondition =
                new window.MSIMEarth.DistanceDisplayCondition(20e5, 350e5)
            } else if (options.id == 'shengjiexian') {
              entity.polyline.width = options.width
              entity.polyline.material = new window.MSIMEarth.Color(
                217 / 255,
                217 / 255,
                223 / 255,
                0.7
              )
              entity.polyline.distanceDisplayCondition =
                new window.MSIMEarth.DistanceDisplayCondition(20e5, 70e5)
            } else if (
              options.id == 'daolian1' ||
              options.id == 'daolian2' ||
              options.id == 'daolian3'
            ) {
              // entity.polyline.distanceDisplayCondition =
              // new window.MSIMEarth.DistanceDisplayCondition(20, 100e20)
              entity.polyline.width = 1
              entity.polyline.material = new window.MSIMEarth.Color(
                1.0,
                0.0,
                0.0,
                1.0
              )
              // entity.polyline.material = options.color
              //   ? options.color
              //   : new window.MSIMEarth.Color(1.0, 0.0, 0.0, 1.0)
              entity.polyline.distanceDisplayCondition =
                new window.MSIMEarth.DistanceDisplayCondition(20e5, 100e5)
            } else if (options.id == 'yindushiquan') {
              entity.polyline.width = 8
              entity.polyline.material = new window.MSIMEarth.Color(
                100 / 255,
                180 / 255,
                232 / 255,
                1.0
              )
              entity.polyline.distanceDisplayCondition =
                new window.MSIMEarth.DistanceDisplayCondition(0, 30e5)
            } else if (options.id == 'g219') {
              entity.polyline.width = 5
              entity.polyline.material = new window.MSIMEarth.Color(
                186 / 255,
                105 / 255,
                102 / 255,
                1.0
              )
              entity.polyline.distanceDisplayCondition =
                new window.MSIMEarth.DistanceDisplayCondition(0, 30e5)
            } else {
            }
            break
          case 'polygon':
            if (options.id == '4H2B') {
              if (entity._name == undefined) {
                // 等高线
                entity.polygon.outlineColor =
                  window.MSIMEarth.Color.YELLOW.withAlpha(0.2)
                entity.polygon.fill = false
                entity.polygon.distanceDisplayCondition =
                  new window.MSIMEarth.DistanceDisplayCondition(20e5, 250e5)
              } else if (entity._name == '中印' || entity._name == '中朝') {
                entity.polygon.material =
                  window.MSIMEarth.Color.CYAN.withAlpha(0.2)
                entity.polygon.outlineColor =
                  window.MSIMEarth.Color.CYAN.withAlpha(0.7)
                entity.polygon.distanceDisplayCondition =
                  new window.MSIMEarth.DistanceDisplayCondition(20e5, 250e5)
              } else if (entity._name.indexOf('海') > -1) {
                entity.polygon.material =
                  window.MSIMEarth.Color.CRIMSON.withAlpha(0.2)
                entity.polygon.outlineColor =
                  window.MSIMEarth.Color.CRIMSON.withAlpha(0.7)
                entity.polygon.distanceDisplayCondition =
                  new window.MSIMEarth.DistanceDisplayCondition(20e5, 250e5)
              } else {
                console.log('四海两边其他数据')
              }
            } else if (options.id == 'guojiexian') {
              entity.polygon.material = new window.MSIMEarth.Color(
                1.0,
                0.0,
                0.0,
                0.0
              )
              entity.polygon.outline = true
              entity.polygon.outlineColor = window.MSIMEarth.Color.YELLOW
              entity.polygon.distanceDisplayCondition =
                new window.MSIMEarth.DistanceDisplayCondition(20e5, 250e5)
            } else if (options.id == 'zyWater_area') {
              entity.polygon.material = new window.MSIMEarth.Color(
                0.0,
                1.0,
                1.0,
                1.0
              )
              // entity.polygon.outline = true
              // entity.polygon.outlineColor = window.MSIMEarth.Color.YELLOW
              entity.polygon.height = 2
              entity.polygon.heightReference =
                window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND
              entity.polygon.distanceDisplayCondition =
                new window.MSIMEarth.DistanceDisplayCondition(0, 100e5)
              console.log(entity.polygon)
            } else if (options.id === 'zyGlacier') {
              entity.polygon.outline = true
              entity.polygon.outlineColor = window.MSIMEarth.Color.RED
              entity.polygon.material = window.MSIMEarth.Color.DIMGRAY
              entity.polygon.height = 100
              entity.polygon.heightReference =
                window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND
              entity.polygon.distanceDisplayCondition =
                new window.MSIMEarth.DistanceDisplayCondition(0, 100e5)
            } else {
              console.log('其他polygong类型数据')
            }

            break
          default:
            break
        }
        if (options.addLabel) {
          let textVal = ''
          if (entity.properties.position)
            textVal = entity.properties.position._value
          entity.label = {
            text: textVal,
            font: 'normal 32px MicroSoft YaHei',
            scale: 0.5,
            fillColor: window.MSIMEarth.Color.RED,
            style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
            // outlineWidth: 2,
            horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
            verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
            pixelOffset: new window.MSIMEarth.Cartesian2(-63, -31),
            eyeOffset: new window.MSIMEarth.ConstantProperty(
              new window.MSIMEarth.Cartesian3(0, 0, -11)
            ),
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 100e5)
          }
        }
      }
      window.EarthViewer.dataSources.add(dataSource)
    })
  }
  /**
   * label结合billboard
   * @param {Object} val 标牌参数 坐标 图片路径 宽高 偏移等
   */
  createBillboardLabel_DC(val) {
    const Cesium = window.MSIMEarth
    // var center = window.MSIMEarth.Cartesian3.fromDegrees(
    //   108.95941558359958,
    //   34.219783901879,
    //   487.37960915730173
    // )
    let center = val.cartesian3
    var heading = -window.MSIMEarth.Math.PI_OVER_TWO
    var pitch = window.MSIMEarth.Math.PI_OVER_FOUR
    var roll = 0.0
    var hpr = new window.MSIMEarth.HeadingPitchRoll(heading, pitch, roll)
    var quaternion = window.MSIMEarth.Transforms.headingPitchRollQuaternion(
      center,
      hpr
    )
    window.EarthViewer.entities.add({
      name: 'billboardlabel',
      position: center,
      orientation: quaternion,
      billboard: {
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          0,
          // 2e5
          30e5
        ),
        image: val.img || 'static/image/billboard/border_bg01.png',
        // imageSubRegion : new window.MSIMEarth.BoundingRectangle(47, 80, 14, 14),
        name: 'singleWarning',
        show: true,
        width: val.width || 18,
        height: 4,
        // alignedAxis: new window.MSIMEarth.Cartesian3(10, 0, 0),
        eyeOffset: new window.MSIMEarth.ConstantProperty(
          new window.MSIMEarth.Cartesian3(0, 0, -1)
        ),
        pixelOffset: val.offset,
        // sizeInMeters: true, //图像的尺寸被指定成图像实际的尺寸
        // pixelOffset : new window.MSIMEarth.Cartesian2(0.0, 0),
        // position: window.MSIMEarth.Cartesian3.fromDegrees(116.2, 39.53, 15),
        //   distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(0, 6.8e10),
        // verticalOrigin: window.MSIMEarth.VerticalOrigin.TOP,
        scale: val.billboardScale || 6
        // scaleByDistance: new window.MSIMEarth.NearFarScalar(1.5e2, 6.0, 1.5e7, 3.5)
        // disableDepthTestDistance: Number.POSITIVE_INFINITY, //防止深度测试导致的遮挡 默认为0会遮挡
      },
      label: {
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          0,
          // 2e5
          30e5
        ),
        // text: '财政局西门',
        text: val.name,
        // backgroundColor: new window.MSIMEarth.Color(1.0, 153 / 255, 18 / 255, 1.0),
        // showBackground: false,
        font: 'normal 32px MicroSoft YaHei',
        scale: val.labelScale || 0.4,
        fillColor: val.color || window.MSIMEarth.Color.AQUA,
        style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
        // outlineWidth: 2,
        horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
        verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
        pixelOffset:
          val.pixelOffset || new window.MSIMEarth.Cartesian2(-43, -30),
        eyeOffset: new window.MSIMEarth.ConstantProperty(
          new window.MSIMEarth.Cartesian3(0, 0, -1)
        )
      }
    })
  }
  /**
   * 高程点标注
   * @param {*} val
   */
  createElevationLabel(val) {
    const Cesium = window.MSIMEarth
    // var center = window.MSIMEarth.Cartesian3.fromDegrees(
    //   108.95941558359958,
    //   34.219783901879,
    //   487.37960915730173
    // )
    let center = val.cartesian3
    var heading = -window.MSIMEarth.Math.PI_OVER_TWO
    var pitch = window.MSIMEarth.Math.PI_OVER_FOUR
    var roll = 0.0
    var hpr = new window.MSIMEarth.HeadingPitchRoll(heading, pitch, roll)
    var quaternion = window.MSIMEarth.Transforms.headingPitchRollQuaternion(
      center,
      hpr
    )
    window.EarthViewer.entities.add({
      name: 'billboardlabel',
      position: center,
      orientation: quaternion,
      label: {
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          0,
          // 2e5
          30e5
        ),
        // text: '财政局西门',
        text: val.name,
        // backgroundColor: new window.MSIMEarth.Color(1.0, 153 / 255, 18 / 255, 1.0),
        // showBackground: false,
        font: 'normal 32px MicroSoft YaHei',
        scale: val.labelScale || 0.4,
        fillColor: val.color || window.MSIMEarth.Color.AQUA,
        style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
        // outlineWidth: 2,
        horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
        verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
        pixelOffset:
          val.pixelOffset || new window.MSIMEarth.Cartesian2(-43, -30),
        eyeOffset: new window.MSIMEarth.ConstantProperty(
          new window.MSIMEarth.Cartesian3(0, 0, -1)
        )
      }
    })
  }
  /**
   * 添加地形
   */
  addTerrianLayer() {
    let terrainLayer = new window.MSIMEarth.CesiumTerrainProvider({
      url: terrainUrlConfig.terrianWorld,
      tilingScheme: new window.MSIMEarth.GeographicTilingScheme()
    })
    window.EarthViewer.scene.terrainProvider = terrainLayer
  }
  /**
   * 添加台湾地形
   */
  addTWTerrian() {
    let terrainLayer = new window.MSIMEarth.CesiumTerrainProvider({
      url: terrainUrlConfig.terrainTW,
      tilingScheme: new window.MSIMEarth.GeographicTilingScheme()
    })
    window.EarthViewer.scene.terrainProvider = terrainLayer
  }
  /** 删除地形 */
  removeTerrianLayer() {
    window.EarthViewer.scene.terrainProvider =
      new window.MSIMEarth.EllipsoidTerrainProvider({})
  }
  /**
   * 添加台湾高清影像
   */
  addTWGQYX() {
    let mvtProvider = new window.MSIMEarth.UrlTemplateImageryProvider({
      url: layersUrlConfig.twHDImage
      // minimumLevel: 14 //最小层级
      // maximumLevel: 18 //最大层级
    })
    let mvtProvider1 =
      window.EarthViewer.imageryLayers.addImageryProvider(mvtProvider)
    mvtProvider1.show = false
    // mvtProvider1.brightness = 0.6
    mvtProvider1.brightness = 0.9
    mvtProvider1.contrast = 1.0
    mvtProvider1.hue = 0
    mvtProvider1.saturation = 1.6
    mvtProvider1.gamma = 0.6
    window.cameraListener = function () {
      var e = window.EarthViewer.camera.position
      if (window.MSIMEarth.Cartographic.fromCartesian(e).height < 300000) {
        // 显示自定义的天空盒
        mvtProvider1.show = true
      } else {
        mvtProvider1.show = false
      }
    }
    window.EarthViewer.camera.changed.addEventListener(window.cameraListener)
  }
  /**
   * 南海基础军事设施
   */
  jichuJiDi() {
    nanhaiLFJD.forEach((element) => {
      window.EarthViewer.entities.add({
        name: element.name,
        position: window.MSIMEarth.Cartesian3.fromDegrees(
          element.lng,
          element.lat,
          10
        ),
        // 图标
        billboard: {
          image: 'static/image/billboard/camera-normal.png',
          show: true,
          width: 5,
          height: 5,
          rotation: 0.0,
          eyeOffset: new window.MSIMEarth.ConstantProperty(
            new window.MSIMEarth.Cartesian3(0, 0, -1)
          ),
          pixelOffset: new window.MSIMEarth.Cartesian2(0.0, -45),
          scaleByDistance: new window.MSIMEarth.NearFarScalar(
            1.5e2,
            6.0,
            1.5e7,
            3.5
          ),
          distanceDisplayCondition:
            new window.MSIMEarth.DistanceDisplayCondition(0, 100e5)
        },
        label: {
          //文字标签
          text: element.name,
          font: '15px sans-serif',
          style: window.MSIMEarth.LabelStyle.FILL,
          horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
          verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
          pixelOffset: new window.MSIMEarth.Cartesian2(20, -60),
          // showBackground: true,
          backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
          distanceDisplayCondition:
            new window.MSIMEarth.DistanceDisplayCondition(0, 100e5)
        }
      })
    })
  }
  /**
   * 基地
   */
  addJiDi() {
    window.EarthViewer.dataSources
      .add(
        window.MSIMEarth.GeoJsonDataSource.load('static/geojson/mubiao.json')
      )
      .then((data) => {
        let entitys = data.entities.values
        entitys.forEach((e) => {
          e.billboard = new window.MSIMEarth.BillboardGraphics({
            image: 'static/image/billboard/camera-normal.png',
            show: true,
            width: 5,
            height: 5,
            rotation: 0.0,
            eyeOffset: new window.MSIMEarth.ConstantProperty(
              new window.MSIMEarth.Cartesian3(0, 0, -1)
            ),
            pixelOffset: new window.MSIMEarth.Cartesian2(0.0, -15),
            scaleByDistance: new window.MSIMEarth.NearFarScalar(
              1.5e2,
              6.0,
              1.5e7,
              3.5
            ),
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 50e5)
          })
          e.label = new window.MSIMEarth.LabelGraphics({
            //文字标签
            text: e.properties._名称._value,
            fillColor: window.MSIMEarth.Color.DEEPSKYBLUE,
            font: '15px 黑体',
            style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
            outlineColor: window.MSIMEarth.Color.BLACK,
            outlineWidth: 2,
            horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
            verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
            pixelOffset: new window.MSIMEarth.Cartesian2(-20, -50),
            // showBackground: true,
            backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 50e5)
          })
        })
        this.handleCluster(data)
      })
  }
  /**
   * 河流
   */
  addRiver() {
    window.EarthViewer.dataSources
      .add(window.MSIMEarth.GeoJsonDataSource.load('static/geojson/river.json'))
      .then((data) => {
        let entitys = data.entities.values
        entitys.forEach((e) => {
          // console.log('河流', e.polyline.width)
          e.polyline.width = 1.5
          e.polyline.material = new window.MSIMEarth.Color(
            175 / 255,
            208 / 255,
            241 / 255,
            0.5
          )
          e.polyline.distanceDisplayCondition =
            new window.MSIMEarth.DistanceDisplayCondition(20e5, 100e5)
        })
      })
  }

  //添加中国 北京点
  addChina() {
    window.EarthViewer.entities.add({
      id: 'shoudu',
      position: window.MSIMEarth.Cartesian3.fromDegrees(
        116.41228426717022,
        40.18554306975011
      ),
      billboard: {
        image: './static/image/billboard/实五角星3.png',
        show: true,
        width: 5,
        height: 5,
        rotation: 0.0,
        eyeOffset: new window.MSIMEarth.ConstantProperty(
          new window.MSIMEarth.Cartesian3(0, 0, -1)
        ),
        pixelOffset: new window.MSIMEarth.Cartesian2(0.0, -1),
        scaleByDistance: new window.MSIMEarth.NearFarScalar(
          1.5e2,
          6.0,
          1.5e7,
          3.5
        ),
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          0,
          350e5
        )
      },
      label: {
        text: '北京市',
        font: '400 18px MicroSoft YaHei',
        fillColor: new window.MSIMEarth.Color(230 / 255, 0 / 255, 0 / 255, 0.7),
        style: window.MSIMEarth.LabelStyle.FILL,
        // style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
        verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
        pixelOffset: new window.MSIMEarth.Cartesian2(-25, -20),
        // showBackground: true,
        backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          0,
          350e5
        ),
        scaleByDistance: new window.MSIMEarth.NearFarScalar(
          30e5,
          1.0,
          80e5,
          0.7
        ),
        outlineColor: window.MSIMEarth.Color.BLACK,
        outlineWidth: 2
      }
    })
    window.EarthViewer.entities.add({
      id: 'china',
      position: window.MSIMEarth.Cartesian3.fromDegrees(
        108.90773811396551,
        30.345157066965147
      ),
      label: {
        text: '中华人民共和国',
        font: '400 28px MicroSoft YaHei',
        fillColor: new window.MSIMEarth.Color(230 / 255, 0 / 255, 0 / 255, 0.7),
        style: window.MSIMEarth.LabelStyle.FILL,
        // style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
        verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
        pixelOffset: new window.MSIMEarth.Cartesian2(-25, -80),
        // showBackground: true,
        backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          20e5,
          350e5
        ),
        scaleByDistance: new window.MSIMEarth.NearFarScalar(
          30e5,
          1.0,
          80e5,
          0.6
        ),
        outlineColor: window.MSIMEarth.Color.BLACK,
        outlineWidth: 2
      }
    })
  }
  /**
   * 主要城市
   */
  addMainCity() {
    window.EarthViewer.dataSources
      .add(
        window.MSIMEarth.GeoJsonDataSource.load(
          './static/data/geojson/mainCity.geojson'
        )
      )
      .then((data) => {
        data.name = 'city1'
        let entitys = data.entities.values
        entitys.forEach((e) => {
          e.billboard = new window.MSIMEarth.BillboardGraphics({
            image: './static/image/billboard/省会2.png',
            show: true,
            width: 2,
            height: 2,
            rotation: 0.0,
            eyeOffset: new window.MSIMEarth.ConstantProperty(
              new window.MSIMEarth.Cartesian3(0, 0, -1)
            ),
            // pixelOffset: new window.MSIMEarth.Cartesian2(0.0, -20),
            scaleByDistance: new window.MSIMEarth.NearFarScalar(
              1.5e2,
              6.0,
              1.5e7,
              3.5
            ),
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(10e5, 70e5)
          })
          e.label = new window.MSIMEarth.LabelGraphics({
            //文字标签
            text: e.properties._市._value,
            font: '16px Lucida Console',
            fillColor: window.MSIMEarth.Color.WHITE,
            style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
            verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
            pixelOffset: new window.MSIMEarth.Cartesian2(-20, -20),
            outlineColor: window.MSIMEarth.Color.BLACK,
            outlineWidth: 2,
            // showBackground: true,
            backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(10e5, 70e5)
          })
        })
        this.handleCluster(data)
      })
    window.EarthViewer.dataSources
      .add(
        window.MSIMEarth.GeoJsonDataSource.load(
          './static/data/geojson/国家点.geojson'
        )
      )
      .then((data) => {
        data.name = 'city2'
        let entitys = data.entities.values
        entitys.forEach((e) => {
          // console.log(e)
          e.billboard = undefined
          // e.billboard = {
          //   image: 'static/image/billboard/城市.png',
          //   show: true,
          //   width: 10,
          //   height: 10,
          //   rotation: 0.0,
          //   eyeOffset: new window.MSIMEarth.ConstantProperty(
          //     new window.MSIMEarth.Cartesian3(0, 0, -1)
          //   ),
          //   // pixelOffset: new window.MSIMEarth.Cartesian2(0.0, -45),
          //   scaleByDistance: new window.MSIMEarth.NearFarScalar(
          //     1.5e2,
          //     6.0,
          //     1.5e7,
          //     3.5
          //   ),
          //   distanceDisplayCondition:
          //     new window.MSIMEarth.DistanceDisplayCondition(0, 300e5)
          // }
          e.label = {
            text: e.name,
            font: '100 18px MicroSoft YaHei',
            fillColor: window.MSIMEarth.Color.WHITE,
            style: window.MSIMEarth.LabelStyle.FILL,
            horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
            verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
            // pixelOffset: new window.MSIMEarth.Cartesian2(-20, -20),
            // showBackground: true,
            backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 100e5)
          }
        })
      })

    // window.EarthViewer.entities.add({
    //   position: window.MSIMEarth.Cartesian3.fromDegrees(
    //     120.26157328273332,
    //     38.57415106853603
    //   ),
    //   label: {
    //     text: '渤海',
    //     font: '20px 黑体',
    //     fillColor: window.MSIMEarth.Color.BLUE,
    //     style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
    //     horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
    //     verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
    //     pixelOffset: new window.MSIMEarth.Cartesian2(-35, -10),
    //     // showBackground: true,
    //     outlineColor: window.MSIMEarth.Color.WHITE,
    //     outlineWidth: 2,
    //     backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
    //     distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
    //       20e5,
    //       100e5
    //     )
    //   }
    // })
    // window.EarthViewer.entities.add({
    //   position: window.MSIMEarth.Cartesian3.fromDegrees(
    //     123.59699699558637,
    //     34.167035046098306
    //   ),
    //   label: {
    //     text: '黄海',
    //     font: '20px 黑体',
    //     fillColor: window.MSIMEarth.Color.BLUE,
    //     style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
    //     horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
    //     verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
    //     pixelOffset: new window.MSIMEarth.Cartesian2(-35, -10),
    //     // showBackground: true,
    //     outlineColor: window.MSIMEarth.Color.WHITE,
    //     outlineWidth: 2,
    //     backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
    //     distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
    //       20e5,
    //       100e5
    //     )
    //   }
    // })
    // window.EarthViewer.entities.add({
    //   position: window.MSIMEarth.Cartesian3.fromDegrees(
    //     122.81499205347458,
    //     27.3254533714982
    //   ),
    //   label: {
    //     text: '东海',
    //     font: '20px 黑体',
    //     fillColor: window.MSIMEarth.Color.BLUE,
    //     style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
    //     horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
    //     verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
    //     // pixelOffset: new window.MSIMEarth.Cartesian2(-85, -10),
    //     // showBackground: true,
    //     outlineColor: window.MSIMEarth.Color.WHITE,
    //     outlineWidth: 2,
    //     backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
    //     distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
    //       20e5,
    //       100e5
    //     )
    //   }
    // })
    // window.EarthViewer.entities.add({
    //   position: window.MSIMEarth.Cartesian3.fromDegrees(
    //     113.98819955558463,
    //     12.282693794963846
    //   ),
    //   label: {
    //     text: '南海',
    //     font: '20px 黑体',
    //     fillColor: window.MSIMEarth.Color.BLUE,
    //     style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
    //     horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
    //     verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
    //     pixelOffset: new window.MSIMEarth.Cartesian2(-35, -10),
    //     // showBackground: true,
    //     outlineColor: window.MSIMEarth.Color.WHITE,
    //     outlineWidth: 2,
    //     backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
    //     distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
    //       20e5,
    //       100e5
    //     )
    //   }
    // })
  }
  // 聚合
  handleCluster(data) {
    // 聚合
    const pixelRange = 20
    const minimumClusterSize = 2
    //clustering 获取或设置此数据源的群集选项。此对象可以在多个数据源之间共享。
    data.clustering.enabled = true //获取或设置是否启用群集。
    data.clustering.pixelRange = pixelRange //pixelRange 是聚合距离，也就是小于这个距离就会被聚合,以像素为单位
    data.clustering.minimumClusterSize = minimumClusterSize //minimumClusterSize是每个聚合点的最小聚合个数，这个值最好是设置为2，因为两个图标也可能叠压。
    let removeListener

    function customStyle() {
      if (window.MSIMEarth.defined(removeListener)) {
        removeListener()
        removeListener = undefined
      } else {
        removeListener = data.clustering.clusterEvent.addEventListener(
          function (clusteredEntities, cluster) {
            cluster.label.show = false
            cluster.billboard.show = true
            cluster.billboard.width = 0
            cluster.billboard.height = 0
          }
        )
      }
      // force a re-cluster with the new styling
      const pixelRange = data.clustering.pixelRange
      data.clustering.pixelRange = 0
      data.clustering.pixelRange = pixelRange
    }
    customStyle()
  }
  /**
   * 国界线-中国
   */
  guojiexian_C() {
    const options1 = {
      url: basicVectorData.guojiexian,
      color: new window.MSIMEarth.Color(164 / 255, 91 / 255, 82 / 255, 1.0),
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      width: 2,
      id: 'guojiexian'
    }
    this.addGeojson(options1)
  }
  /**
   * 国界线-其他国家
   */
  guojiexian_O() {
    const options2 = {
      url: basicVectorData.guojiexian2,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      width: 0.7,
      id: 'guojiexian2'
    }
    this.addGeojson(options2)
    const options3 = {
      url: basicVectorData.shengjiexian,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      width: 1,
      id: 'shengjiexian'
    }
    this.addGeojson(options3)
  }
  /**
   * 添加行政区划
   */
  addTWxzquName() {
    taiwanCity.forEach((item) => {
      let center = window.MSIMEarth.Cartesian3.fromDegrees(
        item.longitude_,
        item.latitude_d,
        1
      )
      window.EarthViewer.entities.add({
        name: 'billboardlabeld',
        id: item.name + '_name',
        position: center,
        label: {
          text: item.name,
          // backgroundColor: new window.MSIMEarth.Color(1.0, 153 / 255, 18 / 255, 1.0),
          // showBackground: false,
          font: 'normal 35px Helvetica',
          scale: 0.56,
          fillColor: window.MSIMEarth.Color.WHITE,
          style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: window.MSIMEarth.Color.BLACK,
          horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
          verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
          pixelOffset: new window.MSIMEarth.Cartesian2(-35, -31),
          eyeOffset: new window.MSIMEarth.ConstantProperty(
            new window.MSIMEarth.Cartesian3(0, 0, -12)
          ),
          distanceDisplayCondition:
            new window.MSIMEarth.DistanceDisplayCondition(0, 100e5)
        }
      })
    })
  }
  /**
   * 添加行政区划
   */
  addTWXZQH() {
    this.addTWxzquName()
    const options = {
      url: basicVectorData.twxzqh,
      color: window.MSIMEarth.Color.RED.withAlpha(0.5),
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      id: 'taiwanxzqh'
    }
    this.addGeojson(options)
  }
  //台湾地理数据测试
  addTWDL() {
    const options = {
      url: 'static/geojson/gis_osm_waterways_free_1.json',
      color: window.MSIMEarth.Color.RED.withAlpha(0.5),
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      id: 'test'
    }
    this.addGeojson(options)
  }
  /**
   * 中印等高点
   */
  addElevation() {
    elevationPoints.forEach((element) => {
      window.EarthViewer.entities.add({
        position: window.MSIMEarth.Cartesian3.fromDegrees(
          element.coordinate[0],
          element.coordinate[1],
          element.coordinate[2]
        ),
        label: {
          text: `${element.value}`,
          distanceDisplayCondition:
            new window.MSIMEarth.DistanceDisplayCondition(
              0,
              // 2e5
              10e5
            ),
          height: 1000,
          heightReference: window.MSIMEarth.HeightReference.CLAMP_TO_GROUND,
          // backgroundColor: new window.MSIMEarth.Color(1.0, 153 / 255, 18 / 255, 1.0),
          // showBackground: false,
          font: 'normal 32px BLACK',
          scale: 0.6,
          fillColor: window.MSIMEarth.Color.YELLOW,
          style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
          // horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
          // verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
          pixelOffset: new window.MSIMEarth.Cartesian2(0, -15),
          eyeOffset: new window.MSIMEarth.ConstantProperty(
            new window.MSIMEarth.Cartesian3(0, 0, -1)
          )
        }
      })
    })
  }
  /**
   * 中印态势初始
   */
  addZYTS() {
    // 219国道
    const options1 = {
      url: basicVectorData.g219,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      width: 4,
      id: 'g219'
    }
    this.addGeojson(options1)
    // 印度河和狮泉河
    const options2 = {
      url: basicVectorData.yinduheshiquanhe,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      width: 4,
      id: 'yindushiquan'
    }
    this.addGeojson(options2)
  }
  /**
   *   清除primitive 'customCloud'
   * @param {*} primitiveName primitive名称
   */
  removePrimitive(primitiveName) {
    let self = this
    self.EarthViewer.scene.primitives._primitives.forEach((primitive) => {
      if (primitive.name && primitive.name == primitiveName) {
        self.EarthViewer.scene.primitives.remove(primitive)
      }
    })
  }
  /**
   * 中印边界班公湖坡度坡向
   * @param {*} type '中印边界坡度' '中印边界坡向'
   */
  add_ZY_Slope_Aspect(type) {
    switch (type) {
      case '中印边界坡度':
        window.EarthViewer.camera.flyTo({
          destination: new window.MSIMEarth.Cartesian3(
            893450.427911107,
            5503791.00276749,
            3361838.329586078
          ),
          orientation: {
            heading: 6.208681757063205, //偏航角
            pitch: -0.601335396103261, //-0.08401170275668313, //水平俯仰角
            roll: 0.00014297250188821664
          },
          complete: () => {}
        })
        let slope = new window.MSIMEarth.UrlTemplateImageryProvider({
          url: googleConfig.slope
        })
        slope.name = '中印边界坡度'
        window.EarthViewer.imageryLayers.addImageryProvider(slope)
        break
      case '中印边界坡向':
        window.EarthViewer.camera.flyTo({
          destination: new window.MSIMEarth.Cartesian3(
            893450.427911107,
            5503791.00276749,
            3361838.329586078
          ),
          orientation: {
            heading: 6.208681757063205, //偏航角
            pitch: -0.601335396103261, //-0.08401170275668313, //水平俯仰角
            roll: 0.00014297250188821664
          },
          complete: () => {}
        })
        let aspect = new window.MSIMEarth.UrlTemplateImageryProvider({
          url: googleConfig.aspect
        })
        aspect.name = '中印边界坡向'
        window.EarthViewer.imageryLayers.addImageryProvider(aspect)
        break
      default:
        break
    }
  }
  /**
   * 班公湖地形
   */
  add_ZY_BGHTerrain() {
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
    let terrainLayer = new window.MSIMEarth.CesiumTerrainProvider({
      url: googleConfig.bangonghuTerrian,
      tilingScheme: new window.MSIMEarth.GeographicTilingScheme()
    })
    window.EarthViewer.scene.terrainProvider = terrainLayer
  }

  /**
   * 中印班公湖附近区域等高线
   */
  add_ZYContourLine() {
    let webmercator1 = new window.MSIMEarth.UrlTemplateImageryProvider({
      url: googleConfig.bangonghuContourLine,
      minimumLevel: 0, //最小层级
      maximumLevel: 18 //最大层级
    })
    webmercator1.name = '中印班公湖等高线1'
    window.EarthViewer.imageryLayers.addImageryProvider(webmercator1)
    let webmercator2 = new window.MSIMEarth.UrlTemplateImageryProvider({
      url: googleConfig.bangonghuContourLine2,
      minimumLevel: 0, //最小层级
      maximumLevel: 18 //最大层级
    })
    webmercator2.name = '中印班公湖等高线2'
    window.EarthViewer.imageryLayers.addImageryProvider(webmercator2)
    // window.cameraListener = function () {
    //   var e = window.EarthViewer.camera.position
    //   // console.log(window.MSIMEarth.Cartographic.fromCartesian(e).height, webmercator2.show);
    //   if (
    //     window.MSIMEarth.Cartographic.fromCartesian(e).height < 50000 &&
    //     window.MSIMEarth.Cartographic.fromCartesian(e).height > 5000
    //   ) {
    //     webmercator1.show = true
    //     webmercator2.show = true
    //   } else {
    //     webmercator1.show = false
    //     webmercator2.show = false
    //   }
    // }
    // window.EarthViewer.camera.changed.addEventListener(window.cameraListener)
  }
  /**
   * 添加arcServer发布的矢量底图
   */
  add_VectorBaseLayer() {
    let worldVectorLayer = new window.MSIMEarth.UrlTemplateImageryProvider({
      url: googleConfig.twArcServer
    })
    worldVectorLayer.name = 'world_vector_layer'
    window.EarthViewer.imageryLayers.addImageryProvider(worldVectorLayer)
  }
  /**
   * 添加arcServer发布的矢量底图
   */
  remove_VectorBaseLayer() {
    for (let i = 0; i < window.EarthViewer.imageryLayers._layers.length; i++) {
      const imageryLayer = window.EarthViewer.imageryLayers._layers[i]
      if (
        imageryLayer.imageryProvider.name &&
        imageryLayer.imageryProvider.name.includes('world_vector_layer')
      ) {
        window.EarthViewer.imageryLayers.remove(imageryLayer)
        i--
      }
    }
  }
  // 等待效果
  loadingPost(time, callback) {
    console.log(time)
    let loadPost = new window.MSIMEarth.PostProcessStage({
      name: 'load',
      fragmentShader: loadGLSL
    })
    window.ppsCollection.add(loadPost)
    setTimeout(() => {
      window.ppsCollection.remove(loadPost)
      callback()
    }, time)
  }
  // 星线效果
  galaxyLinePost(time, callback) {
    let loadPost = new window.MSIMEarth.PostProcessStage({
      name: 'galaxyline',
      fragmentShader: galaxyLineGLSL
    })
    window.ppsCollection.add(loadPost)
    setTimeout(() => {
      window.ppsCollection.remove(loadPost)
      callback()
    }, 10000)
  }
  // 基于后处理效果名称移除该效果
  removePost(name) {
    if (window.ppsCollection) {
      window.ppsCollection._activeStages.forEach((element) => {
        if (element.name === name) {
          window.ppsCollection.remove(element)
        }
      })
    }
  }
  // // 控制loading显示隐藏
  // loadingPost2(type) {
  //   if (window.loadPost2) {
  //     window.ppsCollection.remove(window.loadPost2)
  //     window.loadPost2 = null
  //   }
  //   if (type) {
  //     window.loadPost2 = new window.MSIMEarth.PostProcessStage({
  //       name: 'load',
  //       fragmentShader: loadGLSL
  //     })
  //     window.ppsCollection.add(window.loadPost2)
  //   }
  // }
  // 翻页下拉效果
  // pageDropPost(time, callback) {
  //   let loadPost = new window.MSIMEarth.PostProcessStage({
  //     name: 'pageDrop',
  //     fragmentShader: pageDrop,
  //     uniforms: {
  //       // iMouse: { x: 1.0, y: 1.0 },
  //       iMouse: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
  //       direction: 0
  //     }
  //   })
  //   window.ppsCollection.add(loadPost)
  //   setTimeout(() => {
  //     window.ppsCollection.remove(loadPost)
  //     callback()
  //   }, time)
  // }
  // // 翻页网格效果
  // pageGridPost(time, callback) {
  //   let loadPost = new window.MSIMEarth.PostProcessStage({
  //     name: 'pageGrid',
  //     fragmentShader: pageGrid,
  //     uniforms: {
  //       // iMouse: { x: 1.0, y: 1.0 },
  //       iMouse: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
  //       direction: 0
  //     }
  //   })
  //   window.ppsCollection.add(loadPost)
  //   setTimeout(() => {
  //     window.ppsCollection.remove(loadPost)
  //     callback()
  //   }, time)
  // }
  // // 全局高光效果
  // bloomAllPost(time, callback) {
  //   let loadPost = new window.MSIMEarth.PostProcessStage({
  //     name: 'bloomAll',
  //     fragmentShader: bloomAll,
  //     uniforms: {
  //       // iMouse: { x: 1.0, y: 1.0 },
  //       iMouse: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
  //       direction: 0,
  //       bloomVal: 0.1
  //     }
  //   })
  //   window.ppsCollection.add(loadPost)
  //   setTimeout(() => {
  //     window.ppsCollection.remove(loadPost)
  //     callback()
  //   }, time)
  // }
  // 中印灾害数据展示
  add_ZYZH() {
    const options1 = {
      url: basicVectorData.zyzh_nishiliu,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'point',
      width: 4,
      id: 'debris'
    }
    this.addGeojson(options1)
    const options2 = {
      url: basicVectorData.yzzh_huapo,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'point',
      width: 4,
      id: 'landslide'
    }
    this.addGeojson(options2)
    const options3 = {
      url: basicVectorData.zyzh_dizhen,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'point',
      width: 4,
      id: 'earthquake'
    }
    this.addGeojson(options3)
  }
  // 中印水纹湖泊冰川
  add_ZYRiver() {
    const options1 = {
      url: basicVectorData.zyRiver_link,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'polyline',
      width: 4,
      id: 'zyRiver_link'
    }
    this.addGeojson(options1)
    // const options2 = {
    //   url: basicVectorData.zyWater_area,
    //   color: window.MSIMEarth.Color.YELLOW,
    //   addLabel: false,
    //   dataType: 'vector',
    //   geoType: 'polygon',
    //   width: 4,
    //   id: 'zyWater_area'
    // }
    // this.addGeojson(options2)
    // const options3 = {
    //   url: basicVectorData.zyGlacier,
    //   color: window.MSIMEarth.Color.YELLOW,
    //   addLabel: false,
    //   dataType: 'vector',
    //   geoType: 'polygon',
    //   width: 4,
    //   id: 'zyGlacier'
    // }
    // this.addGeojson(options3)
  }
  // 中印边界整体态势展示地点名
  add_ZYBJ() {
    zy_taishiPoints.forEach((item) => {
      window.EarthViewer.entities.add({
        position: window.MSIMEarth.Cartesian3.fromDegrees(
          item.coordinate[0],
          item.coordinate[1],
          100
        ),
        billboard: {
          image: 'static/image/billboard/省会2.png',
          show: true,
          width: 2,
          height: 2,
          rotation: 0.0,
          eyeOffset: new window.MSIMEarth.ConstantProperty(
            new window.MSIMEarth.Cartesian3(0, 0, -1)
          ),
          pixelOffset: new window.MSIMEarth.Cartesian2(0, -3),
          // pixelOffset: new window.MSIMEarth.Cartesian2(0.0, -20),
          scaleByDistance: new window.MSIMEarth.NearFarScalar(
            1.5e2,
            6.0,
            1.5e7,
            3.5
          ),
          distanceDisplayCondition:
            new window.MSIMEarth.DistanceDisplayCondition(0, 10e5),
          heightReference: window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND
        },
        label: {
          text: item.name,
          font: '18px black',
          fillColor: window.MSIMEarth.Color.WHITE,
          style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
          horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
          verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
          pixelOffset: new window.MSIMEarth.Cartesian2(0, -40),
          outlineColor: window.MSIMEarth.Color.BLACK,
          outlineWidth: 2,
          // showBackground: true,
          backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
          heightReference: window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND,
          distanceDisplayCondition:
            new window.MSIMEarth.DistanceDisplayCondition(0, 10e5)
        }
      })
    })
  }
  /**
   * 中印气象点位标注
   */
  add_ZYQixiangPositions() {
    // 印度河和狮泉河
    const options = {
      url: basicVectorData.ZY_qixiang_position,
      color: window.MSIMEarth.Color.YELLOW,
      addLabel: false,
      dataType: 'vector',
      geoType: 'point',
      width: 4,
      id: 'zy_QixiangPositions'
    }
    this.addGeojson(options)
  }
  /*****************************7月新数据 ******************************/
  /**
   * 添加等温线
   */
  add_dengwenxian() {
    var promise = window.MSIMEarth.GeoJsonDataSource.load(
      basicVectorData.dengwenxian
    )
    // console.log(options)
    // if (!options.geoType) return
    promise.then(function (dataSource) {
      // dataSource.name = options.id
      window.EarthViewer.dataSources.add(dataSource)
    })
  }
  /**
   * 降水
   */
  add_jiangshui() {
    var promise = window.MSIMEarth.GeoJsonDataSource.load(
      basicVectorData.jiangshui
    )
    // console.log(options)
    // if (!options.geoType) return
    promise.then(function (dataSource) {
      // dataSource.name = options.id
      console.log('dataSource :>> ', dataSource)
      window.EarthViewer.dataSources.add(dataSource)
    })
  }
  /**
   * 电厂
   */
  add_dianchang() {
    var promise = window.MSIMEarth.GeoJsonDataSource.load(
      basicVectorData.dianchang
    )
    // console.log(options)
    // if (!options.geoType) return
    promise.then(function (dataSource) {
      // dataSource.name = options.id
      console.log('dataSource :>> ', dataSource)
      dataSource.entities.values.forEach((ds) => {
        console.log(ds)
      })
      window.EarthViewer.dataSources.add(dataSource)
    })
  }
  add_taiwan_dem_vector() {
    let webmercator1 = new window.MSIMEarth.UrlTemplateImageryProvider({
      url: googleConfig.taiWanDem
      // minimumLevel: 0, //最小层级
      // maximumLevel: 18 //最大层级
    })
    webmercator1.name = '台湾地形'
    window.EarthViewer.imageryLayers.addImageryProvider(webmercator1)
  }
  add_taiwan_terrain_vector() {
    let webmercato1 = new window.MSIMEarth.UrlTemplateImageryProvider({
      url: googleConfig.taiWanTerrain
      // minimumLevel: 0, //最小层级
      // maximumLevel: 18 //最大层级
    })
    webmercato1.name = '台湾地势'
    window.EarthViewer.imageryLayers.addImageryProvider(webmercato1)
  }
  add_taiwan_soil_vector() {
    let webmercato1 = new window.MSIMEarth.UrlTemplateImageryProvider({
      url: googleConfig.taiWanSoil
      // minimumLevel: 0, //最小层级
      // maximumLevel: 18 //最大层级
    })
    webmercato1.name = '台湾土壤'
    window.EarthViewer.imageryLayers.addImageryProvider(webmercato1)
  }
  /**
   * 添加台湾一二级标注
   */
  add_twlabel() {
    let height = 500
    if (window.EarthViewer.scene.globe.depthTestAgainstTerrain) {
      height = 5000
    }
    taiwan12biaozhu.forEach((e) => {
      window.EarthViewer.entities.add({
        position: window.MSIMEarth.Cartesian3.fromDegrees(
          e.coordinate[0],
          e.coordinate[1],
          height
        ),
        label: {
          text: e.name,
          font: e.font,
          fillColor: window.MSIMEarth.Color.BLACK,
          style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
          horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
          verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
          // pixelOffset: new window.MSIMEarth.Cartesian2(-35, -10),
          // showBackground: true,
          outlineColor: window.MSIMEarth.Color.WHITE,
          outlineWidth: e.outlineWidth,
          backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
          distanceDisplayCondition:
            new window.MSIMEarth.DistanceDisplayCondition(
              e.displayByDistance[0],
              e.displayByDistance[1]
            ),
          eyeOffset: new window.MSIMEarth.ConstantProperty(
            new window.MSIMEarth.Cartesian3(0, 0, -1)
          )
          // disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      })
      // if (e.lv === 2) {
      //   taiwanLabel.distanceDisplayCondition =
      //     new window.MSIMEarth.DistanceDisplayCondition(3e3, 25e5)
      // }
    })
  }
  /**
   * 夜间灯光
   */
  add_YJDG() {
    // var bloom = window.EarthViewer.scene.postProcessStages.bloom
    // bloom.enabled = Boolean(viewModel.show)
    // bloom.uniforms.glowOnly = Boolean(viewModel.glowOnly)
    // bloom.uniforms.contrast = Number(viewModel.contrast)
    // bloom.uniforms.brightness = Number(viewModel.brightness)
    // bloom.uniforms.delta = Number(viewModel.delta)
    // bloom.uniforms.sigma = Number(viewModel.sigma)
    // bloom.uniforms.stepSize = Number(viewModel.stepSize)
    let color
    basicVectorData.yejiandengguang.forEach((dg) => {
      var promise = window.MSIMEarth.GeoJsonDataSource.load(dg.dgUrl)
      promise.then(function (dataSource) {
        dataSource.name = dg.name
        var entities = dataSource.entities.values
        for (let index = 0; index < entities.length; index++) {
          let en = entities[index]

          switch (en.properties.ContourMin._value) {
            case 10:
              color = new window.MSIMEarth.Color(0.9, 0.9, 0.9, 0.7)
              break
            case 30:
              color = new window.MSIMEarth.Color(0.92, 0.92, 0.92, 0.75)
              break
            case 40:
              color = new window.MSIMEarth.Color(0.94, 0.94, 0.94, 0.84)
              break
            case 50:
              color = new window.MSIMEarth.Color(0.96, 0.96, 0.96, 0.88)
              break
            case 60:
              color = new window.MSIMEarth.Color(0.98, 0.98, 0.98, 0.92)
              break
            default:
              color = new window.MSIMEarth.Color(0.99, 0.99, 0.99, 0.98)
              break
          }
          en.polygon.material = color
          en.polygon.outline = false
        }
        window.EarthViewer.dataSources.add(dataSource)
      })
    })
    basicVectorData.yejiandengguangLine.forEach((dg) => {
      var promise = window.MSIMEarth.GeoJsonDataSource.load(dg.dgUrl)
      promise.then(function (dataSource) {
        dataSource.name = dg.name
        var entities = dataSource.entities.values
        for (let index = 0; index < entities.length; index++) {
          let en = entities[index]

          switch (en.properties.ContourMin._value) {
            case 10:
              color = new window.MSIMEarth.Color(0.9, 0.9, 0.9, 0.7)
              break
            case 30:
              color = new window.MSIMEarth.Color(0.92, 0.92, 0.92, 0.75)
              break
            case 40:
              color = new window.MSIMEarth.Color(0.94, 0.94, 0.94, 0.84)
              break
            case 50:
              color = new window.MSIMEarth.Color(0.96, 0.96, 0.96, 0.88)
              break
            case 60:
              color = new window.MSIMEarth.Color(0.98, 0.98, 0.98, 0.92)
              break
            default:
              color = new window.MSIMEarth.Color(0.99, 0.99, 0.99, 0.98)
              break
          }
          // en.polyline.material = color
          en.polyline.material = new window.MSIMEarth.FlowLineMaterialProperty({
            transparent: true,
            mixColor: new window.MSIMEarth.Color(1.0, 1.0, 1.0, 1.0),
            // mixColor: color,
            mixRatio: 0.9,
            flowSpeed: 2.0,
            repeat: new window.MSIMEarth.Cartesian2(4, 4),
            image: require('@/assets/image/knowleadge/materialline.png')
          })
          en.polyline.width = 5
        }
        window.EarthViewer.dataSources.add(dataSource)
      })
    })
  }
  /**
   * 地图颜色控制
   */
  change_BaseLayerColor() {
    // 此处改成requestAnimationFrame动态变暗  展示完成后再恢复并移除cancelAnimationFrame
    let baseLayerConfig // = window.EarthViewer.imageryLayers.get(1)
    window.EarthViewer.imageryLayers._layers.forEach((e) => {
      if (e.imageryProvider.name === '影像底图服务') {
        baseLayerConfig = e
      }
    })
    baseLayerConfig.brightness = 0.42
    baseLayerConfig.contrast = 1.52
    baseLayerConfig.hue = 0.16
    baseLayerConfig.saturation = 1.58
    baseLayerConfig.gamma = 1.04
    // 获取图层
    // let targetLayer
    // window.EarthViewer.imageryLayers._layers.forEach((layer) => {
    //   if (layer.imageryProvider.name === '影像底图服务') {
    //     targetLayer = layer
    //   }
    // })

    // if (targetLayer) window.EarthViewer.imageryLayers.remove(targetLayer)

    // let imageryProvider = new window.MSIMEarth.UrlTemplateImageryProvider({
    //   url: googleConfig.url4,
    //   // tilingScheme: new window.MSIMEarth.WebMercatorTilingScheme() //url5
    //   tilingScheme: new window.MSIMEarth.GeographicTilingScheme() //url4
    // })
    // let layer =
    //   window.EarthViewer.imageryLayers.addImageryProvider(imageryProvider)

    // // 参数配置
    // const baseLayerController = new BaseLayerControl({
    //   bkColor: 'black',
    //   alpha: 0.5,
    //   invert: true
    // })
    // //rewrite requestImage method
    // const requestImage = layer.imageryProvider.requestImage
    // imageryProvider.requestImage = function (x, y, level, request) {
    //   var promise = requestImage.bind(imageryProvider)(x, y, level, request)
    //   if (promise) {
    //     promise = promise.then((image) => {
    //       var imageProcessed = baseLayerController.process(image)
    //       return imageProcessed || image
    //     })
    //   }
    //   return promise
    // }
  }
  /**
   * 按照给定的10条数据依次清除
   */
  clear_YJDG() {
    // 1 按照0-9顺序清除灯光数据
    let index = 0
    let st = setInterval(() => {
      let polygonName = basicVectorData.yejiandengguang[index].name
      let PolylineName = basicVectorData.yejiandengguangLine[index].name
      window.EarthViewer.dataSources._dataSources.forEach((e) => {
        if (e.name == polygonName) {
          window.EarthViewer.dataSources.remove(e)
        }
      })
      window.EarthViewer.dataSources._dataSources.forEach((e) => {
        if (e.name == PolylineName) {
          window.EarthViewer.dataSources.remove(e)
        }
      })
      index++
      if (index === 10) {
        clearInterval(st)
        setTimeout(() => {
          // 最好自然过度
          let baseLayerConfig // = window.EarthViewer.imageryLayers.get(1)
          window.EarthViewer.imageryLayers._layers.forEach((e) => {
            if (e.imageryProvider.name === '影像底图服务') {
              baseLayerConfig = e
            }
          })
          baseLayerConfig.brightness = 0.9
          baseLayerConfig.contrast = 1.0
          baseLayerConfig.hue = 0
          baseLayerConfig.saturation = 1.6
          baseLayerConfig.gamma = 0.6
        }, 1000)
      }
    }, 500)
    // requestAnimationFrame(clear_YJDG)
    //2 清除完毕后恢复底图配色，去除环境光
  }
  clearLayerGeo(id) {
    window.EarthViewer.dataSources._dataSources.forEach((dataSource) => {
      if (dataSource._name == id) {
        // 移除czml路径
        window.EarthViewer.dataSources.remove(dataSource)
      }
    })
  }
  // 重要目标
  addImportanceTarget() {
    importantPosition.map((item) => {
      window.EarthViewer.entities.add({
        id: item.name,
        position: window.MSIMEarth.Cartesian3.fromDegrees(
          item.position[0],
          item.position[1],
          100
        ),
        billboard: {
          image: item.billboard,
          // distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(4e3, 6e6),
          scale: 0.8
        },
        label: {
          text: item.name,
          font: 'bolder 9pt Lucida Console',
          horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
          pixelOffset: new window.MSIMEarth.Cartesian2(25, -2),
          style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
          fillColor: window.MSIMEarth.Color.fromCssColorString('#1E90FF'),
          outlineColor: window.MSIMEarth.Color.BLACK,
          outlineWidth: 5
          // distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(4e3, 1e6)
        }
      })
    })
  }
  clearImPort() {
    importantPosition.map((item) => {
      window.EarthViewer.entities.removeById(item.name)
    })
  }
  baseGif(e) {
    const viewer = window.EarthViewer
    let options = e
    let url = ''

    switch (options.type) {
      case 0:
        url = require('/public/static/image/gif/中雨.gif')
        break
      case 1:
        url = require('/public/static/image/gif/大雨.gif')
        break
      case 2:
        url = require('/public/static/image/gif/多云.gif')
        break
      case 3:
        url = require('/public/static/image/gif/晴.gif')
        break
      default:
        break
    }
    let gifDiv = document.createElement('div')
    let gifImg = document.createElement('img')
    // gif库需要img标签配置下面两个属性
    gifImg.setAttribute('rel:animated_src', url)
    gifImg.setAttribute('rel:auto_play', '1') // 设置自动播放属性 118.34573072478551 32.25604843382856
    gifDiv.appendChild(gifImg)

    let superGif = new SuperGif({
      gif: gifImg
    })
    viewer.entities.removeById(e.name + 'gifff')
    superGif.load(function () {
      viewer.entities.add({
        id: e.name + 'gifff',
        position: window.MSIMEarth.Cartesian3.fromDegrees(
          e.position[0],
          e.position[1],
          3000
        ),
        billboard: {
          image: new window.MSIMEarth.CallbackProperty(() => {
            // 转成base64,直接加canvas理论上是可以的，这里设置有问题
            return superGif.get_canvas().toDataURL()
          }, false),
          scale: 0.5,
          // pixelOffset: new window.PieEarthX.Cartesian2(-73, -38),
          pixelOffset: new window.MSIMEarth.Cartesian2(20, 0),
          eyeOffset: new window.MSIMEarth.Cartesian3(0, 0, -2)
        }
      })
    })
  }
  //机场
  addDLAirport = () => {
    // 图片材质
    // let imgMaterial = new window.MSIMEarth.ImageMaterialProperty({
    //   image: './static/billboard/1.png'
    //   // repeat: new window.MSIMEarth.Cartesian2(4, 4),
    //   // color: window.MSIMEarth.Color.BLUE,
    // })
    window.EarthViewer.dataSources
      .add(
        window.MSIMEarth.GeoJsonDataSource.load(
          './static/data/geojson/军民机场.json',
          {
            stroke: window.MSIMEarth.Color.WHITE,
            fill: window.MSIMEarth.Color.BLUE.withAlpha(0.3), //注意：颜色必须大写，即不能为blue
            strokeWidth: 5
          }
        )
      )
      .then((data) => {
        data.name = 'DALUJICHANG'
        const viewer = window.EarthViewer

        window.EarthViewer.scene.globe.depthTestAgainstTerrain = false
        // data.name = '机场'
        let array = data._entityCollection._entities._array
        for (const key in array) {
          const airplane11 = ['七美机场', '台南机场']
          const fitFly = ['台东丰年机场']
          array[key].billboard = undefined
          // // 机场信息标识判断
          // let colorc = airplane11.includes(
          //   array[key].properties.chineseName._value
          // )
          //   ? new window.MSIMEarth.Color(231 / 255, 64 / 255, 50 / 255, 1.0)
          //   : new window.MSIMEarth.Color(42 / 255, 156 / 255, 73 / 255, 1.0)
          // 机场适飞情况判断
          // let isfit = fitFly.includes(array[key].properties.chineseName._value)
          //   ? 'static/image/billboard/flyred.png'
          //   : 'static/image/billboard/flyblue.png'
          // 机场朝向
          // let direction = array[key].properties.rotation
          //   ? array[key].properties.rotation._value
          //   : 0
          let direction = Math.random() * 360 - 180

          // array[key]._billboard = undefined
          // array[key].label = new window.MSIMEarth.LabelGraphics({
          //   text: array[key].properties.chineseName,
          //   fillColor: window.MSIMEarth.Color.AQUA,
          //   // fillColor: new window.MSIMEarth.Color(0.0, 1.0, 1.0, 1.0), //250, 251, 0
          //   // outlineColor:
          //   showBackground: false,
          //   scale: 0.4,
          //   pixelOffset: new window.MSIMEarth.Cartesian2(0, -35),
          //   distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          //     0,
          //     // 2e5
          //     18e5
          //   )
          //   // scaleByDistance: new window.MSIMEarth.NearFarScalar(0, 2.2, 2e5, 1.2)
          // })

          array[key].billboard = {
            // image: 'static/image/billboard/空军基地.png',
            image: './static/image/billboard/flyblue.png',
            // rotation: window.MSIMEarth.Math.toRadians(direction),
            // scaleByDistance: new window.MSIMEarth.NearFarScalar(1.0e3, 10.0, 2.0e3, 1.0),
            scale: 2,
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 30e5),
            scaleByDistance: new window.MSIMEarth.NearFarScalar(
              0,
              0.2,
              6e5,
              0.15
            )
          }
          array[key].label = {
            text: array[key].properties.name._value,
            font: '18px black',
            fillColor: window.MSIMEarth.Color.WHITE,
            style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
            verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
            pixelOffset: new window.MSIMEarth.Cartesian2(-40, -40),
            outlineColor: window.MSIMEarth.Color.BLACK,
            outlineWidth: 2,
            // showBackground: true,
            backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
            heightReference:
              window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND,
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 10e5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
          // let cartesian3 = array[key].position._value
          // createBillboardLabel_DC({
          //   cartesian3: cartesian3,
          //   text: array[key].properties.name._value,
          //   offset: new window.MSIMEarth.Cartesian2(0, -35),
          //   distanceDisplay: new window.MSIMEarth.DistanceDisplayCondition(
          //     0,
          //     18e5
          //   ),
          //   img: './static/billboard/border_bg01.png'
          // })

          // array[key]._id = array[key].properties.chineseName._value
          // array[key].ellipse = {
          //   semiMinorAxis: 10000,
          //   semiMajorAxis: 10000,
          //   material: new window.MSIMEarth.PulseMaterialProperty({
          //     color: new window.MSIMEarth.Color(231 / 255, 64 / 255, 50 / 255, 1.0), // 227, 62, 49
          //     // mixColor: new window.MSIMEarth.Color(227 / 255, 62 / 255, 49 / 255, 1.0),
          //     repeat: new window.MSIMEarth.Cartesian2(1.0, 1.0),
          //     // half: false,
          //     flowSpeed: 45
          //   })
          // }
        }
      })
  }
  //添加其他机场
  addTWAirport = () => {
    window.EarthViewer.dataSources
      .add(
        window.MSIMEarth.GeoJsonDataSource.load(
          './static/data/geojson/机场.json',
          {
            stroke: window.MSIMEarth.Color.WHITE,
            fill: window.MSIMEarth.Color.BLUE.withAlpha(0.3), //注意：颜色必须大写，即不能为blue
            strokeWidth: 5
          }
        )
      )
      .then((data) => {
        data.name = 'TAIWANJICHANG'
        const viewer = window.EarthViewer

        window.EarthViewer.scene.globe.depthTestAgainstTerrain = false
        // data.name = '机场'
        let array = data._entityCollection._entities._array
        for (const key in array) {
          const airplane11 = ['七美机场', '台南机场']
          const fitFly = ['台东丰年机场']
          array[key].billboard = undefined
          // // 机场信息标识判断
          // let colorc = airplane11.includes(
          //   array[key].properties.chineseName._value
          // )
          //   ? new window.MSIMEarth.Color(231 / 255, 64 / 255, 50 / 255, 1.0)
          //   : new window.MSIMEarth.Color(42 / 255, 156 / 255, 73 / 255, 1.0)
          // 机场适飞情况判断
          // let isfit = fitFly.includes(array[key].properties.chineseName._value)
          //   ? 'static/image/billboard/flyred.png'
          //   : 'static/image/billboard/flyblue.png'
          // 机场朝向
          // let direction = array[key].properties.rotation
          //   ? array[key].properties.rotation._value
          //   : 0
          let direction = Math.random() * 360 - 180

          // array[key]._billboard = undefined
          // array[key].label = new window.MSIMEarth.LabelGraphics({
          //   text: array[key].properties.chineseName,
          //   fillColor: window.MSIMEarth.Color.AQUA,
          //   // fillColor: new window.MSIMEarth.Color(0.0, 1.0, 1.0, 1.0), //250, 251, 0
          //   // outlineColor:
          //   showBackground: false,
          //   scale: 0.4,
          //   pixelOffset: new window.MSIMEarth.Cartesian2(0, -35),
          //   distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          //     0,
          //     // 2e5
          //     18e5
          //   )
          //   // scaleByDistance: new window.MSIMEarth.NearFarScalar(0, 2.2, 2e5, 1.2)
          // })

          array[key].billboard = {
            // image: 'static/image/billboard/空军基地.png',
            image: './static/image/billboard/flyblue.png',
            // rotation: window.MSIMEarth.Math.toRadians(direction),
            // scaleByDistance: new window.MSIMEarth.NearFarScalar(1.0e3, 10.0, 2.0e3, 1.0),
            scale: 2,
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 30e5),
            scaleByDistance: new window.MSIMEarth.NearFarScalar(
              0,
              0.2,
              6e5,
              0.15
            )
          }
          array[key].label = {
            text: array[key].properties.entity_name._value,
            font: '18px black',
            fillColor: window.MSIMEarth.Color.WHITE,
            style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
            verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
            pixelOffset: new window.MSIMEarth.Cartesian2(-40, -40),
            outlineColor: window.MSIMEarth.Color.BLACK,
            outlineWidth: 2,
            // showBackground: true,
            backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
            heightReference:
              window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND,
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 10e5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
          // let cartesian3 = array[key].position._value
          // createBillboardLabel_DC({
          //   cartesian3: cartesian3,
          //   text: array[key].properties.name._value,
          //   offset: new window.MSIMEarth.Cartesian2(0, -35),
          //   distanceDisplay: new window.MSIMEarth.DistanceDisplayCondition(
          //     0,
          //     18e5
          //   ),
          //   img: './static/billboard/border_bg01.png'
          // })

          // array[key]._id = array[key].properties.chineseName._value
          // array[key].ellipse = {
          //   semiMinorAxis: 10000,
          //   semiMajorAxis: 10000,
          //   material: new window.MSIMEarth.PulseMaterialProperty({
          //     color: new window.MSIMEarth.Color(231 / 255, 64 / 255, 50 / 255, 1.0), // 227, 62, 49
          //     // mixColor: new window.MSIMEarth.Color(227 / 255, 62 / 255, 49 / 255, 1.0),
          //     repeat: new window.MSIMEarth.Cartesian2(1.0, 1.0),
          //     // half: false,
          //     flowSpeed: 45
          //   })
          // }
        }
      })
  }
  //清除entity
  removeEntity(option) {
    let entity = window.EarthViewer.entities.getById(option.entityId)
    if (entity) {
      window.EarthViewer.entities.remove(entity)
    }
  }
  //港口添加
  addPort() {
    window.EarthViewer.dataSources
      .add(
        window.MSIMEarth.GeoJsonDataSource.load(
          './static/data/geojson/港口.json',
          {
            stroke: window.MSIMEarth.Color.WHITE,
            fill: window.MSIMEarth.Color.BLUE.withAlpha(0.3), //注意：颜色必须大写，即不能为blue
            strokeWidth: 5
          }
        )
      )
      .then((data) => {
        data.name = 'TAIWANGANGKOU'
        const viewer = window.EarthViewer

        window.EarthViewer.scene.globe.depthTestAgainstTerrain = false
        // data.name = '机场'
        let array = data._entityCollection._entities._array
        for (const key in array) {
          array[key].billboard = undefined
          let direction = Math.random() * 360 - 180
          array[key].billboard = {
            // image: 'static/image/billboard/空军基地.png',
            image: './static/billboard/台湾图标/港口.png',
            // rotation: window.MSIMEarth.Math.toRadians(direction),
            // scaleByDistance: new window.MSIMEarth.NearFarScalar(1.0e3, 10.0, 2.0e3, 1.0),
            scale: 2,
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 30e5),
            scaleByDistance: new window.MSIMEarth.NearFarScalar(
              0,
              0.2,
              6e5,
              0.15
            )
          }
          array[key].label = {
            text: array[key].properties.entity_name._value,
            font: '18px black',
            fillColor: window.MSIMEarth.Color.WHITE,
            style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
            verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
            pixelOffset: new window.MSIMEarth.Cartesian2(-40, -40),
            outlineColor: window.MSIMEarth.Color.BLACK,
            outlineWidth: 2,
            // showBackground: true,
            backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
            heightReference:
              window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND,
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 10e5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        }
      })
    window.EarthViewer.dataSources
      .add(
        window.MSIMEarth.GeoJsonDataSource.load(
          './static/data/geojson/港口.json',
          {
            stroke: window.MSIMEarth.Color.WHITE,
            fill: window.MSIMEarth.Color.BLUE.withAlpha(0.3), //注意：颜色必须大写，即不能为blue
            strokeWidth: 5
          }
        )
      )
      .then((data) => {
        data.name = 'TAIWANGANGKOU'
        const viewer = window.EarthViewer

        window.EarthViewer.scene.globe.depthTestAgainstTerrain = false
        // data.name = '机场'
        let array = data._entityCollection._entities._array
        for (const key in array) {
          array[key].billboard = undefined
          let direction = Math.random() * 360 - 180
          array[key].billboard = {
            // image: 'static/image/billboard/空军基地.png',
            image: './static/billboard/台湾图标/港口.png',
            // rotation: window.MSIMEarth.Math.toRadians(direction),
            // scaleByDistance: new window.MSIMEarth.NearFarScalar(1.0e3, 10.0, 2.0e3, 1.0),
            scale: 5,
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 30e5),
            scaleByDistance: new window.MSIMEarth.NearFarScalar(
              0,
              0.2,
              6e5,
              0.15
            )
          }
          array[key].label = {
            text: array[key].properties.entity_name._value,
            font: '18px black',
            fillColor: window.MSIMEarth.Color.WHITE,
            style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT,
            verticalOrigin: window.MSIMEarth.VerticalOrigin.CENTER,
            pixelOffset: new window.MSIMEarth.Cartesian2(-40, -40),
            outlineColor: window.MSIMEarth.Color.BLACK,
            outlineWidth: 2,
            // showBackground: true,
            backgroundColor: new window.MSIMEarth.Color.fromBytes(235, 155, 33),
            heightReference:
              window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND,
            distanceDisplayCondition:
              new window.MSIMEarth.DistanceDisplayCondition(0, 10e5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        }
      })
  }
  //九段线
  addNineLine() {
    var promise = window.MSIMEarth.GeoJsonDataSource.load(
      './static/data/geojson/nineLine.geojson'
    )
    promise.then(function (dataSource) {
      window.EarthViewer.dataSources.add(dataSource)
      dataSource.name = 'nineLine'
      var entities = dataSource.entities.values
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        entity.polyline.material = new window.MSIMEarth.Color(
          186 / 255,
          105 / 255,
          102 / 255,
          0.7
        )
        entity.polyline.width = 3
      }
    })
  }
  // 添加西南太平洋蓝方基地
  importantPoint() {
    importantPosition.forEach((p) => {
      window.EarthViewer.entities.add({
        position: window.PieEarthX.Cartesian3.fromDegrees(
          p.position[0],
          p.position[1],
          100
        ),
        billboard: {
          image: 'static/image/billboard/camera-normal.png',
          show: true,
          width: 5,
          height: 5,
          rotation: 0.0,
          eyeOffset: new window.PieEarthX.ConstantProperty(
            new window.PieEarthX.Cartesian3(0, 0, -1)
          ),
          pixelOffset: new window.PieEarthX.Cartesian2(0.0, -45),
          scaleByDistance: new window.PieEarthX.NearFarScalar(
            1.5e2,
            6.0,
            1.5e7,
            3.5
          ),
          distanceDisplayCondition:
            new window.PieEarthX.DistanceDisplayCondition(0, 100e5)
          // disableDepthTestDistance: new window.PieEarthX.CallbackProperty(() => {
          //   let curHeight2 = window.EarthViewer.camera.positionCartographic.height;
          //   if (curHeight2 > 600) {
          //     return 0;
          //   } else {
          //     return Number.POSITIVE_INFINITY;
          //   }
          // }, false), //防止深度测试导致的遮挡 默认为0会遮挡 Number.POSITIVE_INFINITY
        }
      })
    })
  }
}
export default DataControl
