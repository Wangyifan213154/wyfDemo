class CZMLProcess {
  constructor(options) {
    this.Earth = options.Earth || window.MSIMEarth // 初始化Earth对象
    this.viewer = options.viewer || window.EarthViewer // 初始化viewer对象
    this.czmlDataSourceName = undefined
  }
  /**
   * 初始化czml容器并添加到场景 之后许多操作可以直接通过该对象实现
   */
  initCZMLDataSource(datasourceNmae) {
    // 判断当前场景中是否已经存在该容器，如果存在则先卸载
    // 初始化容器
    let czmlDataSource
    if (typeof datasourceNmae === 'undefined') {
      czmlDataSource = new this.Earth.CzmlDataSource()
    } else {
      this.czmlDataSourceName = datasourceNmae
      czmlDataSource = new this.Earth.CzmlDataSource(datasourceNmae)
    }
    // 空容器添加到场景当中
    this.viewer.dataSources.add(czmlDataSource)
  }
  /**
   * 激活czml process功能
   * @param {*} czmlName czml名称 eg. PursuitFighter
   */
  czmlProcess(datasource) {
    // 判断并插入新数据
    const targetCZMLDS = this.viewer.dataSources.getByName(
      this.czmlDataSourceName
    )
    if (this.Earth.defined(targetCZMLDS)) {
      const dsContainer = targetCZMLDS[0]
      if (dsContainer) {
        dsContainer.process(datasource)
      } else {
        console.log(`请确保场景内czml数据集存在`)
      }
    } else {
      console.log(`请确保场景内czml数据集存在`)
    }
  }
}

export default CZMLProcess
