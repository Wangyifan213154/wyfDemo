<template>
  <div :id="id" class="entity-details" v-if="show">
    <div class="details-img"></div>
    <div class="details-title">{{ title }}</div>
    <div class="details-content">
      {{ content }}
    </div>
    <!-- <div class="details-echarts"></div> -->
  </div>
</template>

<script>
import { ref, reactive, readonly, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

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
    }
  },
  setup() {
    let show = ref(true)

    return { show }
  }
}
</script>

<style lang="less" scoped>
.entity-details {
  width: 300px;
  background: url('@/assets/image/voiceInteraction/zjDiv.png');
  // background: url('@/assets/image/mapPopup/bg.png');
  padding: 40px 20px;
  background-size: 100% 100%;
  .details-img {
    height: 100px;
    width: 92%;
    margin: 0 auto;
    background: url('@/assets/image/迈耶号.png');
    // background: url('@/assets/image/images/ue飞机.png');
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
    text-indent: 2em;
    text-align: left;
    font-size: 18px;
    padding: 0 20px 20px;
    letter-spacing: 5px;
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
