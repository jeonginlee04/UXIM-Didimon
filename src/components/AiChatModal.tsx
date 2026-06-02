import { useState, useRef, useEffect } from 'react'
import { X, Send, ExternalLink } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { sendChatMessage } from '../services/aiChatApi'
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_BG, CATEGORY_COLORS } from '../types'
import type { Announcement } from '../types'
import pet1 from '../assets/pet1.png'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  sources?: string[]
  announcements?: Announcement[]
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'ai',
  content:
    '안녕하세요! 저는 디딤온의 AI 도우미 디디몬이에요 🐢\n자립지원 정책을 찾거나, 신청 방법, 자립 관련 질문을 편하게 물어보세요!',
}

// 공고 미니 카드
function AnnouncementMiniCard({ item }: { item: Announcement }) {
  const bg    = CATEGORY_BG[item.category]    ?? '#f5f5f5'
  const color = CATEGORY_COLORS[item.category] ?? '#444'
  const icon  = CATEGORY_ICONS[item.category]  ?? '📋'
  const label = CATEGORY_LABELS[item.category] ?? item.category

  return (
    <a
      href={item.refUrl1 || item.detailUrl || '#'}
      target={item.refUrl1 || item.detailUrl ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="block rounded-xl border border-border-light bg-white p-3 hover:shadow-sm active:opacity-80 transition-all"
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: bg, color }}
        >
          {icon} {label}
        </span>
        {(item.refUrl1 || item.detailUrl) && (
          <ExternalLink size={10} className="ml-auto text-text-disabled" />
        )}
      </div>
      <p className="text-[12px] font-bold text-text-basic leading-snug line-clamp-2">
        {item.title}
      </p>
      {item.organization && (
        <p className="text-[10px] text-text-subtle mt-1">{item.organization}</p>
      )}
      {(item.endDate || item.targetAge) && (
        <p className="text-[10px] text-text-disabled mt-0.5">
          {item.endDate && `마감 ${item.endDate}`}
          {item.endDate && item.targetAge && ' · '}
          {item.targetAge}
        </p>
      )}
    </a>
  )
}

export default function AiChatModal({ isOpen, onClose }: Props) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput]       = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350)
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
          id:            `ai-${Date.now()}`,
          role:          'ai',
          content:       res.answer,
          sources:       res.sources,
          announcements: res.announcements,
        },
      ])
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : ''
      const content =
        code === 'RATE_LIMITED'
          ? '요청이 너무 많아요. 잠시 후 다시 시도해주세요 ⏳'
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
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border-light flex-shrink-0">
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

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {messages.map((msg) =>
            msg.role === 'ai' ? (
              <div key={msg.id} className="flex items-start gap-2.5 animate-fade-in">
                <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <img src={pet1} alt="" className="w-5 h-5 object-contain" />
                </div>
                <div className="max-w-[84%]">
                  <p className="text-[11px] text-text-subtle font-medium mb-1">디디몬</p>
                  <div className="bg-bg-subtle rounded-2xl rounded-tl-sm px-4 py-3">
                    <p className="text-sm text-text-basic whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </p>
                  </div>

                  {/* 출처 뱃지 */}
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

                  {/* 관련 공고 카드 */}
                  {msg.announcements && msg.announcements.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] text-text-subtle font-medium">관련 공고</p>
                      {msg.announcements.map((item) => (
                        <AnnouncementMiniCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex justify-end animate-fade-in">
                <div className="max-w-[78%] bg-primary rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="text-sm text-white whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ),
          )}

          {/* 로딩 인디케이터 */}
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

        {/* 입력창 */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-border-light bg-white">
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
              placeholder="정책 검색, 신청 방법, 자립 질문..."
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
