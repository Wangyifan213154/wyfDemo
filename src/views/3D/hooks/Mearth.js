import { onMounted } from 'vue'
import { useStore } from 'vuex'
// import * as pieearth from 'pieearthweb'
let Cesium = require("cesium/Cesium");
let widgets = require("cesium/Widgets/widgets.css");
import emitter from '@/utils/eventbus'


const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNGNmNjU4Yi1iMWM0LTQ5YzEtYjkyZC0wNzliODdkYzlhMWIiLCJpZCI6NDUzNTAsImlhdCI6MTYxNDkzMjg1Mn0.lt2c05x6ZZYu6-tlJ1xMUnFIbr3a7KJOZNB_Afkt9RQ"

export default function () {
  const store = useStore()
  // 只有等元素挂载渲染后，才可以将 html元素与cesium的viewer挂载
  onMounted(() => {
    window.viewer = new MEarth.Viewer("container", {
      baseLayer: new MEarth.ImageryLayer(
        new MEarth.UrlTemplateImageryProvider({
          url:
            googleConfig.url4,
        })
      ),
    });
    

  })

  return {}
}
