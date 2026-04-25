import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StructuredData from '@/components/seo/StructuredData'
import { DEFAULT_METADATA } from '@/lib/metadata'

export const metadata: Metadata = DEFAULT_METADATA

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ff6b35',
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" dir="ltr">
      <head>
        <StructuredData />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://api.hfparty.asia" />
        
        {/* Preload Critical Fonts */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet"
        />

        {/* Meta Tags for Performance */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="聚聚" />
        
        {/* PWA */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-white">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
