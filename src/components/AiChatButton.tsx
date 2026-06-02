import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AiChatModal from './AiChatModal'
import pet1 from '../assets/pet1.png'

// 자체 AI 버튼이 있거나 플로팅 버튼이 불필요한 페이지
const HIDE_ON_PATHS = ['/checklist']

export default function AiChatButton() {
  const { isAuthenticated, isOnboarded } = useAuthStore()
  const { pathname } = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [pulsed, setPulsed] = useState(false)

  if (!isAuthenticated || !isOnboarded) return null
  if (HIDE_ON_PATHS.some((p) => pathname.startsWith(p))) return null

  return (
    <>
      {/* BottomNav와 동일한 중앙 정렬 컨테이너 — pointer-events-none으로 하단 영역 클릭 통과 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] pointer-events-none z-50">
        <div className="absolute bottom-24 right-4 pointer-events-auto">
          <button
            onClick={() => { setIsOpen(true); setPulsed(true) }}
            className="relative w-14 h-14 bg-primary rounded-full shadow-md
                       flex items-center justify-center
                       active:scale-95 transition-transform touch-manipulation"
            aria-label="AI 도우미 디디몬 열기"
          >
            <img src={pet1} alt="디디몬" className="w-9 h-9 object-contain" />
            {/* 처음 한 번만 펄스 링으로 주목 유도 */}
            {!pulsed && (
              <span className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping" />
            )}
          </button>
        </div>
      </div>

      <AiChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
