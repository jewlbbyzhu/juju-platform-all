'use client'

import { Component, ReactNode, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'

interface ErrorToastProps {
  error: string
  onClose: () => void
}

function ErrorToast({ error, onClose }: ErrorToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm animate-in slide-in-from-right">
      <div className="flex items-start space-x-3 rounded-lg border border-red-200 bg-white p-4 shadow-lg">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">错误</p>
          <p className="mt-1 text-sm text-gray-600">{error}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

interface APIErrorHandlerProps {
  children: ReactNode
}

export function APIErrorHandler({ children }: APIErrorHandlerProps) {
  const [error, setError] = useState<string | null>(null)

  const handleError = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), 5000)
  }

  return (
    <>
      {error && <ErrorToast error={error} onClose={() => setError(null)} />}
      {children}
    </>
  )
}
