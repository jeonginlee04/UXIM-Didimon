import { useLocation, useNavigate } from 'react-router-dom'
import { Search, CheckSquare, Map, User } from 'lucide-react'

const tabs = [
  { path: '/search',    icon: Search,      label: '검색' },
  { path: '/checklist', icon: CheckSquare, label: '할일' },
  { path: '/roadmap',   icon: Map,         label: '로드맵' },
  { path: '/mypage',    icon: User,        label: '프로필' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) =>
    pathname === path || (pathname.startsWith(path + '/') && path !== '/')

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-border-light safe-bottom z-40">
      <div className="flex">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = isActive(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 touch-manipulation"
              aria-label={label}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? 'text-primary' : 'text-text-disabled'}
              />
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-text-disabled'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
