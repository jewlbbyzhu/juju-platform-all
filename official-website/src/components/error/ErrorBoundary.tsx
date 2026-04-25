'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
          <div className="max-w-md text-center">
            <div className="mb-8 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              出错了
            </h2>

            <p className="mb-8 text-gray-600">
              抱歉，页面加载时出现了错误，请稍后重试
            </p>

            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-medium text-white hover:opacity-90 transition-opacity"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
