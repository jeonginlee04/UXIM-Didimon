import { useState } from 'react'
import { X, Sparkles, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_BG, CATEGORY_COLORS } from '../types'
import type { TodoRecommendation, Category } from '../types'

const DIFFICULTY_LABEL = { easy: '쉬움', medium: '보통', hard: '어려움' } as const
const DIFFICULTY_COLOR = {
  easy:   'text-[#3d8070] bg-[#e0efec]',
  medium: 'text-[#c9960a] bg-[#fff1ce]',
  hard:   'text-[#d63d4a] bg-[#fee2e2]',
} as const

interface Props {
  isOpen: boolean
  onClose: () => void
  recommendations: TodoRecommendation[]
  isLoading: boolean
  onAddTodos: (selected: TodoRecommendation[]) => void
}

export default function TodoRecommendModal({
  isOpen,
  onClose,
  recommendations,
  isLoading,
  onAddTodos,
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  const handleAdd = () => {
    const items = recommendations.filter((_, i) => selected.has(i))
    onAddTodos(items)
    setSelected(new Set())
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[70] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[70]
        bg-white rounded-t-3xl flex flex-col shadow-2xl"
        style={{ maxHeight: '88dvh' }}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border-light flex-shrink-0">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-border-default rounded-full" />
          <div className="w-9 h-9 bg-[#fff1ce] rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-[#c9960a]" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-basic">AI 투두 추천</p>
            <p className="text-xs text-text-subtle">나에게 맞는 항목을 추가해보세요</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg active:bg-bg-subtle touch-manipulation">
            <X size={20} className="text-text-subtle" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={28} className="text-primary animate-spin" />
              <p className="text-sm text-text-subtle">AI가 맞춤 추천을 준비 중이에요…</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-text-subtle">추천 항목을 불러오지 못했어요.</p>
              <p className="text-xs text-text-disabled">잠시 후 다시 시도해주세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((item, i) => {
                const cat   = item.category as Category
                const bg    = CATEGORY_BG[cat]    ?? '#f5f5f5'
                const color = CATEGORY_COLORS[cat] ?? '#444'
                const icon  = CATEGORY_ICONS[cat]  ?? '📋'
                const label = CATEGORY_LABELS[cat] ?? cat
                const isChecked = selected.has(i)

                return (
                  <button
                    key={i}
                    onClick={() => toggle(i)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all touch-manipulation
                      ${isChecked
                        ? 'border-primary bg-primary/5'
                        : 'border-border-light bg-white'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {isChecked
                          ? <CheckCircle2 size={20} className="text-primary" />
                          : <Circle size={20} className="text-border-default" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: bg, color }}
                          >
                            {icon} {label}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[item.difficulty]}`}>
                            {DIFFICULTY_LABEL[item.difficulty]}
                          </span>
                        </div>
                        <p className="text-[14px] font-bold text-text-basic leading-snug">{item.title}</p>
                        <p className="text-[12px] text-text-subtle mt-1 leading-relaxed">{item.reason}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        {!isLoading && recommendations.length > 0 && (
          <div className="flex-shrink-0 px-4 py-4 border-t border-border-light bg-white">
            <button
              onClick={handleAdd}
              disabled={selected.size === 0}
              className="btn-primary w-full disabled:opacity-40"
            >
              {selected.size > 0 ? `선택한 ${selected.size}개 추가하기` : '항목을 선택해주세요'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
