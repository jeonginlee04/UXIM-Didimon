import { useEffect, useState } from 'react'
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

const ALL_ROADMAP_CATS: RoadmapCategory[] = ['finance', 'housing', 'employment', 'education', 'mental_health', 'physical_health', 'social_connection']

const STATUS_LABEL: Record<string, string> = {
  finance: '주의 필요',
  housing: '안정 상태',
  employment: '진행중',
  education: '진행중',
}

export default function RoadmapPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const userInterestCats = (user?.interests ?? []).filter(
    (k): k is RoadmapCategory => ALL_ROADMAP_CATS.includes(k as RoadmapCategory)
  )
  const shownCats = userInterestCats.length > 0 ? userInterestCats : ALL_ROADMAP_CATS
  const { getCategoryProgress, dailyQuests, canDoWeeklyCheck, checkAndResetDailyQuests } = useRoadmapStore()
  const { getProgress } = useTodoStore()
  const { announcements } = useAnnouncementStore()

  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    checkAndResetDailyQuests()
  }, [])

  const level = user?.level ?? 1
  const exp = user?.exp ?? 0
  const levelProgress = getLevelProgress(exp)
  const expPercent = Math.round((levelProgress / EXP_PER_LEVEL) * 100)

  const latestAnn = [...announcements]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 1)[0]

  const completedQuests = dailyQuests.filter((q) => q.isCompleted).length
  const totalQuests = dailyQuests.length

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* 상태바 / 상단 여백 */}
      <div className="h-11 bg-white" />

      {/* 공지사항 배너 */}
      {latestAnn && !bannerDismissed && (
        <div className="mx-4 mb-3">
          <div className="bg-white border border-[#ff9277] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center px-5 py-4 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#1f2024] mb-0.5">공지사항</p>
                <p className="text-[12px] text-[#494a50] truncate">
                  {latestAnn.title}
                </p>
              </div>
              <button
                onClick={() => setBannerDismissed(true)}
                className="flex-shrink-0 text-[#ff9277] touch-manipulation"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 구분선 */}
      <div className="h-px bg-[#e8e9f1] mx-4 mb-4" />

      <main className="flex-1 px-4 flex flex-col gap-5">
        {/* 분야별 현황 */}
        <div>
          <h2 className="text-[14px] font-bold text-[#1f2024] mb-3">분야별 현황</h2>
          <div className="grid grid-cols-2 gap-3">
            {shownCats.map((cat) => {
              const { completed, total } = getCategoryProgress(cat)
              const todoPct = getProgress(cat)
              const color = ROADMAP_CATEGORY_COLORS[cat]
              const bg = ROADMAP_CATEGORY_BG[cat]

              return (
                <button
                  key={cat}
                  onClick={() => navigate(`/roadmap/category/${cat}`)}
                  className="rounded-2xl p-4 text-left active:opacity-80 touch-manipulation"
                  style={{ backgroundColor: bg }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-bold text-[#1f2024]">
                      {ROADMAP_CATEGORY_LABELS[cat]}
                    </p>
                    <span className="text-xl">{ROADMAP_CATEGORY_ICONS[cat]}</span>
                  </div>
                  <p className="text-[12px] mb-2" style={{ color }}>
                    {STATUS_LABEL[cat] ?? `${completed}/${total} 단계`}
                  </p>
                  <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
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

        {/* 오늘의 퀘스트 미리보기 */}
        <button
          onClick={() => navigate('/roadmap/quest')}
          className="bg-white border border-[#c5c6cc] rounded-2xl p-5 text-left active:bg-[#f8f9fe] touch-manipulation shadow-sm"
        >
          <h3 className="text-[12px] font-bold text-[#1f2024] mb-2">
            오늘의 퀘스트를 확인해볼까요?
          </h3>
          <ul className="text-[10px] text-[#494a50] space-y-1 list-disc pl-3.5 mb-3">
            {dailyQuests.slice(0, 2).map((q) => (
              <li key={q.id}>{q.title}</li>
            ))}
            {dailyQuests.length === 0 && (
              <>
                <li>공고 하나 이상 스크랩하기</li>
                <li>금융 분야 투두 추가</li>
              </>
            )}
          </ul>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#71727a]">
              {completedQuests}/{totalQuests || 2}개 완료
            </p>
            <span className="bg-[#62ad9e] text-white text-[10px] font-semibold px-3 py-1 rounded-full">
              더보기
            </span>
          </div>
        </button>

        {/* 주간 점검 버튼 */}
        {canDoWeeklyCheck() && (
          <button
            onClick={() => navigate('/roadmap/weekly-check')}
            className="bg-[#62ad9e] text-white rounded-2xl p-4 text-left active:opacity-90 touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <p className="text-sm font-bold">이번 주 점검하기</p>
                <p className="text-xs text-white/80 mt-0.5">한 주의 자립 여정을 돌아보세요</p>
              </div>
              <span className="text-xl opacity-80">›</span>
            </div>
          </button>
        )}

        {/* 레벨/진행률 + 거북이 */}
        <div className="flex items-end gap-3 pb-2">
          <img src={pet2} alt="" className="w-20 h-20 object-contain flex-shrink-0" />
          <div className="flex-1 pb-1">
            <div className="flex items-end justify-between mb-1">
              <span className="text-[12px] text-[#494a50]">안정 준비 단계</span>
              <span className="text-[14px] font-bold text-[#1f2024]">Lv.{level}</span>
            </div>
            <p className="text-[24px] font-bold text-[#1f2024] leading-none mb-2">
              {expPercent}%
            </p>
            {/* 그라디언트 프로그레스 바 */}
            <div className="h-[21px] bg-[#e8e9f1] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${expPercent}%`,
                  background: 'linear-gradient(to right, #284741, #62ad9e)',
                }}
              />
            </div>
          </div>
        </div>

        {/* 거북이 말풍선 */}
        <div className="flex items-end gap-3 pb-2">
          <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-[#c5c6cc] flex-1 shadow-sm">
            <p className="text-xs text-[#71727a] leading-relaxed">
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
