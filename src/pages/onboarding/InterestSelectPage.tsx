import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check } from 'lucide-react'
import { useAuthStore, demoUser } from '../../store/authStore'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../types'
import type { Category } from '../../types'

const categories: Category[] = ['finance', 'housing', 'employment', 'education', 'culture']

const categoryDescs: Record<Category, string> = {
  finance:    '자립수당, 청년 저축, 금융 교육',
  housing:    '주거급여, 전세 대출, 공공임대',
  employment: '취업 훈련, 내일배움카드, 구직 활동',
  education:  '국가장학금, 학자금 대출, 자격증',
  culture:    '심리상담, 문화바우처, 자기계발',
}

// KRDS-aligned category accent colors
const CAT_COLOR: Record<Category, string> = {
  finance:    '#0b50d0',
  housing:    '#5b21b6',
  employment: '#267337',
  education:  '#8a5c00',
  culture:    '#ab2b36',
}

export default function InterestSelectPage() {
  const navigate = useNavigate()
  const { login, completeOnboarding } = useAuthStore()
  const [selected, setSelected] = useState<Category[]>([])

  const toggle = (cat: Category) =>
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )

  const handleComplete = () => {
    login({ ...demoUser, interests: selected.length > 0 ? selected : categories })
    completeOnboarding()
    navigate('/home', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-primary h-1" />
      <div className="px-5 pt-5 pb-10 flex-1 flex flex-col">
        <button onClick={() => navigate(-1)} className="-ml-1 p-1.5 mb-5 self-start" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-text-basic" />
        </button>

        <div className="flex gap-1 mb-2">
          {[1,2,3,4].map((n) => <div key={n} className="step-bar bg-primary" />)}
        </div>
        <p className="text-xs text-text-disabled mb-8">4단계 / 4단계 · 마지막 단계예요!</p>

        <h2 className="text-xl font-bold text-text-basic mb-1">관심 분야를 선택해주세요</h2>
        <p className="text-sm text-text-subtle mb-1">
          선택한 분야의 지원사업과 투두를 먼저 보여드려요
        </p>
        <p className="text-xs text-primary font-medium mb-6">여러 개 선택 가능해요</p>

        <div className="flex flex-col gap-2 flex-1">
          {categories.map((cat) => {
            const isSelected = selected.includes(cat)
            const color = CAT_COLOR[cat]
            return (
              <button
                key={cat}
                onClick={() => toggle(cat)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors touch-manipulation text-left w-full ${
                  isSelected
                    ? 'border-primary bg-primary-light'
                    : 'border-border-light bg-white hover:border-border-default'
                }`}
              >
                <div
                  className="w-10 h-10 rounded flex items-center justify-center text-[2rem] flex-shrink-0"
                  style={{ backgroundColor: isSelected ? '#ecf2fe' : '#f4f5f6' }}
                >
                  {CATEGORY_ICONS[cat]}
                </div>
                <div className="flex-1">
                  <p
                    className="font-bold text-sm mb-0.5"
                    style={{ color: isSelected ? color : '#1e2124' }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <p className="text-xs text-text-subtle">{categoryDescs[cat]}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-primary bg-primary' : 'border-border-default'
                  }`}
                >
                  {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6">
          {selected.length === 0 && (
            <p className="text-center text-xs text-text-disabled mb-3">
              선택하지 않으면 모든 분야를 보여드려요
            </p>
          )}
          <button onClick={handleComplete} className="btn-primary w-full">
            자립 시작하기 🚀
          </button>
        </div>
      </div>
    </div>
  )
}
