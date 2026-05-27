import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockTodos } from "../data/mockData";
import type { Todo, Category, TodoStatus } from "../types";

interface TodoState {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, "id" | "createdAt">) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  changeStatus: (id: string, status: TodoStatus) => void;
  getTodosByCategory: (category: Category) => Todo[];
  getTodosByDate: (date: string) => Todo[];
  getActiveTodos: () => Todo[];
  getProgress: (category?: Category) => number;
}

const getTodayString = () => new Date().toISOString().split("T")[0];

const generateId = () =>
  `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: mockTodos,

      addTodo: (todoData) => {
        const newTodo: Todo = {
          ...todoData,
          id: generateId(),
          createdAt: getTodayString(),
        };

        set((state) => ({
          todos: [newTodo, ...state.todos],
        }));
      },

      updateTodo: (id, updates) => {
        set((state) => ({
          todos: state.todos.map((todo) => {
            if (todo.id !== id) return todo;

            const nextStatus = updates.status ?? todo.status;

            return {
              ...todo,
              ...updates,
              completedAt:
                nextStatus === "done"
                  ? (todo.completedAt ?? getTodayString())
                  : undefined,
            };
          }),
        }));
      },

      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },

      changeStatus: (id, status) => {
        get().updateTodo(id, { status });
      },

      getTodosByCategory: (category) => {
        return get().todos.filter((todo) => todo.category === category);
      },

      getTodosByDate: (date) => {
        return get().todos.filter((todo) => todo.dueDate === date);
      },

      getActiveTodos: () => {
        return get().todos.filter((todo) => todo.status !== "done");
      },

      getProgress: (category) => {
        const targetTodos = category
          ? get().todos.filter((todo) => todo.category === category)
          : get().todos;

        if (targetTodos.length === 0) return 0;

        const doneCount = targetTodos.filter(
          (todo) => todo.status === "done",
        ).length;
        const inProgressCount = targetTodos.filter(
          (todo) => todo.status === "in_progress",
        ).length;

        return Math.round(
          ((doneCount + inProgressCount * 0.5) / targetTodos.length) * 100,
        );
      },
    }),
    {
      name: "didim-todos",
    },
  ),
);
