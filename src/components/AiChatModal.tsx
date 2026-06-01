import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { sendChatMessage } from '../services/aiChatApi'
import pet1 from '../assets/pet1.png'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  sources?: string[]
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'ai',
  content:
    '안녕하세요! 저는 디딤온의 AI 도우미 디디몬이에요 🐢\n자립지원 정책에 대해 궁금한 점을 편하게 물어보세요!',
}

export default function AiChatModal({ isOpen, onClose }: Props) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 새 메시지가 추가될 때마다 스크롤 하단으로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // 모달 열릴 때 입력창 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350)
    }
  }, [isOpen])

  const handleSend = async () => {
    const q = input.trim()
    if (!q || isLoading) return

    setInput('')
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: q },
    ])
    setIsLoading(true)

    try {
      const userCategory = (user?.interests ?? []) as string[]
      const res = await sendChatMessage(q, userCategory, user?.id)
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'ai',
          content: res.answer,
          sources: res.sources,
        },
      ])
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : ''
      const content =
        code === 'RATE_LIMITED'
          ? '요청이 너무 많아요. 잠시 후 다시 시도해주세요 ⏳'
          : code === 'GEMINI_API_DISABLED'
          ? 'Gemini API가 활성화되지 않았어요.\naistudio.google.com/app/apikey 에서 새 API 키를 발급하거나, Google Cloud Console에서 Generative Language API를 활성화해주세요 🔑'
          : code === 'INVALID_API_KEY'
          ? 'Gemini API 키가 유효하지 않아요. .env 파일의 GEMINI_API_KEY를 확인해주세요 🔑'
          : '죄송해요, 잠시 오류가 발생했어요. 다시 시도해주세요 😢'

      setMessages((prev) => [
        ...prev,
        { id: `ai-err-${Date.now()}`, role: 'ai', content },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[60]
          h-[85dvh] bg-white rounded-t-3xl flex flex-col shadow-lg
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* ── 헤더 ── */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border-light flex-shrink-0">
          {/* 드래그 핸들 */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-border-default rounded-full" />

          <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
            <img src={pet1} alt="디디몬" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-basic">디디몬</p>
            <p className="text-xs text-text-subtle">자립지원 AI 도우미</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg active:bg-bg-subtle touch-manipulation"
            aria-label="닫기"
          >
            <X size={20} className="text-text-subtle" />
          </button>
        </div>

        {/* ── 메시지 목록 ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {messages.map((msg) =>
            msg.role === 'ai' ? (
              /* AI 메시지 */
              <div key={msg.id} className="flex items-start gap-2.5 animate-fade-in">
                <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <img src={pet1} alt="" className="w-5 h-5 object-contain" />
                </div>
                <div className="max-w-[78%]">
                  <p className="text-[11px] text-text-subtle font-medium mb-1">디디몬</p>
                  <div className="bg-bg-subtle rounded-2xl rounded-tl-sm px-4 py-3">
                    <p className="text-sm text-text-basic whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {msg.sources.map((src, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-primary-light text-primary px-2 py-0.5 rounded-full font-medium"
                        >
                          📎 {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 사용자 메시지 */
              <div key={msg.id} className="flex justify-end animate-fade-in">
                <div className="max-w-[78%] bg-primary rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="text-sm text-white whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ),
          )}

          {/* 로딩 (타이핑) 인디케이터 */}
          {isLoading && (
            <div className="flex items-start gap-2.5 animate-fade-in">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <img src={pet1} alt="" className="w-5 h-5 object-contain" />
              </div>
              <div className="bg-bg-subtle rounded-2xl rounded-tl-sm px-4 py-3.5">
                <div className="flex items-center gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-2 h-2 bg-text-disabled rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── 입력창 ── */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-border-light bg-white rounded-b-none">
          <div className="flex items-center gap-2 bg-bg-subtle rounded-2xl px-4 h-12">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="자립 지원 정책을 물어보세요"
              className="flex-1 bg-transparent text-sm text-text-basic placeholder:text-text-disabled focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center
                         disabled:bg-primary/30 transition-colors touch-manipulation flex-shrink-0"
              aria-label="전송"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
