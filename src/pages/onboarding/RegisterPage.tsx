import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g, '')
    if (d.length <= 3) return d
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = '이름을 입력해주세요.'
    if (phone.replace(/\D/g, '').length < 10) e.phone = '올바른 전화번호를 입력해주세요.'
    if (password.length < 6) e.password = '비밀번호는 6자 이상이어야 합니다.'
    if (password !== confirm) e.confirm = '비밀번호가 일치하지 않습니다.'
    if (!agreed) e.agreed = '이용약관에 동의해주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    navigate('/register/phone')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex items-center h-14 px-4 border-b border-border-light">
        <button onClick={() => navigate('/login')} className="-ml-1 p-1.5 touch-manipulation">
          <ChevronLeft size={22} className="text-text-basic" />
        </button>
        <h1 className="flex-1 text-base font-bold text-text-basic text-center pr-8">회원가입</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-6 py-6 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="실명을 입력하세요"
            className={`input-field ${errors.name ? 'error' : ''}`}
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">전화번호</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            maxLength={13}
            className={`input-field ${errors.phone ? 'error' : ''}`}
          />
          {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">비밀번호</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPw(e.target.value)}
              placeholder="6자 이상 입력하세요"
              className={`input-field pr-12 ${errors.password ? 'error' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">비밀번호 확인</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            className={`input-field ${errors.confirm ? 'error' : ''}`}
          />
          {errors.confirm && <p className="mt-1 text-xs text-danger">{errors.confirm}</p>}
        </div>

        <label className="flex items-start gap-3 mt-1 cursor-pointer">
          <div
            onClick={() => setAgreed(!agreed)}
            className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${
              agreed ? 'bg-primary border-primary' : 'border-border-default'
            }`}
          >
            {agreed && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className="text-sm text-text-subtle leading-relaxed">
            <span className="text-text-basic font-medium">이용약관</span> 및{' '}
            <span className="text-text-basic font-medium">개인정보처리방침</span>에 동의합니다.
          </span>
        </label>
        {errors.agreed && <p className="text-xs text-danger -mt-2">{errors.agreed}</p>}

        <div className="mt-auto pt-4">
          <button type="submit" className="btn-primary">
            다음 단계 · 전화번호 인증
          </button>
        </div>

        <p className="text-center text-sm text-text-subtle">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-primary font-bold">
            로그인
          </Link>
        </p>
      </form>
    </div>
  )
}
