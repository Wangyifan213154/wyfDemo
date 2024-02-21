import treeDataDefault from '../../Assets/data/tree/treeDataDefault.js'
/**
 * 为支撑树结构得数据提供基础得增删改查方法
 */
class basicManagement {
  constructor() {}
  /**
   * 图层数据初始化，如果没有传入参数则使用本地数据treeDataDefault
   * @param {object} treeNodes 待初始化得数据
   * @returns
   */
  initTreeNodes(treeNodes) {
    if (typeof treeNodes === 'undefined') {
      treeNodes = treeDataDefault
    }
    // 初始化本地图层数据
    // let res = JSON.parse(this.JSONStringify(treeNodes))
    let res = JSON.parse(JSON.stringify(treeNodes))
    return res
  }
  /**
   * 更新节点状态
   * @param {*} treeNodes 更新的树结构
   * @param {*} code 更新的节点code
   * @param {*} type add勾选或取消
   */
  updataTreeNode(treeNodes, code, type) {
    treeNodes.forEach((item) => {
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
    // 返回修改状态后的树
    let res = JSON.parse(JSON.stringify(treeNodes))
    return res
  }
  /**
   * 添加节点
   * @param {*} treeNodes  添加前的树结构
   * @param {*} val 添加的节点{name:"",code:""}
   * @param {*} parentName 父节点名称
   */
  addTreeNode(treeNodes, val, parentName) {
    add(treeNodes, val, parentName)
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
    // 返回添加节点后的树
    let res = JSON.parse(JSON.stringify(treeNodes))
    return res
  }
  /**
   * 删除节点
   * @param {*} treeNodes 删除前的树结构
   * @param {*} code 节点的code
   */
  deleteTreeNode(treeNodes, code) {
    deleteSame(treeNodes, code)
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
    // 返回删除节点后的树
    let res = JSON.parse(JSON.stringify(treeNodes))
    return res
  }
  // 对象序列化，undefined和函数丢失问题
  // JSONStringify(option) {
  //   return JSON.stringify(
  //     option,
  //     (key, val) => {
  //       // 处理函数丢失问题
  //       if (typeof val === 'function') {
  //         return `${val}`
  //       }
  //       // 处理undefined丢失问题
  //       if (typeof val === 'undefined') {
  //         return 'undefined'
  //       }
  //       return val
  //     },
  //     2
  //   )
  // }
}

export default basicManagement
