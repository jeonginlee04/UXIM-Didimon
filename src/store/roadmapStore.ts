import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockRoadmapItems } from '../data/mockData'
import type { RoadmapItem, Category } from '../types'

interface RoadmapState {
  items: RoadmapItem[]
  toggleExpand: (id: string) => void
  addItem: (item: Omit<RoadmapItem, 'id'>) => void
  linkTodo: (roadmapId: string, todoId: string) => void
  getByCategory: (category: Category) => RoadmapItem[]
}

const generateId = () => `rm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get) => ({
      items: mockRoadmapItems,

      toggleExpand: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
          ),
        })),

      addItem: (itemData) => {
        const newItem: RoadmapItem = {
          ...itemData,
          id: generateId(),
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },

      linkTodo: (roadmapId, todoId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === roadmapId && !item.todoIds.includes(todoId)
              ? { ...item, todoIds: [...item.todoIds, todoId] }
              : item
          ),
        })),

      getByCategory: (category) =>
        get().items.filter((item) => item.category === category),
    }),
    { name: 'didim-roadmap' }
  )
)
