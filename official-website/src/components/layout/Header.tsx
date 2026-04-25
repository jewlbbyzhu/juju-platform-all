'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Download, Sparkles } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      
      // 检测当前活动区域
      const sections = ['features', 'parties']
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 阻止背景滚动当菜单打开时
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "border-b border-gray-200/80 bg-white/95 backdrop-blur-md shadow-sm" 
            : "bg-white"
        )}
      >
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] shadow-lg shadow-[#ff6b35]/20"
            >
              <span className="text-base font-bold text-white">聚</span>
            </motion.div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-[#ff6b35] transition-colors">
              聚聚
            </span>
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff5f0] text-[#ff6b35] text-xs font-medium">
              <Sparkles className="h-3 w-3" />
              Beta
            </span>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                  activeSection === item.href.replace('/', '')
                    ? "text-[#ff6b35] bg-[#fff5f0]"
                    : "text-gray-600 hover:text-[#ff6b35] hover:bg-gray-50"
                )}
              >
                {item.label}
                {activeSection === item.href.replace('/', '') && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ff6b35]"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* 右侧按钮组 */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* 下载按钮 - 桌面端显示 */}
            <Link
              href="/download"
              className="hidden sm:flex items-center gap-2 rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a2b] transition-all duration-200 hover:shadow-lg hover:shadow-[#ff6b35]/25"
            >
              <Download className="h-4 w-4" />
              <span>下载App</span>
            </Link>

            {/* 移动端菜单按钮 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6 text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6 text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* 菜单内容 */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-xl lg:hidden"
            >
              <nav className="container px-4 py-4 space-y-1">
                {NAV_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-[#ff6b35] hover:bg-[#fff5f0] rounded-xl transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                {/* 移动端下载按钮 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: NAV_ITEMS.length * 0.05 }}
                  className="pt-4 mt-4 border-t border-gray-100"
                >
                  <Link
                    href="/download"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#ff6b35] px-4 py-3 text-base font-semibold text-white hover:bg-[#e55a2b] transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Download className="h-5 w-5" />
                    下载聚聚App
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
