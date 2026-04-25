'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Loader2, ArrowRight } from 'lucide-react'
import type { Party } from '@/types'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { IMAGE_URLS } from '@/lib/images'
import { getPublishedParties } from '@/lib/api'
import { reloadPage } from '@/lib/browser'

export default function PartyPreview() {
  const [parties, setParties] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchParties() {
      try {
        setIsLoading(true)
        setError(null)
        
        // 添加超时处理
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('请求超时')), 10000)
        })
        
        const response = await Promise.race([
          getPublishedParties({ page: 1, pageSize: 3 }),
          timeoutPromise
        ])

        if (response.success && response.data) {
          // API返回的数据结构: { total, page, pageSize, data: [...] }
          // 或者直接在response.data中是数组
          let list: Party[] = []
          
          if (Array.isArray(response.data)) {
            // 直接是数组
            list = response.data
          } else if (Array.isArray((response.data as any).data)) {
            // { data: [...] } 结构
            list = (response.data as any).data
          } else if (Array.isArray((response.data as any).items)) {
            list = (response.data as any).items
          } else if (Array.isArray((response.data as any).parties)) {
            list = (response.data as any).parties
          } else if (Array.isArray((response.data as any).list)) {
            list = (response.data as any).list
          }
          
          setParties(list)
        } else {
          setError(response.error?.message || '获取聚会列表失败')
        }
      } catch (err) {
        console.error('获取聚会列表失败:', err)
        setError(err instanceof Error ? err.message : '网络错误，请稍后重试')
      } finally {
        setIsLoading(false)
      }
    }

    fetchParties()
  }, [])

  if (isLoading) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="container px-4 md:px-8">
          <div className="mb-12 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-4">
              热门活动
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              热门聚会
            </h2>
            <p className="text-lg text-gray-600">
              发现身边正在进行的精彩活动
            </p>
          </div>

          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-[#ff6b35]" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="container px-4 md:px-8">
          <div className="mb-12 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-4">
              热门活动
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              热门聚会
            </h2>
            <p className="text-lg text-gray-600">
              发现身边正在进行的精彩活动
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-md mx-auto">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">😕</span>
              </div>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={reloadPage}
              className="rounded-xl bg-[#ff6b35] px-6 py-2.5 text-white font-medium hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-lg hover:shadow-[#ff6b35]/20 active:scale-95"
            >
              重试
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="container px-4 md:px-8">
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-4">
            热门活动
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            热门聚会
          </h2>
          <p className="text-lg text-gray-600">
            发现身边正在进行的精彩活动
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {parties.map((party) => (
            <Link key={party.id} href={`/parties/${party.id}`}>
              <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer h-full">
                <div className="relative overflow-hidden">
                  <OptimizedImage
                    src={party.coverImage || party.images?.[0] || IMAGE_URLS.placeholder}
                    alt={party.title}
                    className="aspect-video w-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6">
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-[#ff6b35] transition-colors line-clamp-1">
                    {party.title}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 line-clamp-2">{party.description}</p>

                  <div className="space-y-2.5 text-sm text-gray-600">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-lg bg-[#fff5f0] flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-[#ff6b35]" />
                      </div>
                      <span>
                        {new Date(party.startTime).toLocaleDateString('zh-CN', {
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-lg bg-[#fff5f0] flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-[#ff6b35]" />
                      </div>
                      <span className="line-clamp-1">{(party as any).address || party.location?.address || '地点待定'}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-lg bg-[#fff5f0] flex items-center justify-center">
                        <Users className="h-4 w-4 text-[#ff6b35]" />
                      </div>
                      <span>{`${party.currentParticipants}/${party.maxParticipants} 人`}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xl font-bold text-[#ff6b35]">
                      {`¥${party.minPrice} 起`}
                    </span>
                    <span className="group/btn flex items-center space-x-1 rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a2b] transition-all duration-200 active:scale-95">
                      <span>查看详情</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
