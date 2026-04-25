import type { Variants } from "framer-motion";
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Play, ChevronDown, Download, Star, Zap } from 'lucide-react'
import OptimizedImage from '@/components/ui/OptimizedImage'

export default function Hero() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-[#fff5f0] via-white to-[#fff9f5]">
      {/* 背景装饰 - 网格 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      
      {/* 背景装饰 - 渐变光晕 - 使用CSS动画代替JS动画确保SSR可见 */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-[#ff6b35]/10 to-[#f7c600]/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#f7c600]/10 to-[#ff6b35]/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      
      {/* 动态粒子效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#ff6b35]/20 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="container relative px-4 py-16 md:px-6 md:py-20 lg:py-28 xl:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh]">
          {/* 左侧内容 - 使用CSS确保SSR可见性 */}
          <motion.div
            initial={{ opacity: 0.95, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left z-10"
          >
            {/* 标签 */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff6b35]/20 bg-white/80 backdrop-blur-sm px-4 py-2 shadow-sm hover:shadow-md transition-shadow cursor-default">
              <Sparkles className="h-4 w-4 text-[#ff6b35]" />
              <span className="text-sm font-medium text-gray-700">
                已帮助 50,000+ 用户找到精彩聚会
              </span>
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            {/* 主标题 - 确保始终可见 */}
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl leading-tight">
              让每一次聚会都
              <br />
              <span className="relative inline-block">
                <span className="text-[#ff6b35]">充满惊喜</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full hero-underline"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M2 6C50 2 150 2 198 6"
                    stroke="#ff6b35"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="hero-underline-path"
                  />
                </svg>
              </span>
            </h1>

            {/* 副标题 */}
            <p className="mb-8 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              发现身边的精彩活动，结识志同道合的朋友。
              <br className="hidden sm:block" />
              一键报名参与，开启你的社交新体验。
            </p>

            {/* 统计数据 */}
            <div className="mb-8 flex flex-wrap justify-center lg:justify-start gap-6">
              {[
                { value: '10,000+', label: '精彩活动' },
                { value: '50,000+', label: '活跃用户' },
                { value: '98%', label: '好评率' },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-[#ff6b35]">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA 按钮组 */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/download"
                className="group relative flex items-center gap-2 rounded-xl bg-[#ff6b35] px-8 py-4 text-base font-semibold text-white overflow-hidden shadow-lg shadow-[#ff6b35]/30 hover:shadow-xl hover:shadow-[#ff6b35]/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="relative flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  立即下载
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              
              <button
                onClick={scrollToFeatures}
                className="group flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-8 py-4 text-base font-medium text-gray-700 hover:border-[#ff6b35]/30 hover:bg-[#fff5f0] transition-all duration-200"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b35]/10 group-hover:bg-[#ff6b35] transition-colors">
                  <Play className="h-4 w-4 text-[#ff6b35] group-hover:text-white transition-colors ml-0.5" />
                </div>
                <span>了解更多</span>
              </button>
            </div>

            {/* 用户评价 */}
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300"
                    style={{
                      backgroundImage: `url(/images/avatar-${i}.png)`,
                      backgroundSize: 'cover'
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">4.9</span> 分，来自 2,000+ 评价
                </span>
              </div>
            </div>
          </motion.div>

          {/* 右侧图片展示 */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* 主图容器 */}
            <div className="relative w-full max-w-lg animate-float-slow">
              {/* 装饰光环 */}
              <div className="absolute -inset-8 bg-gradient-to-r from-[#ff6b35]/20 via-[#f7c600]/10 to-[#ff6b35]/20 rounded-3xl blur-2xl" />
              
              {/* 主图 */}
              <div className="relative rounded-2xl border border-gray-200/50 bg-white p-3 shadow-2xl shadow-[#ff6b35]/10 backdrop-blur-sm">
                <OptimizedImage
                  src="/images/hero-preview.svg"
                  alt="聚聚应用预览 - 发现精彩聚会活动"
                  width={1600}
                  height={900}
                  priority
                  className="aspect-[16/9] w-full rounded-xl"
                />
              </div>

              {/* 浮动卡片 - 左侧 */}
              <div className="absolute -bottom-4 -left-8 lg:-left-16 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 cursor-default hover:scale-105 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] flex items-center justify-center shadow-lg shadow-[#ff6b35]/30">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">新聚会发布</div>
                    <div className="text-xs text-gray-500">刚刚 · 户外徒步</div>
                  </div>
                </div>
              </div>

              {/* 浮动卡片 - 右上 */}
              <div className="absolute -top-4 -right-4 lg:-right-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 cursor-default hover:scale-105 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white" />
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white" />
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 border-2 border-white" />
                  </div>
                  <div className="text-sm font-bold text-[#ff6b35]">+128 参与</div>
                </div>
              </div>

              {/* 浮动卡片 - 右下 */}
              <div className="absolute -bottom-8 right-8 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gray-100 cursor-default hover:scale-105 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">4.9</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">用户体验评分</div>
              </div>
            </div>
          </div>
        </div>

        {/* 向下滚动提示 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block">
          <button
            onClick={scrollToFeatures}
            className="flex flex-col items-center text-gray-400 hover:text-[#ff6b35] transition-colors group animate-bounce-slow"
          >
            <span className="text-xs mb-2 opacity-70 group-hover:opacity-100">向下滚动</span>
            <div className="p-2 rounded-full border border-gray-200 group-hover:border-[#ff6b35]/30 group-hover:bg-[#fff5f0] transition-all">
              <ChevronDown className="h-5 w-5" />
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}
