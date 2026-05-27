import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import Header from '../../components/common/Header'
import { useRoadmapStore } from '../../store/roadmapStore'
import { useTodoStore } from '../../store/todoStore'
import { useAnnouncementStore } from '../../store/announcementStore'
import {
  ROADMAP_CATEGORY_LABELS,
  ROADMAP_CATEGORY_ICONS,
  ROADMAP_CATEGORY_COLORS,
  ROADMAP_CATEGORY_BG,
  STATUS_LABELS,
} from '../../types'
import type { RoadmapCategory } from '../../types'

export default function CategoryDetailPage() {
  const { cat } = useParams<{ cat: string }>()
  const navigate = useNavigate()
  const category = cat as RoadmapCategory

  const { getByCategory, getCategoryProgress, toggleExpand } = useRoadmapStore()
  const { todos } = useTodoStore()
  const { announcements } = useAnnouncementStore()

  const items = getByCategory(category)
  const { completed, total, pct } = getCategoryProgress(category)

  const color = ROADMAP_CATEGORY_COLORS[category]
  const bg = ROADMAP_CATEGORY_BG[category]
  const icon = ROADMAP_CATEGORY_ICONS[category]
  const label = ROADMAP_CATEGORY_LABELS[category]

  if (!label) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header title="로드맵" showBack />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-text-subtle">잘못된 카테고리예요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      <Header title={`${icon} ${label} 로드맵`} showBack />

      <main className="flex-1 px-4 py-4">
        {/* Category progress card */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{ backgroundColor: bg }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${color}20` }}
            >
              {icon}
            </div>
            <div>
              <p className="font-bold text-text-basic">{label}</p>
              <p className="text-xs text-text-subtle">{completed}/{total} 단계 진행 중</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-subtle">전체 진행률</span>
            <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
          </div>
          <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
        </div>

        {/* Roadmap items */}
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => {
            const itemTodos = todos.filter((t) => item.todoIds.includes(t.id))
            const linkedAnn = item.linkedAnnouncementId
              ? announcements.find((a) => a.id === item.linkedAnnouncementId)
              : null

            return (
              <div key={item.id} className="bg-white rounded-xl border border-border-light overflow-hidden">
                {/* Item header */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-bg-subtle touch-manipulation"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: bg, color }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-basic">{item.title}</p>
                    <p className="text-xs text-text-subtle mt-0.5 truncate">{item.description}</p>
                  </div>
                  {item.isExpanded
                    ? <ChevronUp size={16} className="text-text-disabled flex-shrink-0" />
                    : <ChevronDown size={16} className="text-text-disabled flex-shrink-0" />
                  }
                </button>

                {/* Expanded content */}
                {item.isExpanded && (
                  <div className="px-4 pb-4 border-t border-border-light">
                    {/* Related todos */}
                    {itemTodos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-text-subtle mb-2">관련 투두</p>
                        <div className="flex flex-col gap-2">
                          {itemTodos.map((todo) => (
                            <div
                              key={todo.id}
                              className="flex items-center gap-2 bg-bg-subtle rounded-lg px-3 py-2"
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                todo.status === 'done'
                                  ? 'bg-primary border-primary'
                                  : 'border-border-default'
                              }`}>
                                {todo.status === 'done' && (
                                  <span className="text-white text-[8px] font-bold">✓</span>
                                )}
                              </div>
                              <p className={`text-xs flex-1 ${
                                todo.status === 'done'
                                  ? 'line-through text-text-disabled'
                                  : 'text-text-basic'
                              }`}>
                                {todo.content}
                              </p>
                              <span className="text-[10px] text-text-disabled">
                                {STATUS_LABELS[todo.status]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Linked announcement */}
                    {linkedAnn && (
                      <button
                        onClick={() => navigate(`/search/${linkedAnn.id}`)}
                        className="mt-3 w-full flex items-center gap-2 bg-primary-light rounded-lg px-3 py-2 text-left touch-manipulation"
                      >
                        <span className="text-base">📢</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-primary truncate">{linkedAnn.title}</p>
                          <p className="text-[10px] text-primary/70">{linkedAnn.organization}</p>
                        </div>
                        <ExternalLink size={13} className="text-primary flex-shrink-0" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">{icon}</span>
            <p className="text-sm text-text-subtle text-center">
              아직 로드맵 항목이 없어요.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
