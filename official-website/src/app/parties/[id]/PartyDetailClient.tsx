'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Loader2,
  Download,
  ChevronRight
} from 'lucide-react'
import type { Party } from '@/types'
import { getPartyById } from '@/lib/api'
import { IMAGE_URLS } from '@/lib/images'
import OptimizedImage from '@/components/ui/OptimizedImage'

interface PartyDetailClientProps {
  id: string
}

export default function PartyDetailClient({ id }: PartyDetailClientProps) {
  const [party, setParty] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchParty = async () => {
      if (!id) {
        setError('无效的聚会ID')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await getPartyById(parseInt(id, 10))
        console.log('API Response:', response)
        if (response.success && response.data) {
          console.log('Party Data:', response.data)
          setParty(response.data)
        } else {
          setError('聚会未找到或已结束')
        }
      } catch (err) {
        setError('加载聚会信息失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchParty()
  }, [id])

  const handleShare = async () => {
    if (navigator.share && party) {
      try {
        await navigator.share({
          title: party.title,
          text: party.description.substring(0, 100) + '...',
          url: window.location.href
        })
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#ff6b35] mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !party) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Calendar className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {error || '聚会未找到'}
          </h1>
          <p className="text-gray-600 mb-6">
            该聚会可能已结束或不存在
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#ff6b35] px-8 py-3 font-medium text-white hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-lg hover:shadow-[#ff6b35]/25"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return {
        date: '日期待定',
        time: '时间待定',
        weekday: ''
      }
    }
    const isoString = dateString.replace(' ', 'T')
    const date = new Date(isoString)
    if (isNaN(date.getTime())) {
      return {
        date: '日期待定',
        time: '时间待定',
        weekday: ''
      }
    }
    return {
      date: date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      weekday: date.toLocaleDateString('zh-CN', { weekday: 'long' })
    }
  }

  const startDate = formatDate(party?.startTime || (party as any)?.start_time)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container px-4 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-[#ff6b35] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>返回首页</span>
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">分享</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Cover Image */}
            <div className="relative mb-8 overflow-hidden rounded-2xl">
              {(() => {
                const coverImage = (party as any).coverImage || (party as any).cover_image || (party as any).images?.[0] || IMAGE_URLS.placeholder
                return (
                  <img
                    src={coverImage}
                    alt={party.title}
                    className="aspect-[21/9] w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = IMAGE_URLS.placeholder
                    }}
                  />
                )
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                  {party.title}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">活动详情</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {party.description}
                  </p>
                </div>

                {/* Images Gallery */}
                {(() => {
                  const images = Array.isArray((party as any).images) ? (party as any).images : [];
                  return images.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">活动照片</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image: string, index: number) => (
                          <div key={index} className="aspect-square rounded-xl overflow-hidden">
                            <OptimizedImage
                              src={image}
                              alt={`${party.title} - ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Info Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">活动信息</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-[#fff5f0] flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-[#ff6b35]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{startDate.date}</p>
                        <p className="text-sm text-gray-600">{startDate.weekday} {startDate.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-[#fff5f0] flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-[#ff6b35]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">活动地点</p>
                        <p className="text-sm text-gray-600">{
                          (party as any).address || 
                          (party as any).location || 
                          (party as any).location_name ||
                          party.location?.address || 
                          '地点待定'
                        }</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-[#fff5f0] flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-[#ff6b35]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">参与人数</p>
                        <p className="text-sm text-gray-600">
                          {(
                            (party as any).currentParticipants ?? 
                            (party as any).current_participants ?? 
                            (party as any).stats?.participantCount ?? 
                            0
                          )} / {(
                            (party as any).maxParticipants ?? 
                            (party as any).max_participants ?? 
                            0
                          )} 人
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-[#fff5f0] flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-[#ff6b35]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">报名截止</p>
                        <p className="text-sm text-gray-600">活动开始前</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price & CTA Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">起价</p>
                    <p className="text-3xl font-bold text-[#ff6b35]">
                      {(party as any).priceRange?.text || 
                       (party as any).price_text ||
                       `¥${(party as any).minPrice ?? (party as any).min_price ?? 0}`}
                    </p>
                  </div>

                  <Link
                    href="/download"
                    className="flex items-center justify-center space-x-2 w-full rounded-xl bg-[#ff6b35] px-6 py-4 font-medium text-white hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-lg hover:shadow-[#ff6b35]/25 active:scale-95"
                  >
                    <Download className="h-5 w-5" />
                    <span>下载APP报名</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
