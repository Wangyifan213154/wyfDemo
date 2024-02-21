<template>
  <div class="Task-Result-Details">
    <div class="details-container">
      <div class="details-title"></div>
      <div class="details-content">
        <div class="spanStyle">名称:{{ props.placeDetail.name }}</div>
        <div class="spanStyle">城市:{{ props.placeDetail.cityname }}</div>
        <div class="spanStyle">省份:{{ props.placeDetail.provincename }}</div>
        <div class="spanStyle">经度:{{ props.placeDetail.lng.toFixed(2) }}</div>
        <div class="spanStyle">纬度:{{ props.placeDetail.lat.toFixed(2) }}</div>
        <div class="spanStyle">类别:{{ props.placeDetail.type }}</div>
        <div class="spanStyle">地址:{{ props.placeDetail.address }}</div>
      </div>
    </div>
    <div class="details-triangle"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({
  placeDetail: {
    default: {},
    type: Object
  },
  title: {
    default: '',
    type: String
  }
})
</script>

<style lang="less" scoped>
.Task-Result-Details {
  width: 300px;
  padding: 20px 20px;

  .details-container {
    // background: url('@/assets/image/ui/背景2.png');
    // background-size: 100% 100%;
    background-image: linear-gradient(
      180deg,
      rgba(0, 80, 179, 0.5) 0%,
      rgba(0, 41, 102, 0.5) 100%
    );
    border: 1px solid rgba(0, 192, 255, 1);
    box-shadow: 0px 0px 10px 0px rgba(0, 135, 252, 1);
    border-radius: 7.04px;

    .details-title {
      height: 30px;
      margin: 3px;
      text-align: left;
      padding: 10px;
      font-family: MicrosoftYaHeiSemibold;
      font-size: 13px;
      color: #ffffff;
      font-weight: 600;
      background: url('@/assets/image/ui/标题背景.png');
      background-size: 100% 100%;
    }

    .details-content {
      color: white;
      // text-indent: 2em;
      text-align: left;
      font-size: 18px;
      padding: 0 20px;
      letter-spacing: 5px;

      .spanStyle {
        padding: 1px 0;
        font-family: MicrosoftYaHei;
        font-size: 11px;
        color: #ffffff;
        font-weight: 400;
      }
    }
  }
  .details-triangle {
    width: 40px;
    height: 30px;
    background: url('@/assets/image/ui/三角.png');
    background-size: 100% 100%;
    margin: -3px auto 0;
  }
}
</style>
