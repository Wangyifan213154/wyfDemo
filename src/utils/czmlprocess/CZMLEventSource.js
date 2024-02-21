import CZMLProcess from './czml/czmlProcess'

class CZMLEventSource {
  constructor(options) {
    this.Earth = options.Earth || window.MSIMEarth // 初始化Earth对象
    this.viewer = options.viewer || window.EarthViewer // 初始化viewer对象
    window.czmlProcess = new CZMLProcess({
      Earth: this.Earth,
      viewer: this.viewer
    })
    this.czmlEventSource = undefined // sourceEvent 容器 需要考虑是否放在vuex或者挂载到window下
  }
  /**
   * 初始化数据流，和后端建立初始连接
   * @param {*} baseUrl baseUrl为ds连接路径
   */
  initStream(baseUrl) {
    const newDate = new Date().getTime()
    this.czmlEventSource = new EventSource(baseUrl + newDate)
    // 连接刚被打开,收到 open 事件。
    this.czmlEventSource.onopen = function () {
      console.log('Connection to server opened.')
    }
    /*
     * “message”事件是一个特例，因为它可以捕获没有 event 字段的事件，
     * 以及具有特定类型 `event：message` 的事件。
     * 它不会触发任何其他类型的事件。
     */
    // this.czmlEventSource.addEventListener('message', (e) => {
    //   console.log(e.data)
    // })
    // 发生错误
    this.czmlEventSource.onerror = function () {
      console.log('EventSource failed.')
    }
  }
  /**
   * 重启数据流
   * @param {*} params
   */
  restartStream(baseUrl) {
    // 判断数据流容器当前状态
    if (this.czmlEventSource) {
      // 关闭当前数据流
      this.czmlEventSource.close()
      // 重启数据流
      this.initStream(baseUrl)
    }
  }
  /**
   * 关闭数据流
   */
  closeStream() {
    // 判断数据流容器当前状态
    if (this.czmlEventSource) {
      // 关闭当前数据流
      this.czmlEventSource.close()
    }
  }
  /**
   *
   * @param {string} eventName 监听的事件名称
   * @param {number} val 事件延迟数值
   */
  addEventListener(eventName, val) {
    let that = this
    let sjtb = true //时间同步控制
    let time = 0 // 默认同步的时间为0
    switch (eventName) {
      case 'czml':
        if (typeof val !== 'number' || typeof val === 'undefined') {
          console.log('输入的时间差不是number类型,默认修改为0.4s')
          val = 0.5
        }
        console.log(eventName)
        this.czmlEventSource.addEventListener(eventName, (e) => {
          try {
            // 格式转换
            let json = JSON.parse(e.data)
            // console.log(json)
            // 基于第一条数据判断时间同步插值
            if (json && json[0]) {
              if (sjtb) {
                console.log(
                  `当前时间差是${json[1].position.cartographicDegrees[0]}`
                )
                time = json[1].position.cartographicDegrees[0]
                sjtb = false
              }
              // 修正时间，保证任何时刻打开场景都能立即执行（前提是后台和仿真端正常执行中）
              json[1].position.cartographicDegrees[0] -= time - val
              json[1].path.show = false
              json[0].name = json[1].name
              let czmlcontainer = that.viewer.dataSources.getByName(
                json[1].name
              )
              if (
                czmlcontainer.length === 0 &&
                typeof czmlcontainer.clock === 'undefined'
              ) {
                czmlcontainer = new that.Earth.CzmlDataSource(json[1].name)
                that.viewer.dataSources.add(czmlcontainer)
                czmlcontainer.process(json)
              } else {
                czmlcontainer[0].process(json)
              }
              // json[1].model.scale = 300
              // console.log(json)
              // 修改样式
              // that.modifyMaterial(json)
              // 数据流推入到场景中
              // window.czmlProcess.czmlProcess(json)
            }
          } catch (t) {
            console.error(t)
          }
        })
        break
      case 'state':
        // 状态信息
        console.log(eventName, val)
        break
      default:
        break
    }
  }
  createCZMLDataSource(datasourceName) {
    if (window.czmlProcess) {
      window.czmlProcess.initCZMLDataSource(datasourceName)
    }
  }
  updateCZML(datasource) {
    if (window.czmlProcess) {
      window.czmlProcess.czmlProcess(datasource)
    }
  }
  /**
   * 修改当前传过来的数据内实体的样式，后期可联合后台统一修改
   * @param {*} ddatasource
   */
  modifyMaterial(datasource) {
    let that = this
    if (datasource) {
      if (datasource[1] || datasource[1].path) {
        datasource[1].path.materail = new that.Earth.FlowLineMaterialProperty({
          transparent: true,
          //mixColor: new window.XEarth.Color(1.0, 1.0, 0.0, 1.0),
          // mixColor: window.XEarth.Color.AQUAMARINE,
          mixColor: new that.Earth.Color(45 / 255, 225 / 255, 244 / 255),
          mixRatio: 0.5,
          flowSpeed: -2.0,
          repeat: new that.Earth.Cartesian2(10, 10),
          image: require('@/assets/image/knowleadge/materialline.png')
        })
        datasource[1].path.width = 0.5
        datasource[1].box = {
          plane: new that.Earth.Plane(that.Earth.Cartesian3.UNIT_Z, 0.0),
          dimensions: new that.Earth.Cartesian3(400000.0, 300000.0, 500000.0),
          material: that.Earth.Color.RED.withAlpha(0.5),
          outline: true,
          outlineColor: that.Earth.Color.BLACK
        }
      }
    } else {
      console.log('请输入被修改数据')
    }
  }
}

export default CZMLEventSource
