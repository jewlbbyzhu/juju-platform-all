import type { RouteRecordRaw } from 'vue-router'

const orderRoutes: RouteRecordRaw[] = [
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/orders/list',
    meta: {
      title: '订单管理',
      icon: 'ShoppingCart',
      permissions: ['order:view']
    },
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/orders/index.vue'),
        meta: {
          title: '订单列表',
          permissions: ['order:view']
        }
      },
      {
        path: ':id',
        name: 'OrderDetail',
        component: () => import('@/views/orders/detail.vue'),
        meta: {
          title: '订单详情',
          permissions: ['order:view'],
          hidden: true
        }
      }
    ]
  }
]

export default orderRoutes
