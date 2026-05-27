import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import { useAuthStore } from '../../store/authStore'
import { INTEREST_KEYWORD_LABELS } from '../../types'
import type { InterestKeyword } from '../../types'

const keywords: { key: InterestKeyword; emoji: string }[] = [
  { key: 'finance',           emoji: '💰' },
  { key: 'employment',        emoji: '💼' },
  { key: 'housing',           emoji: '🏠' },
  { key: 'education',         emoji: '📚' },
  { key: 'mental_health',     emoji: '🧘' },
  { key: 'physical_health',   emoji: '🏃' },
  { key: 'social_connection', emoji: '🤝' },
]

export default function KeywordSettingPage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [selected, setSelected] = useState<InterestKeyword[]>(user?.interests ?? [])
  const [saved, setSaved] = useState(false)

  const toggle = (key: InterestKeyword) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )

  const handleSave = () => {
    updateUser({ interests: selected })
    setSaved(true)
    setTimeout(() => navigate(-1), 800)
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      <Header title="관심 키워드 설정" showBack />

      <main className="px-4 py-5 flex flex-col gap-4">
        <p className="text-xs text-text-subtle">
          관심 키워드를 선택하면 맞춤 공고와 정보를 보여드려요
        </p>

        <div className="flex flex-col gap-2">
          {keywords.map(({ key, emoji }) => {
            const isSelected = selected.includes(key)
            return (
              <button
                key={key}
                onClick={() => { toggle(key); setSaved(false) }}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-colors touch-manipulation text-left ${
                  isSelected ? 'border-primary bg-primary-light' : 'border-border-light bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  isSelected ? 'bg-primary/10' : 'bg-bg-subtle'
                }`}>
                  {emoji}
                </div>
                <span className={`flex-1 text-sm font-bold ${isSelected ? 'text-primary' : 'text-text-basic'}`}>
                  {INTEREST_KEYWORD_LABELS[key]}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  isSelected ? 'bg-primary border-primary' : 'border-border-default'
                }`}>
                  {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={selected.length === 0 || saved}
            className="btn-primary"
          >
            {saved ? '✓ 저장됨' : `${selected.length}개 저장하기`}
          </button>
        </div>
      </main>
    </div>
  )
}
