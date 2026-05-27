import { useParams, useNavigate } from 'react-router-dom'
import { Bookmark, ExternalLink, Users, Calendar, MapPin, Tag } from 'lucide-react'
import Header from '../components/common/Header'
import CategoryBadge from '../components/common/CategoryBadge'
import { useAnnouncementStore } from '../store/announcementStore'
import { useTodoStore } from '../store/todoStore'
import { useRoadmapStore } from '../store/roadmapStore'

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { announcements, toggleBookmark } = useAnnouncementStore()
  const { addTodo } = useTodoStore()
  const { addItem } = useRoadmapStore()

  const ann = announcements.find((a) => a.id === id)
  if (!ann) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header title="공고 상세" showBack />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-subtle text-sm">공고를 찾을 수 없어요.</p>
        </div>
      </div>
    )
  }

  const getDDay = (endDate: string) => {
    const diff = Math.ceil(
      (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    if (diff < 0) return { label: '마감', cls: 'dday-closed' }
    if (diff === 0) return { label: 'D-Day', cls: 'dday-urgent' }
    if (diff <= 7) return { label: `D-${diff}`, cls: 'dday-warning' }
    return { label: `D-${diff}`, cls: 'dday-normal' }
  }

  const handleBookmark = () => {
    toggleBookmark(ann.id)
    if (!ann.isBookmarked) {
      addItem({
        title: ann.title,
        category: ann.category,
        description: `${ann.organization} 지원사업 신청`,
        level: 1,
        todoIds: [],
        linkedAnnouncementId: ann.id,
        isExpanded: false,
        order: 999,
      })
    }
  }

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

  const { label: dday, cls: ddayCls } = getDDay(ann.endDate)
  const isExpired = dday === '마감'

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      <Header title="공고 상세" showBack />

      <main className="flex-1 max-w-md mx-auto w-full pb-32 overflow-y-auto">
        {/* Hero */}
        <div className="bg-white px-5 py-5 mb-3">
          <div className="flex items-start justify-between mb-3">
            <CategoryBadge category={ann.category} />
            <span className={`text-xs font-bold px-2.5 py-1 rounded-sm ${ddayCls}`}>
              {dday}
            </span>
          </div>
          <h1 className="text-lg font-black text-text-basic mb-1 leading-snug">
            {ann.title}
          </h1>
          <p className="text-sm text-text-subtle mb-4">{ann.organization}</p>

          {/* Key info chips */}
          <div className="flex flex-wrap gap-2">
            {ann.amount && (
              <div className="flex items-center gap-1.5 bg-primary-light text-primary rounded-sm px-3 py-1.5 text-xs font-semibold">
                💰 {ann.amount}
              </div>
            )}
            {ann.targetAge && (
              <div className="flex items-center gap-1.5 bg-bg-subtle text-text-subtle rounded-sm px-3 py-1.5 text-xs font-semibold">
                <Users size={12} /> {ann.targetAge}
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-bg-subtle text-text-subtle rounded-sm px-3 py-1.5 text-xs font-semibold">
              <MapPin size={12} /> {ann.region}
            </div>
            <div className="flex items-center gap-1.5 bg-bg-subtle text-text-subtle rounded-sm px-3 py-1.5 text-xs font-semibold">
              <Tag size={12} /> {ann.benefitType}
            </div>
          </div>
        </div>

        {/* Period */}
        <div className="bg-white px-5 py-4 mb-3">
          <h3 className="text-sm font-bold text-text-subtle mb-3">신청 기간</h3>
          <div className="flex items-center gap-2 text-sm text-text-subtle">
            <Calendar size={16} className="text-primary flex-shrink-0" />
            <span>
              {ann.startDate} ~ {ann.endDate}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white px-5 py-4 mb-3">
          <h3 className="text-sm font-bold text-text-subtle mb-3">공고 내용</h3>
          <p className="text-sm text-text-subtle leading-relaxed whitespace-pre-line">
            {ann.description}
          </p>
        </div>

        {/* Tags */}
        <div className="bg-white px-5 py-4 mb-3">
          <h3 className="text-sm font-bold text-text-subtle mb-3">관련 태그</h3>
          <div className="flex flex-wrap gap-2">
            {ann.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-bg-subtle text-text-subtle px-3 py-1.5 rounded-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tip banner */}
        <div className="bg-primary-light mx-4 rounded-lg p-4 mb-3 border border-primary-lighter">
          <p className="text-sm font-bold text-primary mb-1">💡 스크랩하면?</p>
          <p className="text-xs text-primary/80 leading-relaxed">
            이 공고를 스크랩하면 로드맵에 자동으로 추가되고, 신청 투두도 바로 만들 수 있어요!
          </p>
        </div>
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light px-4 py-4 safe-bottom">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={handleBookmark}
            className={`flex items-center justify-center gap-2 h-11 px-5 rounded font-bold text-sm border-2 transition touch-manipulation ${
              ann.isBookmarked
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border-default text-text-subtle'
            }`}
          >
            <Bookmark
              size={18}
              fill={ann.isBookmarked ? 'currentColor' : 'none'}
            />
            {ann.isBookmarked ? '스크랩됨' : '스크랩'}
          </button>
          <button
            onClick={handleAddTodo}
            disabled={isExpired}
            className="btn-primary flex-1 gap-2 disabled:opacity-50"
          >
            <ExternalLink size={16} />
            투두에 추가하기
          </button>
        </div>
      </div>
    </div>
  )
}
