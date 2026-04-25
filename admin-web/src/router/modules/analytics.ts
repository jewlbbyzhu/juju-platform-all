import type { RouteRecordRaw } from 'vue-router'

const analyticsRoutes: RouteRecordRaw[] = [
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/views/analytics/index.vue'),
    meta: {
      title: '数据分析',
      icon: 'DataAnalysis',
      permissions: ['analytics:view']
    }
  }
]

export default analyticsRoutes
