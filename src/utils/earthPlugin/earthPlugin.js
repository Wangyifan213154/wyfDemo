export const VERSION = '1.0'
// 图层树结构管理
export { default as treeManagement } from './core/treeManagement.js'
// // 基础二三维影像、矢量等的数据加载
export { default as dataManagement } from './core/layer.js'
// // 场景动作
export { default as sceneAction } from './core/sceneAction.js'
// 仿真数据流操控
// 后处理效果合集
export { default as postRender } from './renderer/postRender/postRender.js'
// 基于earth的扩展功能，例如天空盒等
export { default as extend } from './renderer/extend/extend.js'
