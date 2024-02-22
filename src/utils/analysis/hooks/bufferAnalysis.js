/**
 * 缓冲区分析
 */
import { useStore } from 'vuex'
import {
  reactive,
  toRefs,
  ref,
  onUnmounted,
  onMounted,
  watch,
  getCurrentInstance
} from 'vue'
import * as turf from '@turf/turf'
import slopeAspect from './analysis/slopeAspect'
import CreatePolygonOnGround from './analysis/CreatePolygonOnGround'
import CreateRemindertip from './analysis/reminderTip'

export default function () {
  const instance = getCurrentInstance()
  const _ = instance.appContext.config.globalProperties

  const Cesium = window.XEarth
  const viewer = window.EarthViewer

  let bufferCollection = []
  let positions1 = []

  /**
   * 点缓冲区
   * @param {*} position 例：[-75.343, 39.984]
   * @param {*} radius 半径km
   * @param {*} callback 回调
   */
  const buffer4Point = (position, radius, callback) => {
    const point = turf.point(position)
    calculateBuffer(point, radius, callback)
  }
  /**
   * 线缓冲区
   * @param {*} positions 例：[[-24, 63], [-23, 60], [-25, 65], [-20, 69]]
   * @param {*} radius 半径km
   * @param {*} callback 回调
   */
  const buffer4Polyline = (positions, radius, callback) => {
    const lineString = turf.lineString(positions)
    calculateBuffer(lineString, radius, callback)
  }
  /**
   * 面缓冲区
   * @param {*} positions 例：[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]
   * @param {*} radius 半径km
   * @param {*} callback 回调
   */
  const buffer4Polygon = (positions, radius, callback) => {
    positions1 = [positions]
    const polygon = turf.polygon(positions1)
    calculateBuffer(polygon, radius, callback)
  }
  /**
   * 执行buffer计算
   * @param {*} data geojson数据
   * @param {*} radius 半径
   * @param {*} callback 回调
   */
  const calculateBuffer = (data, radius, callback) => {
    const buffer = turf.buffer(data, radius)
    const coordinates = buffer ? buffer.geometry.coordinates[0] : []
    const degreesArray = translateDegreesArray(coordinates)
    const bufferEntity = viewer.entities.add({
      polyline: {
        positions: window.XEarth.Cartesian3.fromDegreesArray(degreesArray),
        width: 2,
        material: window.XEarth.Color.ORANGE
      },
      polygon: {
        hierarchy: new window.XEarth.PolygonHierarchy(
          window.XEarth.Cartesian3.fromDegreesArray(degreesArray)
        ),
        heightReference: window.XEarth.HeightReference.CLAMP_TO_GROUND,
        material: window.XEarth.Color.ORANGE.withAlpha(0.4)
      }
    })
    const bufferItem = {
      type: 'PolylineBuffer',
      geojson: buffer,
      degreesArray: degreesArray,
      entity: bufferEntity
    }
    bufferCollection.push(bufferItem)
    if (callback && typeof callback === 'function') {
      callback(bufferItem)
    }
  }
  const translateDegreesArray = (arr) => {
    const result = []
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index]
      result.push(element[0], element[1])
    }
    return result
  }
  /**
   * 移除所有缓冲区结果
   */
  const removeAll = () => {
    bufferCollection.forEach((element) => {
      viewer.entities.remove(element.entity)
    })
    bufferCollection = []
  }

  return {}
}
