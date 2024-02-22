/**
 * 动作管理工具. 包括球上各类目标的动作，如卫星、飞机、地面目标等
 * @param
 */
import satelliteActorCZML from './actionController/satelliteActorCZML'
import ConnectLine from './actionController/connectLineController'
import GroundObjectManage from './actionController/groundObjectManage'
import SatelliteSixActController from './actionController/satelliteSixActController'
import PlaneCzmlManage from './actionController/planeCzmlManage'
import EnvironmentController from './actionController/environmentController'
import SatelliteSimulateController from './actionController/satelliteSimulateController'
import cloudEffect from './actionController/cloudLayer'
import emitter from '@/utils/eventbus'
export default class SceneAction {
  satelliteActorCZML = undefined
  groundObjectManage = undefined
  connectLineManagement = undefined
  satelliteSixActController = undefined
  planeCzmlManage = undefined
  environmentController = undefined
  cloudEffect = undefined
  satelliteSimulateController = undefined
  constructor(options) {
    this.earth = options.earth || window.MSIMEarth // 初始化Earth对象
    this.viewer = options.viewer || window.EarthViewer // 初始化viewer对象
    this.initSceneAction() // 按需初始化工具
  }
  /**
   * 按需求初始化场景动作管理工具
   */
  initSceneAction() {
    this.getSatelliteActorCZML()
    this.getGroundObjectManage()
    this.getConnectLineManagement()
    this.getSatelliteSixActController()
    this.getPlaneCzmlManage()
    this.getEnvironmentController()
    this.getCloudEffect()
    this.getSatelliteSimulateController()
  }
  getSatelliteActorCZML() {
    const option = {
      viewer: this.viewer,
      earth: this.earth
    }
    this.satelliteActorCZML = new satelliteActorCZML(option)
  }
  getGroundObjectManage() {
    const option = {
      viewer: this.viewer,
      earth: this.earth
    }
    this.groundObjectManage = new GroundObjectManage(option)
  }
  getConnectLineManagement() {
    const option = {
      viewer: this.viewer,
      earth: this.earth
    }
    this.connectLineManagement = new ConnectLine(option)
  }
  getSatelliteSixActController() {
    const option = {
      viewer: this.viewer,
      earth: this.earth
    }
    this.satelliteSixActController = new SatelliteSixActController(option)
  }
  getPlaneCzmlManage() {
    const option = {
      viewer: this.viewer,
      earth: this.earth
    }
    this.planeCzmlManage = new PlaneCzmlManage(option)
  }
  getEnvironmentController() {
    const option = {
      viewer: this.viewer,
      earth: this.earth
    }
    this.environmentController = new EnvironmentController(option)
  }
  getCloudEffect() {
    const option = {
      viewer: this.viewer,
      earth: this.earth
    }
    this.cloudEffect = new cloudEffect(option)
  }
  getSatelliteSimulateController() {
    const option = {
      viewer: this.viewer,
      earth: this.earth
    }
    this.satelliteSimulateController = new SatelliteSimulateController(option)
  }
  clearScene() {
    emitter.emit('isShowTree', false)
    window.EarthViewer.scene.postProcessStages.fxaa.enabled = false
    window.EarthViewer.scene.globe.material = null
    window.EarthViewer.scene.globe.depthTestAgainstTerrain = false //关闭深度
    window.EarthViewer.scene.postProcessStages.removeAll()
    window.EarthViewer.entities.removeAll()
    console.log(window.EarthViewer.dataSources);
    // window.EarthViewer.dataSources.removeAll()
    const ds = window.EarthViewer.dataSources
    for (let index = 0; index < ds.length; index++) {
      const element = ds[index];
      window.EarthViewer.dataSources.remove(element)
    }
  }
}
