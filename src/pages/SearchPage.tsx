import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Bookmark } from "lucide-react";
import BottomNav from "../components/common/BottomNav";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ScrapModal from "../components/ScrapModal";
import { useAnnouncementStore } from "../store/announcementStore";
import { getDDay, formatDateRange } from "../utils/dateUtils";
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_BG } from "../types";

const THUMB_ICON: Record<string, string> = {
  finance: "💰",
  housing: "🏠",
  employment: "💼",
  education: "📚",
  culture: "🎨",
};

export default function SearchPage() {
  const navigate = useNavigate();
  const [scrapOpen, setScrapOpen] = useState(false);
  const {
    announcements,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    toggleBookmark,
    getFiltered,
    getTotalFilterCount,
    fetchAnnouncements,
  } = useAnnouncementStore();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filtered = getFiltered();
  const bookmarkedCount = announcements.filter((a) => a.isBookmarked).length;
  const totalFilterCount = getTotalFilterCount();

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* 검색 바 */}
      <div className="px-4 pt-5 pb-3 bg-white sticky top-0 z-30">
        <div className="flex items-center gap-2 h-12 bg-[#f8f9fe] rounded-3xl px-4">
          <Search size={16} className="text-[#8f9098] flex-shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색어"
            className="flex-1 bg-transparent text-sm text-[#1f2024] placeholder:text-[#8f9098] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#8f9098] text-sm leading-none touch-manipulation"
            >
              ✕
            </button>
          )}
        </div>

        {/* 필터 & 스크랩 행 */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => navigate("/search/filter")}
            className={`filter-pill ${totalFilterCount > 0 ? "active" : ""}`}
          >
            <SlidersHorizontal size={12} />
            필터
            {totalFilterCount > 0 && (
              <span className="w-5 h-5 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {totalFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setScrapOpen(true)}
            className={`filter-pill ${bookmarkedCount > 0 ? "active" : ""}`}
          >
            {bookmarkedCount > 0 && (
              <span className="w-5 h-5 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {bookmarkedCount}
              </span>
            )}
            <Bookmark
              size={12}
              fill={bookmarkedCount > 0 ? "currentColor" : "none"}
            />
            스크랩
          </button>
        </div>
      </div>

      {/* 카드 그리드 */}
      <main className="flex-1 px-4 py-1">
        {isLoading && (
          <div className="flex items-center gap-2 py-2 mb-1">
            <LoadingSpinner size={16} />
            <p className="text-xs text-text-subtle">최신 공고를 불러오는 중...</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2 text-xs text-amber-700">
            <span>⚠️</span>
            <span>서버 연결 실패 — 저장된 공고를 표시해요.</span>
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-5xl">🔍</span>
            <p className="text-sm text-text-subtle text-center">
              검색 결과가 없어요.
              <br />
              다른 키워드로 검색해보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((ann) => {
              const { label: dday, urgent, expired } = getDDay(ann.endDate);
              const ddayCls = expired
                ? "text-[#8f9098]"
                : urgent
                ? "text-red-500 font-bold"
                : "text-[#71727a]";
              const catColor = CATEGORY_COLORS[ann.category];
              const catBg = CATEGORY_BG[ann.category];

              return (
                <div
                  key={ann.id}
                  className="ann-card"
                  onClick={() => navigate(`/search/${ann.id}`)}
                >
                  {/* 썸네일 */}
                  <div
                    className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: catBg }}
                  >
                    {ann.posterUrl ? (
                      <img
                        src={ann.posterUrl}
                        alt={ann.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <span className="text-4xl opacity-50">{THUMB_ICON[ann.category]}</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(ann.id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center touch-manipulation"
                    >
                      <Bookmark
                        size={14}
                        className={
                          ann.isBookmarked ? "text-primary" : "text-[#8f9098]"
                        }
                        fill={ann.isBookmarked ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  {/* 텍스트 */}
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] text-[#71727a] mb-1 truncate">
                      {formatDateRange(ann.startDate, ann.endDate)}
                    </p>
                    <p className="text-[13px] font-bold text-[#1f2024] leading-snug line-clamp-2 mb-2">
                      {ann.title}
                    </p>
                    <div className="flex items-center justify-between gap-1 min-w-0">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          color: catColor,
                          backgroundColor: catBg,
                        }}
                      >
                        {CATEGORY_LABELS[ann.category]}
                      </span>
                      <span className={`text-[10px] flex-shrink-0 ${ddayCls}`}>
                        {dday}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />

      <ScrapModal isOpen={scrapOpen} onClose={() => setScrapOpen(false)} />
    </div>
  );
}
