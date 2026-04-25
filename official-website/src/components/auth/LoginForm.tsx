'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { login } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export default function LoginForm() {
  const router = useRouter()
  const { login: authLogin } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await login({ email, password })

      if (response.success && response.data) {
        authLogin(response.data.user, response.data.token, '')
        localStorage.setItem('token', response.data.token)

        if (response.data.user.role === 'admin') {
          const adminUrl = `${process.env.NEXT_PUBLIC_ADMIN_WEB_URL || 'http://localhost:5173'}?token=${response.data.token}`
          window.location.href = adminUrl
        } else {
          router.push('/')
        }
      } else {
        setError(response.error?.message || '登录失败，请重试')
      }
    } catch {
      setError('网络错误，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-md"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff6b35]">
            <span className="text-2xl font-bold text-white">聚</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p className="mt-2 text-gray-600">登录您的聚聚账户</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 hover:border-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 hover:border-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]" />
              <span className="text-gray-600">记住我</span>
            </label>
            <a href="/forgot-password" className="text-[#ff6b35] hover:underline">
              忘记密码？
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group w-full rounded-xl bg-[#ff6b35] py-3.5 font-medium text-white hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-lg hover:shadow-[#ff6b35]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>登录中...</span>
              </>
            ) : (
              <>
                <span>登录</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          还没有账户？{' '}
          <a href="/register" className="text-[#ff6b35] hover:underline font-medium">
            立即注册
          </a>
        </div>
      </div>
    </motion.div>
  )
}
