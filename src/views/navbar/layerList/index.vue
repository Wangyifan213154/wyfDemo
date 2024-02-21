<template>
  <div class="data-container">
    <div class="layerList">
      <el-tree
        ref="treeRef"
        :data="store.state.sceneModule.layerManagementData"
        node-key="code"
        :props="state.defaultProps"
        :default-checked-keys="state.checkeys"
        show-checkbox
        @check="handleCheck"
        @node-click="handleNodeClick"
      />
      <div class="detail-container" v-show="state.detailVisible">
        <div class="container-main">
          <img
            src="@/assets/image/panelIcons/关闭icon.png"
            alt=""
            class="close_Sty"
            @click="handleClose"
          />
          <div class="buttonTitle">视角配置：</div>
          <el-radio-group v-model="state.statusRadio" @change="changeSelected">
            <el-radio label="first">第一视角</el-radio>
            <el-radio label="three">第三视角</el-radio>
            <el-radio label="lockEntity">锁定实体</el-radio>
            <el-radio label="free">自由视角</el-radio>
            <el-radio label="viewAngle">观看视角</el-radio>
          </el-radio-group>
          <div class="buttonTitle">显隐配置：</div>
          <div class="checkedOption">
            <el-checkbox
              v-show="state2.existPath"
              v-model="state2.pathChecked"
              @change="pathCheckChange"
              label="路径"
              size="default"
            />
            <el-checkbox
              v-show="state2.existWall"
              v-model="state2.wallChecked"
              @change="entityWallChange"
              label="路径墙"
              size="default"
            />
            <el-checkbox
              v-show="state2.existWack"
              v-model="state2.wackChecked"
              @change="entityWackChange"
              label="尾迹"
              size="default"
            />
            <el-checkbox
              v-show="state2.existSightFrame"
              v-model="state2.sightFrameChecked"
              @change="sightFrameChange"
              label="瞄准框"
              size="default"
            />
            <el-checkbox
              v-show="state2.existMissileLine"
              v-model="state2.missileLineChecked"
              @change="missileLineChange"
              label="导弹线"
              size="default"
            />
            <el-checkbox
              v-show="state2.existOperationalRadius"
              v-model="state2.operationalRadiusChecked"
              @change="operationalRadiusChange"
              label="作战半径"
              size="default"
            />
            <el-checkbox
              v-show="state2.existFrustum"
              v-model="state2.frustumChecked"
              @change="entityFrustumChange"
              label="感知半径"
              size="default"
            />
            <el-checkbox
              v-show="state2.existCommunicationRadius"
              v-model="state2.communicationRadiusChecked"
              @change="communicationRadiusChange"
              label="通信半径"
              size="default"
            />
            <el-checkbox
              v-show="state2.existFirepowerRadius"
              v-model="state2.firepowerRadiusChecked"
              @change="firepowerRadiusChange"
              label="火力半径"
              size="default"
            />
            <el-checkbox
              v-show="state2.existSensor"
              v-model="state2.sensorChecked"
              @change="entitySensorChange"
              label="传感器范围"
              size="default"
            />
            <el-checkbox
              v-show="state2.existFullBandDisb"
              v-model="state2.fullBandDisbChecked"
              @change="fullBandDisbChange"
              label="干扰范围(全频)"
              size="default"
            />
            <el-checkbox
              v-show="state2.existNarrowBandDisb"
              v-model="state2.narrowBandDisbChecked"
              @change="narrowBandDisbChange"
              label="干扰范围(窄带)"
              size="default"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { loadData } from './hooks/index.js'
import store from '@/store/index'
import { watch } from 'vue'

