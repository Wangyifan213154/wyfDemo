/*
 * @Description:
 * @Version: 2.0
 * @Autor: wx
 * @Date: 2021-11-27 11:20:26
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-21 15:55:07
 */
// ***************************************天地图********************************************
const TDT_Tk = '55d6f64ddfde40d894b6a72a4d678f84'; // key
// 服务域名
const TDTUrl = 'http://t{s}.tianditu.com/'; //https://t{s}.tianditu.gov.cn/
// 影像底图和注记服务地址
const TDT_IMG_W = TDTUrl + "img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" + TDT_Tk;
const TDT_CIA_W = TDTUrl + "cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" + TDT_Tk;
// 矢量底图和注记服务地址
const TDT_VEC_W = TDTUrl + "vec_w/wmts?service=wmts&request=GetTile&version=1.0.0" +
    "&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
    "&style=default&format=tiles&tk=" + TDT_Tk;
const TDT_CVA_W = TDTUrl + "cva_w/wmts?service=wmts&request=GetTile&version=1.0.0" +
    "&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
    "&style=default.jpg&tk=" + TDT_Tk;

const subdomains = ['0', '1', '2', '3', '4', '5', '6', '7'];

// 影像底图配置
const TDT_IMG_W_Config = {
    url: TDT_IMG_W,
    subdomains: subdomains,
    layer: "tdtImgLayer",
    style: "default",
    format: "image/jpeg",
    tileMatrixSetID: "GoogleMapsCompatible", //使用谷歌的瓦片切片方式
    show: true
}
// 影像注记配置
const TDT_CIA_W_Config = {
    url: TDT_CIA_W,
    subdomains: subdomains,
    layer: "tdtImgLayer",
    style: "default",
    format: "image/jpeg",
    tileMatrixSetID: "GoogleMapsCompatible",//使用谷歌的瓦片切片方式
    show: true
}
// 矢量底图配置
const TDT_VEC_W_Config = {
    url: TDT_VEC_W,
    subdomains: subdomains,
    layer: "tdtImgLayer",
    style: "default",
    format: "image/jpeg",
    tileMatrixSetID: "GoogleMapsCompatible",//使用谷歌的瓦片切片方式
    show: true
}
const TDT_CVA_W_Config = {
    url: TDT_CVA_W,
    subdomains: subdomains,
    layer: "tdtImgLayer",
    style: "default",
    format: "image/jpeg",
    tileMatrixSetID: "GoogleMapsCompatible",//使用谷歌的瓦片切片方式
    show: true
}
// ****************************arcgis服务************************************
let ARCGIS_ChinaOnlineCommunity_Mobile = 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity_Mobile/MapServer';
let ARCGIS_ChinaOnlineCommunityENG = 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunityENG/MapServer';
let ARCGIS_ChinaOnlineCommunity = 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer';
let ARCGIS_ChinaOnlineStreetGray = 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer';
let ARCGIS_ChinaOnlineStreetPurplishBlue = 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer';
// let ARCGIS_ChinaOnlineStreetPurplishBlue = "http://172.16.40.18:4041/arcgisMercatorMap/{z}/{y}/{x}.png";
let ARCGIS_ChinaOnlineStreetWarm = 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer';

// ***************************mapBox*****************************************
// let mapBoxToken =
//     "pk.eyJ1Ijoic2hlbnd1eXVleHkiLCJhIjoiY2t0MTZraWVjMDcxdTJ1bzhibTUxbWx0byJ9.b_NXjIKXALcMe7_dpVUABg";
// var layer = new Cesium.MapboxStyleImageryProvider({
//     styleId: "dark-v10", //streets-v11  dark-v10
//     accessToken: mapBoxToken,
//     scaleFactor: true,
// });
// **********************************自己服务器上的服务***************************************
let tmImageryURLList = [
    `http://172.16.40.19:4041/arcgisMercatorMap/{z}/{x}/{y}.png`

];
let tmImageryConfig = {
    minimumLevel: 6,
    rectangle: [139.65, 35.28, 139.74, 35.37],
    // rectangle: [-150,-45,127,30],  // 云图测试
    show: true,
    alpha: 1.0,
}

