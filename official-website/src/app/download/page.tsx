import type { Metadata } from 'next'
import DownloadPageClient from './DownloadPageClient'
import { createPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = createPageMetadata({
  title: '下载',
  description: '下载聚聚应用，支持Android、iOS和微信小程序',
  path: '/download',
  imageUrl: '/og-download.png'
})

export default function DownloadPage() {
  return <DownloadPageClient />
}
