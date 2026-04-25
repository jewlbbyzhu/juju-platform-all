'use client'

import { Download, Star, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const benefits = [
  '发现身边精彩活动',
  '一键轻松报名',
  '结识志同道合的朋友',
  '实时消息提醒'
]

export default function DownloadCTA() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff6b35]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#f7c600]/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            立即下载
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            准备好开始你的
            <span className="text-[#ff6b35]">精彩聚会之旅</span>了吗？
          </h2>

          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            下载聚聚App，发现身边的精彩活动，结识志同道合的朋友
          </p>

          {/* 评分展示 */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-white">
              <span className="font-bold">4.9</span> 分，来自 <span className="font-bold">2,000+</span> 评价
            </span>
          </div>

          {/* 优势列表 */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-gray-300"
              >
                <CheckCircle2 className="h-5 w-5 text-[#ff6b35]" />
                {benefit}
              </div>
            ))}
          </div>

          {/* CTA 按钮 */}
          <div>
            <Link
              href="/download"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#ff6b35] px-8 py-4 text-lg font-semibold text-white hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-xl hover:shadow-[#ff6b35]/30"
            >
              <Download className="h-5 w-5" />
              立即下载
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 平台支持 */}
          <p className="mt-6 text-sm text-gray-400">
            支持 Android、iOS 和 微信小程序
          </p>
        </div>
      </div>
    </section>
  )
}
