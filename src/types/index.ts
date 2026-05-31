// Announcement categories (5)
export type Category = 'finance' | 'housing' | 'employment' | 'education' | 'culture'

// Roadmap categories (4 — no culture)
export type RoadmapCategory = 'finance' | 'housing' | 'employment' | 'education'

// 7 interest keywords for personalization
export type InterestKeyword =
  | 'finance'
  | 'employment'
  | 'housing'
  | 'education'
  | 'mental_health'
  | 'physical_health'
  | 'social_connection'

export type Role = 'mentee' | 'mentor'
export type TodoStatus = 'todo' | 'done'
export type Priority = 'high' | 'medium' | 'low'

export interface User {
  id: string
  name: string
  nickname?: string
  phone: string
  email?: string
  birthDate?: string
  role: Role
  interests: InterestKeyword[]
  profileImage?: string
  level: number
  exp: number
  createdAt: string
  notificationSettings?: NotificationSettings
}

export interface NotificationSettings {
  newAnnouncement: boolean
  deadlineAlert: boolean
  todoReminder: boolean
  questComplete: boolean
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
  category: RoadmapCategory
  description: string
  level: number
  todoIds: string[]
  linkedAnnouncementId?: string
  isExpanded: boolean
  order: number
}

export interface DailyQuest {
  id: string
  title: string
  description: string
  expReward: number
  isCompleted: boolean
  category?: RoadmapCategory
}

export interface WeeklyCheckQuestion {
  id: string
  question: string
  type: 'choice' | 'text'
  options?: string[]
}

export interface WeeklyCheck {
  id: string
  weekStart: string
  answers: Record<string, string>
  completedAt?: string
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

// ── Labels & Colors ──────────────────────────────────────────────

export const CATEGORY_LABELS: Record<Category, string> = {
  finance:    '금융',
  housing:    '주거',
  employment: '취업',
  education:  '학업',
  culture:    '생활&문화',
}

export const ROADMAP_CATEGORY_LABELS: Record<RoadmapCategory, string> = {
  finance:    '금융',
  housing:    '주거',
  employment: '취업',
  education:  '학업',
}

export const INTEREST_KEYWORD_LABELS: Record<InterestKeyword, string> = {
  finance:            '금융',
  employment:         '취업',
  housing:            '주거',
  education:          '학업',
  mental_health:      '정신 건강',
  physical_health:    '신체 건강',
  social_connection:  '사회적 연결',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  finance:    '#256ef4',
  housing:    '#7c3aed',
  employment: '#228738',
  education:  '#9e6a00',
  culture:    '#d63d4a',
}

export const ROADMAP_CATEGORY_COLORS: Record<RoadmapCategory, string> = {
  finance:    '#256ef4',
  housing:    '#7c3aed',
  employment: '#228738',
  education:  '#9e6a00',
}

export const ROADMAP_CATEGORY_BG: Record<RoadmapCategory, string> = {
  finance:    '#EFF6FF',
  housing:    '#F5F3FF',
  employment: '#ECFDF5',
  education:  '#FFFBEB',
}

export const ROADMAP_CATEGORY_ICONS: Record<RoadmapCategory, string> = {
  finance:    '💰',
  housing:    '🏠',
  employment: '💼',
  education:  '📚',
}

export const CATEGORY_BG: Record<Category, string> = {
  finance:    '#EFF6FF',
  housing:    '#F5F3FF',
  employment: '#ECFDF5',
  education:  '#FFFBEB',
  culture:    '#FDF2F8',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  finance:    '💰',
  housing:    '🏠',
  employment: '💼',
  education:  '📚',
  culture:    '🎨',
}

export const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: '미완료',
  done: '완료',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high:   '높음',
  medium: '보통',
  low:    '낮음',
}

// EXP / Level helpers
export const EXP_PER_LEVEL = 100
export const getLevel = (exp: number) => Math.floor(exp / EXP_PER_LEVEL) + 1
export const getLevelProgress = (exp: number) => exp % EXP_PER_LEVEL

export const WEEKLY_CHECK_QUESTIONS: WeeklyCheckQuestion[] = [
  {
    id: 'q1',
    question: '이번 주 할 일을 몇 개 완료했나요?',
    type: 'choice',
    options: ['0개', '1~2개', '3~4개', '5개 이상'],
  },
  {
    id: 'q2',
    question: '이번 주 가장 잘 한 일은 무엇인가요?',
    type: 'text',
  },
  {
    id: 'q3',
    question: '다음 주에 가장 집중할 영역은?',
    type: 'choice',
    options: ['금융', '주거', '취업', '학업'],
  },
  {
    id: 'q4',
    question: '이번 주 나의 자립 노력 점수는?',
    type: 'choice',
    options: ['⭐ 1점', '⭐⭐ 2점', '⭐⭐⭐ 3점', '⭐⭐⭐⭐ 4점', '⭐⭐⭐⭐⭐ 5점'],
  },
]
