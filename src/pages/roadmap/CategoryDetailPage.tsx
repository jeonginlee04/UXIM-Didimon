import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, ChevronUp, ExternalLink, Pencil, X, CheckCircle2, Circle, Plus } from 'lucide-react'
import { useRoadmapStore } from '../../store/roadmapStore'
import { useTodoStore } from '../../store/todoStore'
import { useAnnouncementStore } from '../../store/announcementStore'
import CategoryIcon from '../../components/common/CategoryIcon'
import {
  ROADMAP_CATEGORY_LABELS,
  ROADMAP_CATEGORY_COLORS,
  ROADMAP_CATEGORY_BG,
} from '../../types'
import type { RoadmapCategory, Category, RoadmapItem } from '../../types'

export default function CategoryDetailPage() {
  const { cat } = useParams<{ cat: string }>()
  const navigate = useNavigate()
  const category = cat as RoadmapCategory

  const { getByCategory, getCategoryProgress, toggleExpand, updateItem, addTodoToItem } = useRoadmapStore()
  const { todos, getProgress, changeStatus, addTodo } = useTodoStore()
  const { announcements } = useAnnouncementStore()

  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null)
  const [editTitle, setEditTitle]     = useState('')
  const [editDesc, setEditDesc]       = useState('')

  const openEdit = (item: RoadmapItem) => {
    setEditingItem(item)
    setEditTitle(item.title)
    setEditDesc(item.description)
  }

  const handleEditSave = () => {
    if (!editingItem || !editTitle.trim()) return
    updateItem(editingItem.id, { title: editTitle.trim(), description: editDesc.trim() })
    setEditingItem(null)
  }

  // 행동제안 추가: 기존 ID 없으면 새로 생성하고 item에 연결
  const handleAddSuggestionTodo = (itemId: string, content: string) => {
    // 이미 동일 내용+동일 roadmapItem 연결 todo 있으면 스킵
    const exists = todos.some(
      (t) => t.content === content && t.linkedRoadmapItemId === itemId
    )
    if (exists) return
    // generateId 시나리오: addTodo는 void이므로 내부 ID를 직접 읽을 수 없음
    // → addTodo 호출 후 맨 앞 todo ID 로 연결
    addTodo({
      content,
      category: category as Category,
      dueDate: '',
      status: 'todo',
      priority: 'medium',
      hasNotification: false,
      linkedRoadmapItemId: itemId,
    })
  }

  const items = getByCategory(category)
  const { completed, total } = getCategoryProgress(category)
  const pct = getProgress(category as Category)

  const color = ROADMAP_CATEGORY_COLORS[category]
  const bg = ROADMAP_CATEGORY_BG[category]
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
          {label} 로드맵
        </h1>
      </div>

      <main className="flex-1 px-4 py-4">
        {/* 카테고리 진행도 카드 */}
        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: bg }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${color}25` }}
            >
              <CategoryIcon category={category} size={22} style={{ color }} />
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
                <div className="flex items-center">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="flex-1 flex items-center gap-3 px-4 py-4 text-left active:bg-[#f8f9fe] touch-manipulation"
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
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(item) }}
                    className="pr-4 py-4 touch-manipulation"
                    aria-label="편집"
                  >
                    <Pencil size={14} className="text-[#8f9098]" />
                  </button>
                </div>

                {/* 펼침 내용 */}
                {item.isExpanded && (
                  <div className="px-4 pb-4 border-t border-[#e8e9f1]">
                    {itemTodos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[11px] font-bold text-[#71727a] mb-2">행동 제안</p>
                        <div className="flex flex-col gap-2">
                          {itemTodos.map((todo) => {
                            const isDone = todo.status === 'done'
                            // 같은 내용으로 새로 추가된 todo가 있으면 그걸 우선 확인
                            const linked = todos.find(
                              (t) => t.content === todo.content && t.linkedRoadmapItemId === item.id && t.id !== todo.id
                            )
                            const effectiveDone = isDone || linked?.status === 'done'
                            return (
                              <div
                                key={todo.id}
                                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${
                                  effectiveDone ? 'bg-[#e0efec]' : 'bg-[#f8f9fe]'
                                }`}
                              >
                                {effectiveDone
                                  ? <CheckCircle2 size={15} className="text-[#3d8070] flex-shrink-0" />
                                  : <Circle size={15} className="text-[#c5c6cc] flex-shrink-0" />
                                }
                                <p className={`text-[12px] flex-1 ${
                                  effectiveDone ? 'line-through text-[#71727a]' : 'text-[#1f2024]'
                                }`}>
                                  {todo.content}
                                </p>
                                {effectiveDone ? (
                                  <span className="text-[10px] font-bold text-[#3d8070] bg-[#c4e5de] rounded-lg px-2.5 py-1 flex-shrink-0">
                                    완료됨
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => changeStatus(todo.id, 'done')}
                                    className="text-[10px] font-bold text-[#62ad9e] bg-[#e0efec] rounded-lg px-2.5 py-1 flex-shrink-0 touch-manipulation"
                                  >
                                    완료
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {/* itemTodos 없을 때 직접 추가 */}
                    {itemTodos.length === 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleAddSuggestionTodo(item.id, item.title)}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-[#62ad9e] bg-[#e0efec] rounded-lg px-3 py-1.5 touch-manipulation"
                        >
                          <Plus size={12} /> 투두에 추가
                        </button>
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
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: bg }}>
              <CategoryIcon category={category} size={28} style={{ color }} />
            </div>
            <p className="text-sm text-[#71727a] text-center">아직 로드맵 항목이 없어요.</p>
          </div>
        )}
      </main>

      {/* 편집 모달 */}
      {editingItem && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[70]" onClick={() => setEditingItem(null)} />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[70]
            bg-white rounded-t-2xl px-5 pt-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1f2024] text-sm">로드맵 항목 수정</h3>
              <button onClick={() => setEditingItem(null)}>
                <X size={20} className="text-[#8f9098]" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#71727a] mb-1 block">제목</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-[#c5c6cc] rounded-xl px-3 py-2.5 text-sm text-[#1f2024] focus:outline-none focus:border-[#62ad9e]"
                  placeholder="항목 제목"
                  maxLength={40}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#71727a] mb-1 block">설명</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full border border-[#c5c6cc] rounded-xl px-3 py-2.5 text-sm text-[#1f2024] focus:outline-none focus:border-[#62ad9e] resize-none"
                  placeholder="항목 설명 (선택)"
                  rows={3}
                  maxLength={100}
                />
              </div>
              <button
                onClick={handleEditSave}
                disabled={!editTitle.trim()}
                className="btn-primary w-full disabled:opacity-40"
              >
                수정 완료
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
