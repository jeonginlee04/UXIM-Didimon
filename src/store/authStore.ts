import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Category, Role } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isOnboarded: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  completeOnboarding: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,

      login: (user) => set({ user, isAuthenticated: true }),

      logout: () =>
        set({ user: null, isAuthenticated: false, isOnboarded: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      completeOnboarding: () => set({ isOnboarded: true }),
    }),
    {
      name: 'didim-auth',
    }
  )
)

// Demo login helper
export const demoUser: User = {
  id: 'user-1',
  name: '김지원',
  nickname: '지원이',
  phone: '010-1234-5678',
  email: 'jiwon@email.com',
  birthDate: '2003-03-15',
  role: 'mentee' as Role,
  interests: ['finance', 'housing', 'employment'] as Category[],
  createdAt: '2026-04-01',
}
