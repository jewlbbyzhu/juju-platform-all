import type { RouteRecordRaw } from 'vue-router'

const financeRoutes: RouteRecordRaw[] = [
  {
    path: '/finance',
    name: 'Finance',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/finance/index',
    meta: {
      title: '财务管理',
      icon: 'Money',
      permissions: ['finance:view']
    },
    children: [
      {
        path: 'index',
        name: 'FinanceIndex',
        component: () => import('@/views/finance/index.vue'),
        meta: {
          title: '财务管理',
          permissions: ['finance:view']
        }
      }
    ]
  }
]

export default financeRoutes
