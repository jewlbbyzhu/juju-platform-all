'use client'

import { motion } from 'framer-motion'
import { QrCode, Scan } from 'lucide-react'
import { PLATFORMS } from '@/lib/constants'
import type { Platform } from '@/types'

interface QRCodeProps {
  platform: Platform
}

export default function QRCodeComponent({ platform }: QRCodeProps) {
  const platformData = PLATFORMS[platform]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
    >
      <div className="text-center">
        <h3 className="mb-2 text-2xl font-bold text-gray-900">
          扫码下载
        </h3>
        <p className="text-gray-600">
          使用手机扫描二维码快速下载
        </p>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-[#ff6b35]/10 to-[#f7c600]/10 rounded-2xl blur-xl" />
        <div className="relative w-48 h-48 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center">
          <QrCode className="h-16 w-16 text-gray-300 mb-2" />
          <span className="text-sm text-gray-400">{platformData.name}二维码</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Scan className="h-4 w-4" />
        <span>打开相机或微信扫一扫</span>
      </div>

      <div className="text-center text-xs text-gray-400 max-w-xs">
        支持 {platformData.name} {platform === 'android' ? '8.0+' : platform === 'ios' ? '14.0+' : '全版本'}
      </div>
    </motion.div>
  )
}
