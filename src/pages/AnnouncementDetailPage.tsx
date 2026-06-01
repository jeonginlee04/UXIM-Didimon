import { useParams, useNavigate } from 'react-router-dom'
import { Bookmark, ExternalLink, ChevronLeft } from 'lucide-react'
import CategoryBadge from '../components/common/CategoryBadge'
import { useAnnouncementStore } from '../store/announcementStore'
import { useTodoStore } from '../store/todoStore'
import { getDDay, formatDateRange } from '../utils/dateUtils'
import pet1 from '../assets/pet1.png'
import { CATEGORY_BG } from '../types'

const THUMB_ICON: Record<string, string> = {
  finance: '💰', housing: '🏠', employment: '💼', education: '📚', culture: '🎨',
}

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { announcements, toggleBookmark } = useAnnouncementStore()
  const { addTodo } = useTodoStore()

  const ann = announcements.find((a) => a.id === id)
  if (!ann) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex items-center h-14 px-4 border-b border-[#c5c6cc]">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 touch-manipulation">
            <ChevronLeft size={22} className="text-[#1f2024]" />
          </button>
          <h1 className="flex-1 text-sm font-bold text-[#1f2024]">공고 상세</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#71727a]">공고를 찾을 수 없어요.</p>
        </div>
      </div>
    )
  }

  const handleBookmark = () => toggleBookmark(ann.id)

  const handleAddTodo = () => {
    addTodo({
      content: `[${ann.title}] 신청하기`,
      category: ann.category,
      dueDate: ann.endDate,
      status: 'todo',
      priority: 'high',
      hasNotification: true,
      linkedAnnouncementId: ann.id,
    })
    navigate('/checklist')
  }

  const { label: dday, urgent, expired } = getDDay(ann.endDate)
  const thumbBg = CATEGORY_BG[ann.category]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero 이미지 영역 */}
      <div
        className="relative w-full flex-shrink-0 flex items-center justify-center"
        style={{ height: '253px', backgroundColor: thumbBg }}
      >
        <span className="text-[88px] opacity-30">{THUMB_ICON[ann.category]}</span>

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-6 w-8 h-8 flex items-center justify-center touch-manipulation"
        >
          <ChevronLeft size={22} className="text-[#62ad9e]" />
        </button>

        {/* 페이지네이션 도트 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === 1
                  ? 'w-4 h-2 bg-[#62ad9e]'
                  : 'w-2 h-2 bg-black/10'
              }`}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 pb-28 overflow-y-auto bg-white">
        {/* 제목 섹션 */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-[18px] font-extrabold text-[#1f2024] leading-snug mb-1">
                {ann.title}
              </h1>
              <p className="text-base text-[#71727a]">{ann.organization}</p>
            </div>
            <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full mt-1 ${
              expired ? 'text-[#8f9098] bg-[#f8f9fe]' :
              urgent ? 'text-red-500 bg-red-50' :
              'text-[#71727a] bg-[#f8f9fe]'
            }`}>
              {dday}
            </span>
          </div>
          <CategoryBadge category={ann.category} />
        </div>

        {/* 구분선 */}
        <div className="h-px bg-[#e8e9f1] mx-4" />

        {/* 기본 정보 불릿 리스트 */}
        <div className="px-6 py-5">
          <ul className="space-y-2 text-sm text-[#71727a] list-disc pl-4">
            <li>
              <span className="leading-5">신청 기간: {formatDateRange(ann.startDate, ann.endDate)}</span>
            </li>
            {ann.organization && (
              <li>
                <span className="leading-5">기관: {ann.organization}</span>
              </li>
            )}
            {ann.region && (
              <li>
                <span className="leading-5">지역: {ann.region}</span>
              </li>
            )}
            {ann.targetAge && (
              <li>
                <span className="leading-5">대상: {ann.targetAge}</span>
              </li>
            )}
            {ann.amount && (
              <li>
                <span className="leading-5">지원 혜택: {ann.amount}</span>
              </li>
            )}
            {ann.benefitType && (
              <li>
                <span className="leading-5">분야: {ann.benefitType}</span>
              </li>
            )}
            {ann.detailUrl && (
              <li>
                <span className="leading-5">
                  참고 링크:{' '}
                  <a
                    href={ann.detailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {ann.detailUrl.replace(/^https?:\/\//, '')}
                  </a>
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-[#e8e9f1] mx-4" />

        {/* 상세 설명 */}
        <div className="px-6 py-5">
          <h3 className="text-xs font-bold text-[#2f3036] mb-3">상세 설명</h3>
          <p className="text-sm text-[#71727a] leading-relaxed whitespace-pre-line">
            {ann.description}
          </p>
        </div>

        {/* 관련 태그 */}
        {(ann.keyword || (ann.tags && ann.tags.length > 0)) && (
          <>
            <div className="h-px bg-[#e8e9f1] mx-4" />
            <div className="px-6 py-4">
              <h3 className="text-xs font-bold text-[#2f3036] mb-3">관련 태그</h3>
              <div className="flex flex-wrap gap-2">
                {ann.keyword && (
                  <span className="text-xs bg-[#e0efec] text-[#3d8070] px-2.5 py-1 rounded-full font-semibold">
                    #{ann.keyword}
                  </span>
                )}
                {ann.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-[#f8f9fe] text-[#71727a] px-2.5 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 거북이 팁 */}
        <div className="mx-4 my-2 bg-[#e0efec] rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <img src={pet1} alt="" className="w-5 h-5 object-contain" />
            <p className="text-sm font-bold text-[#3d8070]">거북이의 한마디</p>
          </div>
          <p className="text-xs text-[#3d8070]/80 leading-relaxed">
            투두에 추가하면 마감일 전에 알림을 받을 수 있어요!
          </p>
        </div>
      </main>

      {/* 하단 CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#c5c6cc] px-6 py-4 safe-bottom">
        <div className="flex gap-3">
          <button
            onClick={handleBookmark}
            className={`flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-semibold text-sm border-2 transition touch-manipulation flex-shrink-0 ${
              ann.isBookmarked
                ? 'border-primary bg-[#e0efec] text-primary'
                : 'border-[#c5c6cc] text-[#71727a]'
            }`}
          >
            <Bookmark size={17} fill={ann.isBookmarked ? 'currentColor' : 'none'} />
            {ann.isBookmarked ? '스크랩됨' : '스크랩'}
          </button>
          <button
            onClick={handleAddTodo}
            disabled={expired}
            className="btn-primary flex-1 gap-2"
          >
            <ExternalLink size={15} />
            투두에 추가하기
          </button>
        </div>
      </div>
    </div>
  )
}
