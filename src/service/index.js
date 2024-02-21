import http from './http'
// const { sceneUrl, roomNodeUrl, roomHubUrl } = window.server
const sceneUrl = ''
const roomNodeUrl = ''
const roomHubUrl = ''

// 获取场景配置
export const selectScene = (id) => {
  return http({
    method: 'get',
    url: `${sceneUrl}/SBS-SCENE/scene/v2/selectSceneConfigurationByBId?bId=${id}`
  })
}

//根据bId获取场景基本信息
export const selectSceneRecord = (id) => {
  return http({
    method: 'get',
    url: `${sceneUrl}/SBS-SCENE/scene/v1/selectSceneRecordMgtByBID?bId=${id}`
  })
}

// 获取场景树级列表
export const getSceneList = (sceneBId) => {
  return http({
    method: 'get',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/room/v1/getRoomTreeList?sceneBId=${sceneBId}`
  })
}

// 加载场景到房间
export const loadSceneToRoom = (params) => {
  return http({
    method: 'post',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/room/v1/loadSceneToRoom`,
    data: params
  })
}

// 获取当前房间里场景的信息
export const getRoomSceneInfo = (sceneBId) => {
  return http({
    method: 'get',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/room/v1/getRoomSceneInfo?sceneBId=${sceneBId}`
  })
}

// 获取房间的基本信息
export const getRoomInfo = (params) => {
  return http({
    method: 'get',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/room/v1/getRoomInfo`
  })
}

// 初始化房间里的场景
export const initializeScene = (params) => {
  return http({
    method: 'post',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/room/v1/initializeScene`,
    data: params
  })
}

// 激活推演
export const activeDeduction = (params) => {
  return http({
    method: 'post',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/room/v1/activeDeduction`,
    data: params
  })
}

// 终止推演
export const terminateDeduction = (params) => {
  return http({
    method: 'post',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/room/v1/terminateDeduction`,
    data: params
  })
}

// // 激活时间
// export const activeTime = () => {
//     return http({
//         method: "post",
//         url: `${roomNodeUrl}/SBS-ROOM-NODE/time/v1/activeTime`,
//     })
// }

// // 终止时间
// export const terminateTime = () => {
//     return http({
//         method: "post",
//         url: `${roomNodeUrl}/SBS-ROOM-NODE/time/v1/terminateTime`,
//     })
// }

// 更新当前场景时间
export const updateTime = (params) => {
  return http({
    method: 'put',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/time/v1/updateTime?newTime=${params.time}&sceneBId=${params.sceneBId}`
  })
}

// 更新当前场景时间流速
export const updateTimeSpeed = (params) => {
  return http({
    method: 'put',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/time/v1/updateTimeSpeed?timeSpeed=${params.speed}&sceneBId=${params.sceneBId}`
  })
}

// 获取当前场景时间
export const getCurrentTime = (params) => {
  return http({
    method: 'post',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/time/v1/getCurrentTime`,
    data: params
  })
}

// 根据类型创建WS对象
export const createWS = (key) => {
  let url = roomNodeUrl.replace('https', 'ws')
  return new WebSocket(`${url}/SBS-ROOM-NODE/ws/${key}`)
}

// 获取房间列表
export const getRoomList = () => {
  return http({
    method: 'get',
    url: `${roomHubUrl}/SBS-ROOM-HUB/room/config/v1/getRoomList`
  })
}

// 获取所有场景列表
export const selectAllScene = (params) => {
  return http({
    method: 'get',
    // url: `${sceneUrl}/SBS-SCENE/scene/v1/selectAll`,
    url: `/scene/scene/v1/selectSceneRecordList`
  })
}

// 资源库菜单栏
export const getSourceMenu = (params) => {
  return http({
    method: 'get',
    url:
      `${sceneUrl}/SBS-SCENE/actor/menu/v1/getMenuTreeList` +
      '?menuCode=' +
      params.menuCode +
      '&menuName=' +
      params.menuName
  })
}

// 根据bId获取资源详情
export const getActorCfg = (id) => {
  return http({
    method: 'get',
    url: `${sceneUrl}/SBS-SCENE/actor/type/v1/getSceneActorCfgsListByBId?bId=${id}`
  })
}

//获取台风数据
export const getTyphoonData = (url) => {
  return http({
    method: 'get',
    url: url
  })
}

// 获取房间事件列表
export const getEvent = () => {
  return http({
    method: 'get',
    url: `${roomNodeUrl}/SBS-ROOM-NODE/Event/v1/getEventInfoList`
  })
}
