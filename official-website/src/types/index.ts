export interface User {
  id: number
  email: string
  nickname: string
  avatar: string
  role: 'user' | 'admin'
  isVip: boolean
  createdAt: string
}

export interface Party {
  id: number
  title: string
  description: string
  category: number
  images: string[]
  coverImage?: string
  startTime: string
  endTime?: string
  location: {
    address: string
    latitude: number
    longitude: number
  }
  minPrice: number
  maxParticipants: number
  currentParticipants: number
  status: string
}

export interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type Platform = 'android' | 'ios' | 'wechat'

export interface PlatformInfo {
  id: Platform
  name: string
  icon: string
  description: string
  downloadUrl: string
  qrCodeUrl: string
}

export interface VersionInfo {
  version: string
  releaseDate: string
  changelog: string[]
  downloadUrl: string
  qrCodeUrl: string
}
