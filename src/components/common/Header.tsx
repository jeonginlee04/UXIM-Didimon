import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  rightElement?: React.ReactNode
  transparent?: boolean
}

export default function Header({
  title,
  showBack = false,
  rightElement,
  transparent = false,
}: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className={`sticky top-0 z-40 ${
        transparent ? 'bg-transparent' : 'bg-white border-b border-border-light'
      }`}
    >
      <div className="flex items-center h-14 px-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="mr-2 -ml-1 p-1.5 rounded-lg touch-manipulation active:bg-bg-subtle"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={22} className="text-text-basic" />
          </button>
        )}
        {title && (
          <h1 className="flex-1 text-base font-bold text-text-basic">{title}</h1>
        )}
        {!title && <div className="flex-1" />}
        {rightElement}
      </div>
    </header>
  )
}
