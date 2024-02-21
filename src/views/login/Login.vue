<template>
  <div class="login">
    <div id="logo">
      <h1 id="title"><i> 智慧地球应用门户系统</i></h1>
    </div>
    <section class="stark-login">
      <div class="form">
        <div id="fade-box">
          <input
            v-model="userName"
            type="text"
            name="username"
            id="username"
            placeholder="用户名"
            required
          />
          <input
            v-model="password"
            type="password"
            placeholder="密码"
            required
          />
          <button @click="loginClick">登 录</button>
        </div>
      </div>
      <!-- :style="`background-image: url(${loginBGImgUrl})`" -->
      <div class="hexagons">
        <img
          :src="require(`@/assets/image/login/loginBG.png`)"
          style="vertical-align: middle"
        />
      </div>
    </section>
    <div id="circle1">
      <div id="inner-cirlce1"></div>
    </div>
  </div>
</template>

<script>
import { onMounted, toRefs } from 'vue'

// 导入hooks
import { login } from './hooks/index'
import { websocket } from '@/views/hooks/index'
export default {
  name: 'login',
  components: {},
  setup() {
    // 登录页初始化websocket
    websocket()
    const { loginBGImgUrl, loginClick, state } = login()
    return { loginBGImgUrl, loginClick, ...toRefs(state) }
  }
}
</script>

<style lang="less" scoped>
#logo {
  animation: logo-entry 4s ease-in;
  width: 500px;
  margin: 0 auto;
  margin-left: 23%;
  position: relative;
  z-index: 40;
}

#title {
  animation: text-glow 2s ease-out infinite alternate;
  font-family: 'Ubuntu', sans-serif;
  color: #045cf5ba;
  // font-size: 48px;
  font-size: 48px;
  font-weight: bold;
  position: absolute;
  text-shadow: 0 0 10px #000, 0 0 20px #000, 0 0 30px #000, 0 0 40px #000,
    0 0 50px #000, 0 0 60px #000, 0 0 70px #000;
  top: 50px;
}

#title:before {
  animation: before-glow 2s ease-out infinite alternate;
  border-left: 535px solid transparent;
  border-bottom: 10px solid #045cf5ba;
  content: ' ';
  height: 0;
  position: absolute;
  right: -74px;
  top: -10px;
  width: 0;
}

#title:after {
  animation: after-glow 2s ease-out infinite alternate;
  border-left: 100px solid transparent;
  border-top: 16px solid #045cf5ba;
  content: ' ';
  height: 0;
  position: absolute;
  right: -85px;
  top: 24px;
  transform: rotate(-47deg);
  width: 0;
}

/* =========================================
Log in form
========================================= */
#fade-box {
  animation: input-entry 3s ease-in;
  z-index: 4;
}

