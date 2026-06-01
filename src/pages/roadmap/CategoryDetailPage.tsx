import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useRoadmapStore } from '../../store/roadmapStore'
import { useTodoStore } from '../../store/todoStore'
import { useAnnouncementStore } from '../../store/announcementStore'
import {
  ROADMAP_CATEGORY_LABELS,
  ROADMAP_CATEGORY_ICONS,
  ROADMAP_CATEGORY_COLORS,
  ROADMAP_CATEGORY_BG,
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
        <div className="h-14 flex items-center px-4 border-b border-[#c5c6cc]">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 touch-manipulation">
            <ChevronLeft size={22} className="text-[#1f2024]" />
          </button>
          <p className="flex-1 text-sm font-bold text-[#1f2024]">로드맵</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#71727a]">잘못된 카테고리예요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fe]">
      {/* 헤더 */}
      <div className="h-14 flex items-center px-4 bg-white">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 touch-manipulation">
          <ChevronLeft size={22} className="text-[#1f2024]" />
        </button>
        <h1 className="flex-1 text-[14px] font-bold text-[#1f2024] text-center mr-8">
          {icon} {label} 로드맵
        </h1>
      </div>

      <main className="flex-1 px-4 py-4">
        {/* 카테고리 진행도 카드 */}
        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: bg }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${color}25` }}
            >
              {icon}
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1f2024]">{label}</p>
              <p className="text-[12px] text-[#71727a] mt-0.5">{completed}/{total} 단계 진행 중</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-[#71727a]">전체 진행률</span>
            <span className="text-[12px] font-bold" style={{ color }}>{pct}%</span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
        </div>

        {/* 로드맵 항목 */}
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => {
            const itemTodos = todos.filter((t) => item.todoIds.includes(t.id))
            const linkedAnn = item.linkedAnnouncementId
              ? announcements.find((a) => a.id === item.linkedAnnouncementId)
              : null

            return (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {/* 헤더 */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-[#f8f9fe] touch-manipulation"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: bg, color }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#1f2024]">{item.title}</p>
                    <p className="text-[11px] text-[#71727a] mt-0.5 truncate">{item.description}</p>
                  </div>
                  {item.isExpanded
                    ? <ChevronUp size={16} className="text-[#8f9098] flex-shrink-0" />
                    : <ChevronDown size={16} className="text-[#8f9098] flex-shrink-0" />
                  }
                </button>

                {/* 펼침 내용 */}
                {item.isExpanded && (
                  <div className="px-4 pb-4 border-t border-[#e8e9f1]">
                    {itemTodos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[11px] font-bold text-[#71727a] mb-2">행동 제안</p>
                        <div className="flex flex-col gap-2">
                          {itemTodos.map((todo) => (
                            <div key={todo.id} className="flex items-center gap-2 bg-[#f8f9fe] rounded-xl px-3 py-2.5">
                              <p className="text-[12px] flex-1 text-[#1f2024]">{todo.content}</p>
                              <button
                                onClick={() => navigate(`/checklist?content=${encodeURIComponent(todo.content)}&category=${encodeURIComponent(category)}`)}
                                className="text-[10px] font-bold text-[#62ad9e] bg-[#e0efec] rounded-lg px-2.5 py-1 flex-shrink-0 touch-manipulation"
                              >
                                투두 추가
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {linkedAnn && (
                      <button
                        onClick={() => navigate(`/search/${linkedAnn.id}`)}
                        className="mt-3 w-full flex items-center gap-2 bg-[#e0efec] rounded-xl px-3 py-2.5 text-left touch-manipulation"
                      >
                        <span className="text-base">📢</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-[#3d8070] truncate">{linkedAnn.title}</p>
                          <p className="text-[10px] text-[#3d8070]/70">{linkedAnn.organization}</p>
                        </div>
                        <ExternalLink size={13} className="text-[#3d8070] flex-shrink-0" />
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
            <p className="text-sm text-[#71727a] text-center">아직 로드맵 항목이 없어요.</p>
          </div>
        )}
      </main>
    </div>
  )
}
