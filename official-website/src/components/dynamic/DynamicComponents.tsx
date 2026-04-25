import dynamic from 'next/dynamic'

export const LoginForm = dynamic(
  () => import('@/components/auth/LoginForm'),
  {
    loading: () => (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    ),
    ssr: false
  }
)

export const PartyPreview = dynamic(
  () => import('@/components/marketing/PartyPreview'),
  {
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    )
  }
)
