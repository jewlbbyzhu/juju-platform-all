const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001'

export const BACKEND_API_URL_V1 =
  process.env.NEXT_PUBLIC_BACKEND_API_URL_V1 || `${BACKEND_BASE_URL}/api/v1`

export const BACKEND_API_URL_V2 =
  process.env.NEXT_PUBLIC_BACKEND_API_URL_V2 || `${BACKEND_BASE_URL}/api/v2`

export const PLATFORMS = {
  android: {
    id: 'android' as const,
    name: 'Android',
    icon: 'logo-android',
    description: '适用于Android 8.0+',
    downloadUrl: 'https://hfparty.asia/download/juju-app-latest.apk',
    qrCodeUrl: '/qrcodes/android.png'
  },
  ios: {
    id: 'ios' as const,
    name: 'iOS',
    icon: 'logo-apple',
    description: '适用于iOS 14.0+',
    downloadUrl: process.env.NEXT_PUBLIC_IOS_DOWNLOAD_URL || '',
    qrCodeUrl: '/qrcodes/ios.png'
  },
  wechat: {
    id: 'wechat' as const,
    name: '微信小程序',
    icon: 'logo-wechat',
    description: '微信内直接打开',
    downloadUrl: process.env.NEXT_PUBLIC_WECHAT_MINIPROGRAM_URL || '',
    qrCodeUrl: '/qrcodes/wechat.png'
  }
} as const

export const NAV_ITEMS = [
  { label: '首页', href: '/' },
  { label: '下载', href: '/download' },
  { label: '帮助中心', href: '/help' }
] as const

export const FOOTER_LINKS = {
  product: [
    { label: '关于我们', href: '/about' },
    { label: '隐私政策', href: '/privacy' },
    { label: '服务条款', href: '/terms' }
  ],
  support: [
    { label: '帮助中心', href: '/help' },
    { label: '联系我们', href: '/contact' },
    { label: '反馈建议', href: '/feedback' }
  ],
  about: [
    { label: '公司介绍', href: '/about' },
    { label: '加入我们', href: '/careers' },
    { label: '合作伙伴', href: '/partners' }
  ]
} as const

export const SOCIAL_LINKS = [
  { name: '微信', icon: 'logo-wechat', url: 'https://weixin.qq.com' },
  { name: '微博', icon: 'logo-weibo', url: 'https://weibo.com' },
  { name: '抖音', icon: 'logo-tiktok', url: 'https://douyin.com' }
] as const
