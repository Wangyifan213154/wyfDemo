<template>
  <div
    class="powerPop"
    :style="`background-color: rgba(${ccolor[0]},${ccolor[1]},${ccolor[2]},0.4);
    border: 4px solid rgb(${ccolor[0]},${ccolor[1]},${ccolor[2]});
    box-shadow: 0 0 20px rgb(${ccolor[0]},${ccolor[1]},${ccolor[2]});`"
    v-if="show"
  >
    <!-- <div class="details-img">
      <img
        style="width: 100%; height: 100%"
        :src="require('../../../assets/image/pic/' + imgUrl)"
      />
    </div> -->
    <div class="details-title">{{ title }}</div>

    <div class="details-content" v-if="date">
      事故时间：{{ date }} <br />
      事故位置：{{ posname }} <br />
      事故时间：{{ content }} <br />
    </div>
    <div class="details-content" v-else>
      {{ content }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, readonly, computed, onMounted, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import emitter from '@/utils/eventbus'
export default {
  name: 'accidentLabel',
  props: {
    content: {
      type: String,
      default: '“罗纳德·里根”号于今年5月份完成定期维护保养.'
    },
    title: {
      type: String,
      default: ''
    },

    imgUrl: {
      type: String,
      default: 'gx.png'
    },
    ccolor: {
      type: Array,
      default: [228, 63, 50]
    },
    date: {
      type: String,
      default: ''
    },
    posname: {
      type: String,
      default: ''
    }
  },
  setup() {
    let show = ref(true)
    const state = reactive({})
    onMounted(() => {})
    return { show, ...toRefs(state) }
  }
}
</script>

<style lang="less" scoped>
.powerPop {
  width: 400px;
  max-height: 1000px;
  z-index: 1;
  // background: url('@/assets/image/voiceInteraction/zjDiv.png');
  // background: url('@/assets/image/mapPopup/bg.png');
  padding: 40px 20px;
  // background-color: rgba(255, 0, 0, 0.3);
  // // background: linear-gradient(
  // //   // 90deg,
  // //   red 0%,
  // //   rgba(255, 0, 0, 0.3) 50%,
  // //   red 100%
  // // );
  // border: 4px solid red;
  // box-shadow: 0 0 20px red;
  // background-size: 100% 100%;
  .details-img {
    height: auto;
    width: 92%;
    margin: 0 auto;
    // background: url('@/assets/image/迈耶号.png');
    // background: url('@/assets/image/images/ue飞机.png');
    background-size: 100% 100%;
  }
  .details-title {
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    padding: 20px;
    color: white;
  }
  .details-content {
    color: white;
    // text-indent: 2em;
    text-align: left;
    font-size: 20px;
    padding: 0 20px 20px;
    letter-spacing: 5px;
    // height: 80px;
    margin-top: 10px;
    overflow: auto;
    .content-section {
      letter-spacing: 5px;
      text-align: left;
      text-indent: 2em;
    }
  }
  .details-echarts {
    width: 90%;
    height: 250px;
    border: 1px solid #12ccc27d;
    border-radius: 10px;
    margin: 0 auto 30px;
  }
}
</style>
