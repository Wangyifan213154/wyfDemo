let ExtendEarth;
/**
 * 文件内用于配置球体上的各种配置参数以及构建图元的参数等
 */
// 辉光效果初始参数配置
const viewModel = {
    show: true,
    glowOnly: false,
    contrast: 128,
    brightness: 0.1,
    delta: 2.0,
    sigma: 2.78,
    stepSize: 1.0,
};

// 通用特效 管理
const commonSpecialEffects = {
    specialEffectsID: [],
    japanRailwayShow: false,
    tokyo: {
        tokyoShow: false,
        tokyoEntityHeight: 154,
        tokyoEntityMaxHeight: 18311,
        tokyoEntityMinHeight: 154,
        upSpeed: 160,
        downSpeed: 150,
        tokyoPosition: { lng: 139.75065875870678, lat: 35.686779711557044 },
        orientation: {
            lng: 139.75065875870678, lat: 35.686779711557044,
            altitude: 451
        },
        updateHeightControl: true,
        mainTarget: {
            level1: [
                { x: 140.472532, y: 36.372522, name: '水户', index: 0 },
                { x: 138.683395, y: 35.696336, name: '山梨', index: 1 },
                { x: 139.64063, y: 35.44126, name: '横滨', index: 2 },
                { x: 139.649828, y: 35.863591, name: '埼玉', index: 3 },
                { x: 139.87462, y: 36.924753, name: '枥木县', index: 4 },
            ],
            level2: [
                { x: 137.816998, y: 35.304224, name: '阿南市', index: 21 },
                { x: 138.368916, y: 35.402198, name: '早川町', index: 22 },
                { x: 139.274983, y: 36.194705, name: '深谷市', index: 23 },
                { x: 140.139656, y: 35.854231, name: '利根町', index: 24 },
                { x: 139.739515, y: 36.241294, name: '野木町', index: 25 },
                { x: 138.805852, y: 35.479362, name: '富士吉田市', index: 26 },
                { x: 139.111707, y: 35.625955, name: '上野原市', index: 27 },
            ],
            mainTargetShow: false,
            updateHeightControl: true,
            targetEntityHeight: 150,
            targetEntityMaxHeight: 500,
            targetEntityMinHeight: 100,
            upSpeed: 1.2,
            downSpeed: 1.5,
        }
    },
    tokyoShow: false,
    flyNumShow: false,
}

// 知识图谱实体相关参数，例如id property等的初始值。
const knowledgeGraphEntitiesManageObj = {
    knowledgeNode: {
        EllipsoidRaise: true,
        EllipsoidInitHeight: 100,
        level1EllipsoidEntitiesID: [],
        level2EllipsoidEntitiesID: [],
        level3EllipsoidEntitiesID: [],
        level1: {
            EllipsoidRaise: true,
            EllipsoidInitHeight: 100,
            maxHeight: 1700,
            minHeight: 0,
            level: 1,
            entityIdSuffix: 'level1_node',
            userDefineColor: [0.0, 1.0, 0.4, 1.0],
            maxVisibleHeight: 3500000,
            maxRaddi: 20000,
            minRaddi: 1000,
            heightRadio: 100,
            moveSpeed: 1,
            mixRatio: 1.0,
            isShow: true,
        },
        level2: {
            EllipsoidRaise: true,
            EllipsoidInitHeight: 100,
            maxHeight: 1300,
            minHeight: 0,
            level: 2,
            entityIdSuffix: 'level2_node',
            userDefineColor: [1.0, 1.0, 0.6, 1.0],
            maxVisibleHeight: 3500000,
            maxRaddi: 20000,
            minRaddi: 1000,
            heightRadio: 100,
            moveSpeed: 1,
            mixRatio: 1.0,
            isShow: true,
        },
        level3: {
            EllipsoidRaise: true,
            EllipsoidInitHeight: 100,
            maxHeight: 1900,
            minHeight: 0,
            level: 3,
            entityIdSuffix: 'level3_node',
            userDefineColor: [0.8, 0.9, 1.0, 1.0],
            maxVisibleHeight: 3500000,
            maxRaddi: 20000,
            minRaddi: 1000,
            heightRadio: 100,
            moveSpeed: 1,
            mixRatio: 1.0,
            isShow: true,
        },
        hprd: {
            heading: 30.0,
            pitch: -20,
            range: 135000
        }
    },
    flowLine: {
        RelationLineLevel1ID: [],
        RelationLineLevel2ID: [],
        level1: {
            ArcRatio: 0.3,
            lineWidth: 10,
            mixRatio: 1.0,
            flowSpeed: 3.0,
            userDefineColor: [1.0, 1.0, 0.6, 1.0],
            imageUrl: '../static/image/earthImg/green_line_1.png',
            level: 1,
            maxVisibleHeight: 3500000,
            entityIdSuffix: 'level1',
            isShow: true,
        },
        level2: {
            ArcRatio: 0.3,
            lineWidth: 8,
            mixRatio: 1.0,
            flowSpeed: 3.0,
            userDefineColor: [0.8, 0.9, 1.0, 1.0],
            imageUrl: '../static/image/earthImg/green_line_1.png',
            level: 2,
            maxVisibleHeight: 3500000,
            entityIdSuffix: 'level2',
            isShow: true,
        }
    },
}

