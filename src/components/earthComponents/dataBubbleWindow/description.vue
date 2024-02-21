<template>
  <div class="entity-details" v-if="show">
    <div class="details-title">{{ title }}</div>
    <div class="details-content" v-show="content ? true : false">
      {{ content }}
    </div>
    <div
      class="pos-infor"
      v-show="weatherData && weatherData.length > 0 ? true : false"
    >
      <ul>
        <li v-for="(value, index) in weatherData" :key="index">
          <label>{{ value.name }}:</label><span>{{ value.content }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, reactive, readonly, computed, onMounted, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import emitter from '@/utils/eventbus'
export default {
  name: 'DynamicLabel',
  props: {
    title: {
      type: String,
      default: '标题'
    },
    id: {
      type: String,
      default: '001'
    },
    content: {
      type: String,
      default: '“罗纳德·里根”号于今年5月份完成定期维护保养.'
    },
    bgimg: {
      type: String,
      default: '底框3'
    },
    weatherData: {
      type: Object,
      default: []
    }
  },
  setup() {
    let show = ref(true)
    onMounted(() => {})
    return { show }
  }
}
</script>

<style lang="less" scoped>
.entity-details {
  width: 400px;
  max-height: 1000px;
  z-index: 0;
  background: url('@/assets/image/voiceInteraction/zjDiv.png');
  // background: url('@/assets/image/mapPopup/bg.png');
  padding: 40px 20px;
  background-size: 100% 100%;
  .details-img {
    height: auto;
    width: 92%;
    margin: 0 auto;
    // background: url('@/assets/image/迈耶号.png');
    // background: url('@/assets/image/images/ue飞机.png');
    background-size: 100% 100%;
  }
  .details-title {
    text-align: left;
    font-size: 30px;
    padding: 20px;
    color: white;
  }
  .details-content {
    color: white;
    text-indent: 2em;
    text-align: left;
    font-size: 20px;
    padding: 0 20px 20px;
    letter-spacing: 5px;
    // height: 80px;
    margin-top: 10px;
    overflow: auto;
  }
  .details-echarts {
    width: 90%;
    height: 250px;
    border: 1px solid #12ccc27d;
    border-radius: 10px;
    margin: 0 auto 30px;
  }
  .pos-infor {
    ul {
      list-style: none;
      margin: 0;
      padding: 0 10px;
      li {
        label {
          width: 60%;
          display: inline-block;
          font-size: 25px;
        }
        span {
          width: 40%;
          display: inline-block;
          font-size: 25px;
        }
        margin-top: 5px;
        color: #fff;
        text-align: left;
        border-bottom: 1px dashed #fff;
      }
    }
  }
}
</style>