.stark-login .form {
  animation: form-entry 3s ease-in-out;
  background: #111;
  background: linear-gradient(#90a6cd54, #0680a654);
  border: 5px solid #2077c38f;
  box-shadow: 0 0 15px #2c95cf94;
  border-radius: 5px;
  display: inline-block;
  height: 220px;
  margin: 270px auto 0;
  position: relative;
  z-index: 4;
  width: 500px;
  transition: 1s all;
}

.stark-login .form:hover {
  border: 6px solid #045cf5ba;
  box-shadow: 0 0 25px #045cf5ba;
  transition: 1s all;
}

.stark-login input {
  background: #222;
  background: linear-gradient(#3333333b, #222222);
  border: 1px solid #44444454;
  border-radius: 5px;
  box-shadow: 0 2px 0 #000;
  color: #fff;
  display: block;
  font-family: 'Cabin', helvetica, arial, sans-serif;
  font-size: 13px;
  // font-size: 1.3rem;
  height: 40px;
  margin: 20px auto 10px;
  padding: 0 10px;
  text-shadow: 0 -1px 0 #000;
  width: 400px;
}

.stark-login input:focus {
  animation: box-glow 1s ease-out infinite alternate;
  background: #0b4252;
  background: linear-gradient(#333933, #222922);
  border-color: #045cf5ba;
  box-shadow: 0 0 5px rgba(0, 255, 253, 0.2),
    inset 0 0 5px rgba(0, 255, 253, 0.1), 0 2px 0 black;
  color: #efe;
  outline: none;
}

.stark-login input:invalid {
  border: 2px solid #045cf5ba;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.2), inset 0 0 5px rgba(255, 0, 0, 0.1),
    0 2px 0 black;
}

.stark-login button {
  animation: input-entry 3s ease-in;
  background: #222;
  background: linear-gradient(#3333334a, #222222);
  box-sizing: content-box;
  border: 1px solid #444;
  border-left-color: #000;
  border-radius: 5px;
  box-shadow: 0 2px 0 #000;
  color: #fff;
  display: block;
  font-family: 'Cabin', helvetica, arial, sans-serif;
  font-size: 13px;
  font-weight: 400;
  height: 40px;
  line-height: 40px;
  margin: 20px auto;
  padding: 0;
  position: relative;
  text-shadow: 0 -1px 0 #000;
  width: 400px;
  transition: 1s all;
}

.stark-login button:hover,
.stark-login button:focus {
  background: #0c6125;
  background: linear-gradient(#393939, #292929);
  color: #045cf5ba;
  outline: none;
  transition: 1s all;
}

.stark-login button:active {
  background: #292929;
  background: linear-gradient(#393939, #292929);
  box-shadow: 0 1px 0 #000, inset 1px 0 1px #222;
  top: 1px;
}

/* =========================================
Spinner
========================================= */
#circle1 {
  animation: circle1 4s linear infinite, circle-entry 6s ease-in-out;
  background: #5787dc00;
  border-radius: 100%;
  border: 10px solid #32518726;
  box-shadow: 0 0 0 2px #0da3ea9c, 0 0 0 6px #0ac3e23b;
  height: 400px;
  width: 400px;
  position: absolute;
  top: 53% !important;
  left: 47%;
  // margin-left: -250px;
  overflow: hidden;
  opacity: 1.5;
  z-index: 0;
}

#inner-cirlce1 {
  background: #e6d9d900;
  border-radius: 100%;
  border: 36px solid #4c7bcd14;
  height: 460px;
  width: 460px;
  margin: 10px;
}

#inner-cirlce1:before {
  content: ' ';
  width: 240px;
  height: 480px;
  background: #00000000;
  position: absolute;
  top: 0;
  left: 0;
}

#inner-cirlce1:after {
  content: ' ';
  height: 240px;
  width: 480px;
  background: #00000042;
  position: absolute;
  top: 0;
  left: 0;
}

/* =========================================
Hexagon Mesh
========================================= */
.hexagons {
  animation: logo-entry 4s ease-in;
  /*background:url(http://fc03.deviantart.net/fs71/i/2012/237/c/7/jarvis_rainmeter_skin_by_ingwey-d5cc571.png);*/
  color: #000;
  font-size: 52px;
  font-size: 5.1rem;
  letter-spacing: -0.2em;
  line-height: 0.7;
  position: absolute;
  text-shadow: 0 0 6px #045cf5ba;
  top: 1px;
  height: 100%;
  width: 100%;
  /*transform: perspective(60px)  scale(2.4);*/
  z-index: 0;
  padding-top: 10%;
  padding-left: 3%;
}

.hexagons img {
  width: 65%;
  height: 100%;
}

/* =========================================
Animation Keyframes
========================================= */
@keyframes logo-entry {
  0% {
    opacity: 0;
  }

  80% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes circle-entry {
  0% {
    opacity: 0;
  }

  20% {
    opacity: 0;
  }

  100% {
    opacity: 0.4;
  }
}

@keyframes input-entry {
  0% {
    opacity: 0;
  }

  90% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes form-entry {
  0% {
    height: 0;
    width: 0;
    opacity: 0;
    padding: 0;
  }

  20% {
    height: 0;
    border: 1px solid #accaef33;
    width: 0;
    opacity: 0;
    padding: 0;
  }

  40% {
    width: 0;
    height: 220px;
    border: 3px solid #accaef33;
    opacity: 1;
    padding: 0;
  }

  100% {
    height: 220px;
    width: 500px;
  }
}

@keyframes box-glow {
  0% {
    border-color: #00b8b6;
    box-shadow: 0 0 5px rgba(0, 255, 253, 0.2),
      inset 0 0 5px rgba(0, 255, 253, 0.1), 0 2px 0 black;
  }

  100% {
    border-color: #045cf5ba;
    box-shadow: 0 0 20px rgba(51, 118, 241, 0.6),
      inset 0 0 10px rgba(0, 255, 253, 0.4), 0 2px 0 black;
  }
}

@keyframes text-glow {
  0% {
    color: #00a4a2;
    text-shadow: 0 0 10px #000, 0 0 20px #000, 0 0 30px #000, 0 0 40px #000,
      0 0 50px #000, 0 0 60px #000, 0 0 70px #000;
  }

  100% {
    color: #045cf5ba;
    text-shadow: 0 0 20px rgba(0, 255, 253, 0.6),
      0 0 10px rgba(0, 255, 253, 0.4), 0 2px 0 black;
  }
}

@keyframes before-glow {
  0% {
    border-bottom: 10px solid #00a4a2;
  }

  100% {
    border-bottom: 10px solid #0077ff83;
  }
}

@keyframes after-glow {
  0% {
    border-top: 16px solid #00a4a2;
  }

  100% {
    border-top: 16px solid #0077ff83;
  }
}

@keyframes circle1 {
  0% {
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
