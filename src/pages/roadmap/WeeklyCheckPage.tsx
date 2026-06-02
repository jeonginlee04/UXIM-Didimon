import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useRoadmapStore } from '../../store/roadmapStore'
import { useAuthStore } from '../../store/authStore'
import { useTodoStore } from '../../store/todoStore'
import { WEEKLY_CHECK_QUESTIONS } from '../../types'
import { fetchWeeklyFeedback } from '../../services/aiChatApi'
import type { WeeklyFeedback } from '../../types'
import pet1 from '../../assets/pet1.png'

const WEEKLY_CHECK_EXP = 20

const TURTLE_MESSAGES = [
  '한 주 동안 정말 열심히 했어요!',
  '잘 한 일을 기억해두면 자신감이 생겨요!',
  '집중할 분야를 정하면 더 효율적이에요!',
  '스스로를 평가하는 것도 성장의 일부예요!',
]

export default function WeeklyCheckPage() {
  const navigate = useNavigate()
  const { saveWeeklyCheck } = useRoadmapStore()
  const { addExp, user } = useAuthStore()
  const { todos } = useTodoStore()

  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [done, setDone]       = useState(false)
  const [feedback, setFeedback]     = useState<WeeklyFeedback | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const total   = WEEKLY_CHECK_QUESTIONS.length
  const current = WEEKLY_CHECK_QUESTIONS[step]

  const canProceed = !!answers[current?.id]

  const handleAnswer = (value: string) =>
    setAnswers((prev) => ({ ...prev, [current.id]: value }))

  const handleNext = async () => {
    if (step < total - 1) {
      setStep(step + 1)
    } else {
      saveWeeklyCheck(answers)
      addExp(WEEKLY_CHECK_EXP)
      setDone(true)

      // AI 피드백 비동기 로드
      setFeedbackLoading(true)
      const weekTodos = todos.filter((t) => t.status === 'done' || t.status === 'todo')
      const completed  = todos.filter((t) => t.status === 'done').map((t) => t.content)
      const incomplete = todos.filter((t) => t.status === 'todo').map((t) => t.content)

      const result = await fetchWeeklyFeedback({
        completed:    completed.slice(0, 10),
        incomplete:   incomplete.slice(0, 10),
        answers,
        userInterests: (user?.interests ?? []) as string[],
      })
      setFeedback(result)
      setFeedbackLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9fe]">
        <div className="h-14 flex items-center px-4 bg-white">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 touch-manipulation">
            <ChevronLeft size={22} className="text-[#1f2024]" />
          </button>
          <h1 className="flex-1 text-[14px] font-bold text-[#1f2024] text-center mr-8">주간 점검</h1>
        </div>

        <div className="flex-1 px-5 py-6 space-y-5 overflow-y-auto">
          {/* 완료 헤더 */}
          <div className="flex flex-col items-center text-center gap-4">
            <img src={pet1} alt="" className="w-20 h-20 object-contain" />
            <div>
              <h2 className="text-[18px] font-extrabold text-[#1f2024] mb-1">이번 주도 수고했어요!</h2>
              <p className="text-[14px] text-[#71727a] leading-relaxed">
                주간 점검을 완료했어요.<br />다음 주에도 꾸준히 함께해요!
              </p>
            </div>
            <div className="bg-[#e0efec] rounded-2xl px-6 py-3 w-full">
              <p className="text-[#3d8070] font-bold text-sm">+{WEEKLY_CHECK_EXP} EXP 획득!</p>
            </div>
          </div>

          {/* AI 피드백 카드 */}
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <p className="text-[13px] font-bold text-text-basic mb-3">AI 주간 피드백</p>

            {feedbackLoading ? (
              <div className="flex items-center gap-2 py-4 justify-center">
                <Loader2 size={16} className="text-primary animate-spin" />
                <p className="text-[13px] text-text-subtle">피드백을 분석 중이에요…</p>
              </div>
            ) : feedback ? (
              <div className="space-y-3">
                <p className="text-[13px] text-text-basic leading-relaxed">{feedback.feedback}</p>

                <div className="bg-[#e0efec] rounded-xl px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#3d8070] mb-1">잘한 점</p>
                  <p className="text-[12px] text-[#3d8070]">{feedback.strengths}</p>
                </div>

                <div className="bg-[#fff1ce] rounded-xl px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#c9960a] mb-2">다음 주 제안</p>
                  <ul className="space-y-1">
                    {feedback.suggestions.map((s, i) => (
                      <li key={i} className="text-[12px] text-[#c9960a] flex gap-1.5">
                        <span className="flex-shrink-0">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-[12px] text-text-subtle text-center italic">{feedback.encouragement}</p>
              </div>
            ) : (
              <p className="text-[13px] text-text-subtle text-center py-2">
                피드백을 불러오지 못했어요. 앱을 계속 사용해주세요 😊
              </p>
            )}
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
    <div className="min-h-screen flex flex-col bg-[#f8f9fe]">
      {/* 헤더 */}
      <div className="h-14 flex items-center px-4 bg-white">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 touch-manipulation">
          <ChevronLeft size={22} className="text-[#1f2024]" />
        </button>
        <h1 className="flex-1 text-[14px] font-bold text-[#1f2024] text-center mr-8">주간 점검</h1>
      </div>

      <main className="flex-1 flex flex-col px-5 py-5">
        {/* 진행률 */}
        <div className="mb-6">
          <div className="flex justify-between text-[11px] text-[#71727a] mb-2">
            <span>{step + 1} / {total}</span>
            <span>{Math.round(((step + 1) / total) * 100)}% 완료</span>
          </div>
          <div className="h-2 bg-[#e8e9f1] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#62ad9e] rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* 거북이 말풍선 */}
        <div className="flex items-end gap-3 mb-6">
          <img src={pet1} alt="" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-[#c5c6cc] flex-1 shadow-sm">
            <p className="text-[13px] font-medium text-[#1f2024] leading-relaxed">
              {TURTLE_MESSAGES[step]}
            </p>
          </div>
        </div>

        {/* 질문 */}
        <div className="flex-1">
          <h2 className="text-[16px] font-extrabold text-[#1f2024] mb-5 leading-snug">
            {current.question}
          </h2>

          {current.type === 'choice' && current.options && (
            <div className="flex flex-col gap-2">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full py-3.5 px-4 rounded-2xl border-2 text-[13px] font-medium text-left transition-colors touch-manipulation ${
                    answers[current.id] === opt
                      ? 'border-[#62ad9e] bg-[#e0efec] text-[#3d8070]'
                      : 'border-[#e8e9f1] bg-white text-[#1f2024]'
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
              className="w-full rounded-2xl border border-[#c5c6cc] bg-white px-4 py-3 text-sm text-[#1f2024] placeholder:text-[#8f9098] focus:outline-none focus:border-[#62ad9e] focus:ring-2 focus:ring-[#62ad9e]/20 resize-none"
            />
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="pt-4 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="h-12 px-5 bg-white text-[#62ad9e] text-sm font-semibold rounded-xl border border-[#62ad9e] flex-shrink-0 touch-manipulation active:bg-[#e0efec]"
            >
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            {step < total - 1 ? '다음' : '완료하기'}
          </button>
        </div>
      </main>
    </div>
  )
}
