export type Category = 'finance' | 'housing' | 'employment' | 'education' | 'culture'
export type Role = 'mentee' | 'mentor'
export type TodoStatus = 'todo' | 'in_progress' | 'done'
export type Priority = 'high' | 'medium' | 'low'

export interface User {
  id: string
  name: string
  nickname?: string
  phone: string
  email?: string
  birthDate?: string
  role: Role
  interests: Category[]
  profileImage?: string
  createdAt: string
}

export interface Announcement {
  id: string
  title: string
  organization: string
  category: Category
  region: string
  benefitType: string
  startDate: string
  endDate: string
  description: string
  posterUrl?: string
  tags: string[]
  bookmarkCount: number
  isBookmarked: boolean
  detailUrl?: string
  targetAge?: string
  amount?: string
}

export interface Todo {
  id: string
  content: string
  category: Category
  dueDate?: string
  status: TodoStatus
  priority: Priority
  hasNotification: boolean
  linkedAnnouncementId?: string
  linkedRoadmapItemId?: string
  createdAt: string
  completedAt?: string
}

export interface RoadmapItem {
  id: string
  title: string
  category: Category
  description: string
  level: number
  todoIds: string[]
  linkedAnnouncementId?: string
  isExpanded: boolean
  order: number
}

export interface Notification {
  id: string
  type: 'todo_reminder' | 'announcement' | 'roadmap' | 'system'
  title: string
  body: string
  isRead: boolean
  createdAt: string
  linkedId?: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  finance: '금융',
  housing: '주거',
  employment: '취업',
  education: '학업',
  culture: '생활&문화',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  finance:    '#256ef4',
  housing:    '#7c3aed',
  employment: '#228738',
  education:  '#9e6a00',
  culture:    '#d63d4a',
}

export const CATEGORY_BG: Record<Category, string> = {
  finance: '#EFF6FF',
  housing: '#F5F3FF',
  employment: '#ECFDF5',
  education: '#FFFBEB',
  culture: '#FDF2F8',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  finance: '💰',
  housing: '🏠',
  employment: '💼',
  education: '📚',
  culture: '🎨',
}

export const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: '미완료',
  in_progress: '진행 중',
  done: '완료',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
}
