import type { RouteRecordRaw } from 'vue-router'

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
]

export default authRoutes