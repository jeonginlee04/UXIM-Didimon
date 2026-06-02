import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockRoadmapItems, mockDailyQuests } from '../data/mockData'
import type { RoadmapItem, RoadmapCategory, DailyQuest, WeeklyCheck } from '../types'

interface RoadmapState {
  items: RoadmapItem[]
  dailyQuests: DailyQuest[]
  weeklyCheck: WeeklyCheck | null
  lastWeeklyCheckDate: string | null
  lastQuestResetDate: string | null

  toggleExpand: (id: string) => void
  addItem: (item: Omit<RoadmapItem, 'id'>) => void
  updateItem: (id: string, patch: Partial<Pick<RoadmapItem, 'title' | 'description'>>) => void
  getByCategory: (category: RoadmapCategory) => RoadmapItem[]
  getCategoryProgress: (category: RoadmapCategory) => { completed: number; total: number; pct: number }

  toggleQuest: (id: string, onExpChange: (exp: number) => void) => void
  resetDailyQuests: () => void
  checkAndResetDailyQuests: () => void

  saveWeeklyCheck: (answers: Record<string, string>) => void
  canDoWeeklyCheck: () => boolean
}

const generateId = () => `rm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

function getWeekStart(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get) => ({
      items: mockRoadmapItems,
      dailyQuests: mockDailyQuests,
      weeklyCheck: null,
      lastWeeklyCheckDate: null,
      lastQuestResetDate: null,

      toggleExpand: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
          ),
        })),

      addItem: (itemData) => {
        const newItem: RoadmapItem = { ...itemData, id: generateId() }
        set((state) => ({ items: [...state.items, newItem] }))
      },

      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          ),
        })),

      getByCategory: (category) =>
        get().items.filter((item) => item.category === category).sort((a, b) => a.order - b.order),

      getCategoryProgress: (category) => {
        const items = get().getByCategory(category)
        const total = items.length
        if (total === 0) return { completed: 0, total: 0, pct: 0 }
        const completed = items.filter((i) => i.todoIds.length > 0).length
        return { completed, total, pct: Math.round((completed / total) * 100) }
      },

      toggleQuest: (id, onExpChange) => {
        const quest = get().dailyQuests.find((q) => q.id === id)
        if (!quest) return
        onExpChange(quest.isCompleted ? -quest.expReward : quest.expReward)
        set((state) => ({
          dailyQuests: state.dailyQuests.map((q) =>
            q.id === id ? { ...q, isCompleted: !q.isCompleted } : q
          ),
        }))
      },

      resetDailyQuests: () =>
        set((state) => ({
          dailyQuests: state.dailyQuests.map((q) => ({ ...q, isCompleted: false })),
          lastQuestResetDate: new Date().toISOString().split('T')[0],
        })),

      checkAndResetDailyQuests: () => {
        const today = new Date().toISOString().split('T')[0]
        const { lastQuestResetDate } = get()
        if (lastQuestResetDate !== today) {
          set((state) => ({
            dailyQuests: state.dailyQuests.map((q) => ({ ...q, isCompleted: false })),
            lastQuestResetDate: today,
          }))
        }
      },

      saveWeeklyCheck: (answers) => {
        const now = new Date().toISOString()
        const weekStart = getWeekStart()
        const check: WeeklyCheck = {
          id: `wc-${Date.now()}`,
          weekStart,
          answers,
          completedAt: now,
        }
        set({ weeklyCheck: check, lastWeeklyCheckDate: weekStart })
      },

      canDoWeeklyCheck: () => {
        const { lastWeeklyCheckDate } = get()
        if (!lastWeeklyCheckDate) return true
        return getWeekStart() !== lastWeeklyCheckDate
      },
    }),
    {
      name: 'didim-roadmap',
      version: 3,
      migrate: () => ({
        items: mockRoadmapItems,
        dailyQuests: mockDailyQuests,
        weeklyCheck: null,
        lastWeeklyCheckDate: null,
        lastQuestResetDate: null,
      }),
    }
  )
)