const stationCamera = {
    大甲溪电厂马鞍分厂: [
      [-2972575.0453908215, 5052613.434415478, 2575614.8796465197],
      {
        heading: 0.7351963779188475, //偏航角
        pitch: -0.4027330142379393, //-0.08401170275668313, //水平俯仰角
        roll: 0.00024092158952804255
      }
    ],
    '"513"大停电': [
      [-2987860.2347476613, 5130583.486978741, 2416545.8662871537],
      {
        heading: 6.267849699221239,
        pitch: -0.4230943176453297,
        roll: 0.0012342933577578208
      }
    ],
    '"517"大停电': [
      [-2987860.2347476613, 5130583.486978741, 2416545.8662871537],
      {
        heading: 6.267849699221239,
        pitch: -0.4230943176453297,
        roll: 0.0012342933577578208
      }
    ],
    '"303"大停电': [
      [-2987860.2347476613, 5130583.486978741, 2416545.8662871537],
      {
        heading: 6.267849699221239,
        pitch: -0.4230943176453297,
        roll: 0.0012342933577578208
      }
    ],
    '"815"大停电': [
      [-3020662.081948055, 5010142.357170998, 2637215.495752707],
      {
        heading: 6.273566912737464,
        pitch: -0.49278614890182215,
        roll: 0.001230479797101225
      }
    ],
    台北变电所爆炸: [
      [-3019928.1188984006, 4984623.832634453, 2665740.4934131494],
      {
        heading: 0.8206130851124342,
        pitch: -0.5869972710153277,
        roll: 0.0012223258495565048
      }
    ],
    台中电厂: [
      [-2978276.0675351303, 5064014.384354186, 2570151.2587674945],
      {
        heading: 0.09968812017971729,
        pitch: -0.532050685326225,
        roll: 0.00025171583346761395
      },
      '台中发电厂，又称台中电厂、台中火力发电厂，为台湾电力公司所属的火力发电厂，厂址位于台湾台中市龙井区丽水里龙昌路1号，是以煤炭为燃料的火力发电厂'
    ],
    兴达电厂: [
      [-3036735.9056180622, 5168067.573458575, 2424967.205368695],
      {
        heading: 5.92101793470187,
        pitch: -0.7549996654652014,
        roll: 0.0012931378121558978
      }
    ],
    大谭电厂: [
      [],
      [],
      '大潭发电厂，是台湾最大的天然气电厂，隶属台湾电力公司，位于台湾桃园市观音区大潭里。',
      'show-taiWanDatanPlantStation'
    ],
    通宵电厂: [
      [],
      [],
      '通霄发电厂位于苗栗县通霄镇，南侧为南势溪出海口，北接通霄海水浴场，旧厂区面积为三公顷，新厂区为抽砂填海的新生地，总面积43公顷。',
      'show-taiWanTongxiaoPlantStation'
    ],
    核能三厂: [
      [],
      [],
      '第三核能发电站（简称核三厂）是位于台湾屏东县恒春镇的一座核能发电站，由台湾电力公司经营，因邻近马鞍山而别名马鞍山发电厂，为唯一座落于南台湾的核能发电站。',
      'show-taiWanThirdPlantStation'
    ],
    龙崎超高压变电所: [
      [],
      [],
      '龙崎超高压变电所位于台南，隐身在台南市龙崎区的龙崎超高压变电所，是台电北中南各一处输电线枢纽的关键。',
      'show-taiWanLongqiSubstation'
    ],
    中寮超高压开闭所: [
      [],
      [],
      '中寮超高压开闭所地址在541台湾南投县中寮乡复兴巷22号。隶属于台电台中供电区营运处。',
      'show-taiWanZongliaoSubstation'
    ],
    龙潭超高压变电所: [
      [],
      [],
      '龙潭超高压变电所位于桃园，分为五部345千伏自耦变压器设置于北开关场，三部345千伏自耦变压器装置于南开关场。',
      'show-taiWanLongtanSubstation'
    ],
    石门电厂: [
      [],
      [],
      '石门风力发电站，为台湾本岛第一座商业运转的风力发电机组，于2003年12月15日开工，由中兴电工机械股份有限公司承建。',
      'show-taiWanShimenPlantStation'
    ]
  }

const googleConfig = {

    urlMark: 'http://172.15.8.6:4041/googleMapsVector/{z}/{x}/{y}.png',//'http://10.2.16.15:8090/googleMercatorVector/{z}/{x}/{y}.png',
    url4: 'http://10.1.30.102:9000/bingmaps/{z}/{x}/{y}.jpg',
    urlDark: 'http://172.15.8.6:4041/mapDarkTile/{z}/{x}/{y}.jpg',
    urlBlue: 'http://172.15.8.6:4041/mapBlueTile/{z}/{x}/{y}.jpg',
    // 台湾地形
    terrainTW: "http://172.15.8.6:4041/terrain/",
}

