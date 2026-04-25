'use client'

import { motion } from 'framer-motion'
import { Check, Smartphone, Tablet, MessageCircle } from 'lucide-react'
import { PLATFORMS } from '@/lib/constants'
import type { Platform } from '@/types'

interface PlatformSelectorProps {
  selectedPlatform: Platform
  onPlatformChange: (platform: Platform) => void
}

const platformIcons = {
  android: Smartphone,
  ios: Tablet,
  wechat: MessageCircle
}

export default function PlatformSelector({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  const platforms = Object.values(PLATFORMS)

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-8">
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-sm font-medium mb-4">
            选择平台
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            选择你的平台
          </h2>
          <p className="text-lg text-gray-600">
            支持多种平台，随时随地参与聚会
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {platforms.map((platform, index) => {
              const Icon = platformIcons[platform.id as keyof typeof platformIcons] || Smartphone
              const isSelected = selectedPlatform === platform.id

              return (
                <motion.button
                  key={platform.id}
                  onClick={() => onPlatformChange(platform.id as Platform)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-[#ff6b35] bg-[#fff5f0] shadow-lg shadow-[#ff6b35]/10'
                      : 'border-gray-200 bg-white hover:border-[#ff6b35]/30 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 top-4"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6b35]">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </motion.div>
                  )}

                  <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-300 ${
                    isSelected ? 'bg-[#ff6b35]' : 'bg-[#fff5f0]'
                  }`}>
                    <Icon className={`h-8 w-8 transition-colors ${isSelected ? 'text-white' : 'text-[#ff6b35]'}`} />
                  </div>

                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {platform.name}
                  </h3>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
