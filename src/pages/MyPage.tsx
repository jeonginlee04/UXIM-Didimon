import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Bookmark,
  LogOut,
  ChevronRight,
  BellRing,
  Shield,
  FileText,
  Edit3,
  X,
  Check,
} from 'lucide-react'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import CategoryBadge from '../components/common/CategoryBadge'
import ProgressBar from '../components/common/ProgressBar'
import { useAuthStore } from '../store/authStore'
import { useTodoStore } from '../store/todoStore'
import { useAnnouncementStore } from '../store/announcementStore'
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from '../types'
import type { Category } from '../types'
import { mockNotifications } from '../data/mockData'

const allCategories: Category[] = ['finance', 'housing', 'employment', 'education', 'culture']

export default function MyPage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()
  const { todos, getProgress } = useTodoStore()
  const { getBookmarked } = useAnnouncementStore()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editNickname, setEditNickname] = useState(user?.nickname || '')
  const [editEmail, setEditEmail] = useState(user?.email || '')

  const [notifSettings, setNotifSettings] = useState({
    todayTodo: true,
    announcement: true,
    deadline: true,
    weekly: false,
  })

  const bookmarked = getBookmarked()
  const overallProgress = getProgress()
  const doneCount = todos.filter((t) => t.status === 'done').length
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleSaveProfile = () => {
    updateUser({ nickname: editNickname, email: editEmail })
    setShowEditProfile(false)
  }

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-bg-page">
      <Header title="마이페이지" />

      <main className="max-w-md mx-auto pb-24">
        {/* Profile card */}
        <div className="bg-white px-5 py-5 mb-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-light rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
              🌱
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-black text-text-basic text-base">
                  {user?.nickname || user?.name}
                </p>
                <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-sm font-medium">
                  {user?.role === 'mentee' ? '자립준비청년' : '멘토'}
                </span>
              </div>
              <p className="text-sm text-text-subtle mt-0.5">{user?.phone}</p>
              {user?.email && (
                <p className="text-xs text-text-disabled">{user.email}</p>
              )}
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              className="p-2 bg-bg-subtle rounded touch-manipulation"
            >
              <Edit3 size={16} className="text-text-subtle" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="text-center p-3 bg-bg-page rounded border border-border-light">
              <p className="text-xl font-black text-primary">{overallProgress}%</p>
              <p className="text-[10px] text-text-disabled mt-0.5">자립 진행률</p>
            </div>
            <div className="text-center p-3 bg-bg-page rounded border border-border-light">
              <p className="text-xl font-black text-success">{doneCount}</p>
              <p className="text-[10px] text-text-disabled mt-0.5">완료한 할 일</p>
            </div>
            <div className="text-center p-3 bg-bg-page rounded border border-border-light">
              <p className="text-xl font-black text-warning-text">{bookmarked.length}</p>
              <p className="text-[10px] text-text-disabled mt-0.5">스크랩 공고</p>
            </div>
          </div>
        </div>

        {/* Category progress */}
        <div className="bg-white px-5 py-5 mb-3">
          <h3 className="font-bold text-text-basic mb-4">분야별 달성 현황</h3>
          <div className="flex flex-col gap-3">
            {allCategories.map((cat) => {
              const prog = getProgress(cat)
              const color = CATEGORY_COLORS[cat]
              const catTodos = todos.filter((t) => t.category === cat)
              const catDone = catTodos.filter((t) => t.status === 'done').length
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xl w-7 text-center flex-shrink-0">
                    {CATEGORY_ICONS[cat]}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-text-subtle">
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <span className="text-xs text-text-disabled">
                        {catDone}/{catTodos.length}개 완료
                      </span>
                    </div>
                    <ProgressBar value={prog} color={color} height={6} />
                  </div>
                  <span className="text-xs font-bold w-8 text-right flex-shrink-0" style={{ color }}>
                    {prog}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bookmarked announcements */}
        <div className="bg-white px-5 py-5 mb-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-basic">스크랩한 공고</h3>
            <span className="text-xs text-text-disabled">{bookmarked.length}개</span>
          </div>
          {bookmarked.length === 0 ? (
            <p className="text-sm text-text-disabled text-center py-4">
              스크랩한 공고가 없어요
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {bookmarked.map((ann) => (
                <button
                  key={ann.id}
                  onClick={() => navigate(`/announcements/${ann.id}`)}
                  className="flex items-center gap-3 py-3 border-b border-border-light last:border-0 text-left touch-manipulation w-full"
                >
                  <Bookmark size={16} className="text-primary flex-shrink-0" fill="currentColor" />
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
                  <ChevronRight size={14} className="text-text-disabled flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification settings */}
        <div className="bg-white px-5 py-5 mb-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-basic">알림 설정</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-danger-light text-danger-text px-2 py-0.5 rounded-sm font-medium">
                미읽음 {unreadCount}개
              </span>
            )}
          </div>

          {[
            { key: 'todayTodo', icon: BellRing, label: '오늘 할 일 알림', desc: '매일 아침 오늘의 할 일 알림' },
            { key: 'announcement', icon: Bell, label: '새 공고 알림', desc: '관심 분야 새 지원사업 공고' },
            { key: 'deadline', icon: Bell, label: '마감 임박 알림', desc: '스크랩한 공고 마감 3일 전' },
            { key: 'weekly', icon: Bell, label: '주간 점검 알림', desc: '매주 일요일 주간 진행 현황' },
          ].map(({ key, icon: Icon, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 border-b border-border-light last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-bg-subtle rounded flex items-center justify-center">
                  <Icon size={15} className="text-text-subtle" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-basic">{label}</p>
                  <p className="text-[10px] text-text-disabled">{desc}</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotif(key as keyof typeof notifSettings)}
                className={`w-12 h-6 rounded-full transition-colors relative touch-manipulation ${
                  notifSettings[key as keyof typeof notifSettings]
                    ? 'bg-primary'
                    : 'bg-bg-subtle'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifSettings[key as keyof typeof notifSettings]
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Settings links */}
        <div className="bg-white px-5 py-3 mb-3">
          {[
            { icon: Shield, label: '개인정보처리방침' },
            { icon: FileText, label: '이용약관' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-3 w-full py-3 border-b border-border-light last:border-0 touch-manipulation"
            >
              <Icon size={18} className="text-text-disabled" />
              <span className="flex-1 text-sm text-text-subtle">{label}</span>
              <ChevronRight size={16} className="text-text-disabled" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="px-4">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="btn-tertiary w-full gap-2"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </main>

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-xs border border-border-light">
            <h3 className="font-black text-text-basic text-center mb-2">로그아웃</h3>
            <p className="text-sm text-text-subtle text-center mb-5">
              정말 로그아웃 하시겠어요?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-tertiary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleLogout}
                className="btn-primary flex-1"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit profile sheet */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowEditProfile(false)}
          />
          <div className="relative w-full max-w-md mx-auto bg-white rounded-t-xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-text-basic">내 정보 수정</h3>
              <button onClick={() => setShowEditProfile(false)}>
                <X size={20} className="text-text-disabled" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-subtle mb-[0.6rem]">
                  별명
                </label>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="krds-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-subtle mb-[0.6rem]">
                  이메일
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="krds-field"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="btn-primary w-full gap-2"
              >
                <Check size={16} />
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
