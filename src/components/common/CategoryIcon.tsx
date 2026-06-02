import {
  Wallet, Home, Briefcase, BookOpen, Sprout,
  Heart, Activity, Users,
} from 'lucide-react'
import type { Category, RoadmapCategory } from '../../types'

type AnyCategory = Category | RoadmapCategory | string

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  finance:          Wallet,
  housing:          Home,
  employment:       Briefcase,
  education:        BookOpen,
  culture:          Sprout,
  mental_health:    Heart,
  physical_health:  Activity,
  social_connection:Users,
}

interface Props {
  category: AnyCategory
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function CategoryIcon({ category, size = 16, className, style }: Props) {
  const Icon = ICON_MAP[category]
  if (!Icon) return null
  return <Icon size={size} className={className} style={style} />
}