const {
  state,
  state2,
  handleCheck,
  treeRef,
  sceneRealTimeTreeRef,
  handleSwitchLayers,
  handleCheckSceneRealTimeEntity,
  changeCheck,
  changeSelected,
  handleNodeClick,
  handleClose,
  pathCheckChange,
  entityWackChange,
  entityWallChange,
  entitySensorChange,
  entityFrustumChange,
  sightFrameChange,
  missileLineChange,
  firepowerRadiusChange,
  communicationRadiusChange,
  operationalRadiusChange,
  fullBandDisbChange,
  narrowBandDisbChange
} = loadData()

// watch(
//   () => state.statusRadio,
//   (newValue, oldValue) => {
//     console.log(newValue);
//     changeCameraView(state2.clickEntityID, newValue)
//   }
// )
</script>

<style lang="less" scoped>
.data-container {
  position: absolute;
  right: 6%;
  top: 10%;
  // right: 10px;
  margin-top: 0px;
  height: 420px;
  width: 17vw;
  z-index: 998;

  background-image: url('~@/assets/image/panelIcons/装饰.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  .layerList {
    height: 97%;
    width: 100%;
    background: rgba(2, 26, 70, 0.88);
    box-shadow: 0 0 25px #1092d5;
    .detail-container {
      position: absolute;
      right: calc(17vw + 6%);
      top: 0;
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
  }

  .el-tree {
    font-size: 15px;
    // margin-top: 20px;
    height: 100% !important;
    width: 95%;
    background: transparent;
    color: #e9fcfd;
    overflow-y: auto;
    box-sizing: border-box;
    padding-left: 8%;
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
  .setView {
    height: 8%;
    // position: absolute;
    // bottom: 0;

    .el-radio {
      margin-right: 10px;
    }
    .check-box {
      text-align: right;
      padding-right: 14px;
      display: inline-block;
      margin-left: 6px;
    }
    /deep/ .el-select {
      height: 20px;
      .el-input__wrapper {
        background: rgba(0, 0, 0, 0.2);
        .el-input__inner {
          color: #fff;
        }
      }
    }
  }
  /*滚动条高宽度*/
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  /*滚动条滑块*/
  ::-webkit-scrollbar-thumb {
    border-radius: 3px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(48, 50, 53, 0.7);
  }

  /*滚动条里面轨道*/
  ::-webkit-scrollbar-track {
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2) inset;
  }

  /*滚动条的小边角*/
  ::-webkit-scrollbar-corner {
    background: transparent;
  }
}

//去掉父级的复选框
:deep(.root-node > .el-tree-node__content) {
  .el-checkbox {
    display: none;
  }
}

:deep .el-radio__inner {
  background-color: rgba(17, 181, 236, 0.5);
  border: 1px solid #11b5ec;
}
:deep .el-radio {
  color: #11b5ec;
}
:deep .el-checkbox {
  color: #11b5ec !important;
}

:deep .el-checkbox__inner {
  background-color: rgba(17, 181, 236, 0.5);
  border: 1px solid #11b5ec;
  border-radius: 50%;
  color: #11b5ec;
}

:deep .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: rgba(17, 181, 236, 0.5);
  color: rgba(17, 181, 236, 1);
}

:deep .el-checkbox__input.is-disabled .el-checkbox__inner {
  background-color: rgba(17, 181, 236, 0.5);
  color: rgba(17, 181, 236, 1);
  border-color: rgba(17, 181, 236, 1);
}

:deep .el-checkbox__input.is-disabled {
  background-color: rgba(17, 181, 236, 0.5);
  color: rgba(17, 181, 236, 1);
}

:deep .el-tree-node {
  margin-top: 10px;
}

:deep .el-tree-node__content:hover,
.el-upload-list__item:hover {
  background-color: rgba(17, 181, 236, 0.5);
}

:deep .el-tree-node .is-current > .el-tree-node__content {
  background-color: rgba(17, 181, 236, 0.5);
}

:deep .el-tree-node:focus > .el-tree-node__content {
  background-color: rgba(17, 181, 236, 0.5);
}

:deep el-tree-node__expand-icon el-icon-caret-right:before {
  color: rgba(17, 181, 236, 1);
}
</style>
