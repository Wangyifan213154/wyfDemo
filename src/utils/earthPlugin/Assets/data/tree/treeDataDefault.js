/**
 * 树结构默认初始数据，以当前仿真方案为例，当没有后台接口提供初始树结构数据时，可以使用该目录下得数据进行初始化。
 */
const treeDataDefault = [
  {
    code: 0,
    name: '战场环境',
    disabled: true,
    isPenultimate: true,
    clickable: false,
    childList: []
  },
  {
    code: 1,
    name: '地理数据',
    disabled: true,
    isPenultimate: true,
    clickable: false,
    childList: [
      {
        name: '全球地形',
        code: 'terrain',
        checked: false,
        clickable: false,
        // url: path.terrainUrl,
        geoType: ''
      },
      {
        name: '地球自转',
        code: 'showSwitch',
        checked: false,
        clickable: false,
        geoType: ''
      },
      {
        name: '地球光照',
        code: 'showillumination',
        checked: false,
        clickable: false,
        geoType: ''
      },
      {
        name: '九段线',
        code: 'nineLine',
        checked: true,
        clickable: false,
        // url: path.baseDataUrl.nineLine,
        // geoType: 'polyline',
        // color: Cesium.Color.GOLDENROD,
        addname: true
      },
      {
        name: '岛链',
        code: 'isLandLian',
        checked: false,
        clickable: false,
        url: '',
        geoType: 'polyline'
        // color: Cesium.Color.YELLOW.withAlpha(0.4)
      },
      {
        name: '四海两边',
        code: 'fourSeaTwoBorder',
        checked: false,
        clickable: false,
        // url: path.baseDataUrl.fourSeaTwoBorder,
        geoType: 'polygon'
        // color: new Cesium.Color(255, 255, 255, 0.4)
      },
      {
        name: '机场资源',
        code: 'airport',
        clickable: false,
        // url: path.baseDataUrl.airport,
        geoType: 'point',
        // color: Cesium.Color.STEELBLUE,
        addname: true
      },
      {
        name: '国家点',
        code: 'china',
        checked: true,
        // url: path.baseDataUrl.airport,
        geoType: 'point',
        clickable: false,
        // color: Cesium.Color.STEELBLUE,
        addname: true
      },
      {
        name: '地名',
        code: 'mainCity',
        checked: true,
        // url: path.baseDataUrl.airport,
        geoType: 'point',
        clickable: false,
        // color: Cesium.Color.STEELBLUE,
        addname: true
      },
      {
        name: '国家边界线',
        code: 'borderline',
        checked: true,
        // url: path.baseDataUrl.borderline,
        geoType: 'polyline',
        clickable: false,
        // color: new Cesium.Color(164 / 255, 91 / 255, 82 / 255, 1),
        wcodeth: 4
      },
      {
        name: '重要目标',
        code: 'importanceTarget',
        geoType: 'point',
        clickable: false
      },
      {
        name: '台湾信息网',
        code: 'taiwanInformationNetwork',
        clickable: false,
        checked: false
      },
      {
        name: '台湾海运线',
        code: 'taiwanShippingLine',
        clickable: false,
        checked: false
      },
      {
        name: '台海禁航区',
        code: 'taiwanStraitNoNavigationZone',
        clickable: false,
        checked: false
      }
    ]
  },
  {
    code: 2,
    name: '红方',
    disabled: true,
    isPenultimate: true,
    clickable: false,
    childList: []
  },
  {
    code: 3,
    name: '蓝方',
    disabled: true,
    isPenultimate: true,
    clickable: false,
    childList: []
  }
]
export default treeDataDefault
