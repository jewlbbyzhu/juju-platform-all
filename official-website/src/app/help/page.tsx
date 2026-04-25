import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata'
import HelpPageClient from './HelpPageClient'

export const metadata: Metadata = createPageMetadata({
  title: '帮助中心',
  description: '聚聚帮助中心提供全面的使用指南和常见问题解答。了解如何发现聚会、报名活动、支付订单、管理账户等。',
  path: '/help',
  imageUrl: '/og-help.png'
})

export default function HelpPage() {
  return <HelpPageClient />
}
