import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

const CODE_LENGTH = 4

export default function PhoneVerifyPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''))
  const [codeSent, setCodeSent] = useState(false)
  const [timer, setTimer] = useState(180)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!codeSent || timer <= 0 || isVerified) return
    const id = setInterval(() => setTimer((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [codeSent, timer, isVerified])

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
    setCode(Array(CODE_LENGTH).fill(''))
    setCodeSent(true)
    setTimer(180)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  const handleCodeInput = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[idx] = digit
    setCode(next)
    if (digit && idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  const handleCodeKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handleVerify = () => {
    if (code.join('').length === CODE_LENGTH) {
      setIsVerified(true)
      setError('')
      setTimeout(() => navigate('/register/interest'), 700)
    } else {
      setError(`인증번호 ${CODE_LENGTH}자리를 모두 입력해주세요.`)
    }
  }

  const mm = Math.floor(timer / 60).toString().padStart(2, '0')
  const ss = (timer % 60).toString().padStart(2, '0')

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex items-center h-14 px-4 border-b border-border-light">
        <button onClick={() => navigate(-1)} className="-ml-1 p-1.5 touch-manipulation">
          <ChevronLeft size={22} className="text-text-basic" />
        </button>
        <h1 className="flex-1 text-base font-bold text-text-basic text-center pr-8">전화번호 인증</h1>
      </div>

      <div className="flex-1 flex flex-col px-6 py-8 gap-6">
        {/* Phone input */}
        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">전화번호</label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(formatPhone(e.target.value)); setError('') }}
              placeholder="010-0000-0000"
              maxLength={13}
              disabled={codeSent && !isVerified}
              className="input-field flex-1 disabled:bg-bg-subtle disabled:text-text-disabled"
            />
            <button
              type="button"
              onClick={handleSend}
              className="btn-secondary whitespace-nowrap px-4 h-14 text-sm"
            >
              {codeSent ? '재전송' : '인증번호 받기'}
            </button>
          </div>
        </div>

        {/* OTP code input */}
        {codeSent && (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-text-subtle">
                {phone}으로 {CODE_LENGTH}자리 숫자 코드가 전송되었습니다
              </p>
            </div>

            <div className="flex gap-3 mb-2">
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
                  className={`flex-1 h-14 w-1 text-center text-2xl font-bold rounded-xl border-2 transition-colors focus:outline-none ${
                    isVerified
                      ? 'border-success bg-success-light text-success'
                      : digit
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-text-disabled">남은 시간</span>
              <span className={`text-sm font-bold ${timer <= 30 ? 'text-danger' : 'text-primary'}`}>
                {mm}:{ss}
              </span>
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerified}
              className="btn-primary"
            >
              {isVerified ? '✓ 인증 완료' : '확인'}
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs text-danger flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    </div>
  )
}
