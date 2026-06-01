export interface ChatResponse {
  answer: string
  sources: string[]
}

export async function sendChatMessage(
  question: string,
  userCategory: string[],
  userId?: string,
): Promise<ChatResponse> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, userCategory, userId }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const code = (body as { error?: string }).error ?? ''

    if (code === 'RATE_LIMITED' || res.status === 429) {
      throw new Error('RATE_LIMITED')
    }
    if (code === 'GEMINI_API_DISABLED' || res.status === 403) {
      throw new Error('GEMINI_API_DISABLED')
    }
    if (code === 'INVALID_API_KEY' || res.status === 401) {
      throw new Error('INVALID_API_KEY')
    }
    throw new Error(code || `서버 오류 (${res.status})`)
  }

  return res.json() as Promise<ChatResponse>
}
