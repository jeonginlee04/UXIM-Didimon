import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Bookmark, X } from 'lucide-react'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import CategoryBadge from '../components/common/CategoryBadge'
import EmptyState from '../components/common/EmptyState'
import { useAnnouncementStore } from '../store/announcementStore'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../types'
import type { Category } from '../types'

const categories: (Category | 'all')[] = [
  'all', 'finance', 'housing', 'employment', 'education', 'culture',
]

const sortOptions = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '등록일순' },
  { value: 'deadline', label: '마감임박순' },
  { value: 'recommended', label: '추천순' },
] as const

export default function AnnouncementsPage() {
  const navigate = useNavigate()
  const {
    searchQuery,
    filterCategory,
    sortBy,
    setSearchQuery,
    setFilterCategory,
    setSortBy,
    toggleBookmark,
    getFiltered,
  } = useAnnouncementStore()

  const [showSort, setShowSort] = useState(false)
  const filtered = getFiltered()

  const getDDay = (endDate: string) => {
    const diff = Math.ceil(
      (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    if (diff < 0) return { label: '마감', cls: 'dday-closed' }
    if (diff === 0) return { label: 'D-Day', cls: 'dday-urgent' }
    if (diff <= 7) return { label: `D-${diff}`, cls: 'dday-warning' }
    return { label: `D-${diff}`, cls: 'dday-normal' }
  }

  return (
    <div className="min-h-screen bg-bg-page">
      <Header title="지원사업 공고" showNotification />

      <main className="max-w-md mx-auto pb-24">
        {/* Search */}
        <div className="bg-white px-4 pt-4 pb-3 sticky top-14 z-30 border-b border-border-light">
          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="지원사업명, 기관명으로 검색"
              className="krds-field pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X size={16} className="text-text-disabled" />
              </button>
            )}
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`krds-chip touch-manipulation ${filterCategory === cat ? 'active' : ''}`}
              >
                {cat === 'all'
                  ? '전체'
                  : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
              </button>
            ))}
          </div>
        </div>

        {/* Sort + count */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs text-text-subtle">
            총 <span className="font-bold text-text-basic">{filtered.length}개</span>의 공고
          </span>
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 text-xs text-text-subtle font-medium touch-manipulation"
            >
              <SlidersHorizontal size={14} />
              {sortOptions.find((s) => s.value === sortBy)?.label}
            </button>
            {showSort && (
              <div className="absolute right-0 top-8 bg-white rounded border border-border-light z-20 overflow-hidden min-w-[120px]">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value)
                      setShowSort(false)
                    }}
                    className={`block w-full text-left px-4 py-2.5 text-xs font-medium transition ${
                      sortBy === opt.value
                        ? 'text-primary bg-primary-light'
                        : 'text-text-subtle hover:bg-bg-page'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Announcement list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="검색 결과가 없어요"
            description="다른 키워드나 카테고리로 검색해보세요"
          />
        ) : (
          <div className="px-4 flex flex-col gap-3">
            {filtered.map((ann) => {
              const { label: dday, cls: ddayCls } = getDDay(ann.endDate)
              return (
                <div key={ann.id} className="krds-card rounded-lg overflow-hidden animate-fade-in">
                  <button
                    onClick={() => navigate(`/announcements/${ann.id}`)}
                    className="w-full text-left touch-manipulation"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <CategoryBadge category={ann.category} />
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${ddayCls}`}>
                          {dday}
                        </span>
                      </div>
                      <h3 className="font-bold text-text-basic text-sm mb-1 leading-snug">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-text-subtle mb-2">{ann.organization}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ann.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-bg-subtle text-text-subtle px-2 py-0.5 rounded-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-text-disabled">
                        <span>
                          신청기간: {ann.startDate} ~ {ann.endDate}
                        </span>
                        <span>스크랩 {ann.bookmarkCount}</span>
                      </div>
                    </div>
                  </button>

                  <div className="border-t border-border-light px-4 py-2.5 flex items-center justify-between">
                    {ann.amount && (
                      <span className="text-xs font-bold text-primary">
                        💰 {ann.amount}
                      </span>
                    )}
                    <button
                      onClick={() => toggleBookmark(ann.id)}
                      className="ml-auto flex items-center gap-1.5 touch-manipulation"
                    >
                      <Bookmark
                        size={18}
                        className={ann.isBookmarked ? 'text-primary' : 'text-border-default'}
                        fill={ann.isBookmarked ? 'currentColor' : 'none'}
                      />
                      <span
                        className={`text-xs font-medium ${
                          ann.isBookmarked ? 'text-primary' : 'text-text-disabled'
                        }`}
                      >
                        {ann.isBookmarked ? '스크랩됨' : '스크랩'}
                      </span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
