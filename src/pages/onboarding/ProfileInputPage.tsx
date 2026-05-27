import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function ProfileInputPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', nickname: '', birthDate: '', email: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.name.trim()) e.name = '이름을 입력해주세요.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = '올바른 이메일 형식을 입력해주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => { if (validate()) navigate('/register/interest') }

  const Field = ({
    id, label, required, error, children,
  }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-text-subtle mb-[0.6rem]">
        {label}
        {required
          ? <span className="text-danger ml-0.5">*</span>
          : <span className="text-text-disabled font-normal ml-1">(선택)</span>
        }
      </label>
      {children}
      {error && <p className="text-xs text-danger mt-1">⚠ {error}</p>}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-primary h-1" />
      <div className="px-5 pt-5 pb-10 flex-1 flex flex-col">
        <button onClick={() => navigate(-1)} className="-ml-1 p-1.5 mb-5 self-start" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-text-basic" />
        </button>

        <div className="flex gap-1 mb-2">
          {[1,2,3,4].map((n) => (
            <div key={n} className={`step-bar ${n <= 3 ? 'bg-primary' : 'bg-border-light'}`} />
          ))}
        </div>
        <p className="text-xs text-text-disabled mb-8">3단계 / 4단계</p>

        <h2 className="text-xl font-bold text-text-basic mb-1">프로필을 입력해주세요</h2>
        <p className="text-sm text-text-subtle mb-6">맞춤형 서비스를 위해 필요해요</p>

        <div className="flex flex-col gap-4 flex-1">
          <Field id="name" label="이름" required error={errors.name}>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="실명을 입력하세요"
              className={`krds-field ${errors.name ? 'error' : ''}`}
            />
          </Field>

          <Field id="nickname" label="별명">
            <input
              id="nickname"
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder="앱에서 사용할 별명"
              className="krds-field"
            />
          </Field>

          <Field id="birthDate" label="생년월일">
            <input
              id="birthDate"
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="krds-field"
            />
          </Field>

          <Field id="email" label="이메일" error={errors.email}>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
              className={`krds-field ${errors.email ? 'error' : ''}`}
            />
          </Field>
        </div>

        <button onClick={handleSubmit} className="btn-primary w-full mt-6">
          다음
        </button>
      </div>
    </div>
  )
}
