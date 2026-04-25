"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PlatformSelector from '@/components/download/PlatformSelector'
import DownloadButton from '@/components/download/DownloadButton'
import QRCode from '@/components/download/QRCode'
import type { Platform } from '@/types'
import { Shield, Clock, Headphones, Star, Download, CheckCircle2, Zap } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: '安全可靠',
    description: '官方正版应用，多重安全保障，保护您的账户安全',
  },
  {
    icon: Clock,
    title: '实时更新',
    description: '持续优化体验，第一时间获取新功能和活动信息',
  },
  {
    icon: Headphones,
    title: '专属客服',
    description: '7x24小时在线客服，随时为您解答任何问题',
  }
]

const benefits = [
  '发现身边精彩聚会',
  '一键快速报名',
  '实时消息推送',
  '专属VIP特权',
  '安全支付保障',
  '7x24小时客服'
]

export default function DownloadPageClient() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('android')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 检测用户平台
    const userAgent = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setSelectedPlatform('ios')
    } else if (/micromessenger/.test(userAgent)) {
      setSelectedPlatform('wechat')
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] via-white to-[#fff9f5]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-0 w-96 h-96 bg-[#ff6b35]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#f7c600]/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-4">
                <Zap className="h-4 w-4" />
                应用下载
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                下载聚聚应用
              </h1>
              
              <p className="text-lg text-gray-600">
                选择你的平台，开始精彩的聚会之旅
              </p>

              {/* Rating */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">
                  <span className="font-semibold">4.9</span> 分 · 2,000+ 好评
                </span>
              </div>
            </motion.div>

            {/* Platform Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <PlatformSelector
                selectedPlatform={selectedPlatform}
                onPlatformChange={setSelectedPlatform}
              />
            </motion.div>

            {/* Download Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16"
            >
              <DownloadButton platform={selectedPlatform} />
              <QRCode platform={selectedPlatform} />
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-gray-200 bg-white p-8 mb-16"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                下载聚聚，你将获得
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#ff6b35] flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                为什么选择聚聚
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="text-center p-6 rounded-2xl border border-gray-200 bg-white hover:border-[#ff6b35]/30 hover:shadow-lg transition-all"
                    >
                      <div className="mx-auto w-14 h-14 rounded-xl bg-[#fff5f0] flex items-center justify-center mb-4">
                        <Icon className="h-7 w-7 text-[#ff6b35]" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
