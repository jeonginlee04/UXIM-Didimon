import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Home, Briefcase, BookOpen, Sprout, Heart, Activity, Users, Bell, ClipboardCheck } from 'lucide-react'
import BottomNav from '../components/common/BottomNav'
import { useAuthStore } from '../store/authStore'
import pet2 from '../assets/pet2.png'
import { useRoadmapStore } from '../store/roadmapStore'
import { useTodoStore } from '../store/todoStore'
import { useAnnouncementStore } from '../store/announcementStore'
import {
  ROADMAP_CATEGORY_LABELS,
  ROADMAP_CATEGORY_COLORS,
  ROADMAP_CATEGORY_BG,
  EXP_PER_LEVEL,
  getLevelProgress,
} from '../types'
import type { RoadmapCategory } from '../types'

const CAT_ICON: Record<RoadmapCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  finance:          Wallet,
  housing:          Home,
  employment:       Briefcase,
  education:        BookOpen,
  mental_health:    Heart,
  physical_health:  Activity,
  social_connection:Users,
}

const ALL_ROADMAP_CATS: RoadmapCategory[] = ['finance', 'housing', 'employment', 'education', 'mental_health', 'physical_health', 'social_connection']

// STATUS_LABEL 제거: 항상 진행 단계 수치로 표시

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
  const [showAnnList, setShowAnnList]         = useState(false)

  // 마감 임박 순 상위 5개 공고
  const topAnns = [...announcements]
    .filter((a) => a.endDate && a.endDate !== '')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5)

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

      {/* 중요 공고 배너 — 클릭 시 리스트 모달 */}
      {latestAnn && !bannerDismissed && (
        <div className="mx-4 mb-3">
          <div className="bg-white border border-[#ff9277] rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowAnnList(true)}
              className="w-full flex items-center px-5 py-3.5 gap-3 text-left active:bg-[#fff5f3] touch-manipulation"
            >
              <Bell size={14} className="text-[#ff9277] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#ff9277] mb-0.5">마감 임박 공고</p>
                <p className="text-[12px] text-[#494a50] truncate">{latestAnn.title}</p>
              </div>
              <span className="text-[11px] text-[#ff9277] font-semibold flex-shrink-0">전체보기 ›</span>
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[#ff9277] touch-manipulation"
              aria-label="닫기"
            >✕</button>
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
              const todoPct = getProgress(cat)
              const color = ROADMAP_CATEGORY_COLORS[cat]

              // 상태별 색상 — 카드 배경·뱃지·아이콘·진행바 통합
              const statusInfo =
                todoPct >= 80
                  ? { label: '안정 상태', cardBg: '#d1fae5', iconBg: '#a7f3d0', iconColor: '#065f46', badgeText: '#065f46', badgeBg: '#a7f3d0', barColor: '#22c55e' }
                  : todoPct > 0
                  ? { label: '진행중',   cardBg: '#dbeafe', iconBg: '#bfdbfe', iconColor: '#1e3a8a', badgeText: '#1e40af', badgeBg: '#bfdbfe', barColor: '#3b82f6' }
                  : { label: '시작전',   cardBg: '#fef3c7', iconBg: '#fde68a', iconColor: '#78350f', badgeText: '#92400e', badgeBg: '#fde68a', barColor: '#f59e0b' }

              return (
                <button
                  key={cat}
                  onClick={() => navigate(`/roadmap/category/${cat}`)}
                  className="rounded-2xl p-4 text-left active:opacity-75 touch-manipulation"
                  style={{ backgroundColor: statusInfo.cardBg }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-bold text-[#1f2024]">
                      {ROADMAP_CATEGORY_LABELS[cat]}
                    </p>
                    {CAT_ICON[cat] && (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: statusInfo.iconBg }}>
                        {(() => { const Icon = CAT_ICON[cat]; return <Icon size={16} style={{ color: statusInfo.iconColor }} /> })()}
                      </div>
                    )}
                  </div>
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
                    style={{ color: statusInfo.badgeText, backgroundColor: statusInfo.badgeBg }}
                  >
                    {statusInfo.label}
                  </span>
                  <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${todoPct}%`, backgroundColor: statusInfo.barColor }}
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
              <ClipboardCheck size={22} className="text-white/90" />
              <div className="flex-1">
                <p className="text-sm font-bold">이번 주 점검하기</p>
                <p className="text-xs text-white/80 mt-0.5">한 주의 자립 여정을 돌아보세요</p>
              </div>
              <span className="text-xl opacity-80">›</span>
            </div>
          </button>
        )}

        {/* 레벨/진행률 + 거북이 + 말풍선 통합 */}
        <div className="bg-white rounded-2xl border border-[#e8e9f1] p-4">
          <div className="flex items-center gap-3 mb-3">
            <img src={pet2} alt="" className="w-16 h-16 object-contain flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] text-[#71727a]">꾸준히 하는 것이 가장 중요해요 ☺</span>
                <span className="text-[13px] font-bold text-[#1f2024]">Lv.{level}</span>
              </div>
              <p className="text-[22px] font-bold text-[#1f2024] leading-none mb-2">{expPercent}%</p>
              <div className="h-[14px] bg-[#e8e9f1] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${expPercent}%`, background: 'linear-gradient(to right, #284741, #62ad9e)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />

      {/* 공고 리스트 모달 */}
      {showAnnList && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setShowAnnList(false)} />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[60]
            bg-white rounded-t-3xl" style={{ maxHeight: '70dvh' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#e8e9f1]">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#e8e9f1] rounded-full" />
              <p className="text-[14px] font-bold text-[#1f2024]">마감 임박 중요 공고</p>
              <button onClick={() => setShowAnnList(false)} className="text-[#8f9098]">✕</button>
            </div>
            <div className="overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: 'calc(70dvh - 64px)' }}>
              {topAnns.length === 0 ? (
                <p className="text-sm text-[#71727a] text-center py-8">공고 정보를 불러오는 중이에요.</p>
              ) : (
                topAnns.map((ann) => (
                  <div key={ann.id} className="bg-[#f8f9fe] rounded-2xl px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[#1f2024] leading-snug line-clamp-2">{ann.title}</p>
                        <p className="text-[11px] text-[#71727a] mt-1">{ann.organization}</p>
                        {ann.endDate && (
                          <p className="text-[10px] text-[#ff9277] font-semibold mt-1">마감 {ann.endDate}</p>
                        )}
                      </div>
                      {(ann.refUrl1 || ann.detailUrl) && (
                        <a
                          href={ann.refUrl1 || ann.detailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-[11px] font-semibold text-[#62ad9e] bg-[#e0efec] px-3 py-1.5 rounded-lg mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          링크
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
