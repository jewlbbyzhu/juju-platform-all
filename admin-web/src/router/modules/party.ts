import type { RouteRecordRaw } from 'vue-router'

const partyRoutes: RouteRecordRaw[] = [
  {
    path: '/parties',
    name: 'Parties',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/parties/list',
    meta: {
      title: '聚会管理',
      icon: 'Calendar',
      permissions: ['party:view']
    },
    children: [
      {
        path: 'list',
        name: 'PartyList',
        component: () => import('@/views/parties/index.vue'),
        meta: {
          title: '聚会列表',
          permissions: ['party:view']
        }
      },
      {
        path: 'audit',
        name: 'PartyAudit',
        component: () => import('@/views/parties/audit.vue'),
        meta: {
          title: '聚会审核',
          permissions: ['party:audit']
        }
      }
    ]
  }
]

export default partyRoutes
