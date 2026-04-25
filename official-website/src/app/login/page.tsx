import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: '登录 - 聚聚',
  description: '登录您的聚聚账户',
  openGraph: {
    title: '登录 - 聚聚',
    description: '登录您的聚聚账户'
  }
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fff5f0] via-white to-[#fff9f5] px-4">
      <LoginForm />
    </div>
  )
}
