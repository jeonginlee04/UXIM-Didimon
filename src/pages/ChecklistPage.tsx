import { useState } from 'react'
import {
  CheckCircle,
  Circle,
  Plus,
  Search,
  Trash2,
  RotateCcw,
  X,
  Bell,
  BellOff,
  Archive,
} from 'lucide-react'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import CategoryBadge from '../components/common/CategoryBadge'
import EmptyState from '../components/common/EmptyState'
import { useTodoStore } from '../store/todoStore'
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '../types'
import type { Category, TodoStatus, Priority } from '../types'

const allCategories: Category[] = ['finance', 'housing', 'employment', 'education', 'culture']
const statuses: TodoStatus[] = ['todo', 'in_progress', 'done']

interface AddTodoForm {
  content: string
  category: Category
  dueDate: string
  priority: Priority
  hasNotification: boolean
}

const defaultForm: AddTodoForm = {
  content: '',
  category: 'finance',
  dueDate: '',
  priority: 'medium',
  hasNotification: false,
}

export default function ChecklistPage() {
  const { todos, deletedTodos, addTodo, deleteTodo, restoreTodo, changeStatus } =
    useTodoStore()

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TodoStatus | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  const [form, setForm] = useState<AddTodoForm>(defaultForm)

  const filtered = todos.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (search && !t.content.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const doneCount = todos.filter((t) => t.status === 'done').length
  const progress = todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : 0

  const handleAdd = () => {
    if (!form.content.trim()) return
    addTodo({
      content: form.content.trim(),
      category: form.category,
      dueDate: form.dueDate || undefined,
      status: 'todo',
      priority: form.priority,
      hasNotification: form.hasNotification,
    })
    setForm(defaultForm)
    setShowAddForm(false)
  }

  const priorityDot: Record<Priority, string> = {
    high: 'bg-danger',
    medium: 'bg-warning',
    low: 'bg-border-default',
  }

  return (
    <div className="min-h-screen bg-bg-page">
      <Header title="체크리스트" />

      <main className="max-w-md mx-auto pb-28">
        {/* Progress summary */}
        <div className="bg-white px-5 py-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-subtle">
              전체 <span className="font-bold text-text-basic">{todos.length}개</span> 중
            </span>
            <span className="text-sm font-bold text-success">
              {doneCount}개 완료 ({progress}%)
            </span>
          </div>
          <div className="h-2 bg-bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Search & filter */}
        <div className="bg-white px-4 py-3 mb-3 sticky top-14 z-30 border-b border-border-light">
          <div className="relative mb-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="할 일 검색..."
              className="krds-field pl-9 pr-4"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setFilterStatus('all')}
              className={`krds-chip touch-manipulation ${filterStatus === 'all' ? 'active' : ''}`}
            >
              전체
            </button>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`krds-chip touch-manipulation ${filterStatus === s ? 'active' : ''}`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
            <div className="w-px h-5 bg-border-light self-center mx-0.5" />
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setFilterCategory(filterCategory === cat ? 'all' : cat)
                }
                className={`krds-chip touch-manipulation ${filterCategory === cat ? 'active' : ''}`}
              >
                {CATEGORY_ICONS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Todo list */}
        <div className="px-4 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <EmptyState
              icon="✅"
              title="할 일이 없어요"
              description="새 할 일을 추가해보세요"
            />
          ) : (
            filtered.map((todo) => (
              <div
                key={todo.id}
                className={`krds-card rounded-lg p-4 ${
                  todo.status === 'done' ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      changeStatus(todo.id, todo.status === 'done' ? 'todo' : 'done')
                    }
                    className="mt-0.5 touch-manipulation flex-shrink-0"
                  >
                    {todo.status === 'done' ? (
                      <CheckCircle size={22} className="text-success" />
                    ) : (
                      <Circle size={22} className="text-border-default" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-snug mb-1.5 ${
                        todo.status === 'done'
                          ? 'line-through text-text-disabled'
                          : 'text-text-basic'
                      }`}
                    >
                      {todo.content}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CategoryBadge category={todo.category} size="sm" />
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${priorityDot[todo.priority]}`} />
                        <span className="text-[10px] text-text-disabled">
                          {PRIORITY_LABELS[todo.priority]}
                        </span>
                      </div>
                      {todo.dueDate && (
                        <span className="text-[10px] text-text-disabled">
                          ~{todo.dueDate}
                        </span>
                      )}
                      {todo.status === 'in_progress' && (
                        <span className="text-[10px] bg-primary-light text-primary px-1.5 py-0.5 rounded-sm font-medium">
                          진행 중
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {todo.hasNotification ? (
                      <Bell size={14} className="text-primary" />
                    ) : (
                      <BellOff size={14} className="text-border-light" />
                    )}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 touch-manipulation"
                    >
                      <Trash2 size={14} className="text-border-default hover:text-danger transition" />
                    </button>
                  </div>
                </div>

                {/* Status change */}
                {todo.status !== 'done' && (
                  <div className="mt-3 flex gap-1.5">
                    {(['todo', 'in_progress'] as TodoStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => changeStatus(todo.id, s)}
                        className={`px-2.5 py-1 rounded-sm text-[10px] font-medium transition touch-manipulation ${
                          todo.status === s
                            ? 'bg-primary text-white'
                            : 'bg-bg-subtle text-text-subtle'
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Deleted todos */}
        {deletedTodos.length > 0 && (
          <div className="px-4 mt-4">
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className="flex items-center gap-2 text-sm text-text-disabled font-medium mb-2 touch-manipulation"
            >
              <Archive size={14} />
              최근 삭제된 항목 ({deletedTodos.length}개)
            </button>
            {showDeleted &&
              deletedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 bg-bg-subtle rounded px-4 py-3 mb-2"
                >
                  <span className="flex-1 text-xs text-text-disabled line-through truncate">
                    {todo.content}
                  </span>
                  <button
                    onClick={() => restoreTodo(todo.id)}
                    className="flex items-center gap-1 text-xs text-primary font-medium touch-manipulation"
                  >
                    <RotateCcw size={12} />
                    복구
                  </button>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* Add todo FAB */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setShowAddForm(true)}
          className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center touch-manipulation active:scale-95 transition"
          style={{ boxShadow: '0 4px 12px rgba(37,110,244,0.35)' }}
        >
          <Plus size={26} />
        </button>
      </div>

      {/* Add todo bottom sheet */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAddForm(false)}
          />
          <div className="relative w-full max-w-md mx-auto bg-white rounded-t-xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-text-basic">새 할 일 추가</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X size={20} className="text-text-disabled" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-subtle mb-[0.6rem]">
                  내용 <span className="text-danger ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="할 일을 입력하세요"
                  autoFocus
                  className="krds-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-subtle mb-[0.6rem]">
                    카테고리
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as Category })
                    }
                    className="krds-field"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-subtle mb-[0.6rem]">
                    우선순위
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value as Priority })
                    }
                    className="krds-field"
                  >
                    <option value="high">🔴 높음</option>
                    <option value="medium">🟡 보통</option>
                    <option value="low">⚪ 낮음</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-subtle mb-[0.6rem]">
                  마감일 <span className="text-text-disabled font-normal ml-1">(선택)</span>
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="krds-field"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-basic font-medium">알림 설정</span>
                <button
                  onClick={() =>
                    setForm({ ...form, hasNotification: !form.hasNotification })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative touch-manipulation ${
                    form.hasNotification ? 'bg-primary' : 'bg-bg-subtle'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.hasNotification ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={!form.content.trim()}
                className="btn-primary w-full disabled:opacity-40"
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
