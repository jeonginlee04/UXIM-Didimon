import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Plus,
  Bookmark,
  ExternalLink,
} from 'lucide-react'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import ProgressBar from '../components/common/ProgressBar'
import CategoryBadge from '../components/common/CategoryBadge'
import { useRoadmapStore } from '../store/roadmapStore'
import { useTodoStore } from '../store/todoStore'
import { useAnnouncementStore } from '../store/announcementStore'
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from '../types'
import type { Category } from '../types'

const allCategories: Category[] = [
  'finance', 'housing', 'employment', 'education', 'culture',
]

export default function RoadmapPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const { items, toggleExpand } = useRoadmapStore()
  const { todos, changeStatus, addTodo } = useTodoStore()
  const { announcements } = useAnnouncementStore()

  const getProgress = (category?: Category) => {
    const catTodos = category
      ? todos.filter((t) => t.category === category)
      : todos
    if (catTodos.length === 0) return 0
    const done = catTodos.filter((t) => t.status === 'done').length
    const inProg = catTodos.filter((t) => t.status === 'in_progress').length
    return Math.round(((done + inProg * 0.5) / catTodos.length) * 100)
  }

  const overallProgress = getProgress()

  const visibleItems =
    activeCategory === 'all'
      ? items
      : items.filter((item) => item.category === activeCategory)

  const getItemTodos = (todoIds: string[]) =>
    todos.filter((t) => todoIds.includes(t.id))

  const getLinkedAnn = (annId?: string) =>
    annId ? announcements.find((a) => a.id === annId) : undefined

  const handleAddInlineTodo = (roadmapItemId: string, category: Category) => {
    const content = prompt('추가할 할 일을 입력하세요')
    if (!content?.trim()) return
    addTodo({
      content: content.trim(),
      category,
      status: 'todo',
      priority: 'medium',
      hasNotification: false,
      linkedRoadmapItemId: roadmapItemId,
    })
  }

  return (
    <div className="min-h-screen bg-bg-page">
      <Header title="자립 로드맵" showNotification />

      <main className="max-w-md mx-auto pb-24">
        {/* Overall progress hero */}
        <div className="bg-white px-5 py-5 mb-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-black text-text-basic">전체 자립 진행률</h2>
            <span className="text-2xl font-black text-primary">{overallProgress}%</span>
          </div>
          <ProgressBar value={overallProgress} height={10} showLabel={false} />
          <p className="text-xs text-text-disabled mt-2">
            레벨 {Math.floor(overallProgress / 20) + 1} · 계속 성장 중이에요 🌱
          </p>
        </div>

        {/* Category progress mini cards */}
        <div className="px-4 mb-3">
          <div className="grid grid-cols-3 gap-2">
            {allCategories.slice(0, 3).map((cat) => {
              const prog = getProgress(cat)
              const color = CATEGORY_COLORS[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? 'all' : cat)}
                  className={`p-3 rounded text-left transition touch-manipulation bg-white border-2 ${
                    activeCategory === cat
                      ? 'border-primary'
                      : 'border-border-light'
                  }`}
                >
                  <p className="text-lg mb-1">{CATEGORY_ICONS[cat]}</p>
                  <p className="text-[10px] text-text-subtle font-medium mb-1.5">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <p className="text-sm font-black" style={{ color }}>
                    {prog}%
                  </p>
                  <ProgressBar value={prog} color={color} height={4} animated={false} />
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {allCategories.slice(3).map((cat) => {
              const prog = getProgress(cat)
              const color = CATEGORY_COLORS[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? 'all' : cat)}
                  className={`p-3 rounded text-left transition touch-manipulation bg-white border-2 ${
                    activeCategory === cat
                      ? 'border-primary'
                      : 'border-border-light'
                  }`}
                >
                  <p className="text-lg mb-1">{CATEGORY_ICONS[cat]}</p>
                  <p className="text-[10px] text-text-subtle font-medium mb-1.5">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <p className="text-sm font-black" style={{ color }}>
                    {prog}%
                  </p>
                  <ProgressBar value={prog} color={color} height={4} animated={false} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Category tab filter */}
        <div className="px-4 mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`krds-chip touch-manipulation ${activeCategory === 'all' ? 'active' : ''}`}
          >
            전체
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`krds-chip touch-manipulation ${activeCategory === cat ? 'active' : ''}`}
            >
              {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Roadmap items */}
        <div className="px-4 flex flex-col gap-3">
          {visibleItems
            .sort((a, b) => a.order - b.order)
            .map((item) => {
              const itemTodos = getItemTodos(item.todoIds)
              const doneTodos = itemTodos.filter((t) => t.status === 'done').length
              const linkedAnn = getLinkedAnn(item.linkedAnnouncementId)
              const itemProgress =
                itemTodos.length > 0
                  ? Math.round((doneTodos / itemTodos.length) * 100)
                  : 0

              return (
                <div key={item.id} className="krds-card rounded-lg overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full text-left touch-manipulation"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <CategoryBadge category={item.category} size="sm" />
                            <span className="text-[10px] text-text-disabled">
                              Lv.{item.level}
                            </span>
                          </div>
                          <p className="font-bold text-sm text-text-basic leading-snug">
                            {item.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-sm font-black"
                            style={{ color: CATEGORY_COLORS[item.category] }}
                          >
                            {itemProgress}%
                          </span>
                          {item.isExpanded ? (
                            <ChevronUp size={18} className="text-text-disabled" />
                          ) : (
                            <ChevronDown size={18} className="text-text-disabled" />
                          )}
                        </div>
                      </div>

                      <ProgressBar
                        value={itemProgress}
                        color={CATEGORY_COLORS[item.category]}
                        height={5}
                      />

                      {!item.isExpanded && itemTodos.length > 0 && (
                        <div className="mt-2 flex gap-1.5">
                          {itemTodos.slice(0, 2).map((todo) => (
                            <div
                              key={todo.id}
                              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-sm ${
                                todo.status === 'done'
                                  ? 'bg-success-light text-success-text'
                                  : 'bg-bg-subtle text-text-subtle'
                              }`}
                            >
                              {todo.status === 'done' ? (
                                <CheckCircle size={10} />
                              ) : (
                                <Circle size={10} />
                              )}
                              <span className="truncate max-w-[80px]">{todo.content}</span>
                            </div>
                          ))}
                          {itemTodos.length > 2 && (
                            <span className="text-[10px] text-text-disabled self-center">
                              +{itemTodos.length - 2}개
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {item.isExpanded && (
                    <div className="border-t border-border-light animate-slide-up">
                      {/* Description */}
                      <p className="px-4 pt-3 pb-2 text-xs text-text-subtle">
                        {item.description}
                      </p>

                      {/* Linked announcement */}
                      {linkedAnn && (
                        <button
                          onClick={() => navigate(`/announcements/${linkedAnn.id}`)}
                          className="mx-4 mb-3 w-[calc(100%-2rem)] flex items-center gap-2 bg-primary-light rounded p-3 touch-manipulation text-left border border-primary-lighter"
                        >
                          <Bookmark size={14} className="text-primary flex-shrink-0" />
                          <span className="text-xs text-primary font-medium flex-1 truncate">
                            {linkedAnn.title}
                          </span>
                          <ExternalLink size={12} className="text-primary flex-shrink-0" />
                        </button>
                      )}

                      {/* Todo list */}
                      <div className="px-4 pb-2">
                        {itemTodos.map((todo) => (
                          <div
                            key={todo.id}
                            className="flex items-center gap-3 py-2.5 border-b border-border-light last:border-0"
                          >
                            <button
                              onClick={() =>
                                changeStatus(
                                  todo.id,
                                  todo.status === 'done' ? 'todo' : 'done'
                                )
                              }
                              className="touch-manipulation flex-shrink-0"
                            >
                              {todo.status === 'done' ? (
                                <CheckCircle size={20} className="text-success" />
                              ) : (
                                <Circle size={20} className="text-border-default" />
                              )}
                            </button>
                            <span
                              className={`flex-1 text-xs leading-snug ${
                                todo.status === 'done'
                                  ? 'line-through text-text-disabled'
                                  : 'text-text-subtle'
                              }`}
                            >
                              {todo.content}
                            </span>
                            {todo.dueDate && (
                              <span className="text-[10px] text-text-disabled flex-shrink-0">
                                ~{todo.dueDate.slice(5)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add todo inline */}
                      <button
                        onClick={() => handleAddInlineTodo(item.id, item.category)}
                        className="w-full flex items-center gap-2 px-4 py-3 text-xs text-primary font-medium border-t border-border-light touch-manipulation hover:bg-bg-page transition"
                      >
                        <Plus size={14} />
                        할 일 추가
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
