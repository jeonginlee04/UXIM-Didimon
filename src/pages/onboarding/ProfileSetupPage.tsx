import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import type { CareType, CurrentSituation } from '../../types'
import pet1 from '../../assets/pet1.png'

// ── 단계 정의 ────────────────────────────────────────────────
type Step = 'care' | 'age' | 'years' | 'situation'
const STEPS: Step[] = ['care', 'age', 'years', 'situation']

const CARE_OPTIONS: { key: CareType; label: string; desc: string }[] = [
  { key: 'foster',     label: '위탁가정',       desc: '가정 위탁 보호를 받았어요' },
  { key: 'group_home', label: '그룹홈',          desc: '공동생활가정(그룹홈)에서 지냈어요' },
  { key: 'facility',   label: '아동양육시설',    desc: '보육원 등 시설에서 생활했어요' },
  { key: 'other',      label: '기타',            desc: '그 외의 형태로 보호받았어요' },
]

const SITUATION_OPTIONS: { key: CurrentSituation; label: string; desc: string }[] = [
  { key: 'job_seeking', label: '취업 준비 중',  desc: '일자리를 찾고 있어요' },
  { key: 'studying',    label: '학업 중',        desc: '학교에 다니고 있어요' },
  { key: 'employed',    label: '취업 중',        desc: '현재 직장에 다니고 있어요' },
  { key: 'etc',         label: '기타',           desc: '그 외 상황이에요' },
]

const STEP_MSG: Record<Step, string> = {
  care:      '어떤 형태의 보호를 받았나요?\n편하게 선택해줘요!',
  age:       '현재 나이를 알려주세요!\n맞춤 정보를 드릴게요.',
  years:     '보호종료 후 얼마나 됐나요?\n자립 단계에 맞는 도움을 드릴게요.',
  situation: '지금 어떤 상황인가요?\n적합한 지원을 안내해드릴게요.',
}

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()

  const [step, setStep]     = useState<Step>('care')
  const [care, setCare]     = useState<CareType | null>(null)
  const [age, setAge]       = useState('')
  const [years, setYears]   = useState<number | null>(null)
  const [situation, setSituation] = useState<CurrentSituation | null>(null)

  const stepIdx = STEPS.indexOf(step)
  const progress = ((stepIdx + 1) / STEPS.length) * 100

  const canNext = () => {
    if (step === 'care')      return !!care
    if (step === 'age')       return !!age && parseInt(age) >= 14 && parseInt(age) <= 35
    if (step === 'years')     return years !== null
    if (step === 'situation') return !!situation
    return false
  }

  const handleNext = () => {
    if (step === 'situation') {
      // 완료 → 데이터 저장 후 관심분야 페이지로
      updateUser({
        careType: care ?? undefined,
        age: age ? parseInt(age) : undefined,
        yearsAfterCare: years ?? undefined,
        currentSituation: situation ?? undefined,
      })
      navigate('/register/interest')
    } else {
      setStep(STEPS[stepIdx + 1])
    }
  }

  const handleBack = () => {
    if (stepIdx === 0) navigate(-1)
    else setStep(STEPS[stepIdx - 1])
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 헤더 */}
      <div className="h-14 flex items-center px-4 border-b border-border-light">
        <button onClick={handleBack} className="-ml-1 p-1.5 touch-manipulation">
          <ChevronLeft size={22} className="text-text-basic" />
        </button>
        <h1 className="flex-1 text-[14px] font-bold text-text-basic text-center pr-8">내 정보 입력</h1>
      </div>

      {/* 진행률 */}
      <div className="px-5 pt-4">
        <div className="flex justify-between text-[11px] text-text-subtle mb-1.5">
          <span>{stepIdx + 1} / {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 py-5">
        {/* 캐릭터 말풍선 */}
        <div className="flex items-end gap-3 mb-6">
          <img src={pet1} alt="" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="bg-primary-light rounded-2xl rounded-bl-none px-4 py-3 flex-1">
            <p className="text-sm font-medium text-primary leading-relaxed whitespace-pre-line">
              {STEP_MSG[step]}
            </p>
          </div>
        </div>

        {/* 보호 유형 */}
        {step === 'care' && (
          <div className="flex flex-col gap-2">
            {CARE_OPTIONS.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setCare(key)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left touch-manipulation transition-colors ${
                  care === key ? 'border-primary bg-primary-light' : 'border-border-light bg-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  care === key ? 'border-primary bg-primary' : 'border-border-default'
                }`}>
                  {care === key && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
                <div>
                  <p className={`text-sm font-bold ${care === key ? 'text-primary' : 'text-text-basic'}`}>{label}</p>
                  <p className="text-xs text-text-subtle mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 나이 */}
        {step === 'age' && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-text-basic mb-2 block">현재 나이</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="예: 22"
                min={14}
                max={35}
                className="w-full border-2 border-border-light rounded-xl px-4 py-3.5 text-lg font-bold text-text-basic focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-subtle mt-2">만 나이로 입력해주세요 (14~35세)</p>
            </div>
          </div>
        )}

        {/* 보호종료 연차 */}
        {step === 'years' && (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3, 4, 5].map((yr) => (
              <button
                key={yr}
                onClick={() => setYears(yr)}
                className={`py-4 rounded-xl border-2 text-sm font-bold touch-manipulation transition-colors ${
                  years === yr ? 'border-primary bg-primary-light text-primary' : 'border-border-light bg-white text-text-basic'
                }`}
              >
                {yr === 0 ? '아직 보호 중' : yr < 5 ? `${yr}년차` : '5년 이상'}
              </button>
            ))}
          </div>
        )}

        {/* 현재 상황 */}
        {step === 'situation' && (
          <div className="flex flex-col gap-2">
            {SITUATION_OPTIONS.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setSituation(key)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left touch-manipulation transition-colors ${
                  situation === key ? 'border-primary bg-primary-light' : 'border-border-light bg-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  situation === key ? 'border-primary bg-primary' : 'border-border-default'
                }`}>
                  {situation === key && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
                <div>
                  <p className={`text-sm font-bold ${situation === key ? 'text-primary' : 'text-text-basic'}`}>{label}</p>
                  <p className="text-xs text-text-subtle mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-5 pb-8 pt-4 border-t border-border-light">
        <button
          onClick={handleNext}
          disabled={!canNext()}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {step === 'situation' ? '다음 단계' : '다음'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
