import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore, demoUser } from '../../store/authStore'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, completeOnboarding } = useAuthStore()
  const [phone, setPhone]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !password) {
      setError('전화번호와 비밀번호를 입력해주세요.')
      return
    }
    login(demoUser)
    completeOnboarding()
    navigate('/home', { replace: true })
  }

  const handleDemo = () => {
    login(demoUser)
    completeOnboarding()
    navigate('/home', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top brand strip */}
      <div className="bg-primary h-1" />

      <div className="flex-1 flex flex-col justify-center px-6 pt-12 pb-10">
        {/* Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-[2rem]">
              🌱
            </div>
            <span className="text-[2rem] font-black text-text-basic tracking-tight">디딤온</span>
          </div>
          <h2 className="text-xl font-bold text-text-basic mb-1">다시 만나서 반가워요!</h2>
          <p className="text-sm text-text-subtle">자립의 여정을 계속해봐요</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-text-subtle mb-[0.6rem]">
              전화번호
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="krds-field"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-text-subtle mb-[0.6rem]">
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="krds-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled touch-manipulation"
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs text-danger flex items-center gap-1">
              <span>⚠</span> {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full mt-2">
            로그인
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-border-light" />
          <span className="px-3 text-xs text-text-disabled">또는</span>
          <div className="flex-1 h-px bg-border-light" />
        </div>

        <button onClick={handleDemo} className="btn-tertiary w-full">
          🚀 데모로 둘러보기
        </button>

        <p className="mt-6 text-center text-sm text-text-subtle">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
