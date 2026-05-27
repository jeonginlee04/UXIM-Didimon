import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockTodos } from '../data/mockData'
import type { Todo, Category, TodoStatus } from '../types'

interface TodoState {
  todos: Todo[]
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  changeStatus: (id: string, status: TodoStatus) => void
  getTodosByCategory: (category: Category) => Todo[]
  getTodosByDate: (date: string) => Todo[]
  getActiveTodos: () => Todo[]
  getProgress: (category?: Category) => number
}

const generateId = () => `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: mockTodos,

      addTodo: (todoData) => {
        const newTodo: Todo = {
          ...todoData,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
        }
        set((state) => ({ todos: [newTodo, ...state.todos] }))
      },

      updateTodo: (id, updates) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...updates,
                  completedAt:
                    updates.status === 'done'
                      ? new Date().toISOString().split('T')[0]
                      : updates.status === 'todo'
                      ? undefined
                      : t.completedAt,
                }
              : t
          ),
        })),

      deleteTodo: (id) =>
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),

      changeStatus: (id, status) => get().updateTodo(id, { status }),

      getTodosByCategory: (category) =>
        get().todos.filter((t) => t.category === category),

      getTodosByDate: (date) =>
        get().todos.filter((t) => {
          if (!t.dueDate) return false
          return t.dueDate === date
        }),

      getActiveTodos: () =>
        get().todos.filter((t) => t.status !== 'done'),

      getProgress: (category) => {
        const todos = category
          ? get().todos.filter((t) => t.category === category)
          : get().todos
        if (todos.length === 0) return 0
        const done = todos.filter((t) => t.status === 'done').length
        const inProgress = todos.filter((t) => t.status === 'in_progress').length
        return Math.round(((done + inProgress * 0.5) / todos.length) * 100)
      },
    }),
    { name: 'didim-todos' }
  )
)
