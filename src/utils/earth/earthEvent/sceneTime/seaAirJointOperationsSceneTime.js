import store from '@/store'

export default function () {
  const getSceneTime = (time) => {
    let startTime = new Date('2027/09/12 10:00:00').getTime()
    startTime += time.T * 1000
    store.commit('setMsgMessionTime', getSpeTime(startTime))
    window.EarthViewer.clock.multiplier = time.R
    store.state.sceneModule.multiplier = time.R
  }
  // 毫秒转日期
  const getSpeTime = (timeStr) => {
    let time = new Date(timeStr)
    var year = time.getFullYear()
    var month =
      time.getMonth() + 1 < 10
        ? '0' + (time.getMonth() + 1)
        : time.getMonth() + 1
    var date = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
    var hours = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
    var minutes =
      time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
    var seconds =
      time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds()
    return (
      year +
      '-' +
      month +
      '-' +
      date +
      ' ' +
      hours +
      ':' +
      minutes +
      ':' +
      seconds
    )
  }
  return { getSceneTime }
}
