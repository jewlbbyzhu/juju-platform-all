import type { Metadata } from 'next'

const SITE_NAME = '聚聚'
const SITE_DESCRIPTION = '聚聚是一个创新的社交聚会平台，帮助用户轻松组织和管理各种聚会活动，包括派对、聚餐、户外活动等。发现身边的精彩聚会，结识志同道合的朋友，让每一次聚会都充满惊喜。'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hfparty.asia'
const SITE_KEYWORDS = ['聚会', '派对', '社交', '活动', '聚餐', '户外活动', '聚会平台', '交友', '同城活动', '线下聚会', '派对平台', '社交活动', '兴趣聚会']

const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 发现精彩聚会，结识志同道合的朋友`,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - 发现精彩聚会，结识志同道合的朋友`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - 社交聚会平台`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@juju_party',
    site: '@juju_party'
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#ff6b35' },
    ],
  },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'zh-CN': SITE_URL,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  other: {
    'baidu-site-verification': process.env.NEXT_PUBLIC_BAIDU_VERIFICATION || '',
    'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    'theme-color': '#ff6b35',
    'msapplication-TileColor': '#ff6b35',
    'msapplication-config': '/browserconfig.xml',
  },
}

interface PartyMetadataOptions {
  title: string
  description: string
  imageUrl?: string
  location?: string
  startTime?: string
  endTime?: string
  category?: string
}

export function createPartyMetadata(options: PartyMetadataOptions): Metadata {
  const { title, description, imageUrl, startTime, endTime } = options

  const baseOpenGraph = DEFAULT_METADATA.openGraph as Record<string, unknown> | undefined
  const baseImages = baseOpenGraph?.images as Array<{ url: string; width: number; height: number; alt: string }> | undefined

  return {
    ...DEFAULT_METADATA,
    title,
    description,
    openGraph: {
      ...baseOpenGraph,
      title,
      description,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ] : baseImages || [],
      type: 'article',
      publishedTime: startTime,
      modifiedTime: endTime,
    },
    twitter: {
      ...DEFAULT_METADATA.twitter,
      title,
      description,
      images: imageUrl ? [imageUrl] : DEFAULT_METADATA.twitter?.images,
    },
  }
}

interface PageMetadataOptions {
  title: string
  description: string
  path: string
  imageUrl?: string
}

export function createPageMetadata(options: PageMetadataOptions): Metadata {
  const { title, description, path, imageUrl } = options
  const url = `${SITE_URL}${path}`

  const baseOpenGraph = DEFAULT_METADATA.openGraph as Record<string, unknown> | undefined
  const baseImages = baseOpenGraph?.images as Array<{ url: string; width: number; height: number; alt: string }> | undefined

  return {
    ...DEFAULT_METADATA,
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...baseOpenGraph,
      title,
      description,
      url,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ] : baseImages,
    },
    twitter: {
      ...DEFAULT_METADATA.twitter,
      title,
      description,
      images: imageUrl ? [imageUrl] : DEFAULT_METADATA.twitter?.images,
    },
  }
}

function createMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const baseOpenGraph = DEFAULT_METADATA.openGraph as Record<string, unknown> | undefined
  const overridesOpenGraph = overrides.openGraph as Record<string, unknown> | undefined

  return {
    ...DEFAULT_METADATA,
    ...overrides,
    openGraph: {
      ...baseOpenGraph,
      ...overridesOpenGraph,
    },
    twitter: {
      ...DEFAULT_METADATA.twitter,
      ...overrides.twitter,
    },
  }
}

export { SITE_NAME, SITE_DESCRIPTION, SITE_URL, SITE_KEYWORDS, DEFAULT_METADATA, createMetadata }
