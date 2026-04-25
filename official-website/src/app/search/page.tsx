'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, X, Clock, FileText, ArrowLeft, Loader2 } from 'lucide-react'
import type { HelpArticle } from '@/types'
import { searchHelpArticles } from '@/lib/api'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<HelpArticle[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }

    const initialQuery = searchParams.get('q')
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [searchParams])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setQuery(searchQuery)
    setHasSearched(true)

    try {
      const response = await searchHelpArticles(searchQuery)

      if (response.success && response.data) {
        setResults(response.data)
      } else {
        setResults([])
      }

      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5)
      setSearchHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }

  const handleRemoveHistoryItem = (item: string) => {
    const newHistory = searchHistory.filter(h => h !== item)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark class="bg-[#fff5f0] text-[#ff6b35] px-1 rounded">$1</mark>')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 md:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => router.push('/help')}
              className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-[#ff6b35] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>返回帮助中心</span>
            </button>

            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
              搜索帮助
            </h1>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e.currentTarget.value)
                  }
                }}
                placeholder="搜索帮助文档..."
                className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-32 text-lg text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 hover:border-gray-400"
              />
              <button
                onClick={() => handleSearch(query)}
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#ff6b35] px-6 py-2.5 font-medium text-white hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-lg hover:shadow-[#ff6b35]/25 disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  '搜索'
                )}
              </button>
            </div>
          </motion.div>

          {!query && searchHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-400" />
                  搜索历史
                </h2>
                <button
                  onClick={handleClearHistory}
                  className="text-sm text-gray-500 hover:text-[#ff6b35] transition-colors"
                >
                  清空历史
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 hover:border-[#ff6b35]/30 hover:bg-[#fff5f0] transition-all"
                  >
                    <button
                      onClick={() => handleSearch(item)}
                      className="text-sm text-gray-700 hover:text-[#ff6b35] transition-colors"
                    >
                      {item}
                    </button>
                    <button
                      onClick={() => handleRemoveHistoryItem(item)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {hasSearched && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                搜索结果 ({results.length})
              </h2>
              {results.map((article, index) => (
                <motion.a
                  key={article.id}
                  href={`/help/${article.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="block rounded-xl border border-gray-200 bg-white p-6 hover:border-[#ff6b35]/30 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#fff5f0]">
                      <FileText className="h-6 w-6 text-[#ff6b35]" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-[#ff6b35] transition-colors"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(article.title, query)
                        }}
                      />
                      <p className="mb-2 text-sm text-gray-600">
                        {article.category}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>更新于 {article.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}

          {hasSearched && results.length === 0 && !isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-gray-200 bg-white p-12 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                未找到相关结果
              </h3>
              <p className="text-gray-600 mb-6">
                尝试使用其他关键词或查看帮助中心
              </p>
              <button
                onClick={() => router.push('/help')}
                className="rounded-xl bg-[#ff6b35] px-8 py-3 font-medium text-white hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-lg hover:shadow-[#ff6b35]/25"
              >
                查看帮助中心
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
