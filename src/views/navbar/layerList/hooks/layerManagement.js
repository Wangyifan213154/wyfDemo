import store from '@/store'

class LayerManagement {
  constructor(options) {
    this.Earth = options.Earth || window.MSIMEarth // 初始化Earth对象
    this.viewer = options.viewer || window.EarthViewer // 初始化viewer对象
  }
  // 改变勾选状态
  updateTree(code, type) {
    store.state.sceneModule.layerManagementData.forEach((item) => {
      check(item.childList, type)
    })
    function check(childList, type) {
      childList.forEach((i) => {
        if (i.code == code) {
          i.checked = type == 'add' ? true : false
        }
        if (i.childList) {
          check(i.childList, type)
        } else {
          return
        }
      })
    }
  }
  // 添加节点
  addTreeNode(val, parentName) {
    add(store.state.sceneModule.layerManagementData, val, parentName)
    function add(treeData, val, parentName) {
      treeData.forEach((item) => {
        if (item.name == parentName) {
          item.childList.push(val)
          return
        }
        if (item.childList) {
          add(item.childList, val, parentName)
        } else {
          return
        }
      })
    }
    store.commit(
      'setLayerManagementData',
      JSON.parse(JSON.stringify(store.state.sceneModule.layerManagementData))
    )
  }
  // 删除节点
  deleteTreeNode(code) {
    deleteSame(store.state.sceneModule.layerManagementData, code)
    function deleteSame(treeData, code) {
      treeData.forEach((item, index) => {
        if (item.code == code) {
          treeData.splice(index, 1)
          return
        }
        if (item.childList) {
          deleteSame(item.childList, code)
        } else {
          return
        }
      })
    }
    store.commit(
      'setLayerManagementData',
      JSON.parse(JSON.stringify(store.state.sceneModule.layerManagementData))
    )
  }
}

export default LayerManagement
