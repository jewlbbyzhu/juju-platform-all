import type { MenuGroupData, UserStats, UserProfile } from './index';

export const MENU_GROUPS: MenuGroupData[] = [
  {
    title: '我的活动',
    items: [
      {
        icon: '🎉',
        title: '我的聚会',
        subtitle: '查看参与的聚会',
        route: 'MyParties',
        colorScheme: 'primary',
      },
      {
        icon: '🎫',
        title: '我的票券',
        subtitle: '管理您的票券',
        route: 'MyTickets',
        colorScheme: 'secondary',
      },
      {
        icon: '📦',
        title: '我的订单',
        subtitle: '查看订单记录',
        route: 'MyOrders',
        colorScheme: 'success',
      },
    ],
  },
  {
    title: '会员服务',
    items: [
      {
        icon: '👑',
        title: 'VIP中心',
        subtitle: '会员权益与特权',
        route: 'VIPCenter',
        badge: 'NEW',
        colorScheme: 'gold',
      },
      {
        icon: '💎',
        title: '我的积分',
        subtitle: '积分兑换好礼',
        route: 'Points',
        colorScheme: 'info',
      },
      {
        icon: '💰',
        title: '我的钱包',
        subtitle: '余额与交易记录',
        route: 'Wallet',
        colorScheme: 'warning',
      },
    ],
  },
  {
    title: '社交互动',
    items: [
      {
        icon: '❤️',
        title: '我的收藏',
        subtitle: '收藏的活动',
        route: 'Favorites',
        colorScheme: 'primary',
      },
      {
        icon: '👥',
        title: '我的关注',
        subtitle: '关注的人',
        route: 'Following',
        colorScheme: 'secondary',
      },
      {
        icon: '💬',
        title: '消息中心',
        subtitle: '查看消息通知',
        route: 'Notifications',
        badge: '3',
        colorScheme: 'info',
      },
    ],
  },
  {
    title: '系统设置',
    items: [
      {
        icon: '⚙️',
        title: '设置',
        subtitle: '账号与安全',
        route: 'Settings',
        colorScheme: 'info',
      },
      {
        icon: '❓',
        title: '帮助与反馈',
        subtitle: '常见问题解答',
        route: 'Help',
        colorScheme: 'warning',
      },
    ],
  },
];

export const DEFAULT_STATS: UserStats = {
  partyCount: 12,
  orderCount: 8,
  followingCount: 156,
  followerCount: 89,
};

export const DEFAULT_PROFILE: UserProfile = {
  id: 1,
  nickname: '聚聚用户',
  avatar: 'https://i.pravatar.cc/200?1',
  bio: '热爱生活，享受聚会 🎉',
  vipLevel: 3,
};
