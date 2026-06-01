import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import BottomNav from '../components/common/BottomNav'
import { useAuthStore } from '../store/authStore'
import { EXP_PER_LEVEL, getLevelProgress } from '../types'

const SETTINGS_ROWS = [
  { label: '별명 설정',       path: '/mypage/nickname' },
  { label: '개인정보 변경',   path: '/mypage/edit' },
  { label: '관심 키워드 설정', path: '/mypage/keywords' },
  { label: '알림 설정',       path: '/mypage/notifications' },
  { label: '서비스 이용약관', path: null },
  { label: '개인정보 처리방침', path: null },
  { label: '로그아웃',        path: null, action: 'logout' },
  { label: '회원 탈퇴',       path: null, action: 'withdraw' },
]

function UserAvatar() {
  return (
    <div className="w-20 h-20 rounded-[32px] bg-[#eaf2ff] flex items-center justify-center overflow-hidden">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="#62ad9e" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#62ad9e" />
      </svg>
    </div>
  )
}

export default function MyPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const level = user?.level ?? 1
  const exp = user?.exp ?? 0
  const levelProgress = getLevelProgress(exp)
  const expPercent = Math.round((levelProgress / EXP_PER_LEVEL) * 100)

  const handleRowPress = (row: typeof SETTINGS_ROWS[number]) => {
    if (row.action === 'logout') { logout(); navigate('/login', { replace: true }) }
    else if (row.path) navigate(row.path)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* 헤더 */}
      <div className="h-14 flex items-center justify-center bg-white">
        <h1 className="text-[14px] font-bold text-[#1f2024]">마이 페이지</h1>
      </div>

      {/* 프로필 */}
      <div className="flex flex-col items-center py-6">
        <div className="relative mb-3">
          <UserAvatar />
          <button
            onClick={() => navigate('/mypage/edit')}
            className="absolute bottom-0 right-0 w-6 h-6 bg-[#62ad9e] rounded-full flex items-center justify-center shadow"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="text-[16px] font-extrabold text-[#1f2024] tracking-[0.08px]">
          {user?.nickname ?? user?.name ?? '사용자'}
        </p>
        <p className="text-[12px] text-[#71727a] mt-0.5 tracking-[0.12px]">
          {user?.phone ?? ''}
        </p>
      </div>

      {/* 레벨 카드 */}
      <div className="mx-6 mb-6 bg-[#e0efec] rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#3d8070] bg-[#62ad9e]/20 px-2 py-0.5 rounded-full">
              Lv.{level}
            </span>
            <span className="text-xs text-[#3d8070]">안정 준비 단계</span>
          </div>
          <span className="text-xs font-bold text-[#3d8070]">
            {levelProgress} / {EXP_PER_LEVEL} EXP
          </span>
        </div>
        <div className="h-[21px] bg-[#c5c6cc]/40 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${expPercent}%`, background: 'linear-gradient(to right, #284741, #62ad9e)' }}
          />
        </div>
      </div>

      {/* 설정 목록 (구분선만, 카드 없음) */}
      <div className="flex-1">
        {SETTINGS_ROWS.map((row, idx) => {
          const isWithdraw = row.action === 'withdraw'
          return (
            <div key={row.label}>
              <button
                onClick={() => handleRowPress(row)}
                className="w-full flex items-center gap-4 px-6 py-4 text-left active:bg-[#f8f9fe] touch-manipulation"
              >
                <span className={`flex-1 text-[14px] leading-5 ${isWithdraw ? 'text-red-500' : 'text-[#1f2024]'}`}>
                  {row.label}
                </span>
                <div className="w-3 h-3 overflow-hidden flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4 2l4 4-4 4" stroke="#8f9098" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
              {idx < SETTINGS_ROWS.length - 1 && (
                <div className="h-px bg-[#e8e9f1] mx-6" />
              )}
            </div>
          )
        })}
      </div>

      <div className="py-4 text-center text-[10px] text-[#8f9098]">
        디딤온 v0.1.0
      </div>

      <BottomNav />
    </div>
  )
}
