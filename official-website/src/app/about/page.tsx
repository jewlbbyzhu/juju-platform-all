import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = createPageMetadata({
  title: '关于我们',
  description: '了解聚聚的故事、使命和愿景。聚聚成立于2024年，是一个专注于社交聚会的创新平台。',
  path: '/about',
  imageUrl: '/og-about.png'
})

import Link from 'next/link'
import { Users, Target, Award, Globe, Heart, Zap, Shield, Sparkles, Mail, Briefcase, MapPin, Clock } from 'lucide-react'

const values = [
  { icon: Heart, title: '用户至上', description: '始终以用户需求为中心', color: '#ff6b35' },
  { icon: Zap, title: '创新驱动', description: '持续创新，不断优化', color: '#f7c600' },
  { icon: Shield, title: '诚信透明', description: '保持诚信经营', color: '#10b981' },
  { icon: Users, title: '共同成长', description: '与用户共同成长', color: '#3b82f6' }
]

const missions = [
  { icon: Users, title: '连接人与人', description: '打破社交壁垒', color: 'from-purple-500 to-pink-500' },
  { icon: Target, title: '创造美好回忆', description: '提供优质聚会体验', color: 'from-blue-500 to-cyan-500' },
  { icon: Award, title: '提升生活质量', description: '丰富业余生活', color: 'from-green-500 to-emerald-500' },
  { icon: Globe, title: '构建社交生态', description: '打造健康生态系统', color: 'from-orange-500 to-amber-500' }
]

const stats = [
  { value: '10,000+', label: '成功活动' },
  { value: '50,000+', label: '活跃用户' },
  { value: '100+', label: '合作品牌' },
  { value: '98%', label: '用户满意度' }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff5f0] via-white to-[#fff9f5] py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container relative px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              我们的故事
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              关于<span className="text-[#ff6b35]">聚聚</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              让每一次聚会都充满惊喜，让每一个人都能找到属于自己的精彩
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-gray-100">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#ff6b35] mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">我们的故事</h2>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>聚聚成立于2024年，是一个专注于社交聚会的创新平台。</p>
                <p>我们相信，每一次聚会都是一次美好的相遇，每一次相遇都可能改变人生。</p>
              </div>
            </div>

            {/* Mission Grid */}
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">我们的使命</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {missions.map((mission, index) => {
                  const Icon = mission.icon
                  return (
                    <div key={index} className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-[#ff6b35]/30 hover:shadow-lg transition-all">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${mission.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">{mission.title}</h3>
                      <p className="text-gray-600">{mission.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Values */}
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">我们的价值观</h2>
              <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {values.map((value, index) => {
                    const Icon = value.icon
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${value.color}15` }}>
                          <Icon className="h-5 w-5" style={{ color: value.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{value.title}</h3>
                          <p className="text-sm text-gray-600">{value.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">联系我们</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <a href="mailto:support@hfparty.asia" className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-[#ff6b35]/30 hover:shadow-lg transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff5f0]">
                    <Mail className="h-6 w-6 text-[#ff6b35]" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">客服邮箱</div>
                    <div className="text-[#ff6b35] group-hover:underline">support@hfparty.asia</div>
                  </div>
                </a>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff5f0]">
                    <MapPin className="h-6 w-6 text-[#ff6b35]" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">公司地址</div>
                    <div className="text-gray-600">中国安徽省合肥市</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
