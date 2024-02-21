import http from './http'
// const { sceneUrl, roomNodeUrl, roomHubUrl } = window.server
const voiceUrl = path.voicePath

// 录音接口
export const parseVoice = (data) => {
  return http({
    method: 'post',
    url: `${voiceUrl}/voiceAi/v3/parseVoiceReply`,
    data: data
  })
}

export const parseVoice2 = (data) => {
  return http({
    method: 'post',
    url: `${voiceUrl}/voiceAi/v3/parseVoice`,
    data: data
  })
}
// 录音接口
export const speech = (data) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8400/text2speech_well`,
    params: data
  })
}

// 设置时间流速为几倍速
// export const sendsMessage = (data) => {
//   return http({
//     method: 'get',
//     url: `http://172.15.8.6:8503/spee-message/spee/sendsMessage`,
//     params: data
//   })
// }

// 设置时间流速为几倍速新接口
export const sendsMessage = (data) => {
  return http({
    method: 'put',
    url: `http://172.15.8.6:8503/time/v1/updateTimeSpeed`,
    data: data
  })
}
//激活时间接口
export const updateTimeSpeed = (data) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8503/time/v1/activeTime`,
    params: data
  })
}
// 发送请求，websocket接收时间
export const getCurrentTime = (data) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8503/time/v1/getCurrentTime`,
    params: data
  })
}
//终止时间接口
export const terminateTime = (data) => {
  return http({
    method: 'post',
    url: `http://172.15.8.6:8503/time/v1/terminateTime`,
    data: data
  })
}
// 1回复我是智能作战参谋小慧
export const sendMessage = (data) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8503/fligh-message/fligh/sendMessage`,
    params: data
  })
}

// 2回复获取完毕
export const sendMessage2 = (data) => {
  return http({
    method: 'get',
    // url: `http://172.15.8.6:8503/fligh-message/fligh/sendMessage2`,
    url: path.sendM,
    params: data
  })
}

// 3回复您可以继续查看其他信息
export const sendMessage3 = (data) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8503/fligh-message/fligh/sendMessage3`,
    params: data
  })
}

// 4回复您是否需要进一步查看具体机场的情况
export const sendMessage4 = (data) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8503/fligh-message/fligh/sendMessage4`,
    params: data
  })
}

// 5回复首先给您展示台湾及周边地区机场的相关情况。
export const sendMessage5 = (data) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8503/fligh-message/fligh/sendMessage5`,
    params: data
  })
}

// 6回复您可以选择起飞和降落机场，我们将根据您提供的信息规划飞行路线
export const sendMessage6 = (data) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8503/fligh-message/fligh/sendMessage6`,
    params: data
  })
}

// 7回复分析完毕
export const sendMessage7 = (data) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8503/fligh-message/fligh/sendMessage7`,
    params: data
  })
}

// 接收json类型的指令
export const messageService2 = (data) => {
  return http({
    method: 'post',
    url: `http://${path.messageService}:8503/InstructMessageController/InstructUse/messageService2`,
    data: data
  })
}

// 指令直接使用
export const messageService1 = (params) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8503//InstructMessageController/InstructUse/messageService1`,
    params
  })
}

// 合成语音
export const createVoice = (params) => {
  return http({
    method: 'get',
    url: `http://172.15.8.6:8400/text2speech_well`,
    params
  })
}
