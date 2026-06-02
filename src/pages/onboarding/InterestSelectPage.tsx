import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuthStore, demoUser } from '../../store/authStore'
import { INTEREST_KEYWORD_LABELS } from '../../types'
import type { InterestKeyword } from '../../types'
import CategoryIcon from '../../components/common/CategoryIcon'
import pet1 from '../../assets/pet1.png'

const keywords: { key: InterestKeyword; desc: string }[] = [
  { key: 'finance',           desc: '자립수당, 청년 저축, 금융 교육' },
  { key: 'employment',        desc: '취업 훈련, 내일배움카드, 구직' },
  { key: 'housing',           desc: '주거급여, 전세 대출, 공공임대' },
  { key: 'education',         desc: '국가장학금, 학자금 대출, 자격증' },
  { key: 'mental_health',     desc: '심리상담, 스트레스 관리, 정서 지원' },
  { key: 'physical_health',   desc: '운동, 건강 검진, 체력 관리' },
  { key: 'social_connection', desc: '자립준비청년 네트워크, 커뮤니티' },
]

export default function InterestSelectPage() {
  const navigate = useNavigate()
  const { login, completeOnboarding } = useAuthStore()
  const [selected, setSelected] = useState<InterestKeyword[]>([])

  const toggle = (key: InterestKeyword) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )

  const handleComplete = () => {
    login({
      ...demoUser,
      interests: selected.length > 0 ? selected : keywords.map((k) => k.key),
    })
    completeOnboarding()
    navigate('/roadmap', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex items-center h-14 px-4 border-b border-border-light">
        <button onClick={() => navigate(-1)} className="-ml-1 p-1.5 touch-manipulation">
          <ChevronLeft size={22} className="text-text-basic" />
        </button>
        <h1 className="flex-1 text-base font-bold text-text-basic text-center pr-8">관심 키워드</h1>
      </div>

      <div className="flex-1 flex flex-col px-5 py-6">
        {/* Turtle speech bubble */}
        <div className="flex items-end gap-3 mb-6">
          <img src={pet1} alt="" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="relative bg-primary-light rounded-2xl rounded-bl-none px-4 py-3 flex-1">
            <p className="text-sm font-medium text-primary leading-relaxed">
              관심 있는 키워드를 선택해주세요!
              <br />
              <span className="text-xs text-text-subtle font-normal">맞춤 정보를 제공해드려요</span>
            </p>
          </div>
        </div>

        <p className="text-xs text-text-disabled mb-4">최소 1개 이상 선택해주세요 (복수 선택 가능)</p>

        <div className="flex flex-col gap-2 flex-1">
          {keywords.map(({ key, desc }) => {
            const isSelected = selected.includes(key)
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-colors touch-manipulation text-left ${
                  isSelected
                    ? 'border-primary bg-primary-light'
                    : 'border-border-light bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-primary/10' : 'bg-bg-subtle'
                }`}>
                  <CategoryIcon category={key} size={20} className={isSelected ? 'text-primary' : 'text-text-subtle'} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-text-basic'}`}>
                    {INTEREST_KEYWORD_LABELS[key]}
                  </p>
                  <p className="text-xs text-text-subtle mt-0.5">{desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  isSelected ? 'border-primary bg-primary' : 'border-border-default'
                }`}>
                  {isSelected && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-border-light">
          {selected.length === 0 && (
            <p className="text-center text-xs text-text-disabled mb-3">
              선택하지 않으면 모든 키워드를 기본으로 설정해드려요
            </p>
          )}
          <button onClick={handleComplete} className="btn-primary">
            {selected.length > 0 ? `${selected.length}개 선택 완료` : '건너뛰기'}
          </button>
        </div>
      </div>
    </div>
  )
}
