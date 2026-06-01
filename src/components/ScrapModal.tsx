import { useNavigate } from 'react-router-dom'
import { X, Bookmark, Calendar, MapPin } from 'lucide-react'
import { useAnnouncementStore } from '../store/announcementStore'
import { getDDay, formatDate } from '../utils/dateUtils'
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_BG } from '../types'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ScrapModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate()
  // announcements 자체를 구독해야 북마크 토글 즉시 반영됨
  const { announcements, toggleBookmark } = useAnnouncementStore()
  const bookmarked = announcements.filter((a) => a.isBookmarked)

  const handleCardClick = (id: string) => {
    onClose()
    navigate(`/search/${id}`)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[60]
          h-[80dvh] bg-white rounded-t-3xl flex flex-col shadow-lg
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* ── 헤더 ── */}
        <div className="flex-shrink-0 pt-5 pb-4 px-5 border-b border-border-light relative">
          {/* 드래그 핸들 */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-border-default rounded-full" />

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-basic">스크랩한 공고</h2>
              <p className="text-xs text-text-subtle mt-0.5">
                {bookmarked.length > 0
                  ? `총 ${bookmarked.length}개의 공고를 스크랩했어요`
                  : '아직 스크랩한 공고가 없어요'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg active:bg-bg-subtle touch-manipulation"
              aria-label="닫기"
            >
              <X size={20} className="text-text-subtle" />
            </button>
          </div>
        </div>

        {/* ── 목록 ── */}
        <div className="flex-1 overflow-y-auto">
          {bookmarked.length === 0 ? (
            /* 빈 상태 */
            <div className="flex flex-col items-center justify-center h-full gap-4 pb-10">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
                <Bookmark size={28} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-text-basic mb-1">스크랩한 공고가 없어요</p>
                <p className="text-xs text-text-subtle leading-relaxed">
                  공고 카드의 북마크 아이콘을 눌러<br />관심 있는 공고를 저장해보세요!
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border-light">
              {bookmarked.map((ann) => {
                const { label: dday, urgent, expired } = getDDay(ann.endDate)
                const catColor = CATEGORY_COLORS[ann.category]
                const catBg = CATEGORY_BG[ann.category]

                return (
                  <li
                    key={ann.id}
                    className="flex items-start gap-3 px-5 py-4 active:bg-bg-subtle touch-manipulation cursor-pointer"
                    onClick={() => handleCardClick(ann.id)}
                  >
                    {/* 카테고리 컬러 인디케이터 */}
                    <div
                      className="flex-shrink-0 w-1 self-stretch rounded-full mt-0.5"
                      style={{ backgroundColor: catColor }}
                    />

                    {/* 본문 */}
                    <div className="flex-1 min-w-0">
                      {/* 상단: 카테고리 + D-day */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ color: catColor, backgroundColor: catBg }}
                        >
                          {CATEGORY_LABELS[ann.category]}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            expired
                              ? 'text-text-disabled'
                              : urgent
                              ? 'text-danger'
                              : 'text-text-subtle'
                          }`}
                        >
                          {dday}
                        </span>
                      </div>

                      {/* 제목 */}
                      <p className="text-sm font-semibold text-text-basic leading-snug line-clamp-2 mb-1.5">
                        {ann.title}
                      </p>

                      {/* 메타 정보 */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-text-subtle">
                          <MapPin size={9} />
                          {ann.region}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-text-subtle">
                          <Calendar size={9} />
                          {formatDate(ann.endDate)} 마감
                        </span>
                        {ann.amount && (
                          <span className="text-[10px] text-primary font-semibold">
                            {ann.amount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 북마크 해제 버튼 */}
                    <button
                      className="flex-shrink-0 p-1.5 -mr-1 rounded-lg active:bg-bg-subtle touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(ann.id)
                      }}
                      aria-label="스크랩 해제"
                    >
                      <Bookmark
                        size={18}
                        className="text-primary"
                        fill="currentColor"
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