const datas = [
    {
        name: "气温风场融合",
        datas: [
            {
                name: "气温",
                type: "tile",
                visible: true,
                url: "http://172.15.8.6:4041/WeatherDATA/Tempreture_202008280000/{z}/{x}/{y}.png",
                legend: [-30, -13, 5, 22, 40],
                ext: "温度（℃）",
                colors: "rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 143, 211), rgb(149, 158, 213), rgb(150, 173, 213), rgb(149, 192, 214), rgb(149, 207, 216), rgb(145, 207, 211), rgb(140, 206, 208), rgb(135, 205, 203), rgb(131, 204, 199), rgb(125, 200, 196), rgb(120, 195, 194), rgb(114, 190, 191), rgb(109, 185, 189), rgb(103, 180, 187), rgb(100, 170, 188), rgb(98, 162, 191), rgb(97, 155, 193), rgb(95, 148, 196), rgb(92, 143, 185), rgb(89, 142, 155), rgb(86, 141, 119), rgb(82, 140, 90), rgb(79, 139, 62), rgb(88, 140, 54), rgb(96, 142, 48), rgb(108, 143, 37), rgb(116, 145, 31), rgb(126, 147, 26), rgb(136, 150, 23), rgb(148, 153, 20), rgb(158, 157, 17), rgb(171, 160, 14), rgb(182, 164, 12), rgb(194, 167, 11), rgb(205, 172, 9), rgb(215, 175, 7), rgb(225, 173, 6), rgb(229, 167, 6), rgb(233, 161, 6), rgb(237, 156, 6), rgb(242, 150, 6), rgb(241, 138, 9), rgb(239, 123, 13), rgb(238, 111, 16), rgb(237, 99, 18), rgb(230, 90, 20), rgb(221, 84, 19), rgb(208, 76, 18), rgb(199, 70, 17), rgb(188, 64, 17), rgb(177, 59, 16), rgb(166, 54, 14), rgb(155, 49, 13), rgb(142, 43, 11), rgb(138, 42, 10), rgb(138, 42, 10), rgb(138, 42, 10), rgb(138, 42, 10)"
            },
            // {
            //     name: "风场",
            //     type: "windField",
            //     visible: true,
            //     url: ""
            // }
        ]
    },
    {
        name: "风速风场融合",
        datas: [
            {
                name: "风速",
                type: "tile",
                visible: true,
                url: "http://172.15.8.6:4041/WeatherDATA/wind/WindSpeed_202008280000/{z}/{x}/{y}.png",
                legend: [0, 7.5, 15, 22.5, 30],
                ext: "风速（m/s）",
                colors: "rgb(98, 113, 184), rgb(88, 112, 179), rgb(81, 112, 175), rgb(77, 111, 172), rgb(72, 111, 169), rgb(68, 111, 167), rgb(62, 110, 163), rgb(63, 117, 164), rgb(64, 120, 165), rgb(65, 122, 165), rgb(68, 128, 166), rgb(70, 135, 168), rgb(73, 145, 170), rgb(74, 148, 165), rgb(74, 147, 161), rgb(74, 147, 156), rgb(74, 146, 151), rgb(74, 145, 144), rgb(75, 145, 139), rgb(76, 144, 133), rgb(77, 142, 125), rgb(77, 144, 121), rgb(77, 146, 118), rgb(77, 147, 112), rgb(77, 149, 109), rgb(77, 150, 107), rgb(77, 152, 104), rgb(77, 153, 99), rgb(76, 154, 96), rgb(76, 157, 90), rgb(76, 161, 84), rgb(76, 163, 78), rgb(77, 164, 76), rgb(79, 164, 74), rgb(83, 164, 70), rgb(85, 164, 68), rgb(90, 164, 65), rgb(92, 164, 63), rgb(95, 164, 61), rgb(97, 164, 58), rgb(102, 164, 55), rgb(108, 161, 55), rgb(113, 160, 56), rgb(119, 157, 57), rgb(126, 153, 58), rgb(133, 149, 59), rgb(139, 147, 60), rgb(144, 145, 61), rgb(148, 141, 61), rgb(154, 139, 63), rgb(157, 137, 63), rgb(162, 134, 64), rgb(162, 132, 67), rgb(162, 129, 69), rgb(162, 127, 71), rgb(162, 125, 74), rgb(162, 124, 76), rgb(162, 120, 79), rgb(162, 119, 82), rgb(162, 116, 85), rgb(162, 112, 90), rgb(161, 106, 92), rgb(159, 103, 92), rgb(157, 98, 92), rgb(154, 94, 92), rgb(151, 85, 92), rgb(149, 81, 92), rgb(148, 77, 92), rgb(145, 73, 92), rgb(144, 69, 92), rgb(142, 66, 92), rgb(142, 64, 94), rgb(142, 64, 97), rgb(143, 65, 100), rgb(144, 67, 108), rgb(146, 69, 118), rgb(147, 70, 122), rgb(147, 71, 125), rgb(148, 71, 128), rgb(149, 73, 134), rgb(150, 74, 141), rgb(151, 75, 144), rgb(149, 76, 146), rgb(147, 77, 146), rgb(143, 79, 148), rgb(142, 80, 148), rgb(140, 80, 148), rgb(139, 81, 149), rgb(138, 81, 149), rgb(136, 82, 150), rgb(135, 82, 150), rgb(133, 83, 150), rgb(132, 83, 150), rgb(130, 84, 151), rgb(128, 85, 152), rgb(126, 87, 153), rgb(122, 88, 153), rgb(121, 89, 153), rgb(119, 90, 154), rgb(116, 91, 154), rgb(112, 92, 155), rgb(106, 94, 156), rgb(101, 97, 158), rgb(95, 99, 159), rgb(95, 102, 160), rgb(94, 105, 160), rgb(94, 108, 160), rgb(94, 109, 160), rgb(94, 112, 160), rgb(93, 116, 160), rgb(93, 117, 160), rgb(93, 119, 160), rgb(93, 120, 161), rgb(93, 122, 161), rgb(93, 124, 161), rgb(92, 126, 161), rgb(92, 128, 161), rgb(92, 130, 161), rgb(92, 132, 161), rgb(91, 135, 161), rgb(91, 136, 161)"
            },
            {
                name: "风场",
                type: "windField",
                visible: true,
                url: "http://172.15.8.6:4041/WeatherDATA/wind/WindDirection_202008280000.json"
            }
        ]
    },
    {
        name: "海流融合场景",
        datas: [
            {
                name: "海流",
                type: "tile",
                visible: true,
                url: "http://172.15.8.6:4041/WeatherDATA/sea/SeaSpeed_202302251200/{z}/{x}/{y}.png",
                legend: [0, 0.4, 0.8, 1.4, 4],
                ext: "海流（m/s）",
                colors: "rgb(65, 78, 145), rgb(62, 108, 99), rgb(58, 139, 51), rgb(101, 127, 50), rgb(143, 116, 50), rgb(131, 88, 58), rgb(117, 54, 68), rgb(112, 60, 100), rgb(107, 67, 130), rgb(88, 94, 132), rgb(69, 122, 135), rgb(86, 127, 138), rgb(111, 134, 140), rgb(119, 137, 141), rgb(130, 141, 143), rgb(143, 144, 145), rgb(143, 144, 145), rgb(143, 144, 145)"
            },
            {
                name: "海流场",
                type: "oceanCurrent",
                visible: true,
                url: "http://172.15.8.6:4041/WeatherDATA/sea/SeaDirection_202302251200.json"
            }
        ]
    },
    {
        name: "海浪融合场景",
        datas: [
            {
                name: "海浪",
                type: "tile",
                visible: true,
                url: "http://172.15.8.6:4041/WeatherDATA/sea/SeawaveHight_202112191200/{z}/{x}/{y}.png",
                legend: [0, 0.4, 0.8, 1.4, 4],
                ext: "海浪（m/s）",
                colors: "rgb(65, 78, 145), rgb(62, 108, 99), rgb(58, 139, 51), rgb(101, 127, 50), rgb(143, 116, 50), rgb(131, 88, 58), rgb(117, 54, 68), rgb(112, 60, 100), rgb(107, 67, 130), rgb(88, 94, 132), rgb(69, 122, 135), rgb(86, 127, 138), rgb(111, 134, 140), rgb(119, 137, 141), rgb(130, 141, 143), rgb(143, 144, 145), rgb(143, 144, 145), rgb(143, 144, 145)"
            },
            {
                name: "海浪场",
                type: "oceanCurrent",
                visible: true,
                url: "http://172.15.8.6:4041/WeatherDATA/sea/SeawaveDirection_202112191200.json"
            }
        ]
    },
    {
        name: "海浪色斑图",
        datas: [
            {
                name: "海浪",
                type: "tile",
                visible: true,
                url: "http://172.15.8.6:4041/WeatherDATA/sea/SeawaveHight_202112191200/{z}/{x}/{y}.png",
                legend: [-30, -13, 5, 22, 40],
                ext: "温度（℃）",
                colors: "rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 136, 211), rgb(149, 143, 211), rgb(149, 158, 213), rgb(150, 173, 213), rgb(149, 192, 214), rgb(149, 207, 216), rgb(145, 207, 211), rgb(140, 206, 208), rgb(135, 205, 203), rgb(131, 204, 199), rgb(125, 200, 196), rgb(120, 195, 194), rgb(114, 190, 191), rgb(109, 185, 189), rgb(103, 180, 187), rgb(100, 170, 188), rgb(98, 162, 191), rgb(97, 155, 193), rgb(95, 148, 196), rgb(92, 143, 185), rgb(89, 142, 155), rgb(86, 141, 119), rgb(82, 140, 90), rgb(79, 139, 62), rgb(88, 140, 54), rgb(96, 142, 48), rgb(108, 143, 37), rgb(116, 145, 31), rgb(126, 147, 26), rgb(136, 150, 23), rgb(148, 153, 20), rgb(158, 157, 17), rgb(171, 160, 14), rgb(182, 164, 12), rgb(194, 167, 11), rgb(205, 172, 9), rgb(215, 175, 7), rgb(225, 173, 6), rgb(229, 167, 6), rgb(233, 161, 6), rgb(237, 156, 6), rgb(242, 150, 6), rgb(241, 138, 9), rgb(239, 123, 13), rgb(238, 111, 16), rgb(237, 99, 18), rgb(230, 90, 20), rgb(221, 84, 19), rgb(208, 76, 18), rgb(199, 70, 17), rgb(188, 64, 17), rgb(177, 59, 16), rgb(166, 54, 14), rgb(155, 49, 13), rgb(142, 43, 11), rgb(138, 42, 10), rgb(138, 42, 10), rgb(138, 42, 10), rgb(138, 42, 10)"
            },
            // {
            //     name: "风场",
            //     type: "windField",
            //     visible: true,
            //     url: ""
            // }
        ]
    },
]

