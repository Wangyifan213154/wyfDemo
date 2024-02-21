<template>
  <div class="send-message">
    <div id="send-div"></div>
  </div>
</template>

<script>
import { sendMessage } from './hooks/index'
export default {
  name: 'sendMessage',
  setup() {
    const { sendMessageToServer } = sendMessage()
    return { sendMessageToServer }
  }
}
</script>

<style lang="less" scoped>
#send-div {
  position: absolute;
  z-index: 99;
}
</style>
