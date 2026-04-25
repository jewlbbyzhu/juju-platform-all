'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader2, CheckCircle2 } from 'lucide-react'
import { PLATFORMS } from '@/lib/constants'
import { getAppVersion } from '@/lib/api'
import type { Platform } from '@/types'

interface VersionInfo {
  version: string
  releaseDate: string
  changelog: string[]
  downloadUrl: string
  qrCodeUrl: string
}

interface DownloadButtonProps {
  platform: Platform
}

export default function DownloadButton({ platform }: DownloadButtonProps) {
  const [version, setVersion] = useState<VersionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    async function fetchVersion() {
      try {
        setIsLoading(true)
        const response = await getAppVersion(platform)

        if (response.success && response.data) {
          setVersion(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch version:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVersion()
  }, [platform])

  const handleDownload = () => {
    const downloadUrl = version?.downloadUrl || platformData.downloadUrl
    if (!downloadUrl) {
      alert('下载链接暂未配置，敬请期待')
      return
    }
    setIsDownloading(true)
    setTimeout(() => setIsDownloading(false), 2000)
  }

  const platformData = PLATFORMS[platform]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff6b35]" />
        <p className="text-gray-600">加载中...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
    >
      <div className="text-center">
        <h3 className="mb-2 text-2xl font-bold text-gray-900">
          {platformData.name}
        </h3>
        <p className="text-gray-600">
          版本 {version?.version || '1.0.0'}
        </p>
        {version?.releaseDate && (
          <p className="mt-1 text-sm text-gray-500">
            发布于 {version.releaseDate}
          </p>
        )}
      </div>

      <motion.button
        onClick={handleDownload}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group flex items-center space-x-3 rounded-xl bg-[#ff6b35] px-10 py-4 text-lg font-medium text-white hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-lg hover:shadow-[#ff6b35]/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>下载中...</span>
          </>
        ) : (
          <>
            <Download className="h-6 w-6 transition-transform group-hover:-translate-y-0.5" />
            <span>{(version?.downloadUrl || platformData.downloadUrl) ? '立即下载' : '即将上线'}</span>
          </>
        )}
      </motion.button>

      {version?.changelog && version.changelog.length > 0 && (
        <div className="w-full">
          <h4 className="mb-3 text-sm font-semibold text-gray-900">
            更新日志
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {version.changelog.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-[#ff6b35] mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>下载即表示您同意我们的</p>
        <div className="mt-1 space-x-2">
          <a href="/privacy" className="text-[#ff6b35] hover:underline">
            隐私政策
          </a>
          <span>和</span>
          <a href="/terms" className="text-[#ff6b35] hover:underline">
            服务条款
          </a>
        </div>
      </div>
    </motion.div>
  )
}