const starlink = {
    time: 0,
    IDCol: ['emit-signal-ship', 'ship_signal', 'starlink_Satellite', 'parallel_Signal', 'distance_line','ground_Signal'],
    ship: {
        id: 'emit-signal-ship',
        signalId: 'ship_signal',
        position: [154.5075604536446,
            15.371539094425964,
            14000],
        positionC3: {
            x: -8112874.1924505215,
            y: 7772914.974606924,
            z: -2956670.123172411
        },
        heading: 0.018127819385393096,
        pitch: -1.398322852891222,
        roll: 6.275640330729831,
        heading2: 0.6867874970431398,
        pitch2: -0.26853408129002854,
        roll2: 6.27958733098933,
        cylinderHeight: 225000, // cylinder的坐标高度
    },
    parallelSignal: {
        id: 'parallel_Signal',
        show: true
    },
    groundSignal: {
        id: 'ground_Signal',
        show: true
    },
    distanceLine: {
        id: 'distance_line'
    },
    starlinkSatellite: {
        id: 'starlink_Satellite',
        position: [137.816998, 35.304224, 14000],
        satelliteHeight: 49000, // cylinder的坐标高度
        scale: 16.0,
        lightColor: [30.0, 30.0, 30.0],
        lightColorTarget: [10.0, 10.0, 10.0],
        uri: 'static/data/gltf/wxModel/XL_tt.gltf',
        // 发射信号后镜头接近视角参数
        afterSignalHPR: {
            heading: 0.7705395992154669,
            pitch: -0.5985964930816015,
            roll: 6.2796173550744765,
            position: {
                lng: 137.602,
                lat: 35.130,
                height: 62135.364
            }
        }
    },
    JMSStation: {
        lng: 0,
        lat: 0
    }
}

const importantPosition = [
  {
    name: '嘉手纳空军基地',
    position: [128.31984455428437, 26.282818023248776],
    id: '嘉手纳'
  },
  {
    name: '岩国空军基地',
    position: [132.6316300870419, 33.401534257136305],
    id: '岩国'
  },
  {
    name: '安德森空军基地',
    position: [145.6012902323775, 14.979268448802111],
    id: '安德森'
  },
  { name: '佐世保海军基地', position: [129.7151101, 33.1799153], id: '佐世保' },
  { name: '横须贺海军基地', position: [139.6722005, 35.2813412], id: '横须贺海军基地' },
  { name: '苏比克基地', position: [120.2397336, 14.7910576], id: '苏比克基地' },
  { name: '关岛基地', position: [144.716667, 13.433333], id: '关岛基地' },
  {name:'西沙群岛',position:[111.773241,16.208191],id:'西沙群岛'},
  {name:'南沙群岛',position:[113.54474,9.396571],id:'南沙群岛'},
  {name:'台北',position:[121.574539,25.040524],id:'台北'},
  {name:'高雄',position:[120.320648,22.622666],id:'高雄'},
  {name:'上海',position:[121.476228,31.235435],id:'上海'},
  {name:'杭州',position:[120.157273,30.270166],id:'杭州'},
  {name:'宁波',position:[121.555467,29.886139],id:'宁波'},
  {name:'舟山',position:[122.236167,29.998302],id:'舟山'},
  {name:'台州',position:[121.426686,28.643981],id:'台州'},
  {name:'温州',position:[120.727589,28.009071],id:'温州'},
  {name:'福州',position:[119.310997,26.081745],id:'福州'},
  {name:'泉州',position:[118.685489,24.879374],id:'泉州'},
  {name:'泉州',position:[118.685489,24.879374],id:'泉州'},
  {name:'厦门',position:[118.096435,24.484882],id:'厦门'},
  {name:'深圳',position:[114.086165,22.669919],id:'深圳'},
  {name:'深圳',position:[114.086165,22.669919],id:'深圳'},
  {name:'香港',position:[114.205747,22.276641],id:'香港'},
  {name:'澳门',position:[113.561842,22.165293],id:'澳门'},
]

const threeClassNodes= []
