'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export default function SSOCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login: authLogin } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleSSO = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(decodeURIComponent(error))
        return
      }

      if (!token) {
        setStatus('error')
        setMessage('缺少认证令牌')
        return
      }

      try {
        localStorage.setItem('token', token)
        const response = await getCurrentUser()

        if (response.success && response.data) {
          authLogin(response.data, token, '')
          setStatus('success')
          setMessage('登录成功，正在跳转...')

          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('登录失败，请重试')
        }
      } catch {
        setStatus('error')
        setMessage('网络错误，请检查网络连接')
      }
    }

    handleSSO()
  }, [searchParams, router, authLogin])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
              <p className="text-lg text-gray-600">正在验证登录...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                登录成功
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                登录失败
              </h2>
              <p className="mb-8 text-center text-gray-600">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white hover:opacity-90 transition-opacity"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>返回登录</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
