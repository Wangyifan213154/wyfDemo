<template>
  <div class="detail-container">
    <div class="container-main">
      <div class="buttonTitle">场景执行：</div>
      <el-radio-group
        v-model="state.curSelect"
        class="checkedOption"
        @change="handleCheckChange"
      >
        <el-radio label="0">无界面启动</el-radio>
        <el-radio label="1">有界面启动</el-radio>
        <el-radio label="2">场景关闭</el-radio>
      </el-radio-group>
      <div class="select_btn">
        <el-button type="primary" size="small" @click="state.curSelect = ''"
          >重置</el-button
        >
        <el-button type="primary" size="small" @click="confirmScene"
          >确定</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, getCurrentInstance, defineEmits } from 'vue'
// import loadEvent from '@/utils/earth/cesium/loadEvent'
import store from '@/store/index'
import emitter from '@/utils/eventbus'
import { sceneControl, interfaceStartup } from '@/service/SSE'

const state = reactive({
  curSelect: ''
})

const handleCheckChange = () => {}
const confirmScene = () => {
  switch (state.curSelect) {
    case '0':
      sceneControl({ file: 'joint.txt' }).then((res) => {})
      break
    case '1':
      interfaceStartup({ file: 'joint.txt' }).then((res) => {})
      break
    case '2':
      sceneControl({ kill: 0 }).then((res) => {})
      break
    default:
      break
  }
}
</script>

<style lang="less" scoped>
.detail-container {
  position: absolute;
  right: 6%;
  top: 10%;
  width: 150px;
  // height: 250px;
  // background: url('@/assets/image/voiceInteraction/zjDiv.png');
  // background-size: 100% 100%;
  // padding: 40px 20px;
  background-image: url('~@/assets/image/panelIcons/装饰.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .container-main {
    padding: 15px;
    height: 97%;
    width: 100%;
    background: rgba(2, 26, 70, 0.88);
    box-shadow: 0 0 25px #1092d5;
    .close_Sty {
      width: 20px;
      height: 20px;
      position: absolute;
      top: 10px;
      right: 20px;
      cursor: pointer;
    }
    .el-radio-group {
      display: inline-flex;
      align-items: flex-start;
      font-size: 0;
      flex-direction: column;
      padding: 0;
    }
  }
}
.buttonTitle {
  width: 100%;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  color: #00c7fb;
}
.checkedOption {
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
.select_btn {
  display: flex;
}

:deep(.el-radio) {
  color: white;
  margin: 10px 0;
}
</style>
