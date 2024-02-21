import LayerManagementSource from '@/views/layerList/hooks/layerManagementSource'
import store from '@/store'

export default function () {
  let layerManagementSource = new LayerManagementSource({
    viewer: window.EarthViewer,
    Cesium: window.MSIMEarth
  })

  let options = {
    earth: window.MSIMEarth,
    viewer: window.viewer,
    type: 'panel'
  }
  let layerList = new window.EarthPlugn.treeManagement(options)

  const handlePA = (json) => {
    console.log(json)
    let resultTreeData
    if (json.Data.Side == 'blue') {
      // 图层添加
      resultTreeData = layerList.panelManagement.addNode(
        store.state.sceneModule.layerManagementData,
        {
          name: json.Data.LabelName,
          type: json.Data.Type,
          code: json.Data.Name,
          checked: true,
          clickable: true
        },
        '蓝方'
      )
      // 图层勾选
      resultTreeData = layerList.panelManagement.updateTickStatus(
        store.state.sceneModule.layerManagementData,
        {
          name: json.Data.LabelName,
          type: json.Data.Type,
          code: json.Data.Name
        },
        'add'
      )
      window.EarthViewer.entities.removeById(json.Data.Name)
      if (json.Data.Name.indexOf('radar') !== -1) {
        // let trackMatte = new TrackMatte({
        //   viewer: window.EarthViewer,
        //   earth: window.MSIMEarth,
        //   id: json.Data.Name + 'radar_blue_tw',
        //   shortwaveRange: 150000.0,
        //   position: [json.Data.Lon, json.Data.Lat],
        //   speed: 2
        // })
      }

      // 蓝方目标布设完成 绿色
    } else if (json.Data.Side == 'red') {
      // 图层添加
      resultTreeData = layerList.panelManagement.addNode(
        store.state.sceneModule.layerManagementData,
        {
          name: json.Data.LabelName,
          type: json.Data.Type,
          code: json.Data.Name,
          checked: true,
          clickable: true
        },
        '红方'
      )
      // 图层勾选
      resultTreeData = layerList.panelManagement.updateTickStatus(
        store.state.sceneModule.layerManagementData,
        {
          name: json.Data.LabelName,
          type: json.Data.Type,
          code: json.Data.Name
        },
        'add'
      )
    }
    store.commit(
      'setLayerManagementData',
      JSON.parse(JSON.stringify(resultTreeData))
    )
    if (json.Data.Side) {
      // 日志展示
      // store.commit('setCzmlEventSourceData', json)
    }
    window.EarthViewer.entities.removeById(json.Data.Name)
    let imageUrl = 'static/image/billboard/台湾图标/飞机.png'
    let scale = 1.0
    if (
      typeof json.Data === 'undefined' ||
      typeof json.Data.Name === 'undefined'
    )
      return
    if (json.Data.Name.indexOf('target') !== -1) {
      imageUrl = 'static/image/billboard/静态目标/阵地blue.png'
    } else if (json.Data.Name.indexOf('cap_south') !== -1) {
      imageUrl = 'static/image/billboard/静态目标/飞机B.png'
    } else if (
      json.Data.Name.indexOf('radar') !== -1 ||
      json.Data.Name.indexOf('sam_battalion') !== -1 ||
      json.Data.Name.indexOf('sam_ttr') !== -1
    ) {
      imageUrl = 'static/image/billboard/静态目标/radar.png'
      scale = 0.5
    } else if (json.Data.Name.indexOf('sam_launcher') !== -1) {
      imageUrl = 'static/image/billboard/静态目标/陆军.png'
      scale = 0.5
    } else {
      imageUrl = 'static/image/billboard/静态目标/飞机B.png'
    }
    if (json.Data.Side === 'red') {
      imageUrl = 'static/image/billboard/静态目标/飞机R.png'
    }
    let height = 1000
    // if (window.EarthViewer.scene.globe.depthTestAgainstTerrain) {
    //   height = 10000
    // }
    // if (json.Data.Name == 'destroyer1' || json.Data.Name == 'destroyer2') {
    //   console.log('静态驱逐舰')
    //   window.EarthViewer.entities.add({
    //     id: json.Data.Name,
    //     position: new window.MSIMEarth.Cartesian3.fromDegrees(
    //       json.Data.Lon,
    //       json.Data.Lat,
    //       json.Data.Alt + height
    //     ),
    //     model: {
    //       // uri: "http://172.15.14.72:4042/model/红方海上指挥中心.gltf",
    //       uri: `${baseStatic}/model/驱逐舰.gltf`,
    //       silhouetteColor: window.MSIMEarth.Color.RED,
    //       silhouetteSize: 2,
    //       minimumPixelSize: 10,
    //       maximumScale: 15,
    //       scale: 5.0
    //     },
    //     label: {
    //       text: json.Data.LabelName,
    //       font: 'normal 29px MicroSoft YaHei',
    //       scale: 0.5,
    //       fillColor: window.MSIMEarth.Color.WHITE,
    //       // fillColor: color,
    //       outlineColor: new window.window.MSIMEarth.Color(1, 0, 0, 1),
    //       outlineWidth: 5,
    //       style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
    //       horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
    //       verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
    //       pixelOffset: new window.MSIMEarth.Cartesian2(-33, -21),
    //       eyeOffset: new window.MSIMEarth.ConstantProperty(
    //         new window.MSIMEarth.Cartesian3(0, 0, -11)
    //       ),
    //       distanceDisplayCondition:
    //         new window.MSIMEarth.DistanceDisplayCondition(1000, 100e5)
    //     }
    //   })
    //   return
    // }
    window.EarthViewer.entities.add({
      id: json.Data.Name,
      position: new window.MSIMEarth.Cartesian3.fromDegrees(
        json.Data.Lon,
        json.Data.Lat,
        json.Data.Alt + height
      ),
      label: {
        text: json.Data.LabelName,
        font: 'normal 29px MicroSoft YaHei',
        scale: 0.5,
        // fillColor: color,
        // outlineColor: color,
        outlineWidth: 1,
        style: window.MSIMEarth.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: window.MSIMEarth.HorizontalOrigin.LEFT, //水平位置
        verticalOrigin: window.MSIMEarth.VerticalOrigin.BOTTOM,
        pixelOffset: new window.MSIMEarth.Cartesian2(-33, -21),
        eyeOffset: new window.MSIMEarth.ConstantProperty(
          new window.MSIMEarth.Cartesian3(0, 0, -11)
        ),
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          1000,
          100e5
        ),
        heightReference: window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND,
        // disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      billboard: {
        image: imageUrl,
        scale: scale,
        distanceDisplayCondition: new window.MSIMEarth.DistanceDisplayCondition(
          1000,
          40e5
        ),
        heightReference: window.MSIMEarth.HeightReference.RELATIVE_TO_GROUND,
        // scaleByDistance: new window.MSIMEarth.NearFarScalar(1000, 0.5, 100e5, 0.3)
        // disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })
  }
  return { handlePA }
}
