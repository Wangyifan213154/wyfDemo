<template>
  <div id="container"></div>
</template>

<script>
// 工具条
// import ToolBar from '@/components/toolBar/ToolBar.vue'
import { earth } from './hooks/index'
// vue2中是export default Vue.extend; vue3中是 export default defineComponent
export default {
  name: 'EarthViewer',
  components: {},
  setup() {
    earth() // 地球初始化
    return {}
  }
}
</script>

<style lang="less" scoped>
#container {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
