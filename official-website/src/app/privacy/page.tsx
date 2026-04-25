import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = createPageMetadata({
  title: '隐私政策',
  description: '了解聚聚如何保护您的隐私。',
  path: '/privacy'
})

import { Shield, Lock, Eye, UserCheck, Bell, FileText, Mail } from 'lucide-react'

const sections = [
  { icon: UserCheck, title: '1. 信息收集', content: '我们收集账户信息、个人资料、位置信息、设备信息、活动数据和支付信息，用于提供优质服务。' },
  { icon: Eye, title: '2. 信息使用', content: '我们使用您的信息提供服务、推荐活动、处理报名、发送通知、改进体验和防范风险。' },
  { icon: Lock, title: '3. 信息共享', content: '我们严格保护隐私，仅在获得同意、与活动组织者共享必要信息、遵守法律要求时共享。' },
  { icon: Shield, title: '4. 信息安全', content: '我们采取SSL加密、数据加密、安全审计、访问控制等多层次安全措施保护您的信息。' },
  { icon: UserCheck, title: '5. 您的权利', content: '您有权访问、更正、删除个人信息，限制处理，获取数据副本，撤回同意。' },
  { icon: Bell, title: '6. Cookie', content: '我们使用Cookie改善服务，包括必需Cookie、分析Cookie和功能Cookie。' },
  { icon: FileText, title: '7. 数据保留', content: '账户信息保留至删除后2年，交易记录保留5年，日志保留12个月。' }
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <section className="py-16 lg:py-24">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />隐私政策
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">隐私政策</h1>
              <p className="text-gray-600">最后更新：2024年1月</p>
            </div>

            <div className="space-y-6">
              {sections.map((section, index) => {
                const Icon = section.icon
                return (
                  <div key={index} className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff5f0]">
                        <Icon className="h-5 w-5 text-[#ff6b35]" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{section.content}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff5f0]">
                  <Mail className="h-5 w-5 text-[#ff6b35]" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">联系我们</h2>
              </div>
              <p className="text-gray-600">如有隐私问题，请联系 support@hfparty.asia</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
