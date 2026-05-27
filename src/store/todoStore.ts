import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockTodos } from '../data/mockData'
import type { Todo, Category, TodoStatus, Priority } from '../types'

interface TodoState {
  todos: Todo[]
  deletedTodos: Todo[]
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  restoreTodo: (id: string) => void
  changeStatus: (id: string, status: TodoStatus) => void
  getTodosByCategory: (category: Category) => Todo[]
  getTodayTodos: () => Todo[]
  getProgress: (category?: Category) => number
}

const generateId = () => `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: mockTodos,
      deletedTodos: [],

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
        set((state) => {
          const todo = state.todos.find((t) => t.id === id)
          if (!todo) return state
          return {
            todos: state.todos.filter((t) => t.id !== id),
            deletedTodos: [todo, ...state.deletedTodos].slice(0, 20),
          }
        }),

      restoreTodo: (id) =>
        set((state) => {
          const todo = state.deletedTodos.find((t) => t.id === id)
          if (!todo) return state
          return {
            todos: [{ ...todo, status: 'todo' as TodoStatus }, ...state.todos],
            deletedTodos: state.deletedTodos.filter((t) => t.id !== id),
          }
        }),

      changeStatus: (id, status) => {
        get().updateTodo(id, { status })
      },

      getTodosByCategory: (category) =>
        get().todos.filter((t) => t.category === category),

      getTodayTodos: () => {
        const today = new Date().toISOString().split('T')[0]
        return get().todos.filter(
          (t) => t.status !== 'done' && (!t.dueDate || t.dueDate >= today)
        ).slice(0, 5)
      },

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
