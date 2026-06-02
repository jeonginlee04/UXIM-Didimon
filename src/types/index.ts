// Announcement categories
export type Category = 'finance' | 'housing' | 'employment' | 'education' | 'culture' | 'mental_health' | 'physical_health' | 'social_connection'

// Roadmap categories
export type RoadmapCategory = 'finance' | 'housing' | 'employment' | 'education' | 'mental_health' | 'physical_health' | 'social_connection'

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

export type CareType = 'foster' | 'group_home' | 'facility' | 'other'
export type CurrentSituation = 'job_seeking' | 'studying' | 'employed' | 'etc'

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
  // 온보딩 추가 정보
  careType?: CareType
  age?: number
  yearsAfterCare?: number   // 보호종료 연차 (0~5+)
  currentSituation?: CurrentSituation
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
  keyword?: string   // 정책 키워드 (plcyKywdNm) — 카드 하단 태그 표시용
  refUrl1?: string   // 참고 URL 1 (refUrlAddr1)
  refUrl2?: string   // 참고 URL 2 (refUrlAddr2)
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

// ── AI 기능 타입 ─────────────────────────────────────────────

export interface TodoRecommendation {
  title: string
  category: Category
  reason: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface WeeklyFeedback {
  feedback: string
  strengths: string
  suggestions: string[]
  encouragement: string
}

export interface AiChatResponse {
  answer: string
  sources: string[]
  announcements?: Announcement[]
  intent?: 'policy_search' | 'procedure' | 'emotional' | 'general'
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
  finance:          '금융',
  housing:          '주거',
  employment:       '취업',
  education:        '학업',
  culture:          '생활&문화',
  mental_health:    '정신 건강',
  physical_health:  '신체 건강',
  social_connection:'사회적 연결',
}

export const ROADMAP_CATEGORY_LABELS: Record<RoadmapCategory, string> = {
  finance:          '금융',
  housing:          '주거',
  employment:       '취업',
  education:        '학업',
  mental_health:    '정신 건강',
  physical_health:  '신체 건강',
  social_connection:'사회적 연결',
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
  finance:          '#c9960a',
  housing:          '#3d8070',
  employment:       '#006FFD',
  education:        '#006FFD',
  culture:          '#d63d4a',
  mental_health:    '#7c5cbf',
  physical_health:  '#e07a3a',
  social_connection:'#d63d6e',
}

export const ROADMAP_CATEGORY_COLORS: Record<RoadmapCategory, string> = {
  finance:          '#c9960a',
  housing:          '#3d8070',
  employment:       '#006FFD',
  education:        '#006FFD',
  mental_health:    '#7c5cbf',
  physical_health:  '#e07a3a',
  social_connection:'#d63d6e',
}

export const ROADMAP_CATEGORY_BG: Record<RoadmapCategory, string> = {
  finance:          '#fff1ce',
  housing:          '#e0efec',
  employment:       '#eaf2ff',
  education:        '#eaf2ff',
  mental_health:    '#f0ebf9',
  physical_health:  '#fef0e6',
  social_connection:'#fce8ef',
}

export const ROADMAP_CATEGORY_ICONS: Record<RoadmapCategory, string> = {
  finance:          '💰',
  housing:          '🏠',
  employment:       '💼',
  education:        '📚',
  mental_health:    '🧘',
  physical_health:  '🏃',
  social_connection:'🤝',
}

export const CATEGORY_BG: Record<Category, string> = {
  finance:          '#fff1ce',
  housing:          '#e0efec',
  employment:       '#eaf2ff',
  education:        '#eaf2ff',
  culture:          '#eaf2ff',
  mental_health:    '#f0ebf9',
  physical_health:  '#fef0e6',
  social_connection:'#fce8ef',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  finance:          '💰',
  housing:          '🏠',
  employment:       '💼',
  education:        '📚',
  culture:          '🌱',
  mental_health:    '💙',
  physical_health:  '🏃',
  social_connection:'🤝',
}

// lucide-react 아이콘 이름 (KRDS/Apple 스타일 참고)
export const CATEGORY_LUCIDE_NAME: Record<Category, string> = {
  finance:          'Wallet',
  housing:          'Home',
  employment:       'Briefcase',
  education:        'BookOpen',
  culture:          'Sprout',
  mental_health:    'Heart',
  physical_health:  'Activity',
  social_connection:'Users',
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
    question: '이번 주 나 자신을 평가한다면?',
    type: 'choice',
    options: ['매우 잘했어요', '잘했어요', '보통이에요', '조금 아쉬웠어요', '많이 힘들었어요'],
  },
  {
    id: 'q2',
    question: '이번 주 가장 어려웠던 점은?',
    type: 'choice',
    options: ['돈·금융 관리', '집·주거 문제', '취업·학업', '외로움·감정', '건강', '특별히 없어요'],
  },
  {
    id: 'q3',
    question: '이번 주 스스로 해낸 일이 있다면?',
    type: 'text',
  },
  {
    id: 'q4',
    question: '다음 주 나의 목표는?',
    type: 'text',
  },
]
