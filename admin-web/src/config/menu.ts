import type { MenuItem } from '@/types/global'
import {
  HomeFilled,
  User,
  Document,
  ShoppingCart,
  Wallet,
  PictureFilled,
  DataAnalysis,
  Setting,
  Cellphone
} from '@element-plus/icons-vue'

/**
 * Menu configuration for the admin system
 */
export const menuConfig: MenuItem[] = [
  {
    id: 'dashboard',
    title: '仪表盘',
    path: '/dashboard',
    icon: HomeFilled,
    permission: 'dashboard:view'
  },
  {
    id: 'users',
    title: '用户管理',
    path: '/users',
    icon: User,
    permission: 'user:view'
  },
  {
    id: 'parties',
    title: '聚会管理',
    path: '/parties',
    icon: Document,
    permission: 'party:view',
    children: [
      {
        id: 'parties-list',
        title: '聚会列表',
        path: '/parties',
        permission: 'party:view'
      },
      {
        id: 'parties-audit',
        title: '聚会审核',
        path: '/parties/audit',
        permission: 'party:audit'
      }
    ]
  },
  {
    id: 'orders',
    title: '订单管理',
    path: '/orders',
    icon: ShoppingCart,
    permission: 'order:view'
  },
  {
    id: 'finance',
    title: '财务管理',
    path: '/finance',
    icon: Wallet,
    permission: 'finance:view'
  },
  {
    id: 'content',
    title: '内容管理',
    path: '/content',
    icon: PictureFilled,
    permission: 'content:view'
  },
  {
    id: 'analytics',
    title: '数据分析',
    path: '/analytics',
    icon: DataAnalysis,
    permission: 'analytics:view'
  },
  {
    id: 'system',
    title: '系统设置',
    path: '/system',
    icon: Setting,
    permission: 'system:view',
    children: [
      {
        id: 'system-admins',
        title: '管理员管理',
        path: '/system/admins',
        permission: 'admin:manage'
      },
      {
        id: 'system-roles',
        title: '角色管理',
        path: '/system/roles',
        permission: 'role:manage'
      },
      {
        id: 'system-permissions',
        title: '权限管理',
        path: '/system/permissions',
        permission: 'permission:manage'
      },
      {
        id: 'system-logs',
        title: '操作日志',
        path: '/system/logs',
        permission: 'log:manage'
      },
      {
        id: 'system-configs',
        title: '系统配置',
        path: '/system/configs',
        permission: 'config:manage'
      }
    ]
  },
  {
    id: 'app',
    title: 'App管理',
    path: '/app',
    icon: Cellphone,
    permission: 'app:view',
    children: [
      {
        id: 'app-versions',
        title: '版本管理',
        path: '/app/versions',
        permission: 'version:manage'
      },
      {
        id: 'app-feedback',
        title: '用户反馈',
        path: '/app/feedback',
        permission: 'feedback:manage'
      }
    ]
  }
]
