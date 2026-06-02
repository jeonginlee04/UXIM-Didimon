import type { AiChatResponse, TodoRecommendation, WeeklyFeedback, Category } from '../types'

export type { AiChatResponse }

export async function sendChatMessage(
  question: string,
  userCategory: string[],
  userId?: string,
): Promise<AiChatResponse> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, userCategory, userId }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const code = (body as { error?: string }).error ?? ''
    if (code === 'RATE_LIMITED' || res.status === 429) throw new Error('RATE_LIMITED')
    if (code === 'GEMINI_API_DISABLED' || res.status === 403) throw new Error('GEMINI_API_DISABLED')
    if (code === 'INVALID_API_KEY' || res.status === 401) throw new Error('INVALID_API_KEY')
    throw new Error(code || `서버 오류 (${res.status})`)
  }

  return res.json() as Promise<AiChatResponse>
}

export async function fetchTodoRecommendations(params: {
  userInterests: string[]
  completedTodos: string[]
  roadmapProgress: Record<string, number>
}): Promise<TodoRecommendation[]> {
  try {
    const res = await fetch('/api/ai/recommend-todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`서버 오류 (${res.status})`)
    const data = await res.json() as { recommendations: TodoRecommendation[] }
    return data.recommendations ?? []
  } catch {
    return []
  }
}

export async function fetchWeeklyFeedback(params: {
  completed: string[]
  incomplete: string[]
  answers: Record<string, string>
  userInterests: string[]
}): Promise<WeeklyFeedback | null> {
  try {
    const res = await fetch('/api/ai/weekly-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`서버 오류 (${res.status})`)
    const data = await res.json() as { feedback: WeeklyFeedback }
    return data.feedback ?? null
  } catch {
    return null
  }
}
