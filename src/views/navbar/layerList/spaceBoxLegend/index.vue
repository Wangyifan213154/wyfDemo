<template>
  <div class="terrainBand-legend">
    <div class="title-div">
      空间盒图例
      <!-- <p style="color: white; word-spacing: 30px; font-size: 24px"></p> -->
    </div>
    <div v-for="item in state.colors" class="item" :key="item.height">
      <div class="itemWidth">
        <div class="color" :style="`background:${item.color}`"></div>
      </div>
      <div class="itemWidth1">
        <div class="height">{{ item.height }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const state = reactive({
  colors: [
    {
      color: 'red',
      height: '第一层网格'
    },
    // {
    //   color: 'rgba(250, 252, 178, 1)',
    //   height: '雷达追踪'
    // },
    {
      color: 'white',
      height: '第二层网格'
    },
    {
      color: 'yellow',
      height: '点'
    },
    {
      color: 'green',
      height: '线'
    },
    // {
    //   color: 'rgba(127, 156, 48, 1)',
    //   height: '杀伤'
    // },
    {
      color: 'blue',
      height: '道'
    }
    // {
    //   color: 'rgba(225, 179, 21, 1)',
    //   height: '电磁干扰'
    // },
    // {
    //   color: 'rgba(136, 8, 1, 1)',
    //   height: '网络通信'
    // },
    // {
    //   color: 'rgba(107, 47, 12, 1)',
    //   height: '任务关联'
    // }
    // {
    //   color: 'rgba(145, 54, 145, 1)',
    //   height: '路径'
    // }
  ]
})
</script>

<style lang="less" scoped>
.terrainBand-legend {
  position: absolute;
  bottom: 12%;
  right: 123px;
  // width: 300px;

  width: 200px;
  // height: 250px;
  // background: url('@/assets/image/voiceInteraction/qiyeliebiao.png');
  // background-size: 100% 100%;
  // background: rgba(7, 8, 11, 0.6);
  // box-shadow: 0 12px 12px 0 rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(2, 26, 70, 0.88);
  // border-top: transparent;
  border-radius: 4px;
  backdrop-filter: blur(1px);
  animation: zoomIn 0.4s;
  margin-bottom: 1.5vh;
  background: rgba(2, 26, 70, 0.88);
  box-shadow: 0 0 25px #1092d5;

  .title-div {
    background: url('@/assets/image/panelIcons/title-bg3.png') no-repeat;
    background-size: 100.1% 48px;
    height: 40px;
    line-height: 48px;
    font-size: 25px;
    color: #ffffff;
    letter-spacing: 2.4px;
    font-weight: 400;
    text-align: center;
    // padding-left: 50px;
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px 10px;
    color: white;

    .itemWidth {
      width: 30%;
    }

    .itemWidth1 {
      width: 60%;
    }

    .color {
      width: 100%;
      height: 2px;
      margin: 0 auto;
      border-radius: 4px;
    }
  }
}
</style>
