import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bell } from 'lucide-react'
import { mockNotifications } from '../../data/mockData'

interface HeaderProps {
  title: string
  showBack?: boolean
  showNotification?: boolean
  rightElement?: React.ReactNode
}

export default function Header({
  title,
  showBack = false,
  showNotification = false,
  rightElement,
}: HeaderProps) {
  const navigate = useNavigate()
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border-light">
      <div className="max-w-[480px] mx-auto flex items-center h-[4.8rem] px-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="mr-2 -ml-1 p-1.5 rounded touch-manipulation hover:bg-bg-subtle transition-colors"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={22} className="text-text-basic" />
          </button>
        )}
        <h1 className="flex-1 text-base font-bold text-text-basic leading-none">
          {title}
        </h1>
        {showNotification && (
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-1.5 rounded touch-manipulation hover:bg-bg-subtle transition-colors"
            aria-label={`알림${unreadCount > 0 ? ` (미읽음 ${unreadCount}개)` : ''}`}
          >
            <Bell size={20} className="text-text-subtle" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-[1.6rem] h-[1.6rem] bg-danger text-white text-[1rem] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>
        )}
        {rightElement}
      </div>
    </header>
  )
}
