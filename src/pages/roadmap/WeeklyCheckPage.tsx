import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import { useRoadmapStore } from '../../store/roadmapStore'
import { WEEKLY_CHECK_QUESTIONS } from '../../types'
import pet1 from '../../assets/pet1.png'

export default function WeeklyCheckPage() {
  const navigate = useNavigate()
  const { saveWeeklyCheck } = useRoadmapStore()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const total = WEEKLY_CHECK_QUESTIONS.length
  const current = WEEKLY_CHECK_QUESTIONS[step]
  const progress = ((step + 1) / total) * 100

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }))
  }

  const handleNext = () => {
    if (step < total - 1) {
      setStep(step + 1)
    } else {
      saveWeeklyCheck(answers)
      setDone(true)
    }
  }

  const canProceed = !!answers[current?.id]

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-page">
        <Header title="주간 점검" showBack />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
          <img src={pet1} alt="" className="w-24 h-24 object-contain" />
          <div>
            <h2 className="text-xl font-black text-text-basic mb-2">이번 주도 수고했어요!</h2>
            <p className="text-sm text-text-subtle leading-relaxed">
              주간 점검을 완료했어요.
              <br />다음 주에도 꾸준히 함께해요!
            </p>
          </div>
          <div className="bg-primary-light rounded-xl px-6 py-4 w-full">
            <p className="text-primary font-bold text-sm">+20 EXP 획득! 🎉</p>
          </div>
          <button
            onClick={() => navigate('/roadmap', { replace: true })}
            className="btn-primary w-full"
          >
            로드맵으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      <Header title="주간 점검" showBack />

      <main className="flex-1 flex flex-col px-5 py-5">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-text-subtle mb-2">
            <span>{step + 1} / {total}</span>
            <span>{Math.round(progress)}% 완료</span>
          </div>
          <div className="h-2 bg-bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Turtle */}
        <div className="flex items-end gap-3 mb-6">
          <img src={pet1} alt="" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-border-light flex-1 shadow-sm">
            <p className="text-sm font-medium text-text-basic leading-relaxed">
              {step === 0 && '한 주 동안 정말 열심히 했어요!'}
              {step === 1 && '잘 한 일을 기억해두면 자신감이 생겨요!'}
              {step === 2 && '집중할 분야를 정하면 더 효율적이에요!'}
              {step === 3 && '스스로를 평가하는 것도 성장의 일부예요!'}
            </p>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1">
          <h2 className="text-lg font-black text-text-basic mb-5">
            {current.question}
          </h2>

          {current.type === 'choice' && current.options && (
            <div className="flex flex-col gap-2">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full py-3.5 px-4 rounded-xl border-2 text-sm font-medium text-left transition-colors touch-manipulation ${
                    answers[current.id] === opt
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-border-light bg-white text-text-basic'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {current.type === 'text' && (
            <textarea
              value={answers[current.id] ?? ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="자유롭게 작성해주세요..."
              rows={5}
              className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-basic placeholder:text-text-disabled focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          )}
        </div>

        <div className="pt-4 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary flex-shrink-0"
            >
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {step < total - 1 ? '다음' : '완료하기'}
          </button>
        </div>
      </main>
    </div>
  )
}
