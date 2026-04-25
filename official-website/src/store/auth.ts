import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: User) => void
  updateTokens: (token: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
      login: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isAdmin: user.role === 'admin'
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false
        }),
      updateUser: (user) => set({ user }),
      updateTokens: (token, refreshToken) =>
        set({
          token,
          refreshToken
        })
    }),
    {
      name: 'auth-storage'
    }
  )
)
