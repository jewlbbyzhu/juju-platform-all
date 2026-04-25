import type { Metadata } from 'next'
import Hero from '@/components/marketing/Hero'
import Features from '@/components/marketing/Features'
import PartyPreview from '@/components/marketing/PartyPreview'
import DownloadCTA from '@/components/marketing/DownloadCTA'

export const metadata: Metadata = {
  title: '聚聚 - 发现精彩聚会，结识志同道合的朋友',
  description: '聚聚是一个创新的社交聚会平台，帮助你发现身边的精彩活动，结识志同道合的朋友，创造美好回忆。支持Android、iOS和微信小程序，立即下载开启精彩聚会之旅！',
  keywords: ['聚会', '派对', '社交', '活动', '聚餐', '户外活动', '聚会平台', '交友', '同城活动', '线下聚会', '派对平台', '社交活动', '兴趣聚会', '聚聚'],
  openGraph: {
    title: '聚聚 - 发现精彩聚会，结识志同道合的朋友',
    description: '聚聚是一个创新的社交聚会平台，帮助你发现身边的精彩活动，结识志同道合的朋友。已帮助 50,000+ 用户找到精彩聚会！',
    url: '/',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: '聚聚 - 社交聚会平台'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '聚聚 - 发现精彩聚会',
    description: '发现身边的精彩活动，结识志同道合的朋友',
    images: ['/og-home.png'],
  },
  alternates: {
    canonical: '/'
  },
  verification: {
    google: 'google-site-verification-code',
  },
  other: {
    'baidu-site-verification': 'baidu-verification-code',
  }
}

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <PartyPreview />
      <DownloadCTA />
    </>
  )
}
