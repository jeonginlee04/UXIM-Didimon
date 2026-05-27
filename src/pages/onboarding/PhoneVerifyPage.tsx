import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

function StepBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1 mb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`step-bar ${i < current ? 'bg-primary' : 'bg-border-light'}`}
        />
      ))}
    </div>
  )
}

export default function PhoneVerifyPage() {
  const navigate = useNavigate()
  const [phone, setPhone]       = useState('')
  const [code, setCode]         = useState(['', '', '', '', '', ''])
  const [codeSent, setCodeSent] = useState(false)
  const [timer, setTimer]       = useState(180)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError]       = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!codeSent || timer <= 0) return
    const id = setInterval(() => setTimer((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [codeSent, timer])

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g, '')
    if (d.length <= 3) return d
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`
  }

  const handleSend = () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('올바른 전화번호를 입력해주세요.')
      return
    }
    setError('')
    setCodeSent(true)
    setTimer(180)
  }

  const handleCodeInput = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next  = [...code]
    next[idx]   = digit
    setCode(next)
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleCodeKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0)
      inputRefs.current[idx - 1]?.focus()
  }

  const handleVerify = () => {
    if (code.join('').length === 6) {
      setIsVerified(true)
      setTimeout(() => navigate('/register/role'), 600)
    } else {
      setError('인증번호 6자리를 모두 입력해주세요.')
    }
  }

  const mm = Math.floor(timer / 60).toString().padStart(2, '0')
  const ss = (timer % 60).toString().padStart(2, '0')

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-primary h-1" />
      <div className="px-5 pt-5 pb-10 flex-1 flex flex-col">
        <button onClick={() => navigate(-1)} className="-ml-1 p-1.5 mb-5 self-start" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-text-basic" />
        </button>

        <StepBar total={4} current={1} />
        <p className="text-xs text-text-disabled mb-8">1단계 / 4단계</p>

        <h2 className="text-xl font-bold text-text-basic mb-1">전화번호 인증</h2>
        <p className="text-sm text-text-subtle mb-6">본인 확인을 위해 전화번호를 인증해주세요</p>

        {/* Phone input row */}
        <div className="flex gap-2 mb-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            maxLength={13}
            disabled={codeSent && !isVerified}
            className="krds-field flex-1"
          />
          <button onClick={handleSend} className="btn-secondary whitespace-nowrap">
            {codeSent ? '재전송' : '인증번호 받기'}
          </button>
        </div>

        {/* Code input */}
        {codeSent && (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-text-subtle">인증번호 6자리</p>
              <span className={`text-sm font-bold ${timer <= 30 ? 'text-danger' : 'text-primary'}`}>
                {mm}:{ss}
              </span>
            </div>

            <div className="flex gap-2 mb-4">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(e.target.value, idx)}
                  onKeyDown={(e) => handleCodeKey(e, idx)}
                  className={`flex-1 h-12 text-center text-lg font-bold rounded border transition-colors focus:outline-none ${
                    isVerified
                      ? 'border-success bg-success-light text-success'
                      : 'border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={isVerified}
              className="btn-primary w-full disabled:opacity-60"
            >
              {isVerified ? '✓ 인증 완료' : '확인'}
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-2 text-xs text-danger flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    </div>
  )
}
