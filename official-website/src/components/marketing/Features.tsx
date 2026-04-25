import type { Variants } from "framer-motion";
'use client'

import { motion } from 'framer-motion'
import { 
  Users, Calendar, MapPin, Shield, Zap, Heart, 
  ArrowRight, Sparkles, CheckCircle2,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  color: string
  gradient: string
  features: string[]
}

const features: Feature[] = [
  {
    icon: Users,
    title: '发现志同道合的朋友',
    description: '基于兴趣和地理位置，智能匹配与你志趣相投的伙伴',
    color: '#ff6b35',
    gradient: 'from-[#ff6b35] to-[#ff8c5a]',
    features: ['智能推荐', '兴趣标签', '共同好友']
  },
  {
    icon: Calendar,
    title: '丰富多样的聚会活动',
    description: '从音乐派对到户外探险，总有一款活动适合你',
    color: '#f7c600',
    gradient: 'from-[#f7c600] to-[#f9d423]',
    features: ['百种类型', '定期更新', '主题活动']
  },
  {
    icon: MapPin,
    title: '便捷的报名流程',
    description: '一键报名，在线支付，让参与聚会变得简单轻松',
    color: '#10b981',
    gradient: 'from-[#10b981] to-[#34d399]',
    features: ['一键报名', '在线支付', '电子票据']
  },
  {
    icon: Shield,
    title: '安全可靠的平台',
    description: '严格的实名认证和活动审核，保障每一次聚会安全',
    color: '#3b82f6',
    gradient: 'from-[#3b82f6] to-[#60a5fa]',
    features: ['实名认证', '活动审核', '保险保障']
  },
  {
    icon: Zap,
    title: '实时消息通知',
    description: '活动提醒、变更通知，确保你不错过任何精彩瞬间',
    color: '#f59e0b',
    gradient: 'from-[#f59e0b] to-[#fbbf24]',
    features: ['即时推送', '日程提醒', '变更通知']
  },
  {
    icon: Heart,
    title: 'VIP专属特权',
    description: '解锁专属活动、优先报名等更多尊享权益',
    color: '#ec4899',
    gradient: 'from-[#ec4899] to-[#f472b6]',
    features: ['专属活动', '优先报名', '专属客服']
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute top-40 -left-40 w-80 h-80 bg-[#ff6b35]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 -right-40 w-80 h-80 bg-[#f7c600]/5 rounded-full blur-3xl" />

      <div className="container px-4 md:px-6 lg:px-8">
        {/* 标题区域 - 移除动画依赖，使用CSS */}
        <div className="mb-16 lg:mb-20 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            核心功能
          </div>
          
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            为什么选择<span className="text-[#ff6b35]">聚聚</span>？
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            精心设计的功能，让每一次聚会都充满乐趣与惊喜
          </p>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature: Feature) => {
            const Icon: LucideIcon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 lg:p-8 hover:border-transparent hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-default"
              >
                {/* 背景渐变 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`}
                />

                {/* 右上角装饰 */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-bl-full"
                  style={{ backgroundColor: feature.color }}
                />
                
                {/* 图标 */}
                <div 
                  className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <Icon 
                    className="h-7 w-7 transition-colors duration-300" 
                    style={{ color: feature.color }}
                  />
                </div>
                
                {/* 标题 */}
                <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-[#ff6b35] transition-colors duration-300">
                  {feature.title}
                </h3>
                
                {/* 描述 */}
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* 特性标签 */}
                <div className="flex flex-wrap gap-2">
                  {feature.features.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 text-xs text-gray-500"
                    >
                      <CheckCircle2 className="h-3 w-3" style={{ color: feature.color }} />
                      {item}
                    </div>
                  ))}
                </div>

                {/* 悬停时显示的箭头 */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <ArrowRight className="h-5 w-5" style={{ color: feature.color }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 底部 CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            想要体验更多功能？
          </p>
          <Link
            href="/download"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-base font-semibold text-white hover:bg-gray-800 transition-all duration-200 hover:shadow-lg hover:shadow-gray-900/20 hover:-translate-y-0.5"
          >
            立即开始
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
