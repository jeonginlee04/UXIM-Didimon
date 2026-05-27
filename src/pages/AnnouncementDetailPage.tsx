import { useParams, useNavigate } from 'react-router-dom'
import { Bookmark, ExternalLink, Users, Calendar, MapPin, Tag } from 'lucide-react'
import Header from '../components/common/Header'
import CategoryBadge from '../components/common/CategoryBadge'
import { useAnnouncementStore } from '../store/announcementStore'
import { useTodoStore } from '../store/todoStore'
import pet1 from '../assets/pet1.png'

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { announcements, toggleBookmark } = useAnnouncementStore()
  const { addTodo } = useTodoStore()

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
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
    if (diff < 0) return { label: '마감', urgent: false, expired: true }
    if (diff === 0) return { label: 'D-Day', urgent: true, expired: false }
    if (diff <= 7) return { label: `D-${diff}`, urgent: true, expired: false }
    return { label: `D-${diff}`, urgent: false, expired: false }
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

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      <Header
        title="공고 상세"
        showBack
        rightElement={
          <button onClick={handleBookmark} className="p-1.5 -mr-1 touch-manipulation">
            <Bookmark
              size={20}
              className={ann.isBookmarked ? 'text-primary' : 'text-text-subtle'}
              fill={ann.isBookmarked ? 'currentColor' : 'none'}
            />
          </button>
        }
      />

      <main className="flex-1 pb-28 overflow-y-auto">
        {/* Hero card */}
        <div className="bg-white px-5 py-5 mb-2">
          <div className="flex items-start justify-between mb-3">
            <CategoryBadge category={ann.category} />
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              expired ? 'text-text-disabled bg-bg-subtle' :
              urgent ? 'text-danger bg-danger-light' :
              'text-text-subtle bg-bg-subtle'
            }`}>
              {dday}
            </span>
          </div>
          <h1 className="text-lg font-black text-text-basic mb-1 leading-snug">{ann.title}</h1>
          <p className="text-sm text-text-subtle mb-4">{ann.organization}</p>

          <div className="flex flex-wrap gap-2">
            {ann.amount && (
              <div className="flex items-center gap-1.5 bg-primary-light text-primary rounded-lg px-3 py-1.5 text-xs font-semibold">
                💰 {ann.amount}
              </div>
            )}
            {ann.targetAge && (
              <div className="flex items-center gap-1.5 bg-bg-subtle text-text-subtle rounded-lg px-3 py-1.5 text-xs font-semibold">
                <Users size={11} /> {ann.targetAge}
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-bg-subtle text-text-subtle rounded-lg px-3 py-1.5 text-xs font-semibold">
              <MapPin size={11} /> {ann.region}
            </div>
            <div className="flex items-center gap-1.5 bg-bg-subtle text-text-subtle rounded-lg px-3 py-1.5 text-xs font-semibold">
              <Tag size={11} /> {ann.benefitType}
            </div>
          </div>
        </div>

        {/* Period */}
        <div className="bg-white px-5 py-4 mb-2">
          <h3 className="text-xs font-bold text-text-subtle uppercase mb-3">신청 기간</h3>
          <div className="flex items-center gap-2 text-sm text-text-basic">
            <Calendar size={15} className="text-primary flex-shrink-0" />
            {ann.startDate} ~ {ann.endDate}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white px-5 py-4 mb-2">
          <h3 className="text-xs font-bold text-text-subtle uppercase mb-3">공고 내용</h3>
          <p className="text-sm text-text-basic leading-relaxed whitespace-pre-line">
            {ann.description}
          </p>
        </div>

        {/* Tags */}
        <div className="bg-white px-5 py-4 mb-2">
          <h3 className="text-xs font-bold text-text-subtle uppercase mb-3">관련 태그</h3>
          <div className="flex flex-wrap gap-2">
            {ann.tags.map((tag) => (
              <span key={tag} className="text-xs bg-bg-subtle text-text-subtle px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="mx-4 bg-primary-light rounded-xl p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <img src={pet1} alt="" className="w-5 h-5 object-contain" />
            <p className="text-sm font-bold text-primary">거북이의 한마디</p>
          </div>
          <p className="text-xs text-primary/80 leading-relaxed">
            투두에 추가하면 마감일 전에 알림을 받을 수 있어요!
          </p>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-border-light px-4 py-3 safe-bottom">
        <div className="flex gap-3">
          <button
            onClick={handleBookmark}
            className={`flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-bold text-sm border-2 transition touch-manipulation flex-shrink-0 ${
              ann.isBookmarked
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border-default text-text-subtle'
            }`}
          >
            <Bookmark size={17} fill={ann.isBookmarked ? 'currentColor' : 'none'} />
            {ann.isBookmarked ? '스크랩됨' : '스크랩'}
          </button>
          <button
            onClick={handleAddTodo}
            disabled={expired}
            className="btn-primary flex-1 gap-2 disabled:opacity-50"
          >
            <ExternalLink size={15} />
            투두에 추가하기
          </button>
        </div>
      </div>
    </div>
  )
}
