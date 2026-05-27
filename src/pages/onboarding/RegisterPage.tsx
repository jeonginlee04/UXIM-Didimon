import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

const steps = ['전화번호 인증', '역할 선택', '프로필 입력', '관심 분야 선택']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else navigate('/register/interest')
  }

  // Redirect to step-specific pages
  const stepRoutes = [
    '/register/phone',
    '/register/role',
    '/register/profile',
    '/register/interest',
  ]

  const handleStart = () => {
    navigate(stepRoutes[0])
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="px-6 pt-14 pb-8 flex-1 flex flex-col">
        <button
          onClick={() => navigate('/login')}
          className="self-start mb-6 -ml-1 p-1.5 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>

        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="text-6xl mb-6">🌱</div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">
            디딤온에 오신 걸 환영해요!
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            자립의 첫 걸음을 함께 시작해봐요.
            <br />몇 가지 정보만 알려주시면 맞춤형 로드맵을 드릴게요.
          </p>

          <div className="w-full bg-gray-50 rounded-2xl p-5 mb-8">
            <p className="text-xs font-semibold text-gray-500 mb-3">가입 단계</p>
            <div className="flex flex-col gap-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-sm text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full h-13 bg-primary text-white rounded-xl font-bold text-sm shadow-md shadow-primary/30 hover:bg-primary-dark active:scale-[0.98] transition touch-manipulation py-3.5"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
