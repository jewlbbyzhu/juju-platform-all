import type { RouteRecordRaw } from 'vue-router'

const appRoutes: RouteRecordRaw[] = [
  {
    path: '/app',
    name: 'App',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/app/versions',
    meta: {
      title: 'App版本管理',
      icon: 'Cellphone',
      permissions: ['app:view']
    },
    children: [
      {
        path: 'versions',
        name: 'AppVersions',
        component: () => import('@/views/app/index.vue'),
        meta: {
          title: 'App版本管理',
          permissions: ['app:view']
        }
      }
    ]
  }
]

export default appRoutes
