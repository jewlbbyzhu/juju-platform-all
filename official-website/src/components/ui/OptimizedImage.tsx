'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, ImageOff } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
}

export default function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  fill = false,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const isSvg = src.endsWith('.svg')
  const isExternal = src.startsWith('http')

  // 处理加载完成
  const handleLoad = () => {
    setIsLoading(false)
  }

  // 处理加载错误
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // 错误状态
  if (hasError) {
    return (
      <div 
        className={`relative flex items-center justify-center bg-gray-100 ${className}`}
        style={fill ? {} : { width, height }}
      >
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">图片加载失败</span>
        </div>
      </div>
    )
  }

  // SVG 图片使用原生 img
  if (isSvg) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-[#ff6b35]" />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} ${fill ? 'object-cover w-full h-full' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    )
  }

  // Next.js Image 组件
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 加载占位 */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoading ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#ff6b35]" />
      </motion.div>

      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        quality={quality}
        className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} ${fill ? 'object-cover' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={isExternal}
      />
    </div>
  )
}
