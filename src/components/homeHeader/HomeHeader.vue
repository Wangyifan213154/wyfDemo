<template>
  <div class="header-container">
    <Transition
      name="custom-classes"
      enter-active-class="animate__animated animate__fadeInDown "
      leave-active-class="animate__animated animate__fadeOutUp"
    >
      <div class="home-header">
        <div class="header-title">
          <div class="title-logo" @click="showHeaderMenu">
            <img :src="logoImg" alt="" style="" />
          </div>
          <div class="title-text">
            <div>cesium3Ddemo</div>
            <div class="text-pinyin"></div>
          </div>
        </div>
        <div class="header-menu">
          <div
            class="menu-item"
            v-for="item in menuList"
            :key="item"
            @click="selectMenu(item)"
            :class="activeMenu == item ? 'menu-active' : ''"
          >
            {{ item }}
          </div>
        </div>
        <div class="header-time">
          <div class="time-item">
            天文时间：
            <div class="time-text">{{ currentTime }}</div>
          </div>
          <div class="time-item">
            作战时间：
            <div class="time-text">{{ daihaoTime }}</div>
          </div>
        </div>
      </div>
    </Transition>
    <div class="show-container" v-show="showZT" @click="unfoldAndCollapse">
      <img src="@/assets/image/header/返回_关闭.png" />
    </div>
    <Transition
      name="custom-classes"
      enter-active-class="animate__animated animate__zoomIn "
      leave-active-class="animate__animated animate__zoomOut"
    >
      <div
        class="interactive-container animate__animated animate__fadeInLeft animate__delay-10s"
        v-show="isShujumenhu"
      >
        <div class="container_blur_info">
          <div class="container-title">
            <div class="title-context">
              <div>数据资源</div>
              <div></div>
              <div @click="goHome" class="retract">
                <img src="@/assets/image/header/返回_关闭.png" />
              </div>
            </div>
          </div>

          <div class="container-main">
            <el-collapse
              v-model="activeNames"
              v-for="item in cesiumData"
              :key="item.name"
              @change="handleChange"
            >
              <el-collapse-item :name="item.name" @click="test(item)">
                <template #title>
                  <div class="collapse-title">
                    <img
                      :src="
                        require(item.name == '数据'
                          ? '@/assets/image/header/数据.png'
                          : item.name == '知识'
                          ? '@/assets/image/header/知识.png'
                          : '@/assets/image/header/实体.png')
                      "
                      alt=""
                      style="height: 20px; margin-right: 5px"
                    />
                    {{ item.name }}
                  </div>
                </template>
                <el-card
                  class="card-item"
                  shadow="hover"
                  v-for="(analysis, index) in item.childList"
                  :key="index"
                  @click="handleCardSelect(analysis, item.name)"
                  :class="index == activeIndex ? 'card-click' : ''"
                >
                  <div
                    class=""
                    :class="analysis.name == activeIndex ? 'card__input' : ''"
                  />
                  <el-image
                    loading="lazy"
                    :class="['animated', analysis.class]"
                    :src="analysis.img"
                    alt=""
                    style="
                      width: 100%;
                      height: 70%;
                      border: 1px solid #5c5757;
                      border-radius: 10px;
                    "
                  ></el-image>
                  <div class="img-content" :title="analysis.name">
                    {{ analysis.name }}
                  </div>
                </el-card>
              </el-collapse-item>
            </el-collapse>
          </div>
          <!-- <div class="container-btn">
            <div @click="">进入数据中台</div>
          </div> -->
        </div>
      </div>
    </Transition>
    <Transition
      name="custom-classes"
      enter-active-class="animate__animated animate__zoomIn "
      leave-active-class="animate__animated animate__zoomOut"
    >
      <div
        class="interactive-container animate__animated animate__fadeInLeft animate__delay-10s"
        v-show="curType == '空间分析'"
      >
        <div class="container_blur_info">
          <div class="container-title">
            <div class="title-context">
              <div>空间分析</div>
              <div></div>
              <div @click="goHome" class="retract">
                <img src="@/assets/image/header/返回_关闭.png" />
              </div>
            </div>
          </div>

          <div class="container-main">
            <el-collapse
              v-model="activeNames"
              v-for="item in geoAnalysisState"
              :key="item.name"
              @change="handleChange"
            >
              <el-collapse-item :name="item.name" @click="test(item)">
                <template #title>
                  <div class="collapse-title">
                    <img
                      :src="
                        require(item.name == '数据'
                          ? '@/assets/image/header/数据.png'
                          : item.name == '知识'
                          ? '@/assets/image/header/知识.png'
                          : '@/assets/image/header/实体.png')
                      "
                      alt=""
                      style="height: 20px; margin-right: 5px"
                    />
                    {{ item.name }}
                  </div>
                </template>
                <el-card
                  class="card-item"
                  shadow="hover"
                  v-for="(analysis, index) in item.childList"
                  :key="index"
                  @click="handleCardSelect(analysis, item.name)"
                  :class="index == activeIndex ? 'card-click' : ''"
                >
                  <div
                    class=""
                    :class="analysis.name == activeIndex ? 'card__input' : ''"
                  />
                  <el-image
                    loading="lazy"
                    :class="['animated', analysis.class]"
                    :src="analysis.img"
                    alt=""
                    style="
                      width: 100%;
                      height: 70%;
                      border: 1px solid #5c5757;
                      border-radius: 10px;
                    "
                  ></el-image>
                  <div class="img-content" :title="analysis.name">
                    {{ analysis.name }}
                  </div>
                </el-card>
              </el-collapse-item>
            </el-collapse>
          </div>
          <!-- <div class="container-btn">
            <div @click="">进入数据中台</div>
          </div> -->
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, reactive, toRefs, onMounted, watch, onUnmounted } from 'vue'
import store from '@/store/index'
import router from '@/router/index'
import emitter from '@/utils/eventbus'
import { geoAnalysis } from './hooks/index'
export default {
  name: 'home-header',
  components: {
    // zModel1,
    // zModel2,
    // zModel3,
    // zModel4,
    // zModel14,
    // zModel15,
    // zModel16
    // great
  },
  setup() {
    const { geoAnalysisState } = geoAnalysis()
    const state = reactive({
      activeMenu: '应用门户',
      menuList: ['应用门户', '示范场景', '空间分析', '示例效果'],
      activeNames: [
        '数据',
        '知识',
        '实体',
        '通用模型',
        '智能认知',
        '预报预警',
        '干预控制',
        '分析工具',
        '标绘工具',
        '应用实例工具',
        '战场环境编辑工具'
      ],
      // greatboolean: false,
      currentTime: '',
      daihaoTime: '----/--/-- --:--:--',
      curType: '应用门户',
      isShujumenhu: false,
      isDianxingshifan: false,
      isAnalysis: false,
      isYingyongmenhu: false,
      isYewumenhu: false,
      isYingyongkaifa: false,
      isAbout: false,
      showZT: false,
      Component: '',
      sjzyData: '',
      ywmkData: '',
      showToolbar: false,
      showCloudCard: false,
      TWCityImageHeader: '',
      showTWCityImage: false,
      cardItemTitle: '',
      logoImg: require('@/assets/image/header/logo新.png')
    })
    const selectMenu = (type) => {
      router.push('/home')
      state.isAbout = false
      state.activeMenu = type
      state.isShujumenhu = false
      state.isYingyongmenhu = false
      state.showZT = false
      state.isYewumenhu = false
      state.isYingyongkaifa = false
      state.showTWCityImage = false
      state.Component = ''
      state.curType = type
      if (type == state.menuList[1]) {
        state.isShujumenhu = true
        state.isDianxingshifan = false
      } else if (type == state.menuList[0]) {
        state.isYingyongmenhu = true
        state.isDianxingshifan = false
      } else if (type == state.menuList[2]) {
        state.isAnalysis = true
        state.isDianxingshifan = false
      } else if (type == state.menuList[3]) {
        state.isDianxingshifan = !state.isDianxingshifan
      } else if (type == state.menuList[4]) {
        state.isYingyongkaifa = true
        state.isDianxingshifan = false
      }
      store.state.curSecence = 0
      activeIndex.value = null
      // removeStaticHB()
      // clearSourceEntity()
      // reset()
    }
    const cesiumData = reactive([
      {
        name: '标绘',
        icon: 'Paperclip',
        callback: '',
        actived: false,
        childList: [
          {
            name: '地形渲染',
            icon: '',
            img: require('@/assets/image/数据中台缩略图/地形渲染.png'),
            callback: function () {
              window.sceneAction.environmentController.viewTW()
            },
            class: ''
          }
        ]
      },
      {
        name: '仿真',
        icon: 'Money',
        callback: '',
        actived: false,
        childList: [
          {
            name: '卫星侦察',
            icon: 'Ship',
            img: require('@/assets/image/数据中台缩略图/卫星侦察.png'),
            callback: function () {
              window.sceneAction.satelliteSimulateController.addSatellites()
            },
            class: ''
          },
          {
            name: '卫星组网',
            icon: 'Ship',
            img: require('@/assets/image/数据中台缩略图/卫星组网.png'),
            callback: function () {
              window.sceneAction.satelliteSimulateController.createCzmlGroup()
              setTimeout(() => {
                window.sceneAction.satelliteSimulateController.connect()
              }, 6000)
            },
            class: ''
          },
          {
            name: '飞机作战仿真',
            icon: 'Ship',
            img: require('@/assets/image/数据中台缩略图/卫星组网.png'),
            callback: function () {
              window.sceneAction.planeCzmlManage.addPlaneCzml()
              emitter.emit('isShowTree', true)
            },
            class: ''
          },
          {
            name: '台湾电厂',
            icon: 'Ship',
            img: require('@/assets/image/数据中台缩略图/台湾电厂.png'),
            callback: function () {
              window.sceneAction.environmentController.twPowerGrid()
              window.sceneAction.environmentController.addImportancePlantAndSubstation(
                'flowLine'
              )
            },
            class: ''
          }
        ]
      }
    ])
    let activeIndex = ref(null)
    const handleCardSelect = (analysis, name) => {
      window.sceneAction.clearScene()
      if (activeIndex.value == analysis.name) {
        activeIndex.value = null
        store.state.curSecence = 0
      } else {
        activeIndex.value = analysis.name
        // 执行回调
        if (analysis.callback) {
          // 显示标题
          // addCartTitle(analysis.name)
          if (typeof analysis.callback == 'string') {
            dataController[analysis.callback]()
          } else {
            // 显示标题
            // addCartTitle(analysis.name)
            analysis.callback()
          }
        }
      }
    }
    const test = (val) => {
      val.actived = !val.actived
      let rotation = [
        'flipped-vertical-bottom',
        'flipped-vertical-top',
        'flipped-horizontal-left',
        'flipped-horizontal-right'
      ]
      let data = cesiumData
      data.map((item) => {
        if (val.name == item.name) {
          if (val.actived) {
            val.childList.map((citem) => {
              let random = Math.floor(Math.random() * (3 - 0 + 1))
              let animation = rotation[random]
              setTimeout(() => {
                citem.class = animation
              }, 10)
            })
          } else {
            item.childList.map((citem) => {
              citem.class = ''
            })
          }
        }
      })
    }

    return {
      ...toRefs(state),
      geoAnalysisState,
      selectMenu,
      cesiumData,
      handleCardSelect,
      activeIndex,
      test
    }
  }
}
</script>

