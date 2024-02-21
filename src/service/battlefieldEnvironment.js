// 战场环境图层

// import http from './request/http'
import http from './http'
// import { BASE_URL_DATAFUSION } from './request/config'

// 民航数据
export const getMinHangJSON = () => {
  return http({
    method: 'get',
    url: `/static/data/geojson/minhang1.json`
  })
}
// 空间盒
// export const getSpaceBoxData = (data) => {
//   return http({
//     method: 'post',
//     url: `${BASE_URL_DATAFUSION}/fusion-data-index/gridCode/getBoundsIntelligent3D`,
//     data
//   })
// }
