'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, BookOpen, User, PartyPopper, CreditCard, Crown, Loader2, FileText, ArrowRight } from 'lucide-react'
import type { HelpArticle } from '@/types'
import { getHelpArticles } from '@/lib/api'

const categories = [
  { id: 'getting-started', name: '快速入门', count: 5, icon: BookOpen, color: '#ff6b35', description: '新用户指南，快速上手聚聚' },
  { id: 'account', name: '账户管理', count: 8, icon: User, color: '#3b82f6', description: '注册、登录、密码重置等' },
  { id: 'parties', name: '聚会活动', count: 12, icon: PartyPopper, color: '#10b981', description: '发现、报名、参与聚会' },
  { id: 'payments', name: '支付问题', count: 6, icon: CreditCard, color: '#f59e0b', description: '支付方式、退款、发票等' },
  { id: 'vip', name: 'VIP服务', count: 4, icon: Crown, color: '#8b5cf6', description: '会员权益和专属服务' }
]

const faqs = [
  {
    question: '如何报名参加聚会活动？',
    answer: '浏览活动列表，选择感兴趣的活动，点击"立即报名"，选择票型并完成支付即可。'
  },
  {
    question: '报名后如何取消？',
    answer: '在活动详情页点击"我的报名"，选择"取消报名"。根据活动规则，可能会收取一定手续费。'
  },
  {
    question: '如何联系活动组织者？',
    answer: '报名成功后，您可以在"我的活动"中找到联系方式，或通过App内的消息功能联系。'
  }
]

export default function HelpPageClient() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCategoryClick = async (categoryId: string) => {
    setIsLoading(true)
    setSelectedCategory(categoryId)
    try {
      const response = await getHelpArticles({ category: categoryId, page: 1, pageSize: 20 })
      if (response.success && response.data) {
        const articles = response.data.articles || response.data.items || response.data.list || []
        setArticles(articles)
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#fff5f0] via-white to-[#fff9f5] py-16 lg:py-24">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-6"
            >
              <BookOpen className="h-4 w-4" />
              帮助支持
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            >
              帮助中心
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 mb-8"
            >
              查找帮助文档和常见问题解答
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="搜索帮助文档..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-32 text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-[#ff6b35] focus:outline-none focus:ring-4 focus:ring-[#ff6b35]/10"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#ff6b35] px-6 py-2.5 font-medium text-white hover:bg-[#e55a2b] transition-colors"
                >
                  搜索
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 lg:py-16">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              浏览分类
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category, index) => {
                const Icon = category.icon
                const isSelected = selectedCategory === category.id
                
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`group relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                      isSelected
                        ? 'border-[#ff6b35] bg-[#fff5f0]'
                        : 'border-gray-100 bg-white hover:border-[#ff6b35]/30 hover:shadow-lg'
                    }`}
                  >
                    <div 
                      className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <Icon className="h-7 w-7" style={{ color: category.color }} />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {category.count} 篇文章
                      </span>
                      <ArrowRight className={`h-4 w-4 transition-all ${
                        isSelected ? 'text-[#ff6b35] translate-x-1' : 'text-gray-300 group-hover:text-[#ff6b35]'
                      }`} />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              常见问题
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      {isLoading && (
        <section className="py-12">
          <div className="container px-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#ff6b35] mx-auto" />
          </div>
        </section>
      )}

      {!isLoading && articles.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="container px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="h-6 w-6 text-[#ff6b35]" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    文章列表 ({articles.length})
                  </h2>
                </div>
                
                <div className="space-y-3">
                  {articles.map((article) => (
                    <a
                      key={article.id}
                      href={`/help/${article.id}`}
                      className="block rounded-xl border border-gray-100 bg-white p-5 hover:border-[#ff6b35]/30 hover:shadow-md transition-all group"
                    >
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#ff6b35] transition-colors mb-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{article.category}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>更新于 {article.updatedAt}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
