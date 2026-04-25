'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Share2, Loader2 } from 'lucide-react'
import type { HelpArticle } from '@/types'
import { getHelpArticleById, getHelpArticles } from '@/lib/api'

interface HelpDetailClientProps {
  id: string
}

export default function HelpDetailClient({ id }: HelpDetailClientProps) {
  const [article, setArticle] = useState<HelpArticle | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<HelpArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError('无效的文档ID')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await getHelpArticleById(id)
        if (response.success && response.data) {
          setArticle(response.data)

          // Fetch related articles from the same category
          const relatedResponse = await getHelpArticles({
            category: response.data.category,
            page: 1,
            pageSize: 5
          })
          if (relatedResponse.success && relatedResponse.data) {
            const articles = relatedResponse.data.articles || relatedResponse.data.items || relatedResponse.data.list || []
            setRelatedArticles(
              articles.filter(a => a.id !== id).slice(0, 4)
            )
          }
        } else {
          setError('文档未找到')
        }
      } catch (err) {
        setError('加载文档失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.content.substring(0, 100) + '...',
          url: window.location.href
        })
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#ff6b35] mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {error || '文档未找到'}
          </h1>
          <Link
            href="/help"
            className="text-[#ff6b35] hover:underline"
          >
            返回帮助中心
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 md:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/help"
              className="mb-8 inline-flex items-center space-x-2 text-gray-600 hover:text-[#ff6b35] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>返回帮助中心</span>
            </Link>

            <article className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <header className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="mb-4 text-3xl font-bold text-gray-900">
                  {article.title}
                </h1>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>更新于 {article.updatedAt}</span>
                    </div>
                    <span>分类: {article.category}</span>
                  </div>

                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>分享</span>
                  </button>
                </div>
              </header>

              <div className="prose prose-purple max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {article.content}
                </div>
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {relatedArticles.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    相关文章
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {relatedArticles.map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        href={`/help/${relatedArticle.id}`}
                        className="rounded-lg border border-gray-200 p-4 hover:border-[#ff6b35]/30 hover:shadow-md transition-all"
                      >
                        <h4 className="mb-2 font-medium text-gray-900 group-hover:text-[#ff6b35] transition-colors">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {relatedArticle.category}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