<style lang="less" scoped>
@font-face {
  font-family: title;
  src: url('@/assets/fontFamily/标题字体.otf');
}

.header-container {
  z-index: 99999;
  position: relative;
  user-select: none;
  font-size: 20px;

  .showbg {
  }

  .home-header {
    width: 100%;
    // height: 80px;
    height: 90px;
    position: absolute;
    top: 0;
    // background: url('~@/assets/image/top.png');
    // background: url('~@/assets/image/header/顶部菜单.png');
    background: url('~@/assets/image/header/顶部菜单.png');
    background-size: 100% 100%;
    z-index: 99999;
    display: flex;
    justify-content: space-between;
    .header-title {
      width: 15%;
      display: flex;

      .title-logo {
        height: 100%;
        width: 22%;
        margin-left: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .title-text {
        // height: 100%;
        width: 70%;
        color: white;
        font-size: 40px;
        margin: auto 20px;
        margin-left: 0;
        letter-spacing: 3px;

        .text-pinyin {
          display: flex;
          justify-content: space-around;
          font-size: 20px;
          letter-spacing: 2px;
        }
      }
    }

    .header-menu {
      width: 43%;
      height: 80%;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      color: white;
      font-size: 30px;

      .menu-item {
        &:hover {
          cursor: pointer;
        }
      }

      .menu-active {
        // width: 10%;
        height: 80%;
        display: flex;
        align-items: center;
        background: url('~@/assets/image/header/顶部导航-选中.png');
        background-size: 100% 100%;
        color: #05f8e8;
        font-weight: 900;
      }
    }

    .header-time {
      width: 42%;
      height: 80%;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      color: white;
      font-size: 25px;

      .time-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: PingFangSC-Medium;
        color: #ffffff;
        letter-spacing: 0.23px;
        text-align: center;
        font-weight: 500;
      }

      .about-style {
        display: flex;
        align-items: center;

        &:hover {
          cursor: pointer;
        }

        .el-tooltip__trigger {
          display: flex;
          align-items: center;
        }
      }

      .time-text {
        padding: 5px;
        // background-image: linear-gradient(180deg, #776ad63b 0%, #388aaca8 100%);
        background-image: linear-gradient(180deg, #776ad63b 0%, #388aaca8 100%);
        border-radius: 2px;
        letter-spacing: 3px;
      }
    }
  }

  .show-container {
    position: absolute;
    top: 130px;
    left: 5%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-image: linear-gradient(
      180deg,
      rgba(0, 20, 16, 0.32) 0%,
      #0075a6 100%
    );
    font-size: 18px;

    img {
      transform: rotateY(180deg);
    }
  }

  .interactive-container {
    position: absolute;
    top: 130px;
    left: 1%;
    background: url('@/assets/image/header/背景.png') no-repeat;
    background-size: 100% 100%;
    // background: url('@/assets/image/左侧菜单栏/左侧菜单栏底.png');
    height: 940px;
    width: 450px;
    // background-image: linear-gradient(
    //   180deg,
    //   rgba(71, 138, 160, 0.56) 0%,
    //   rgba(52, 122, 154, 0.56) 100%
    // );
    // border-radius: 10px;

    .container-title {
      // height: 50px;
      padding: 10px 20px;
      color: white;
      font-size: 25px;
      // background-image: linear-gradient(
      //   180deg,
      //   rgba(0, 20, 16, 0.32) 0%,
      //   #0075a6 100%
      // );
      background: url('@/assets/image/header/头.png') no-repeat;
      background-size: 100% 100%;
      // border-radius: 10px 10px 0px 0px;
      margin-bottom: 2px;
      position: relative;

      .title-context {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .retract {
          cursor: pointer;
        }
      }

      .title-search {
        height: 50px;
        width: 100%;
        padding: 10px;

        :deep .el-input__suffix {
          // 处理前缀图标不垂直居中的问题
          height: auto;
          font-size: 20px;

          &-inner {
            flex-direction: row-reverse;
            -webkit-flex-direction: row-reverse;
            display: flex;
          }
        }

        :deep .el-input__inner::placeholder {
          color: #90dbee;
        }

        :deep .el-button {
          padding: 0;
        }

        :deep .el-icon {
          color: white !important;
          font-size: 25px;
          position: relative;

          &:hover {
            color: #1e6988;
          }

          // &::after {
          //   content: '';
          //   width: 2px;
          //   height: 80%;
          //   left: -5px;
          //   position: absolute;
          //   top: 15%;
          //   background-color: #1e6988;
          // }
        }

        :deep .el-input__wrapper {
          background: #2587a0;
          border: none;
          border-radius: 4px 0 0 4px;
          box-shadow: none;
        }

        :deep .el-input__inner {
          color: white;
        }

        :deep .el-input-group__append,
        .el-input-group__prepend {
          background: #2587a0;
          border: none;
          border-radius: 0 4px 4px 0;
          box-shadow: none;

          &::after {
            content: '';
            width: 2px;
            height: 80%;
            left: -2px;
            position: absolute;
            top: 8%;
            background-color: #1e6988;
          }
        }
      }
    }

    .container-main {
      height: calc(100% - 140px);
      overflow: auto;

      .collapse-title {
        display: flex;
        align-items: center;
      }

      .card-item {
        width: calc(45% - 22px);
        height: 145px;
        margin: 10px 15px;
        padding-bottom: 5px;
        position: relative;
        display: inline-block;
        text-align: center;

        .card__input {
          position: absolute;
          display: block;
          outline: none;
          background: rgba(0, 0, 0, 0);
          padding: 0;
          margin: 5px;
          z-index: 9999;
          width: 20px;
          height: 20px;
          border: 3px solid #0082ff;
          border-radius: 13px;

          &:after {
            content: '\2714';
            color: #0082ff;
            font-size: 16px;
            border: none;
            border-radius: 2px;
            line-height: 16px;
          }
        }

        .img-content {
          color: white;
          height: 30%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 18px;

          &:hover {
            letter-spacing: 0.1em;
            text-shadow: 0 0 10px #000;
          }

          :deep .el-tooltip__popper {
            z-index: 99999999 !important;
          }
        }

        &:hover {
          cursor: pointer;
          box-shadow: 0 0 20px #0082ff;
        }
      }

      .card-click {
        box-shadow: 0 0 20px #0082ff;
      }
    }

    /*滚动条高宽度*/
    .container-main::-webkit-scrollbar {
      width: 0px;
      height: 4px;
    }

    /*滚动条滑块*/
    .container-main::-webkit-scrollbar-thumb {
      border-radius: 3px;
      box-shadow: inset 0 0 5px rgba(71, 138, 160, 0.56);
      background: #c7c4c4;
    }

    /*滚动条里面轨道*/
    .container-main ::-webkit-scrollbar-track {
      box-shadow: 1px 1px 5px rgba(71, 138, 160, 0.56) inset;
    }

    /*滚动条的小边角*/
    .container-main::-webkit-scrollbar-corner {
      background: transparent;
    }

    /*应用开发*/
    .container-main2 {
      height: calc(100% - 140px);
      overflow: auto;

      .collapse-title {
        display: flex;
        align-items: center;
      }

      .card-item {
        width: calc(45% - 22px);
        height: 145px;
        margin: 10px 15px;
        padding-bottom: 5px;
        position: relative;
        display: inline-block;
        text-align: center;

        .card__input {
          position: absolute;
          display: block;
          outline: none;
          background: rgba(0, 0, 0, 0);
          padding: 0;
          margin: 5px;
          z-index: 9999;
          width: 20px;
          height: 20px;
          border: 3px solid #0082ff;
          border-radius: 13px;

          &:after {
            content: '\2714';
            color: #0082ff;
            font-size: 16px;
            border: none;
            border-radius: 2px;
            line-height: 16px;
          }
        }

        .img-content {
          color: white;
          height: 30%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
          width: 100%;
          font-size: 20px;

          &:hover {
            letter-spacing: 0.1em;
            text-shadow: 0 0 10px #000;
          }

          :deep .el-tooltip__popper {
            z-index: 99999999 !important;
          }
        }

        &:hover {
          cursor: pointer;
          box-shadow: 0 0 20px #0082ff;
        }
      }

      .card-click {
        box-shadow: 0 0 20px #0082ff;
      }
    }

    /*滚动条高宽度*/
    .container-main2::-webkit-scrollbar {
      width: 0px;
      height: 4px;
    }

    /*滚动条滑块*/
    .container-main2::-webkit-scrollbar-thumb {
      border-radius: 3px;
      box-shadow: inset 0 0 5px rgba(71, 138, 160, 0.56);
      background: #c7c4c4;
    }

    /*滚动条里面轨道*/
    .container-main2 ::-webkit-scrollbar-track {
      box-shadow: 1px 1px 5px rgba(71, 138, 160, 0.56) inset;
    }

    /*滚动条的小边角*/
    .container-main2::-webkit-scrollbar-corner {
      background: transparent;
    }

    .container-btn {
      height: 50px;
      width: calc(100% - 20px);
      margin: 10px;
      background-image: linear-gradient(180deg, #57c7cd 0%, #1e9bb5 100%);
      border-radius: 6px;
      font-family: PingFangSC-Regular;
      font-size: 22px;
      color: #ffffff;
      letter-spacing: 0.51px;
      line-height: 22px;
      font-weight: 400;
      line-height: 50px;
      cursor: pointer;

      a {
        color: white;

        /* 状态一: 未被访问过的链接 */
        &:link {
          text-decoration: none;
          color: white;
        }

        /* 状态二: 已经访问过的链接 */
        &:visited {
          text-decoration: none;
          color: white;
        }

        /* 状态三: 鼠标划过(停留)的链接(默认红色) */
        &:hover {
          text-decoration: none;
          color: white;
        }

        /* 状态四: 被点击的链接 */
        &:active {
          text-decoration: none;
          color: white;
        }
      }
    }
  }

  .iframe {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
  }

  .xiala-style {
    display: flex;
    align-items: center;
    justify-content: center;

    .xiala-item {
      height: 300px;
      width: 400px;
      padding: 10px 40px;
      margin: 10px;
      border-radius: 8px;
      position: relative;

      div {
        font-family: YouSheBiaoTiHei;
        font-size: 30px;
        color: #94d6e3;
        letter-spacing: 1.85px;
        text-align: center;
        line-height: 30px;
        text-shadow: 0 1px 2px rgba(43, 86, 93, 0.39);
        font-weight: 400;
        width: 100%;
        padding: 10px 10px;
        margin: 0;
        background: #0b90c9b0;
        border-radius: 0px;
        position: absolute;
        bottom: 0;
        left: 0;
        cursor: pointer;
      }

      a {
        font-family: YouSheBiaoTiHei;
        font-size: 30px;
        color: #94d6e3;
        letter-spacing: 1.85px;
        text-align: center;
        line-height: 30px;
        text-shadow: 0 1px 2px rgba(43, 86, 93, 0.39);
        font-weight: 400;
        width: 100%;
        padding: 10px 10px;
        margin: 0;
        background: #0b90c9b0;
        border-radius: 0px;
        position: absolute;
        bottom: 0;
        left: 0;

        /* 状态一: 未被访问过的链接 */
        &:link {
          text-decoration: none;
          color: #94d6e3;
        }

        /* 状态二: 已经访问过的链接 */
        &:visited {
          text-decoration: none;
          color: #94d6e3;
        }

        /* 状态三: 鼠标划过(停留)的链接(默认红色) */
        &:hover {
          text-decoration: none;
          color: #94d6e3;
        }

        /* 状态四: 被点击的链接 */
        &:active {
          text-decoration: none;
          color: #94d6e3;
        }
      }
    }

    .item1 {
      background: url('@/assets/image/homePage/qun8.jpg');
      background-size: 100% 100%;
    }

    .item2 {
      background: url('@/assets/image/homePage/qun9.jpg');
      background-size: 100% 100%;
    }

    .item3 {
      background: url('@/assets/image/homePage/qun10.jpg');
      background-size: 100% 100%;
    }
  }

  .about {
    position: absolute;
    top: 90px;
    right: 10px;
  }

  .shifanyingyong {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 150%);
  }

  .norem-component-style {
    position: absolute;
    top: 460px;
  }

  :deep .el-collapse {
    border: none;
  }

  :deep .el-collapse-item__header {
    background: url('@/assets/image/header/分类背景.png');
    background-size: 100% 100%;
    color: white;
    border: none;
    padding-left: 20px;
  }

  :deep .el-collapse-item__wrap {
    background: rgba(0, 0, 0, 0);
    border: none;
  }

  :deep .el-collapse-item__content {
    color: white;
    padding: 25px;
    height: calc(100% - 120px);
    text-align: left;
    // display: flex;
    // flex-wrap: wrap;
    // align-content: flex-start;
  }

  :deep .el-collapse-item__arrow .el-collapse-item__arrow.is-active {
    color: #84dbeb;
  }

  :deep .el-card {
    border: none;
    background: rgba(0, 0, 0, 0) !important;
  }

  :deep .el-card__body {
    padding: 0;
    height: 100%;
  }

  .animated {
    -webkit-transition: 0.9s ease-out;
    -moz-transition: 0.9s ease-out;
    -ms-transition: 0.9s ease-out;
    -o-transition: 0.9s ease-out;
    transition: 0.9s ease-out;
  }

  .flipped-horizontal-right {
    -webkit-transform: rotateY(360deg);
    -moz-transform: rotateY(360deg);
    -ms-transform: rotateY(360deg);
    -o-transform: rotateY(360deg);
    transform: rotateY(360deg);
  }

  .flipped-horizontal-left {
    -webkit-transform: rotateY(-360deg);
    -moz-transform: rotateY(-360deg);
    -ms-transform: rotateY(-360deg);
    -o-transform: rotateY(-360deg);
    transform: rotateY(-360deg);
  }

  .flipped-vertical-top {
    -webkit-transform: rotateX(360deg);
    -moz-transform: rotateX(360deg);
    -ms-transform: rotateX(360deg);
    -o-transform: rotateX(360deg);
    transform: rotateX(360deg);
  }

  .flipped-vertical-bottom {
    -webkit-transform: rotateX(-360deg);
    -moz-transform: rotateX(-360deg);
    -ms-transform: rotateX(-360deg);
    -o-transform: rotateX(-360deg);
    transform: rotateX(-360deg);
  }

  // 数据中太卡牌样式
  .card-content {
    width: 100%;
    height: 150px;
    display: flex;
    padding: 10px;
    background-image: linear-gradient(
      180deg,
      rgba(71, 138, 160, 0.56) 0%,
      rgba(52, 122, 154, 0.56) 100%
    );

    &:hover {
      cursor: pointer;
    }
  }

  :deep .yewuzhongtai-item {
    .el-collapse-item__content {
      padding: 0%;
    }

    .content-img {
      position: relative;
      overflow: hidden;
      width: 30%;
      height: 100%;
      border-radius: 12px 0 0 12px;

      .yewu-img {
        height: 100%;
        width: 100%;
      }
    }

    .content-details {
      position: relative;
      width: 70%;
      height: 100%;
      word-spacing: 2px;

      .name {
        width: 100%;

        .name-title {
          width: 100%;
          text-align: left;
          font-family: PingFangSC-Regular;
          font-size: 20px;
          color: #ffffff;
          padding-left: 15px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .name-list {
          font-family: PingFangSC-Regular;
          font-size: 12px;
          color: #7affe3;
          text-align: left;
          font-weight: 400;
          padding-left: 15px;
          word-spacing: 2px;
        }
      }

      .yewu-item-border {
        border-top: 1px solid rgba(39, 136, 160, 1);
        width: 90%;
        margin: 3px 0;
        margin-left: 12px;
      }

      .details {
        width: 100%;
        text-align: left;
        padding-left: 15px;
        padding-right: 10px;
        letter-spacing: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
}
</style>