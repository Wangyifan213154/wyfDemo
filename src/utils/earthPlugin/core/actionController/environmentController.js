import store from '@/store'
import * as turf from '@turf/turf'
import { divLabel } from '@/components/earthComponents/dataBubbleWindow/dataBubble.js'
export default class EnvironmentController {
  constructor(options) {
    this.Earth = options.earth
    this.viewer = options.viewer
    this.cloudArray = []
  }
  particleCloudByOption(option) {
    let cloudCol = new this.Earth.CloudCollection({
      noiseDetail: 16.0,
      noiseOffset: this.Earth.Cartesian3.ZERO
    })
    cloudCol.name = 'customCloud'
    const clouds = this.viewer.scene.primitives.add(cloudCol)
    this.cloudArray.push({
      id: option.id,
      cloud: clouds
    })
    let offset = [
      [0, 0, 0],
      [0, -0.4, 1000],
      [0, 0.4, 1000],
      [0.4, 0, 1000],
      [-0.4, 0, 1000],
      [0.3, -0.3, 1000],
      [-0.3, 0.3, 1000],
      [0.3, 0.3, 1000],
      [-0.3, -0.3, 1000],
    ]
    for (let index = 0; index < offset.length; index++) {
      const element = offset[index]
      clouds.add({
        position: this.Earth.Cartesian3.fromDegrees(
          option.position[0] + element[0],
          option.position[1] + element[1],
          11000 + element[2]
        ),
        scale: new this.Earth.Cartesian2(500000 / 2, 250000 / 2),
        maximumSize: new this.Earth.Cartesian3(20.0, 12.0, 8.0),
        color: this.Earth.Color.White,
        slice: 0.32,
        brightness: 1
      })
    }
  }
  removeCloud(id) {
    let index = this.cloudArray.findIndex(item => item.id == id)
    if (index > -1) {
      window.EarthViewer.scene.primitives.remove(this.cloudArray[index].cloud)
      this.cloudArray.splice(index, 1)
    }
  }
  accidentalPowerStationDMX = function (val) {
    const that = this
    
    store.state.home.powerStationName = val.title
    let options = val || []
    let ccolor = options.color || [228, 63, 50]
    let tt = options.title || '大甲溪电厂马鞍分厂'
    let pos = options.position || [120.80614326267549, 24.22321058432321]
    let ccontent = options.content || '2022年3月3日电站停电'
    let strLength = ccontent.length
    let entity = val.entity
    const divval = {
      Cesium: window.XEarth,
      viewer: window.EarthViewer,
      position: pos,
      height: 6000,
      distanceDisplayCondition: [0, 500000],
      title: tt,
      id: tt,
      content: ccontent,
      offsetX: -120,
      offsetY: 245 + strLength,
      div: 'powerStation',
      color: ccolor
    }
    divLabel(divval)
    let option = {
      longitude: pos[0],
      latitude: pos[1],
      bId: 'Rectangular111',
      name: 'Rectangular111',
      color: ccolor,
      minHeight: 1000
    }
    that.drawRectangular(option)
  
    if (entity) {
      let aa = window.EarthViewer.entities.getById('Rectangular111')
      window.EarthViewer.flyTo(aa, {
        offset: new window.XEarth.HeadingPitchRange(
          0.09968812017971729,
          -0.532050685326225,
          70000
        )
      })
      setTimeout(() => {
        if (val.callback) {
          val.callback()
        }
      }, 3100)
    } else {
      // 匹配视角
      let cameraV = stationCamera[tt]
      let desti = null
      let orien = null
      if (cameraV) {
        desti = new window.XEarth.Cartesian3(...cameraV[0])
        orien = cameraV[1]
        console.log(cameraV, desti, orien)
      } else {
        that.clearStation()
        return
      }
      window.EarthViewer.camera.flyTo({
        destination: desti,
        orientation: orien,
        duration: 5,
        complete: () => {
          if (val.callback) {
            val.callback()
          } else {
          }
        }
      })
    }
  
    that.createWall({
      color: ccolor,
      position: pos
    })
  }
  twPowerGrid(val) {
    let that = this
    // 环境光
    // setGlow(viewModel)
    // 底图色调深色
    // setDarkLayer('tempLayer')
    setTimeout(() => {
      that.loadPowerData1()
      // TwMainCityLabel()
      // window.EarthViewer.scene.globe.depthTestAgainstTerrain = true
      setTimeout(() => {
        window.EarthViewer.camera.flyTo({
          // 118.34573072478551 32.25604843382856 131.6186629187405
          destination: new window.XEarth.Cartesian3(
            -3340812.5573974596,
            5644737.207718739,
            2569063.1694112318
          ),
          duration: 3,
          orientation: {
            heading: 6.263974901185826, //偏航角
            pitch: -1.2262844925452123, //-0.08401170275668313, //水平俯仰角
            roll: 0.0014052908057502478
          },
          complete: () => {
            setTimeout(() => {
            }, 500)
          }
        })
      }, 1000)
    }, 500)
  }
  loadPowerData1(val) {
    const that = this
    this.loadPowerData().then((dataSource) => {
      window.EarthViewer.dataSources._dataSources.forEach((e) => {
        if (e.name == '台湾电厂点线') {
          window.EarthViewer.dataSources.remove(e)
        }
      })
      // window.EarthViewer.dataSources.add(dataSource)
      const entities = dataSource.entities.values
      dataSource.name = '台湾电厂点线'
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        if (entity.billboard) {
          entity.billboard = null
          let colorp = null
          let img = null
  
          // console.log(entity);
          if (entity.properties.type._value.includes('变电所')) {
            colorp = new window.XEarth.Color(249 / 255, 193 / 255, 31 / 255)
            if (entity.properties.type._value.includes('超高压变电所')) {
              // colorp = new window.XEarth.Color(17 / 255, 76 / 255, 42 / 255)
              img = 'static/image/billboard/台湾图标/电网/超高压力.png'
            } else {
              // colorp = new window.XEarth.Color(138 / 255, 188 / 255, 37 / 255)
              img = 'static/image/billboard/台湾图标/一次变电所.png'
            }
            entity.billboard = {
              image: img,
              scale: 0.6,
              distanceDisplayCondition:
                new window.XEarth.DistanceDisplayCondition(100, 8e5),
              scaleByDistance: new window.XEarth.NearFarScalar(
                1000,
                0.5,
                5e5,
                0.6
              ),
              eyeOffset: new window.XEarth.ConstantProperty(
                new window.XEarth.Cartesian3(0, 0, -11)
              )
            }
          } else {
            let scale = 0.8
            if (entity.properties.type._value.includes('火力')) {
              // colorp = new window.XEarth.Color(225 / 255, 0, 262 / 255, 1.0)
              entity.billboard = {
                image: 'static/image/billboard/台湾图标/电网/火力.png',
                scale: scale,
                distanceDisplayCondition:
                  new window.XEarth.DistanceDisplayCondition(100, 8e5),
                scaleByDistance: new window.XEarth.NearFarScalar(
                  1000,
                  0.5,
                  5e5,
                  0.6
                ),
                eyeOffset: new window.XEarth.ConstantProperty(
                  new window.XEarth.Cartesian3(0, 0, -11)
                )
              }
            } else if (entity.properties.type._value.includes('水力')) {
              if (entity.properties.Name._value !== '曾文电厂') {
                colorp = new window.XEarth.Color(
                  1 / 255,
                  160 / 255,
                  233 / 255,
                  1.0
                )
                entity.billboard = {
                  image: 'static/image/billboard/台湾图标/电网/水力.png',
                  scale: scale,
                  distanceDisplayCondition:
                    new window.XEarth.DistanceDisplayCondition(100, 8e5),
                  scaleByDistance: new window.XEarth.NearFarScalar(
                    1000,
                    0.5,
                    5e5,
                    0.6
                  ),
                  eyeOffset: new window.XEarth.ConstantProperty(
                    new window.XEarth.Cartesian3(0, 0, -11)
                  )
                }
              }
              // colorp = new window.XEarth.Color(0 / 255, 183 / 255, 253 / 255)
            } else if (entity.properties.type._value.includes('风力')) {
              colorp = new window.XEarth.Color(28 / 255, 138 / 255, 137 / 255)
              entity.billboard = {
                image: 'static/image/billboard/台湾图标/电网/风力.png',
                scale: scale,
                distanceDisplayCondition:
                  new window.XEarth.DistanceDisplayCondition(100, 8e5),
                scaleByDistance: new window.XEarth.NearFarScalar(
                  1000,
                  0.5,
                  5e5,
                  0.6
                ),
                eyeOffset: new window.XEarth.ConstantProperty(
                  new window.XEarth.Cartesian3(0, 0, -11)
                )
              }
            } else if (entity.properties.type._value.includes('核能')) {
              // colorp = new window.XEarth.Color(135 / 255, 39 / 255, 132 / 255)
              colorp = new window.XEarth.Color(
                162 / 255,
                29 / 255,
                122 / 255,
                1.0
              )
              entity.billboard = {
                image: 'static/image/billboard/台湾图标/电网/核能.png',
                scale: scale,
                distanceDisplayCondition:
                  new window.XEarth.DistanceDisplayCondition(100, 8e5),
                scaleByDistance: new window.XEarth.NearFarScalar(
                  1000,
                  0.5,
                  5e5,
                  0.6
                ),
                eyeOffset: new window.XEarth.ConstantProperty(
                  new window.XEarth.Cartesian3(0, 0, -11)
                )
              }
            } else if (entity.properties.type._value.includes('太阳能')) {
              colorp = new window.XEarth.Color(244 / 255, 182 / 255, 62 / 255)
              entity.billboard = {
                image: 'static/image/billboard/台湾图标/电网/大洋能.png',
                scale: scale,
                distanceDisplayCondition:
                  new window.XEarth.DistanceDisplayCondition(100, 8e5),
                scaleByDistance: new window.XEarth.NearFarScalar(
                  1000,
                  0.5,
                  5e5,
                  0.6
                ),
                eyeOffset: new window.XEarth.ConstantProperty(
                  new window.XEarth.Cartesian3(0, 0, -11)
                )
              }
            } else if (entity.properties.type._value.includes('民间电厂')) {
              // colorp = new window.XEarth.Color(148 / 255, 96 / 255, 55 / 255)
              colorp = new window.XEarth.Color(
                153 / 255,
                94 / 255,
                43 / 255,
                1.0
              )
              entity.billboard = {
                image: 'static/image/billboard/台湾图标/电网/民间电力.png',
                scale: scale,
                distanceDisplayCondition:
                  new window.XEarth.DistanceDisplayCondition(100, 8e5),
                scaleByDistance: new window.XEarth.NearFarScalar(
                  1000,
                  0.5,
                  5e5,
                  0.6
                ),
                eyeOffset: new window.XEarth.ConstantProperty(
                  new window.XEarth.Cartesian3(0, 0, -11)
                )
              }
            } else if (entity.properties.type._value.includes('抽蓄')) {
              // colorp = new window.XEarth.Color(35 / 255, 41 / 255, 139 / 255)
              colorp = new window.XEarth.Color(120 / 255, 120 / 255, 250 / 255)
              entity.billboard = {
                image: 'static/image/billboard/台湾图标/电网/民间电力.png',
                scale: scale,
                distanceDisplayCondition:
                  new window.XEarth.DistanceDisplayCondition(100, 8e5),
                scaleByDistance: new window.XEarth.NearFarScalar(
                  1000,
                  0.5,
                  5e5,
                  0.6
                ),
                eyeOffset: new window.XEarth.ConstantProperty(
                  new window.XEarth.Cartesian3(0, 0, -11)
                )
              }
            } else {
              colorp = new window.XEarth.Color(0, 0, 0)
              entity.billboard = {
                image: 'static/image/billboard/台湾图标/电网/三角形.png',
                scale: scale,
                distanceDisplayCondition:
                  new window.XEarth.DistanceDisplayCondition(100, 8e5),
                scaleByDistance: new window.XEarth.NearFarScalar(
                  1000,
                  0.5,
                  5e5,
                  0.6
                ),
                eyeOffset: new window.XEarth.ConstantProperty(
                  new window.XEarth.Cartesian3(0, 0, -11)
                )
              }
            }
            // entity.point = {
            //   outlineColor: colorp,
            //   color: new window.XEarth.Color(1, 1, 1),
            //   pixelSize: isCore ? 8 : 8,
            //   outlineWidth: isCore ? 8 : 8,
            //   distanceDisplayCondition:
            //     new window.XEarth.DistanceDisplayCondition(100, 5e5),
            //   scaleByDistance: new window.XEarth.NearFarScalar(
            //     1000,
            //     1,
            //     3e5,
            //     1.1
            //   )
            // }
            // 彰滨光电位置不对，所以暂时不显示
            if (
              entity.properties.Name._value !== '彰滨光电' &&
              entity.properties.Name._value !== '曾文电厂'
            ) {
              entity.label = {
                text: entity.properties.Name._value,
                font: '200 20px MicroSoft YaHei',
                fillColor: colorp,
                style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
                horizontalOrigin: window.XEarth.HorizontalOrigin.LEFT,
                verticalOrigin: window.XEarth.VerticalOrigin.CENTER,
                pixelOffset: new window.XEarth.Cartesian2(-30, -35),
                showBackground: false,
                outlineColor: window.XEarth.Color.WHITE,
                outlineWidth: 5,
                backgroundColor: new window.XEarth.Color(
                  1 / 255,
                  1 / 255,
                  1 / 255,
                  0.3
                ),
                distanceDisplayCondition:
                  new window.XEarth.DistanceDisplayCondition(100, 3e5),
                eyeOffset: new window.XEarth.ConstantProperty(
                  new window.XEarth.Cartesian3(0, 0, -100)
                )
              }
            }
            // createBillboardLabel2({
            // 	cartesian3: entity.position._value,
            // 	name: entity.properties.Name._value || '电厂',
            // 	offset: new window.XEarth.Cartesian2(0, -35),
            // 	distanceDisplay: new window.XEarth.DistanceDisplayCondition(
            // 		0,
            // 		18e5
            // 	),
            // 	img: 'static/image/billboard/border_bg01.png'
            // })
          }
        } else if (entity.polyline) {
          let polylineType = entity.properties.type._value
          // if (!val) {
          //   entity.polyline.show = false
          // }
          entity.polyline.width = 5
          switch (polylineType) {
            case '一次输电线161KV':
              // entity.polyline.material.color = new window.XEarth.Color(
              //   149 / 255,
              //   195 / 255,
              //   37 / 255
              // )
              entity.polyline.material =
                new window.XEarth.PolylineGlowMaterialProperty({
                  color: new window.XEarth.Color(
                    119 / 255,
                    245 / 255,
                    117 / 255
                  ),
                  glowPower: 0.1
                })
              entity.polyline.width = 10
              entity.polyline.distanceDisplayCondition =
                new window.XEarth.DistanceDisplayCondition(0, 8e5)
              break
            case '超高压输电线345KV':
              // entity.polyline.material.color = new window.XEarth.Color(
              //   30 / 255,
              //   102 / 255,
              //   62 / 255
              // )
              entity.polyline.material =
                new window.XEarth.PolylineGlowMaterialProperty({
                  color: new window.XEarth.Color(255 / 255, 1 / 255, 1 / 255),
                  glowPower: 0.1
                  // taperPower: 0.5
                })
              entity.polyline.width = 15
              entity.polyline.distanceDisplayCondition =
                new window.XEarth.DistanceDisplayCondition(0, 8e5)
              break
  
            default:
              break
          }
        }
      }
      that.clickPowerTarget()
    })
    // 枢纽单加
    window.XEarth.GeoJsonDataSource.load(
      'static/geojson/taiwan/关键核心枢纽.geojson'
    ).then((dataSource) => {
      const entities = dataSource.entities.values
      dataSource.name = '关键核心枢纽'
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        if (entity.billboard) {
          entity._id = entity.properties.Name._value
          entity.billboard = null
          entity.label = {
            text: entity.properties.Name._value,
            font: '200 20px MicroSoft YaHei',
            fillColor: new window.XEarth.Color(0 / 255, 114 / 255, 59 / 255),
            style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: window.XEarth.HorizontalOrigin.LEFT,
            verticalOrigin: window.XEarth.VerticalOrigin.CENTER,
            pixelOffset: new window.XEarth.Cartesian2(-70, -35),
            showBackground: false,
            outlineColor: window.XEarth.Color.WHITE,
            outlineWidth: 5,
            backgroundColor: new window.XEarth.Color(
              1 / 255,
              1 / 255,
              1 / 255,
              0.3
            ),
            distanceDisplayCondition:
              new window.XEarth.DistanceDisplayCondition(100, 5e5),
            eyeOffset: new window.XEarth.ConstantProperty(
              new window.XEarth.Cartesian3(0, 0, -100)
            )
          }
          entity.billboard = {
            image: 'static/image/billboard/台湾图标/dianwang_02.png',
            scale: 4.5,
            distanceDisplayCondition:
              new window.XEarth.DistanceDisplayCondition(100, 8e5),
            scaleByDistance: new window.XEarth.NearFarScalar(
              1000,
              0.5,
              5e5,
              0.6
            )
          }
        }
      }
      window.EarthViewer.dataSources.add(dataSource)
    })
  }
  loadPowerData() {
    const that = this
    const p = new Promise((resolve, reject) => {
      window.XEarth.GeoJsonDataSource.load('static/geojson/taiwan/电厂点线.geojson').then(
        (dataSource) => {
          const entities = dataSource.entities.values
          for (let i = 0; i < entities.length; i++) {
            let entity = entities[i]
            if (entity.properties.Name) {
              entity._id = entity.properties.Name._value
            }
          }
          window.EarthViewer.dataSources.add(dataSource)
          let data = dataSource
          resolve(data)
        }
      )
    })
    return p
  }
  createWall(option) {
    const that = this
    //
    var center = option.position || [120.80614326267549, 24.22321058432321]
    console.log(option.color)
    var ccolor = option.color || [255, 0, 0]
    var radius = 6
    var options = { steps: 50, units: 'kilometers', properties: { foo: 'bar' } }
    var circle = turf.circle(center, radius, options)
    const wallpp = []
    let cpp = circle.geometry.coordinates[0]
    for (let index = 0; index < cpp.length; index++) {
      const element = cpp[index]
      wallpp.push(...element, 2000)
    }
    console.log(wallpp)
    window.EarthViewer.entities.add({
      id: 'WallTrail',
      wall: {
        // positions: window.XEarth.Cartesian3.fromDegreesArrayHeights([
        // 	121.50905998633573, 23.682517340649152, 10000.0, 122.50905998633573,
        // 	23.682517340649152, 10000.0, 122.50905998633573, 25.682517340649152,
        // 	10000.0, 121.50905998633573, 25.682517340649152, 10000.0,
        // 	121.50905998633573, 23.682517340649152, 10000.0
        // ]),
        positions: window.XEarth.Cartesian3.fromDegreesArrayHeights(wallpp),
        material: new window.XEarth.PolylineTrailLinkMaterialProperty({
          // color: new window.XEarth.Color(252 / 255, 197 / 255, 38 / 255, 1.0),
          mixColor: new window.XEarth.Color(
            ccolor[0] / 255,
            ccolor[1] / 255,
            ccolor[2] / 255,
            1.0
          ),
          repeat: new window.XEarth.Cartesian2(1.0, 1.0),
          // half: false,
          flowSpeed: -0.7,
          image: 'static/image/texture/colors2.png',
          mixRatio: 0.9,
          // image: 'static/image/texture/纵向渐变.png',
          transparent: true,
          direction: false
        })
      }
    })
  }
  drawRectangular(options) {
    const that = this
    let position = window.XEarth.Cartesian3.fromDegrees(
      options.longitude,
      options.latitude
    )
    let color = options.color || [228, 63, 50]
    let minHeight = options.minHeight || 4000
    let maxHeight = minHeight + 2000
    let centerCityInitHeight = minHeight
    let adding = true
    var _update_height = function () {
      let positionNew
  
      if (
        centerCityInitHeight < maxHeight &&
        centerCityInitHeight > minHeight &&
        adding
      ) {
        centerCityInitHeight += 40
      } else if (
        centerCityInitHeight < maxHeight &&
        centerCityInitHeight > minHeight &&
        !adding
      ) {
        centerCityInitHeight -= 40
      } else if (centerCityInitHeight >= maxHeight) {
        adding = false
        centerCityInitHeight -= 40
      } else if (centerCityInitHeight <= minHeight) {
        adding = true
        centerCityInitHeight += 40
      }
      positionNew = window.XEarth.Cartesian3.fromDegrees(
        options.longitude,
        options.latitude,
        centerCityInitHeight
      )
      return positionNew
    }
    let rollVal = 0
    let pitchVal = 0
    let headingVal = 0
    let speedControl = 0.05
    // 匀速版本
    function getOrientation2(time, result) {
      let center = window.XEarth.Cartesian3.fromDegrees(
        options.longitude,
        options.latitude,
        451
      )
      headingVal += speedControl
      var orientation3 = window.XEarth.Transforms.headingPitchRollQuaternion(
        center,
        new window.XEarth.HeadingPitchRoll(headingVal, pitchVal, rollVal)
      )
      return orientation3
    }
    window.EarthViewer.entities.add({
      id: options.bId,
      position: new window.XEarth.CallbackProperty(_update_height, false),
      orientation: new window.XEarth.CallbackProperty(getOrientation2, false),
      model: {
        uri: 'static/model/slz.gltf',
        scale: options.scale || 450,
        runAnimations: true,
        clampAnimations: true,
        color: new window.XEarth.Color(
          color[0] / 255,
          color[1] / 255,
          color[2] / 255
        ),
        silhouetteColor: new window.XEarth.Color.fromAlpha(
          new window.XEarth.Color(
            color[0] / 255,
            color[1] / 255,
            color[2] / 255
          ),
          1
        ),
        silhouetteSize: 4
      }
    })
  }
  clickPowerTarget() {
    const that = this
    window.baseHandler = new window.XEarth.ScreenSpaceEventHandler(
      window.EarthViewer.scene.canvas
    )
    window.baseHandler.setInputAction(async (click) => {
      let pickedObject = window.EarthViewer.scene.pick(click.position)
      if (!window.XEarth.defined(pickedObject)) return
      // 判断类型
      if (pickedObject.id.point || pickedObject.id.billboard) {
        let pos = pickedObject.id._position._value
        console.log(pickedObject.id.properties);
        let cartog =
          window.EarthViewer.scene.globe.ellipsoid.cartesianToCartographic(pos)
        let name = pickedObject.id.properties.Name._value
        let tar = stationCamera[name]
        if (!tar || !tar[2]) return
        console.log(name, pickedObject.id)
  
        that.accidentalPowerStationDMX({
          color: [255, 255, 0],
          entity: pickedObject.id,
          position: [
            window.XEarth.Math.toDegrees(cartog.longitude),
            window.XEarth.Math.toDegrees(cartog.latitude)
          ],
          title: name,
          content: tar[2],
          callback: name == '台中电厂' ? cb : null
        })
      } else if (pickedObject.id.polyline) {
        console.log(pickedObject.id)
        pickedObject.id.polyline.show = new window.XEarth.CallbackProperty(
          changeShow(),
          false
        )
        pickedObject.id.polyline.material = window.XEarth.Color.RED
        pickedObject.id.polyline.width = 6
      }
      // 切换路由
    }, window.XEarth.ScreenSpaceEventType.LEFT_CLICK)
  
    const changeShow = () => {
      let number = 1
      let flag = true
  
      const show1 = () => {
        if (flag) {
          number -= 0.08
          if (number <= 0) {
            flag = false
          }
        } else {
          number += 0.08
          if (number >= 1) {
            flag = true
          }
        }
        return number >= 0.5
      }
      return show1
    }
  }
  clearStation() {
    let aa = ['WallTrail', 'Rectangular111']
    aa.forEach((item) => {
      window.EarthViewer.entities.removeById(item)
    })
    that.clearPowerPop()
  }
  clearPowerPop() {
    let labels = document.getElementsByClassName('powerPop')
    if (labels) {
      for (let index = 0; index < labels.length; index++) {
        const element = labels[index]
        element.style.display = 'none'
      }
    }
  }
  addImportancePlantAndSubstation(type) {
    window.EarthViewer.dataSources._dataSources.forEach((dataSource) => {
      if (dataSource._name == '台湾核心电厂') {
        // 移除czml路径
        window.EarthViewer.dataSources.remove(dataSource)
      }
    })
    window.EarthViewer.dataSources._dataSources.forEach((dataSource) => {
      if (dataSource._name == '核心电厂') {
        // 移除czml路径
        window.EarthViewer.dataSources.remove(dataSource)
      }
    })
    window.EarthViewer.dataSources._dataSources.forEach((dataSource) => {
      if (dataSource._name == '关键核心枢纽') {
        // 移除czml路径
        window.EarthViewer.dataSources.remove(dataSource)
      }
    })
    window.XEarth.GeoJsonDataSource.load(
      'static/geojson/taiwan/电厂点线.geojson'
    ).then((dataSource) => {
      window.EarthViewer.dataSources.add(dataSource)
      const entities = dataSource.entities.values
      dataSource.name = '台湾核心电厂'
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        if (entity.billboard) {
          entity.billboard = null
        }
        if (entity.polygon) {
          entity.polygon = null
        }
        if (entity.polyline) {
          let polylineType = entity.properties.type._value
          if (type == 'default') {
            switch (polylineType) {
              case '一次输电线161KV':
                // console.log(entity.polyline);
                entity.polyline.material.color = new window.XEarth.Color(
                  149 / 255,
                  195 / 255,
                  37 / 255
                )
                break
              case '超高压输电线345KV':
                entity.polyline.material.color = new window.XEarth.Color(
                  30 / 255,
                  102 / 255,
                  62 / 255
                )
                break
  
              default:
                break
            }
          } else if (type == 'flowLine') {
            entity.polyline.width = 10
            // entity.polyline.material =
            //   new window.XEarth.FlowLineMaterialProperty({
            //     transparent: true,
            //     //mixColor: new window.XEarth.Color(1.0, 1.0, 0.0, 1.0),
            //     // mixColor: window.XEarth.Color.AQUAMARINE,
            //     mixColor: new window.XEarth.Color(
            //       230 / 255,
            //       62 / 255,
            //       51 / 255
            //     ),
            //     // mixColor: color,
            //     mixRatio: 0.9,
            //     flowSpeed: 2.0,
            //     image: require('@/assets/image/knowleadge/materialline.png')
            //   })
            let ccolor = null
            let speed = null
            let width = null
            let mixRatio = null
            switch (polylineType) {
              case '一次输电线161KV':
                console.log('一次输电线161KV')
                // console.log(entity.polyline);
                ccolor = new window.XEarth.Color(
                  149 / 255,
                  195 / 255,
                  37 / 255,
                  255 / 255
                )
                speed = 1
                width = 15
                mixRatio = 0.5
                entity.polyline.material =
                  new window.XEarth.FlowLineMaterialProperty({
                    transparent: true,
                    //mixColor: new window.XEarth.Color(1.0, 1.0, 0.0, 1.0),
                    // mixColor: window.XEarth.Color.AQUAMARINE,
                    mixColor: ccolor,
                    // mixColor: color,
                    mixRatio: mixRatio,
                    flowSpeed: speed || 2.0,
                    repeat: new window.XEarth.Cartesian2(10, 10),
                    image: require('@/assets/image/knowleadge/green_line_1r.png')
                  })
                entity.polyline.width = width
                break
              case '超高压输电线345KV':
                console.log('超高压输电线345KV')
                ccolor = new window.XEarth.Color(
                  664 / 255,
                  224 / 255,
                  208 / 255,
                  255 / 255
                ) //30 / 255, 102 / 255, 62 / 255
                speed = 2
                width = 20
                mixRatio = 0.8
                entity.polyline.material =
                  new window.XEarth.FlowLineMaterialProperty({
                    transparent: true,
                    //mixColor: new window.XEarth.Color(1.0, 1.0, 0.0, 1.0),
                    // mixColor: window.XEarth.Color.AQUAMARINE,
                    mixColor: ccolor,
                    // mixColor: color,
                    mixRatio: mixRatio,
                    flowSpeed: -speed || -2.0,
                    repeat: new window.XEarth.Cartesian2(10, 10),
                    image: require('@/assets/image/knowleadge/green_line_1.png')
                  })
                entity.polyline.width = width
                break
  
              default:
                break
            }
          }
        }
      }
    })
  
    // loadPowerData1()
    window.XEarth.GeoJsonDataSource.load(
      'static/geojson/taiwan/核心电厂.geojson'
    ).then((dataSource) => {
      const entities = dataSource.entities.values
      dataSource.name = '核心电厂'
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        if (entity.billboard) {
          entity.billboard = null
          entity.label = {
            text: entity.properties.Name._value,
            font: '200 32px MicroSoft YaHei',
            style: window.XEarth.LabelStyle.FILL,
            scale: 0.5,
            fillColor: new window.XEarth.Color(206 / 255, 40 / 255, 41 / 255),
            // outlineColor: window.XEarth.Color.WHITE,
            pixelOffset: new window.XEarth.Cartesian2(0, -25),
            distanceDisplayCondition:
              new window.XEarth.DistanceDisplayCondition(0, 10e5)
          }
          // entity.billboard = {
          //   image: 'static/image/billboard/flyblue.png',
          //   scale: 1.2,
          //   distanceDisplayCondition: new window.XEarth.DistanceDisplayCondition(0, 30e5),
          //   scaleByDistance: new window.XEarth.NearFarScalar(0, 0.2, 6e5, 0.15)
          // }
          entity.point = {
            outlineColor: new window.XEarth.Color(
              206 / 255,
              40 / 255,
              41 / 255
            ),
            color: new window.XEarth.Color(1, 1, 1),
            pixelSize: 4,
            outlineWidth: 4
            // disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }
        }
      }
      window.EarthViewer.dataSources.add(dataSource)
    })
    window.XEarth.GeoJsonDataSource.load(
      'static/geojson/taiwan/关键核心枢纽.geojson'
    ).then((dataSource) => {
      const entities = dataSource.entities.values
      dataSource.name = '关键核心枢纽'
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        if (entity.billboard) {
          entity.billboard = null
          entity.label = {
            text: entity.properties.Name._value,
            font: '200 32px MicroSoft YaHei',
            style: window.XEarth.LabelStyle.FILL,
            scale: entity.properties.level._value == '枢纽节点' ? 0.6 : 0.5,
            fillColor: new window.XEarth.Color(50 / 255, 163 / 255, 223 / 255),
            // outlineColor: window.XEarth.Color.WHITE,
            pixelOffset: new window.XEarth.Cartesian2(0, -25),
            distanceDisplayCondition:
              new window.XEarth.DistanceDisplayCondition(0, 10e5)
          }
          entity.point = {
            outlineColor: new window.XEarth.Color(
              50 / 255,
              163 / 255,
              223 / 255
            ),
            color: new window.XEarth.Color(1, 1, 1),
            pixelSize: entity.properties.level._value == '枢纽节点' ? 6 : 4,
            outlineWidth: entity.properties.level._value == '枢纽节点' ? 6 : 4
            // disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }
        }
      }
      window.EarthViewer.dataSources.add(dataSource)
    })
  }
  terrainBand() {
    const viewer = window.EarthViewer

    let entries1 = []
    let colors = [
      [0, 20, 234, 242, 0],
      [200, 20, 234, 242, 0.8],
      [2000, 44, 176, 14, 0.8],
      [4000, 230, 233, 7, 0.8],
      [6000, 227, 119, 9, 0.8],
      [8000, 235, 7, 12, 0.8]
    ]
    colors.forEach((item) => {
      let entry = {
        height: item[0],
        color: new window.XEarth.Color(
          item[1] / 255,
          item[2] / 255,
          item[3] / 255,
          item[4]
        )
      }
      entries1.push(entry)
    })
    const layerBand = [
      {
        entries: entries1,
        extendDownwards: true,
        extendUpwards: true
      }
    ]
    viewer.scene.globe.material = window.XEarth.createElevationBandMaterial({
      scene: viewer.scene,
      layers: layerBand
    })
  }
  terrainExaggeration(speed) {
    const viewer = window.EarthViewer

    let sp = speed || 0.01
    viewer.scene.globe.depthTestAgainstTerrain = true
    viewer.scene.globe.terrainExaggeration = 0
    this.terrainBand()
    viewer.camera.flyTo({
      destination: new window.XEarth.Cartesian3(
        -3007850.519157388,
        5137536.34772638,
        2341661.9104861133
      ),
      orientation: {
        heading: 0.3444160325644585,
        pitch: -0.18032308765797556,
        roll: 6.282808059773251
      },
      duration: 3,
      pitchAdjustHeight: 30000,
      complete: () => {
        setTimeout(() => {
          // // 绕台旋转
          // let flyingRoam = new FlyingRoam({})
          // flyingRoam.rotate()
          //
          let inter = setInterval(() => {
            if (viewer.scene.globe.terrainExaggeration > 2) {
              // flyRoamTaiwan()
              // setTimeout(() => {
              //   viewer.scene.globe.material = null
              // }, 7000)
              clearInterval(inter)
              // flyingRoam.quitLook2()
            } else {
              viewer.scene.globe.terrainExaggeration += sp
            }
          }, 100)
        }, 1000)
      }
    })
  }
  viewTW() {
    // let terrainLayer = new window.XEarth.CesiumTerrainProvider({
    //   url: googleConfig.terrainTW, //加载地形
    //   tilingScheme: new window.XEarth.GeographicTilingScheme()
    // })
    // window.EarthViewer.scene.terrainProvider = terrainLayer
    this.terrainExaggeration(0.03)
  }
}
