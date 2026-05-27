import { useNavigate } from 'react-router-dom'
import { CheckCircle, Circle, ChevronRight, Bookmark, TrendingUp } from 'lucide-react'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import CategoryBadge from '../components/common/CategoryBadge'
import ProgressBar from '../components/common/ProgressBar'
import { useAuthStore } from '../store/authStore'
import { useTodoStore } from '../store/todoStore'
import { useAnnouncementStore } from '../store/announcementStore'
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ICONS } from '../types'
import type { Category } from '../types'

const allCategories: Category[] = ['finance', 'housing', 'employment', 'education', 'culture']

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { todos, changeStatus, getProgress } = useTodoStore()
  const { announcements } = useAnnouncementStore()

  const todayTodos = todos
    .filter((t) => t.status !== 'done')
    .slice(0, 5)

  const bookmarked = announcements.filter((a) => a.isBookmarked).slice(0, 3)
  const overallProgress = getProgress()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '좋은 아침이에요'
    if (hour < 18) return '좋은 오후예요'
    return '좋은 저녁이에요'
  }

  return (
    <div className="min-h-screen bg-bg-page">
      <Header title="디딤온" showNotification />

      <main className="max-w-md mx-auto pb-24">
        {/* Greeting + progress hero */}
        <section className="bg-white px-5 pt-6 pb-5 mb-3">
          <p className="text-sm text-text-subtle mb-0.5">{greeting()},</p>
          <h2 className="text-xl font-black text-text-basic mb-5">
            {user?.nickname || user?.name}님! 🌱
          </h2>

          <div className="bg-gradient-to-br from-primary to-primary-hover rounded-lg p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-white/80 mb-0.5">전체 자립 진행률</p>
                <p className="text-3xl font-black">{overallProgress}%</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded flex items-center justify-center">
                <TrendingUp size={28} className="text-white" />
              </div>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-xs text-white/70 mt-2">
              계속 나아가고 있어요! 조금만 더 힘내세요 💪
            </p>
          </div>
        </section>

        {/* Category progress */}
        <section className="bg-white px-5 py-5 mb-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-basic">분야별 진행률</h3>
            <button
              onClick={() => navigate('/roadmap')}
              className="text-xs text-primary font-medium flex items-center gap-0.5"
            >
              로드맵 보기 <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {(user?.interests || allCategories).map((cat) => {
              const progress = getProgress(cat)
              const color = CATEGORY_COLORS[cat]
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-lg w-6 flex-shrink-0 text-center">
                    {CATEGORY_ICONS[cat]}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-text-subtle">
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <span className="text-xs font-bold" style={{ color }}>
                        {progress}%
                      </span>
                    </div>
                    <ProgressBar value={progress} color={color} height={6} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Today's todos */}
        <section className="bg-white px-5 py-5 mb-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-basic">오늘 할 일</h3>
            <button
              onClick={() => navigate('/checklist')}
              className="text-xs text-primary font-medium flex items-center gap-0.5"
            >
              전체 보기 <ChevronRight size={14} />
            </button>
          </div>

          {todayTodos.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm font-semibold text-text-subtle">오늘 할 일을 모두 완료했어요!</p>
              <p className="text-xs text-text-disabled mt-1">정말 잘 하고 있어요</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-3 py-2.5 border-b border-border-light last:border-0"
                >
                  <button
                    onClick={() =>
                      changeStatus(todo.id, todo.status === 'done' ? 'todo' : 'done')
                    }
                    className="mt-0.5 touch-manipulation flex-shrink-0"
                  >
                    {todo.status === 'done' ? (
                      <CheckCircle size={22} className="text-success" />
                    ) : (
                      <Circle size={22} className="text-border-default" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        todo.status === 'done'
                          ? 'line-through text-text-disabled'
                          : 'text-text-basic'
                      }`}
                    >
                      {todo.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <CategoryBadge category={todo.category} size="sm" />
                      {todo.dueDate && (
                        <span className="text-[10px] text-text-disabled">
                          ~{todo.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bookmarked announcements */}
        {bookmarked.length > 0 && (
          <section className="bg-white px-5 py-5 mb-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-basic">스크랩한 공고</h3>
              <button
                onClick={() => navigate('/mypage')}
                className="text-xs text-primary font-medium flex items-center gap-0.5"
              >
                전체 보기 <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {bookmarked.map((ann) => (
                <button
                  key={ann.id}
                  onClick={() => navigate(`/announcements/${ann.id}`)}
                  className="flex items-center gap-3 py-2.5 border-b border-border-light last:border-0 text-left touch-manipulation w-full"
                >
                  <Bookmark size={18} className="text-primary flex-shrink-0" fill="currentColor" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-basic font-medium truncate">
                      {ann.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CategoryBadge category={ann.category} size="sm" />
                      <span className="text-[10px] text-text-disabled">
                        ~{ann.endDate}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-disabled flex-shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recommended announcements */}
        <section className="bg-white px-5 py-5 mb-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-basic">추천 지원사업</h3>
            <button
              onClick={() => navigate('/announcements')}
              className="text-xs text-primary font-medium flex items-center gap-0.5"
            >
              더 보기 <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {announcements.slice(0, 3).map((ann) => (
              <button
                key={ann.id}
                onClick={() => navigate(`/announcements/${ann.id}`)}
                className="flex items-center gap-3 p-3 bg-bg-page rounded text-left touch-manipulation w-full hover:bg-bg-subtle transition border border-border-light"
              >
                <div
                  className="w-10 h-10 rounded flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[ann.category] + '20' }}
                >
                  {CATEGORY_ICONS[ann.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-basic truncate">
                    {ann.title}
                  </p>
                  <p className="text-xs text-text-subtle mt-0.5">{ann.organization}</p>
                </div>
                <ChevronRight size={16} className="text-text-disabled flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