const HDImage = [
    {
        name: "永兴岛",
        lng: 112.33,
        lat: 16.83
    },
    {
        name: "横须贺海军基地",
        lng: 139.66,
        lat: 35.29
    },
    {
        name: "嘉手纳空军基地",
        lng: 127.76,
        lat: 26.35
    },
    // {
    //     name: "岩国空军基地",
    //     lng: 132.24,
    //     lat: 34.14
    // },
    {
        name: "关岛基地",
        lng: 144.66,
        lat: 13.43
    },
    {
        name: "苏比克基地",
        lng: 120.27,
        lat: 14.80
    },
    // {
    //     name: "佐世保海军基地",
    //     lng: 129.70,
    //     lat: 33.15
    // },
    // {
    //     name: "安德森空军基地",
    //     lng: 144.93,
    //     lat: 13.57
    // },
    {
        name: "与那国岛",
        lng: 122.97,
        lat: 24.45
    },
    // {
    //     name: "韩国萨德",
    //     lng: 128.22,
    //     lat: 36.045
    // },
    // {
    //     name: "赣州黄金机场",
    //     lng: 114.78,
    //     lat: 25.85
    // },
    // {
    //     name: "广州汕头机场",
    //     lng: 116.760278,
    //     lat: 23.425
    // },
    // {
    //     name: "福州义序机场",
    //     lng: 119.329814,
    //     lat: 26.012482
    // },
]

const terrainTW = 'http://172.15.8.6:4041/terrain/';

const basicVectorData = {
    _4H2BUrl: 'static/geojson/4H2B.geojson',
    daolian1: 'static/geojson/firstIslandLain.geojson',
    daolian2: 'static/geojson/secondIslandLain.geojson',
    daolian3: 'static/geojson/thirdIslandLain.geojson'
}
