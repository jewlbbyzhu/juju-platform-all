'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fff5f0] via-white to-[#fff9f5] px-4">
      <div className="max-w-lg text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl font-bold text-[#ff6b35]/20">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-16 h-16 text-[#ff6b35]" />
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-3xl font-bold text-gray-900">
          页面未找到
        </h2>

        <p className="mb-8 text-gray-600 text-lg">
          抱歉，您访问的页面不存在或已被移除
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="group flex items-center justify-center space-x-2 rounded-xl bg-[#ff6b35] px-8 py-3.5 font-medium text-white hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-lg hover:shadow-[#ff6b35]/25"
          >
            <Home className="h-5 w-5" />
            <span>返回首页</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="group flex items-center justify-center space-x-2 rounded-xl border-2 border-gray-200 px-8 py-3.5 font-medium text-gray-700 hover:border-[#ff6b35]/30 hover:bg-[#fff5f0] hover:text-[#ff6b35] transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>返回上一页</span>
          </button>
        </div>
      </div>
    </div>
  )
}
