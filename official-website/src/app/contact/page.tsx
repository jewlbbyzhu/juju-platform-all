import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = createPageMetadata({
  title: '联系我们',
  description: '联系聚聚团队，获取帮助和支持。',
  path: '/contact',
  imageUrl: '/og-contact.png'
})

import { Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const contactMethods = [
  { icon: Mail, title: '电子邮件', value: 'support@hfparty.asia', href: 'mailto:support@hfparty.asia', color: '#ff6b35' },
  { icon: Phone, title: '客服热线', value: '400-888-8888', href: 'tel:400-888-8888', color: '#10b981' },
  { icon: MapPin, title: '公司地址', value: '中国安徽省合肥市', href: '#', color: '#3b82f6' },
  { icon: Clock, title: '工作时间', value: '周一至周五 9:00-18:00', href: '#', color: '#f59e0b' }
]

const quickLinks = [
  { icon: HelpCircle, title: '帮助中心', href: '/help', color: '#8b5cf6' },
  { icon: MessageCircle, title: '意见反馈', href: '/feedback', color: '#ec4899' }
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] via-white to-[#fff9f5]">
      <section className="py-16 lg:py-24">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-6">
              <MessageCircle className="h-4 w-4" />联系我们
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">有任何问题？<br /><span className="text-[#ff6b35]">我们随时为您服务</span></h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <a key={index} href={method.href} className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-[#ff6b35]/30 hover:shadow-lg transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${method.color}15` }}>
                    <Icon className="h-6 w-6" style={{ color: method.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                    <p className="text-[#ff6b35] font-medium">{method.value}</p>
                  </div>
                </a>
              )
            })}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">快速链接</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => {
                const Icon = link.icon
                return (
                  <Link key={index} href={link.href} className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 hover:border-[#ff6b35]/30 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${link.color}15` }}>
                      <Icon className="h-5 w-5" style={{ color: link.color }} />
                    </div>
                    <span className="font-medium text-gray-900">{link.title}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-[#ff6b35] group-hover:translate-x-1 transition-all" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
