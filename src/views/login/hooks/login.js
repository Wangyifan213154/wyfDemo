import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import emitter from '@/utils/eventbus'

export default function () {
  const state = reactive({
    userName: '',
    password: ''
  })
  const loginBGImgUrl = ref(require(`../../../assets/image/login/loginBG.png`))
  const router = useRouter()
  emitter.on('load', async (val) => {
    // 语音登录
    if (val.cmd == 'system-load') {
      state.userName = 'admin'
      state.password = '123456'
      loginClick()
    }
  })
  const loginClick = () => {
    window.localStorage.setItem('token', 'test')
    router.push({
      path: '/home'
    })
  }
  return {
    loginClick,
    loginBGImgUrl,
    state
  }
}
