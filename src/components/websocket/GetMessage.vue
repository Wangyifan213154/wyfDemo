<template>
  <div class="get-message">
    <h2>{{ name }}</h2>
    <h2>{{ age }}</h2>
  </div>
</template>

<script>
import { getMessage } from './hooks/index'
export default {
  setup() {
    const { message, name, age } = getMessage()
    return { message, name, age }
  }
}
</script>

<style lang="less" scoped>
.get-message {
  position: absolute;
  top: 0%;
  right: 0%;
  z-index: 99;
  color: aliceblue;
}
</style>
