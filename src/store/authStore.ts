import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, InterestKeyword, NotificationSettings } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isOnboarded: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  completeOnboarding: () => void
  addExp: (amount: number) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,

      login: (user) => set({ user, isAuthenticated: true }),

      logout: () => set({ user: null, isAuthenticated: false, isOnboarded: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      completeOnboarding: () => set({ isOnboarded: true }),

      addExp: (amount) =>
        set((state) => {
          if (!state.user) return state
          const newExp = state.user.exp + amount
          return { user: { ...state.user, exp: newExp } }
        }),
    }),
    { name: 'didim-auth' }
  )
)

export const defaultNotificationSettings: NotificationSettings = {
  newAnnouncement: true,
  deadlineAlert: true,
  todoReminder: true,
  questComplete: true,
}

export const demoUser: User = {
  id: 'user-1',
  name: '김지원',
  nickname: '지원이',
  phone: '010-1234-5678',
  email: 'jiwon@email.com',
  birthDate: '2003-03-15',
  role: 'mentee',
  interests: ['finance', 'housing', 'employment'] as InterestKeyword[],
  level: 3,
  exp: 240,
  createdAt: '2026-04-01',
  notificationSettings: defaultNotificationSettings,
}
