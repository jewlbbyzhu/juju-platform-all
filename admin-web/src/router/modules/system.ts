import type { RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/system/admins',
    meta: {
      title: '系统设置',
      icon: 'Setting',
      permissions: ['system:view']
    },
    children: [
      {
        path: 'admins',
        name: 'SystemAdmins',
        component: () => import('@/views/system/index.vue'),
        meta: {
          title: '系统设置',
          permissions: ['system:view']
        }
      }
    ]
  }
]

export default systemRoutes
