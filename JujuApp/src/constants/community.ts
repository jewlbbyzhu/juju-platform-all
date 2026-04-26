import type { Post, Tag } from '../types/api';

export const MOCK_TOPICS: Tag[] = [
  { id: 1, name: '周末聚会', icon: '🎉', count: 1280, isHot: true },
  { id: 2, name: '美食探店', icon: '🍜', count: 956, isHot: true },
  { id: 3, name: '户外徒步', icon: '🏃', count: 743, isHot: false },
  { id: 4, name: '剧本杀', icon: '🎭', count: 621, isHot: true },
  { id: 5, name: '电影约会', icon: '🎬', count: 534, isHot: false },
  { id: 6, name: 'KTV嗨唱', icon: '🎤', count: 489, isHot: false },
];

export interface SuggestedUser {
  id: number;
  name: string;
  avatar: string;
  isVerified?: boolean;
}

export const MOCK_SUGGESTED_USERS: SuggestedUser[] = [
  {
    id: 1,
    name: '小明',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isVerified: true,
  },
  {
    id: 2,
    name: '小红',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isVerified: false,
  },
  {
    id: 3,
    name: '阿杰',
    avatar: 'https://i.pravatar.cc/150?img=8',
    isVerified: true,
  },
  {
    id: 4,
    name: '小美',
    avatar: 'https://i.pravatar.cc/150?img=9',
    isVerified: false,
  },
  {
    id: 5,
    name: '大熊',
    avatar: 'https://i.pravatar.cc/150?img=12',
    isVerified: true,
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 1,
    userId: 1,
    title: '周末烧烤聚会，一起来玩！',
    content:
      '这周末组织了一场户外烧烤聚会，地点在朝阳公园，欢迎小伙伴们一起来玩！',
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    ],
    author: { id: 1, name: '小明', avatar: 'https://i.pravatar.cc/150?img=1' },
    createdAt: '2小时前',
    likes: 128,
    comments: 32,
    tags: ['周末聚会', '烧烤'],
    isLiked: false,
  },
  {
    id: 2,
    userId: 2,
    title: '发现一家超棒的日料店！',
    content:
      '今天和朋友去了这家藏在巷子里的日料店，寿司超级新鲜，环境也很有氛围感。',
    images: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    ],
    author: { id: 2, name: '小红', avatar: 'https://i.pravatar.cc/150?img=5' },
    createdAt: '4小时前',
    likes: 256,
    comments: 45,
    tags: ['美食探店', '日料'],
    isLiked: true,
  },
  {
    id: 3,
    userId: 3,
    title: '剧本杀组队，还差2人！',
    content:
      '今晚8点的剧本杀，目前4人还差2人。主题是《迷雾庄园》，难度中等，新手友好。',
    images: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    ],
    author: { id: 3, name: '阿杰', avatar: 'https://i.pravatar.cc/150?img=8' },
    createdAt: '5小时前',
    likes: 89,
    comments: 23,
    tags: ['剧本杀', '组队'],
    isLiked: false,
  },
];
