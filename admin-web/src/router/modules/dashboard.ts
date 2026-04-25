import type { RouteRecordRaw } from 'vue-router'

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard/overview',
    meta: {
      title: '仪表盘',
      requiresAuth: true,
    },
    children: [
      {
        path: 'overview',
        name: 'DashboardOverview',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '概览',
          requiresAuth: true,
          permissions: ['dashboard:view'],
        },
      },
    ],
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/users/list',
    meta: {
      title: '用户管理',
      requiresAuth: true,
      permissions: ['user:view'],
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/users/index.vue'),
        meta: {
          title: '用户列表',
          requiresAuth: true,
          permissions: ['user:view'],
        },
      },
      {
        path: ':id',
        name: 'UserDetail',
        component: () => import('@/views/users/detail.vue'),
        meta: {
          title: '用户详情',
          requiresAuth: true,
          permissions: ['user:view'],
        },
      },
    ],
  },
  {
    path: '/parties',
    name: 'Parties',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/parties/audit',
    meta: {
      title: '聚会管理',
      requiresAuth: true,
      permissions: ['party:view'],
    },
    children: [
      {
        path: 'audit',
        name: 'PartyAudit',
        component: () => import('@/views/parties/audit.vue'),
        meta: {
          title: '聚会审核',
          requiresAuth: true,
          permissions: ['party:audit'],
        },
      },
    ],
  },
  {
    path: '/finance',
    name: 'Finance',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/finance/overview',
    meta: {
      title: '财务管理',
      requiresAuth: true,
      roles: ['super_admin', 'finance_admin'],
      permissions: ['finance:view'],
    },
    children: [
      {
        path: 'overview',
        name: 'FinanceOverview',
        component: () => import('@/views/finance/index.vue'),
        meta: {
          title: '财务概览',
          requiresAuth: true,
          permissions: ['finance:view'],
        },
      },
      {
        path: 'withdrawals',
        name: 'WithdrawalManagement',
        component: () => import('@/views/finance/index.vue'),
        meta: {
          title: '提现管理',
          requiresAuth: true,
          permissions: ['finance:withdrawal'],
        },
      },
    ],
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/system/admins',
    meta: {
      title: '系统设置',
      requiresAuth: true,
      roles: ['super_admin'],
    },
    children: [
      {
        path: 'admins',
        name: 'AdminManagement',
        component: () => import('@/views/system/index.vue'),
        meta: {
          title: '管理员管理',
          requiresAuth: true,
          roles: ['super_admin'],
          permissions: ['admin:manage'],
        },
      },
    ],
  },
]

export default dashboardRoutes