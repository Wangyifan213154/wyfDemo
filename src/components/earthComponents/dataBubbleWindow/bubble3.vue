<template>
  <div class="entity-details" v-if="show">
    <div class="details-img">
      <img
        style="width: 100%; height: 100%"
        :src="require('../../../assets/image/pic/' + imgUrl)"
      />
    </div>
    <!-- <div class="details-title">{{ title }}</div> -->
    <div class="details-content">
      {{ content }}
    </div>
    <!-- <div class="details-echarts"></div> -->
  </div>
</template>

<script>
import { ref, reactive, readonly, computed, onMounted, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import emitter from '@/utils/eventbus'
export default {
  name: 'DynamicLabel',
  // props: {
  //   content: {
  //     type: String,
  //     default: '“罗纳德·里根”号于今年5月份完成定期维护保养.'
  //   },

  //   imgUrl: {
  //     type: String,
  //     default: 'gx.png'
  //   }
  // },
  setup() {
    let show = ref(true)
    const state = reactive({
      imgUrl: taiwanCity[0].imgurl,
      content: taiwanCity[0].describe
    })
    onMounted(() => {
      emitter.on('contentInfo', (val) => {
        state.imgUrl = val.imgUrl
        state.content = val.content
      })

      let num = 0
      setInterval(() => {
        state.content = taiwanCity[num].describe
        state.imgUrl = taiwanCity[num].imgurl
        // emitter.emit('contentInfo', {
        //   imgUrl: data2[num].imgurl,
        //   content: data2[num].describe
        // })
        num++
        if (num > taiwanCity.length - 1) {
          num = 0
        }
      }, 3000)
    })
    return { show, ...toRefs(state) }
  }
}
</script>

<style lang="less" scoped>
.entity-details {
  width: 400px;
  max-height: 1000px;

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
    font-size: 22px;
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
}
</style>
