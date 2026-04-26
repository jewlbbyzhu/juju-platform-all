// Mock数据 - 用于离线演示和测试
export const mockParties = [
  {
    id: 1,
    title: "周末音乐派对",
    description: "一起来享受周末的音乐派对吧！",
    location: "上海市黄浦区",
    startTime: "2026-04-10T19:00:00",
    endTime: "2026-04-10T23:00:00",
    maxParticipants: 50,
    currentParticipants: 32,
    price: 128,
    image: "https://picsum.photos/400/300?random=1",
    category: "music",
    status: "active",
  },
  {
    id: 2,
    title: "户外徒步活动",
    description: "周末一起去爬山，享受大自然！",
    location: "杭州市西湖区",
    startTime: "2026-04-12T08:00:00",
    endTime: "2026-04-12T16:00:00",
    maxParticipants: 20,
    currentParticipants: 15,
    price: 68,
    image: "https://picsum.photos/400/300?random=2",
    category: "sports",
    status: "active",
  },
  {
    id: 3,
    title: "美食探店聚会",
    description: "探索城市里的隐藏美食",
    location: "北京市朝阳区",
    startTime: "2026-04-11T18:00:00",
    endTime: "2026-04-11T21:00:00",
    maxParticipants: 12,
    currentParticipants: 8,
    price: 200,
    image: "https://picsum.photos/400/300?random=3",
    category: "food",
    status: "active",
  },
  {
    id: 4,
    title: "艺术画展参观",
    description: "一起欣赏当代艺术展览",
    location: "深圳市南山区",
    startTime: "2026-04-15T14:00:00",
    endTime: "2026-04-15T17:00:00",
    maxParticipants: 30,
    currentParticipants: 22,
    price: 88,
    image: "https://picsum.photos/400/300?random=4",
    category: "art",
    status: "active",
  },
];

export const mockUserProfile = {
  id: 1,
  nickname: "测试用户",
  avatar: "https://picsum.photos/100/100?random=5",
  phone: "13800138000",
  gender: 1,
  bio: "热爱生活，喜欢参加聚会活动",
  location: "上海市",
  email: "test@example.com",
  isVip: true,
  vipLevel: 3,
  vipExpireTime: "2026-12-31T23:59:59",
};

export const mockUserStats = {
  partyCount: 12,
  orderCount: 8,
  followingCount: 56,
  followerCount: 23,
};

export const mockOrders = [
  {
    id: 1,
    partyId: 1,
    partyTitle: "周末音乐派对",
    amount: 128,
    status: "paid",
    createTime: "2026-04-05T10:30:00",
    ticketName: "普通票",
    quantity: 1,
  },
  {
    id: 2,
    partyId: 3,
    partyTitle: "美食探店聚会",
    amount: 200,
    status: "pending",
    createTime: "2026-04-06T15:20:00",
    ticketName: "VIP票",
    quantity: 1,
  },
];

export const mockTickets = [
  {
    id: 1,
    partyId: 1,
    partyTitle: "周末音乐派对",
    ticketName: "普通票",
    status: "unused",
    useTime: null,
    qrCode: "TICKET001",
  },
];

export const mockWallet = {
  balance: 1280.50,
  totalRecharge: 5000,
  totalConsume: 3719.50,
  transactions: [
    {
      id: 1,
      type: "recharge",
      amount: 1000,
      description: "充值",
      createTime: "2026-04-01T10:00:00",
    },
    {
      id: 2,
      type: "pay",
      amount: -128,
      description: "购买周末音乐派对门票",
      createTime: "2026-04-05T10:30:00",
    },
  ],
};

export const mockPosts = [
  {
    id: 1,
    userId: 1,
    userNickname: "小明",
    userAvatar: "https://picsum.photos/50/50?random=6",
    content: "周末的音乐派对太棒了！认识了很多新朋友 🎵",
    images: ["https://picsum.photos/300/300?random=7"],
    likeCount: 23,
    commentCount: 5,
    isLiked: false,
    createTime: "2026-04-06T12:00:00",
  },
  {
    id: 2,
    userId: 2,
    userNickname: "小红",
    userAvatar: "https://picsum.photos/50/50?random=8",
    content: "今天的徒步活动虽然有点累，但是风景真的很美！",
    images: ["https://picsum.photos/300/300?random=9", "https://picsum.photos/300/300?random=10"],
    likeCount: 45,
    commentCount: 12,
    isLiked: true,
    createTime: "2026-04-05T18:30:00",
  },
];

export const mockNotifications = [
  {
    id: 1,
    type: "system",
    title: "欢迎加入聚聚",
    content: "感谢使用聚聚APP，发现精彩聚会！",
    isRead: false,
    createTime: "2026-04-07T09:00:00",
  },
  {
    id: 2,
    type: "order",
    title: "订单支付成功",
    content: "您的周末音乐派对订单已支付成功",
    isRead: true,
    createTime: "2026-04-05T10:35:00",
  },
];

export const mockVipInfo = {
  level: 3,
  levelName: "黄金会员",
  points: 2580,
  nextLevelPoints: 5000,
  privileges: [
    { name: "优先报名", icon: "⭐", description: "热门活动优先报名权" },
    { name: "专属客服", icon: "💬", description: "7x24小时专属客服" },
    { name: "生日特权", icon: "🎂", description: "生日月双倍积分" },
    { name: "活动折扣", icon: "💰", description: "活动费用9折优惠" },
  ],
};
