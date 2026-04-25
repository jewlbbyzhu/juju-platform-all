import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = createPageMetadata({
  title: '服务条款',
  description: '了解使用聚聚平台的服务条款和条件。',
  path: '/terms'
})

import { FileText, CheckCircle, AlertTriangle, Users, CreditCard, Ban, Gavel, Mail } from 'lucide-react'

const sections = [
  { icon: CheckCircle, title: '1. 服务接受', content: '使用我们的服务即表示您同意这些条款。如不同意，请勿使用服务。我们有权随时修改条款。' },
  { icon: Users, title: '2. 账户注册', content: '您必须年满18周岁，提供真实信息，保护密码安全，对账户活动负责。违反条款可能导致账户终止。' },
  { icon: FileText, title: '3. 服务使用', content: '您同意遵守法律，不发布虚假信息，不骚扰他人，不传播恶意软件，不干扰服务运行。' },
  { icon: CreditCard, title: '4. 支付和退款', content: '活动费用在报名时收取，支持微信、支付宝。退款政策因活动而异，活动开始后一般不予退款。' },
  { icon: Ban, title: '5. 禁止行为', content: '严禁发布违法内容、组织非法活动、冒充他人、欺诈行为、侵犯知识产权、收集他人信息。' },
  { icon: AlertTriangle, title: '6. 责任限制', content: '我们对服务的可用性不作保证，不对用户内容负责，不对活动质量负责，责任总额不超过支付费用。' },
  { icon: Gavel, title: '7. 知识产权', content: '平台内容归我们所有，用户保留其发布内容的知识产权，用户授予我们使用许可。' }
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <section className="py-16 lg:py-24">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-6">
                <FileText className="h-4 w-4" />服务条款
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">服务条款</h1>
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
              <p className="text-gray-600">如有问题，请联系 support@hfparty.asia</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
