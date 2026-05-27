import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Bookmark } from "lucide-react";
import BottomNav from "../components/common/BottomNav";
import { useAnnouncementStore } from "../store/announcementStore";
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_BG } from "../types";

function getDDay(endDate: string) {
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
  if (diff < 0) return { label: "마감", cls: "text-text-disabled" };
  if (diff <= 7) return { label: `D-${diff}`, cls: "text-danger font-bold" };
  return { label: `D-${diff}`, cls: "text-text-subtle" };
}

const THUMB_BG: Record<string, string> = {
  finance: "#D6EDE3",
  housing: "#D6EDE3",
  employment: "#D6EDE3",
  education: "#D6EDE3",
  culture: "#D6EDE3",
};
const THUMB_ICON: Record<string, string> = {
  finance: "💰",
  housing: "🏠",
  employment: "💼",
  education: "📚",
  culture: "🎨",
};

export default function SearchPage() {
  const navigate = useNavigate();
  const {
    announcements,
    searchQuery,
    setSearchQuery,
    setSortBy,
    toggleBookmark,
    getFiltered,
    getTotalFilterCount,
  } = useAnnouncementStore();

  const filtered = getFiltered();
  const bookmarkedCount = announcements.filter((a) => a.isBookmarked).length;
  const totalFilterCount = getTotalFilterCount();

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* 검색 바 */}
      <div className="px-4 pt-5 pb-3 bg-white sticky top-0 z-30">
        <div className="flex items-center gap-2 h-12 bg-[#F2F4F6] rounded-full px-4">
          <Search size={16} className="text-text-disabled flex-shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색어"
            className="flex-1 bg-transparent text-sm text-text-basic placeholder:text-text-disabled focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-text-disabled text-sm leading-none touch-manipulation"
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
            <SlidersHorizontal size={13} />
            필터
            {totalFilterCount > 0 && (
              <span className="w-5 h-5 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {totalFilterCount}
              </span>
            )}
          </button>

          <button onClick={() => setSortBy("popular")} className="filter-pill">
            <span className="w-5 h-5 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {bookmarkedCount}
            </span>
            스크랩
          </button>
        </div>
      </div>

      {/* 카드 그리드 */}
      <main className="flex-1 px-4 py-1">
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
              const { label: dday, cls: ddayCls } = getDDay(ann.endDate);
              const catColor = CATEGORY_COLORS[ann.category];

              return (
                <div
                  key={ann.id}
                  className="ann-card"
                  onClick={() => navigate(`/search/${ann.id}`)}
                >
                  <div
                    className="ann-card-thumb relative"
                    style={{ backgroundColor: THUMB_BG[ann.category] }}
                  >
                    <span className="text-4xl opacity-40">
                      {THUMB_ICON[ann.category]}
                    </span>
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
                          ann.isBookmarked
                            ? "text-primary"
                            : "text-text-disabled"
                        }
                        fill={ann.isBookmarked ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <div className="px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-text-disabled">
                        {ann.startDate.slice(5).replace("-", ".")} -{" "}
                        {ann.endDate.slice(5).replace("-", ".")}
                      </span>
                      <span className={`text-[10px] ${ddayCls}`}>{dday}</span>
                    </div>
                    <p className="text-xs font-bold text-text-basic leading-snug line-clamp-2">
                      {ann.title}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: catColor,
                          backgroundColor: CATEGORY_BG[ann.category],
                        }}
                      >
                        {CATEGORY_LABELS[ann.category]}
                      </span>
                      {ann.amount && (
                        <span className="text-[10px] text-primary font-semibold">
                          {ann.amount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
