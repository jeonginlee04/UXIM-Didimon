import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/common/BottomNav'
import { useAuthStore } from '../store/authStore'
import pet2 from '../assets/pet2.png'
import { useRoadmapStore } from '../store/roadmapStore'
import { useTodoStore } from '../store/todoStore'
import { useAnnouncementStore } from '../store/announcementStore'
import {
  ROADMAP_CATEGORY_LABELS,
  ROADMAP_CATEGORY_ICONS,
  ROADMAP_CATEGORY_COLORS,
  ROADMAP_CATEGORY_BG,
  EXP_PER_LEVEL,
  getLevelProgress,
} from '../types'
import type { RoadmapCategory } from '../types'

const ROADMAP_CATS: RoadmapCategory[] = ['finance', 'housing', 'employment', 'education']

const CAT_EMOJI: Record<string, string> = {
  finance: '💰', housing: '🏠', employment: '💼', education: '📚', culture: '🎨',
}

export default function RoadmapPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { getCategoryProgress, dailyQuests, canDoWeeklyCheck } = useRoadmapStore()
  const { getProgress } = useTodoStore()
  const { announcements } = useAnnouncementStore()

  const level = user?.level ?? 1
  const exp = user?.exp ?? 0
  const levelProgress = getLevelProgress(exp)
  const completedQuests = dailyQuests.filter((q) => q.isCompleted).length
  const totalQuests = dailyQuests.length

  const latestAnn = [...announcements]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 2)

  return (
    <div className="min-h-screen flex flex-col bg-bg-page pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border-light px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-base font-bold text-text-basic">
              {user?.nickname ?? user?.name ?? ''}님의 자립 로드맵
            </h1>
            <p className="text-xs text-text-subtle mt-0.5">오늘도 한 걸음씩 나아가요</p>
          </div>
          <img src={pet2} alt="" className="w-12 h-12 object-contain flex-shrink-0" />
        </div>

        {/* Level EXP bar */}
        <div className="bg-primary-light rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                Lv.{level}
              </span>
              <span className="text-xs text-primary font-medium">
                {user?.nickname ?? user?.name}
              </span>
            </div>
            <span className="text-xs text-primary font-bold">
              {levelProgress} / {EXP_PER_LEVEL} EXP
            </span>
          </div>
          <div className="h-2.5 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${(levelProgress / EXP_PER_LEVEL) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 py-4 flex flex-col gap-4">
        {/* 공지사항 */}
        {latestAnn.length > 0 && (
          <div className="bg-white rounded-xl border border-border-light overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border-light bg-primary/5">
              <span className="text-xs font-bold text-primary">📢 최신 공고</span>
            </div>
            {latestAnn.map((ann) => (
              <button
                key={ann.id}
                onClick={() => navigate(`/search/${ann.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-bg-subtle touch-manipulation border-b border-border-light last:border-0"
              >
                <span className="text-base">{CAT_EMOJI[ann.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-basic truncate">{ann.title}</p>
                  <p className="text-[10px] text-text-subtle mt-0.5">{ann.organization}</p>
                </div>
                <span className="text-text-disabled">›</span>
              </button>
            ))}
          </div>
        )}

        {/* Daily quest */}
        <button
          onClick={() => navigate('/roadmap/quest')}
          className="bg-white rounded-xl border border-border-light p-4 text-left active:bg-bg-subtle touch-manipulation"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="text-sm font-bold text-text-basic">이번 주 퀘스트</span>
            </div>
            <span className="text-xs font-bold text-primary">
              {completedQuests}/{totalQuests}
            </span>
          </div>
          <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-warning rounded-full transition-all"
              style={{ width: `${totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-text-subtle">
            {completedQuests === totalQuests
              ? '모든 퀘스트를 완료했어요! 🎉'
              : `${totalQuests - completedQuests}개 퀘스트가 남아있어요`}
          </p>
        </button>

        {/* Weekly check */}
        {canDoWeeklyCheck() && (
          <button
            onClick={() => navigate('/roadmap/weekly-check')}
            className="bg-primary text-white rounded-xl p-4 text-left active:bg-primary-pressed touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <p className="text-sm font-bold">이번 주 점검하기</p>
                <p className="text-xs text-primary-light mt-0.5">한 주의 자립 여정을 돌아보세요</p>
              </div>
              <span className="text-xl opacity-80">›</span>
            </div>
          </button>
        )}

        {/* 2×2 Category cards */}
        <div>
          <h2 className="text-sm font-bold text-text-basic mb-3">카테고리별 진행 현황</h2>
          <div className="grid grid-cols-2 gap-3">
            {ROADMAP_CATS.map((cat) => {
              const { completed, total } = getCategoryProgress(cat)
              const todoPct = getProgress(cat)
              const color = ROADMAP_CATEGORY_COLORS[cat]
              const bg = ROADMAP_CATEGORY_BG[cat]

              return (
                <button
                  key={cat}
                  onClick={() => navigate(`/roadmap/category/${cat}`)}
                  className="bg-white rounded-xl border border-border-light p-4 text-left active:bg-bg-subtle touch-manipulation"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                    style={{ backgroundColor: bg }}
                  >
                    {ROADMAP_CATEGORY_ICONS[cat]}
                  </div>
                  <p className="text-sm font-bold text-text-basic mb-1">
                    {ROADMAP_CATEGORY_LABELS[cat]}
                  </p>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-text-subtle">{completed}/{total} 단계</span>
                    <span className="text-[10px] font-bold" style={{ color }}>
                      {todoPct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${todoPct}%`, backgroundColor: color }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Turtle tip */}
        <div className="flex items-end gap-3 pb-2">
          <img src={pet2} alt="" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-border-light flex-1 shadow-sm">
            <p className="text-xs text-text-subtle leading-relaxed">
              꾸준히 하는 것이 가장 중요해요.
              <br />오늘도 작은 한 걸음 내딛어봐요!
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
