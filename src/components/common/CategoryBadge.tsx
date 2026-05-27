import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../types'
import type { Category } from '../../types'

// KRDS-aligned category colors
const CAT_COLOR: Record<Category, { text: string; bg: string; border: string }> = {
  finance:    { text: '#0b50d0', bg: '#ecf2fe', border: '#b1cefb' },
  housing:    { text: '#5b21b6', bg: '#f5f3ff', border: '#c4b5fd' },
  employment: { text: '#267337', bg: '#eaf6ec', border: '#a9dab4' },
  education:  { text: '#8a5c00', bg: '#fff3db', border: '#ffc95c' },
  culture:    { text: '#ab2b36', bg: '#fbeff0', border: '#ebadb2' },
}

interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'md'
  showIcon?: boolean
}

export default function CategoryBadge({
  category,
  size = 'md',
  showIcon = true,
}: CategoryBadgeProps) {
  const { text, bg, border } = CAT_COLOR[category]
  const label = CATEGORY_LABELS[category]
  const icon  = CATEGORY_ICONS[category]

  const cls =
    size === 'sm'
      ? 'text-[1rem] px-[0.6rem] py-[0.2rem]'
      : 'text-xs px-2 py-[0.3rem]'

  return (
    <span
      className={`inline-flex items-center gap-[0.3rem] rounded-sm font-medium leading-none ${cls}`}
      style={{ color: text, backgroundColor: bg, border: `1px solid ${border}` }}
    >
      {showIcon && <span className="text-[1.1rem] leading-none">{icon}</span>}
      {label}
    </span>
  )
}
