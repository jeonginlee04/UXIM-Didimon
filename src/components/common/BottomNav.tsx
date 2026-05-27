import { NavLink } from 'react-router-dom'
import { Home, Megaphone, Map, CheckSquare, User } from 'lucide-react'

const navItems = [
  { to: '/home',          icon: Home,        label: '홈'       },
  { to: '/announcements', icon: Megaphone,   label: '공고'     },
  { to: '/roadmap',       icon: Map,         label: '로드맵'   },
  { to: '/checklist',     icon: CheckSquare, label: '체크리스트' },
  { to: '/mypage',        icon: User,        label: '마이페이지' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-light safe-bottom"
      role="navigation"
      aria-label="하단 메뉴"
    >
      <div className="max-w-[480px] mx-auto flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors touch-manipulation ${
                isActive ? 'text-primary' : 'text-text-disabled'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  aria-hidden="true"
                />
                <span
                  className={`text-[1rem] font-medium leading-none ${
                    isActive ? 'text-primary' : 'text-text-disabled'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
