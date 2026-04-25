'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Settings, Heart, ArrowUpRight, Mail, Phone } from 'lucide-react'
import { FOOTER_LINKS, SOCIAL_LINKS } from '@/lib/constants'

// 社交媒体图标组件
const WechatIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
  </svg>
)

const WeiboIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.401-.649.386-1.017.425-1.893.003-2.521-.793-1.17-2.966-1.109-5.419-.031 0 0-.777.34-.578-.274.381-1.217.324-2.234-.27-2.82-1.35-1.33-4.945.047-8.028 3.079C1.116 10.641 0 12.792 0 14.667c0 3.589 4.613 5.773 9.127 5.773 5.916 0 9.856-3.44 9.856-6.175 0-1.649-1.389-2.583-2.894-3.016zm.568-4.852c-.696-.919-1.727-1.447-2.901-1.447-.243 0-.485.024-.719.069l.018-.003c-.238.041-.394.264-.354.502.041.239.265.395.503.355.17-.03.347-.054.525-.054.861 0 1.64.37 2.161 1.054.521.683.666 1.544.448 2.364-.063.238.081.482.319.545.238.063.482-.08.545-.318.29-1.069.09-2.227-.545-3.067zm-1.135 1.591c-.318-.419-.789-.659-1.325-.659-.109 0-.219.011-.324.031-.239.046-.396.271-.35.51.046.238.271.395.51.35.059-.011.119-.017.179-.017.341 0 .647.146.854.417.207.272.265.607.188.918-.058.236.087.477.323.535.236.059.477-.087.535-.323.123-.503.03-1.046-.277-1.467l-.313-.295z"/>
  </svg>
)

const TiktokIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

const SocialIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'logo-wechat':
      return <WechatIcon />
    case 'logo-weibo':
      return <WeiboIcon />
    case 'logo-tiktok':
      return <TiktokIcon />
    default:
      return null
  }
}

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function Footer() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_WEB_URL || 'https://admin.hfparty.asia'
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <motion.div
        variants={footerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="container px-4 py-12 md:px-6 md:py-16 lg:py-20"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* 品牌区域 */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] transition-transform group-hover:scale-105">
                <span className="text-base font-bold text-white">聚</span>
              </div>
              <span className="text-xl font-bold text-gray-900">聚聚</span>
            </Link>
            
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs mb-6">
              发现精彩聚会，结识志同道合的朋友。让每一次聚会都充满惊喜。
            </p>

            {/* 联系方式 */}
            <div className="space-y-3">
              <a 
                href="mailto:support@hfparty.asia"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff6b35] transition-colors"
              >
                <Mail className="h-4 w-4" />
                support@hfparty.asia
              </a>
              <a 
                href="tel:400-888-8888"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff6b35] transition-colors"
              >
                <Phone className="h-4 w-4" />
                400-888-8888
              </a>
            </div>
          </motion.div>

          {/* 产品链接 */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">产品</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-sm text-gray-600 hover:text-[#ff6b35] transition-colors"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 支持链接 */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">支持</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-sm text-gray-600 hover:text-[#ff6b35] transition-colors"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 管理与社交 */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">管理入口</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff6b35] transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>管理后台</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </a>
              </li>
            </ul>

            <h3 className="mb-4 text-sm font-semibold text-gray-900">关注我们</h3>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#ff6b35] hover:text-[#ff6b35] hover:bg-[#fff5f0] transition-colors duration-200"
                  aria-label={social.name}
                >
                  <SocialIcon icon={social.icon} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 底部版权 */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              © {currentYear} 聚聚. 用
              <Heart className="h-4 w-4 text-red-500 fill-red-500 inline" />
              打造 · All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <Link 
                href="/privacy" 
                className="text-sm text-gray-500 hover:text-[#ff6b35] transition-colors"
              >
                隐私政策
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-gray-500 hover:text-[#ff6b35] transition-colors"
              >
                服务条款
              </Link>
              <Link 
                href="/feedback" 
                className="text-sm text-gray-500 hover:text-[#ff6b35] transition-colors"
              >
                意见反馈
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  )
}
