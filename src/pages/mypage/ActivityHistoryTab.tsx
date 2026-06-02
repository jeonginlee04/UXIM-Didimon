import { useMemo } from 'react'
import { useTodoStore } from '../../store/todoStore'
import { useAuthStore } from '../../store/authStore'
import { CATEGORY_LABELS, CATEGORY_BG, CATEGORY_COLORS, EXP_PER_LEVEL, getLevelProgress } from '../../types'
import CategoryIcon from '../../components/common/CategoryIcon'
import type { Category } from '../../types'

const ACTIVITY_CATS: Category[] = ['finance', 'housing', 'employment', 'education', 'culture']

export default function ActivityHistoryTab() {
  const { todos } = useTodoStore()
  const { user }  = useAuthStore()

  const level        = user?.level ?? 1
  const exp          = user?.exp ?? 0
  const levelProgress = getLevelProgress(exp)
  const expPercent   = Math.round((levelProgress / EXP_PER_LEVEL) * 100)

  // 완료된 투두 (최신순)
  const doneTodos = useMemo(
    () =>
      todos
        .filter((t) => t.status === 'done')
        .sort((a, b) => {
          const da = a.completedAt ?? a.createdAt
          const db = b.completedAt ?? b.createdAt
          return new Date(db).getTime() - new Date(da).getTime()
        }),
    [todos]
  )

  // 카테고리별 완료 수
  const catCounts = useMemo(() => {
    const m: Record<string, number> = {}
    doneTodos.forEach((t) => {
      m[t.category] = (m[t.category] ?? 0) + 1
    })
    return m
  }, [doneTodos])

  const maxCount = Math.max(...Object.values(catCounts), 1)

  // 날짜 포맷
  const fmtDate = (d?: string) => {
    if (!d) return ''
    const date = new Date(d)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="px-5 py-4 space-y-6">
      {/* 펫 성장 기록 */}
      <section>
        <h3 className="text-[13px] font-bold text-[#1f2024] mb-3">펫 성장 기록</h3>
        <div className="bg-[#e0efec] rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[22px] font-extrabold text-[#1f2024]">Lv.{level}</p>
              <p className="text-[11px] text-[#3d8070]">안정 준비 단계</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-[#3d8070]">{levelProgress} / {EXP_PER_LEVEL} EXP</p>
              <p className="text-[11px] text-[#3d8070]/70">다음 레벨까지 {EXP_PER_LEVEL - levelProgress} EXP</p>
            </div>
          </div>
          <div className="h-3 bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${expPercent}%`, background: 'linear-gradient(to right, #284741, #62ad9e)' }}
            />
          </div>
          <p className="text-[11px] text-[#3d8070]/70 mt-2 text-right">{expPercent}% 달성</p>
        </div>
      </section>

      {/* 분야별 완료 현황 */}
      <section>
        <h3 className="text-[13px] font-bold text-[#1f2024] mb-3">분야별 완료 투두</h3>
        {doneTodos.length === 0 ? (
          <p className="text-[12px] text-[#8f9098] text-center py-4">아직 완료한 투두가 없어요.</p>
        ) : (
          <div className="space-y-2">
            {ACTIVITY_CATS.map((cat) => {
              const count = catCounts[cat] ?? 0
              const bg    = CATEGORY_BG[cat]
              const color = CATEGORY_COLORS[cat]
              const pct   = Math.round((count / maxCount) * 100)
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-6 flex justify-center flex-shrink-0"><CategoryIcon category={cat} size={14} style={{ color }} /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-medium text-[#494a50]">{CATEGORY_LABELS[cat]}</span>
                      <span className="text-[11px] font-bold" style={{ color }}>{count}개</span>
                    </div>
                    <div className="h-2 bg-[#e8e9f1] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 완료 이력 타임라인 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-[#1f2024]">완료 이력</h3>
          <span className="text-[11px] text-[#71727a]">총 {doneTodos.length}개</span>
        </div>
        {doneTodos.length === 0 ? (
          <p className="text-[12px] text-[#8f9098] text-center py-4">완료한 투두가 없어요. 오늘 첫 번째를 완료해봐요!</p>
        ) : (
          <div className="space-y-2">
            {doneTodos.slice(0, 20).map((todo) => {
              const cat   = todo.category as Category
              const bg    = CATEGORY_BG[cat]
              const color = CATEGORY_COLORS[cat]
              return (
                <div key={todo.id} className="flex items-center gap-3 bg-[#f8f9fe] rounded-xl px-3 py-2.5">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0"
                    style={{ backgroundColor: bg }}
                  >
                    <CategoryIcon category={cat} size={12} style={{ color }} />
                  </span>
                  <p className="flex-1 text-[12px] text-[#1f2024] line-clamp-1">{todo.content}</p>
                  <span className="text-[10px] text-[#8f9098] flex-shrink-0">
                    {fmtDate(todo.completedAt ?? todo.createdAt)}
                  </span>
                </div>
              )
            })}
            {doneTodos.length > 20 && (
              <p className="text-[11px] text-[#8f9098] text-center py-2">최근 20개만 표시돼요.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
