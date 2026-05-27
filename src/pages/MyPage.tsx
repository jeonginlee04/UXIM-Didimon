import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import BottomNav from '../components/common/BottomNav'
import { useAuthStore } from '../store/authStore'
import { EXP_PER_LEVEL, getLevelProgress } from '../types'
import pet1 from '../assets/pet1.png'

const SETTINGS = [
  { label: '별명 설정', path: '/mypage/nickname', emoji: '✏️' },
  { label: '개인정보 변경', path: '/mypage/edit', emoji: '👤' },
  { label: '관심 키워드 설정', path: '/mypage/keywords', emoji: '🏷️' },
  { label: '알림 설정', path: '/mypage/notifications', emoji: '🔔' },
]

const INFO_LINKS = [
  { label: '이용약관', emoji: '📄' },
  { label: '개인정보처리방침', emoji: '🔒' },
]

export default function MyPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const level = user?.level ?? 1
  const exp = user?.exp ?? 0
  const levelProgress = getLevelProgress(exp)

  return (
    <div className="min-h-screen flex flex-col bg-bg-page pb-20">
      {/* Profile section */}
      <div className="bg-white px-5 pt-8 pb-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center overflow-hidden">
              <img src={pet1} alt="프로필" className="w-16 h-16 object-contain" />
            </div>
            <button
              onClick={() => navigate('/mypage/edit')}
              className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow"
            >
              <span className="text-white text-xs font-bold">✏</span>
            </button>
          </div>
          <h2 className="text-base font-bold text-text-basic">
            {user?.nickname ?? user?.name}
          </h2>
          <p className="text-xs text-text-subtle mt-0.5">{user?.phone}</p>
        </div>

        {/* Level card */}
        <div className="bg-primary-light rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                Lv.{level}
              </span>
              <span className="text-xs text-primary">자립준비 중</span>
            </div>
            <span className="text-xs font-bold text-primary">
              {levelProgress} / {EXP_PER_LEVEL} EXP
            </span>
          </div>
          <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(levelProgress / EXP_PER_LEVEL) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mx-4 mt-4 bg-white rounded-xl border border-border-light overflow-hidden">
        {SETTINGS.map(({ label, path, emoji }, idx) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-bg-subtle touch-manipulation ${
              idx < SETTINGS.length - 1 ? 'border-b border-border-light' : ''
            }`}
          >
            <span className="text-base w-6 text-center">{emoji}</span>
            <span className="flex-1 text-sm font-medium text-text-basic">{label}</span>
            <ChevronRight size={16} className="text-text-disabled" />
          </button>
        ))}
      </div>

      {/* Info links */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-border-light overflow-hidden">
        {INFO_LINKS.map(({ label, emoji }, idx) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-bg-subtle touch-manipulation ${
              idx < INFO_LINKS.length - 1 ? 'border-b border-border-light' : ''
            }`}
          >
            <span className="text-base w-6 text-center">{emoji}</span>
            <span className="flex-1 text-sm font-medium text-text-subtle">{label}</span>
            <ChevronRight size={16} className="text-text-disabled" />
          </button>
        ))}
      </div>

      {/* Danger zone */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-border-light overflow-hidden">
        <button
          onClick={() => { logout(); navigate('/login', { replace: true }) }}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-bg-subtle touch-manipulation border-b border-border-light"
        >
          <span className="text-base w-6 text-center">🚪</span>
          <span className="flex-1 text-sm font-medium text-text-subtle">로그아웃</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-danger-light touch-manipulation">
          <span className="text-base w-6 text-center">⚠️</span>
          <span className="flex-1 text-sm font-medium text-danger">회원탈퇴</span>
        </button>
      </div>

      <div className="mt-6 pb-4 text-center text-[10px] text-text-disabled">
        디딤온 v0.1.0
      </div>

      <BottomNav />
    </div>
  )
}
