import type { RouteRecordRaw } from 'vue-router'

const contentRoutes: RouteRecordRaw[] = [
  {
    path: '/content',
    name: 'Content',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/content/index',
    meta: {
      title: '内容管理',
      icon: 'Document',
      permissions: ['content:view']
    },
    children: [
      {
        path: 'index',
        name: 'ContentIndex',
        component: () => import('@/views/content/index.vue'),
        meta: {
          title: '内容管理',
          permissions: ['content:view']
        }
      }
    ]
  }
]

export default contentRoutes
