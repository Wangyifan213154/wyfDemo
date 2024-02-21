import {
  createRouter,
  createWebHistory,
  createWebHashHistory
} from 'vue-router'
import { useStore } from 'vuex'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: () =>
      import(/* webpackChunkName: "home-chunk" */ '../views/HomeView.vue'),
    children: []
  },
  {
    path: '/login',
    component: () => import('../views/login/Login.vue')
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/:pathMatch(.*)', // "/:pathMatch(.*)*" 返回数组
    component: () => import('../components/content/NotFound.vue')
  }
]

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes
})

// 添加动态路由
// const route1 = {
//   path: "/xx",
//   component: () => import("xx.vue"),
// };
// router.addRoute(route1);

// router.addRoute("home", {
//   path: "xx",
//   component: () => import("xx.vue"),
// });

// 导航首位验证登录
router.beforeEach((to, from) => {
  if (to.path !== '/login') {
    const token = window.localStorage.getItem('token')
    if (!token) {
      return '/login'
    }
  }
})

export default router
