<template>
  <div class="entity-details" v-if="show" style="transforms: rotateZ(0deg)">
    <!-- <div class="details-img"></div> -->
    <div class="details-content">
      <div class="left-top">
        <ul>
          <li>
            <span class="spanStyle">经度:{{ infors.lng }}</span>
          </li>
          <li>
            <span class="spanStyle">纬度:{{ infors.lat }}</span>
          </li>
        </ul>
      </div>
      <div class="left-bottom">
        <ul>
          <li>
            <span class="spanStyle">高度:{{ infors.height }}</span>
          </li>
        </ul>
      </div>
      <div class="right-top">
        <ul>
          <li>
            <span class="spanStyle">H:{{ infors.heading }}</span>
          </li>
          <li>
            <span class="spanStyle">P:{{ infors.pitch }}</span>
          </li>
          <li>
            <span class="spanStyle">R:{{ infors.roll }}</span>
          </li>
        </ul>
      </div>
      <div class="right-bottom">
        <ul>
          <li>
            <span class="spanStyle">速度:{{ infors.speed }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ref,
  reactive,
  readonly,
  computed,
  onMounted,
  watch,
  toRefs
} from 'vue'
import store from '@/store/index'

export default {
  name: 'firstDiv',
  props: {
    title: {
      type: String,
      default: '标题'
    },
    id: {
      type: String,
      default: '001'
    }
  },
  setup() {
    // 计算属性
    const show = computed(() => {
      return store.state.sceneModule.showFirstDiv
    })
    let statelMsg = reactive({
      infors: {
        lng: 'XXX',
        lat: '中国',
        height: '卫星',
        heading: '轨道六根数',
        pitch: '正常运行中',
        roll: '正常运行中',
        speed: '正常运行中'
      }
    })
    function closeDiv() {
      show.value = false
    }
    watch(
      () => store.state.sceneModule.danInfors,
      (newValue, oldValue) => {
        statelMsg.infors = {
          lng: newValue.lng ? newValue.lng : 136,
          lat: newValue.lat,
          height: newValue.height,
          heading: newValue.heading,
          pitch: newValue.pitch,
          roll: newValue.roll,
          speed: newValue.speed
        }
      }
    )
    watch(
      () => store.state.sceneModule.showFirstDiv,
      (newValue, oldValue) => {
        // console.log(newValue);
      }
    )

    return { show, closeDiv, ...toRefs(statelMsg) }
  }
}
</script>

<style lang="less" scoped>
.entity-details {
  // width: 800px;
  width: 42%;
  height: 52%;
  background: url('@/assets/image/voiceInteraction/daodan.png');
  padding: 40px 20px;
  background-size: 100% 100%;
  // height: 500px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .details-img {
    height: 100px;
    width: 92%;
    margin: 0 auto;
    background: url('@/assets/image/voiceInteraction/vx.jpg');
    background-size: 100% 100%;
  }
  .details-title {
    text-align: left;
    font-size: 22px;
    padding: 20px;
    color: white;
  }
  .details-content {
    color: white;
    text-align: left;
    font-size: 18px;
    padding: 0 20px 20px;
    height: 100%;
    width: 100%;
    position: relative;
    .left-top {
      position: absolute;
      top: 20px;
      left: 50px;
    }
    .left-bottom {
      position: absolute;
      bottom: 40px;
      left: 50px;
    }
    .right-top {
      position: absolute;
      right: 50px;
      top: 20px;
    }
    .right-bottom {
      position: absolute;
      right: 50px;
      bottom: 40px;
    }
  }
  .details-echarts {
    width: 90%;
    height: 250px;
    border: 1px solid #12ccc27d;
    border-radius: 10px;
    margin: 0 auto 30px;
  }
  .buttonClose {
    top: 11px;
    right: 20px;
    position: absolute;
    background: none;
    color: aqua;
    border: none;
    font-size: 18px;
  }
  .spanStyle {
    font-size: 14px;
    left: 5px;
    color: aqua;
  }
}
.sixspanStyle {
  font-size: 14px;
  position: absolute;
  left: -25px;
  font-family: cursive;
}
/* 定义滚动条样式 */
&::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: rgba(240, 240, 240, 0.4);
}
/*定义滚动条轨道 内阴影+圆角*/
&::-webkit-scrollbar-track {
  box-shadow: inset 0 0 0px rgba(240, 240, 240, 0.5);
  border-radius: 10px;
  background-color: rgba(240, 240, 240, 0.5);
}
/*定义滑块 内阴影+圆角*/
&::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 0px aqua;
  background-color: aqua;
}
</style>
