import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore, demoUser } from '../../store/authStore'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, completeOnboarding } = useAuthStore()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !password) {
      setError('전화번호와 비밀번호를 입력해주세요.')
      return
    }
    login(demoUser)
    completeOnboarding()
    navigate('/roadmap', { replace: true })
  }

  const handleDemo = () => {
    login(demoUser)
    completeOnboarding()
    navigate('/roadmap', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 pt-16 pb-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-md mb-4">
            <span className="text-[3rem] leading-none">🌱</span>
          </div>
          <h1 className="text-2xl font-black text-text-basic tracking-tight">디딤온</h1>
          <p className="text-sm text-text-subtle mt-1">자립의 첫 걸음을 함께</p>
        </div>

        <h2 className="text-xl font-bold text-text-basic mb-6">환영합니다!</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-subtle mb-1.5">
              전화번호
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError('') }}
              placeholder="010-0000-0000"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-subtle mb-1.5">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="비밀번호를 입력하세요"
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled touch-manipulation"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-danger flex items-center gap-1">
              <span>⚠</span> {error}
            </p>
          )}

          <button type="submit" className="btn-primary mt-2">
            로그인
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-border-light" />
          <span className="px-3 text-xs text-text-disabled">또는</span>
          <div className="flex-1 h-px bg-border-light" />
        </div>

        {/* Social login */}
        <div className="flex gap-3 justify-center mb-6">
          {[
            { label: 'Google', emoji: '🔍', color: '#EA4335' },
            { label: 'Apple', emoji: '🍎', color: '#000' },
            { label: 'Facebook', emoji: '📘', color: '#1877F2' },
          ].map(({ label, emoji }) => (
            <button
              key={label}
              onClick={handleDemo}
              className="flex-1 h-12 rounded-xl border border-border-light bg-white flex items-center justify-center gap-2 text-sm font-medium text-text-subtle active:bg-bg-subtle touch-manipulation"
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleDemo}
            className="text-sm text-primary font-semibold underline-offset-2 hover:underline"
          >
            🚀 데모로 둘러보기
          </button>
          <p className="text-sm text-text-subtle">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-primary font-bold">
              회원가입
            </Link>
          </p>
          <button className="text-xs text-text-disabled">
            비밀번호를 잊으셨나요?
          </button>
        </div>
      </div>
    </div>
  )
}
