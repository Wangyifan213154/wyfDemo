import axios from 'axios'

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    error.response.data = {
      error: error.response.statusText
    }
    return Promise.reject(error.response)
  }
)

// 请求方法
function http(params) {
  let CancelToken = axios.CancelToken
  let options = {
    cancelToken: new CancelToken(function (cancel) {
      params.cancel = cancel
    })
  }
  options = {
    ...options,
    ...params
  }
  return new Promise((resolve, reject) => {
    axios(options)
      .then((response) => {
        if (response.data.code && response.data.code !== 200) {
          resolve({
            error: response.data.message || ''
          })
        } else {
          resolve(response.data)
        }
      })
      .catch((error) => {
        resolve({
          error: error.data || ''
        })
      })
  })
}

export default http
