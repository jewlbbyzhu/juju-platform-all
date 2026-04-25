'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error occurred:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff5f0] via-white to-[#fff9f5] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            出错了
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error.message || '页面加载失败，请稍后重试'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#ff6b35] text-white rounded-xl hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-lg hover:shadow-[#ff6b35]/25 font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              <span>重试</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              <Home className="w-5 h-5" />
              <span>返回首页</span>
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors">
                错误详情（开发模式）
              </summary>
              <pre className="mt-3 p-4 bg-gray-50 rounded-xl text-xs overflow-auto max-h-64 text-gray-700">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </motion.div>
    </div>
  )
}
