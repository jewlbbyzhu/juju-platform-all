'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'suggestion',
    content: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] via-white to-[#fff9f5]">
        <div className="container px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">感谢您的反馈！</h1>
            <p className="mb-8 text-gray-600">
              我们已收到您的反馈，会尽快进行处理。感谢您的支持！
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false)
                setFormData({ name: '', email: '', type: 'suggestion', content: '' })
              }}
              className="rounded-xl bg-[#ff6b35] px-8 py-3 font-medium text-white hover:bg-[#e55a2b] transition-all duration-200"
            >
              继续反馈
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] via-white to-[#fff9f5]">
      <div className="container px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">反馈建议</h1>
            <p className="text-lg text-gray-600">
              您的意见对我们非常重要，帮助我们不断改进产品
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                您的姓名
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20"
                placeholder="请输入您的姓名"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                联系邮箱
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20"
                placeholder="请输入您的邮箱"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-700">
                反馈类型
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20"
              >
                <option value="suggestion">产品建议</option>
                <option value="bug">问题反馈</option>
                <option value="complaint">投诉</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700">
                反馈内容
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20"
                placeholder="请详细描述您的反馈内容..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-[#ff6b35] px-8 py-4 font-medium text-white hover:bg-[#e55a2b] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>提交中...</span>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>提交反馈</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
