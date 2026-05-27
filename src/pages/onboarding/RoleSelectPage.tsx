import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check } from 'lucide-react'
import type { Role } from '../../types'

const roles = [
  {
    id: 'mentee' as Role,
    emoji: '🌱',
    title: '자립준비청년 (멘티)',
    desc: '자립을 준비하는 청년으로, 로드맵과 지원사업 정보를 활용해 자립을 계획합니다.',
  },
  {
    id: 'mentor' as Role,
    emoji: '🌳',
    title: '멘토 / 서포터',
    desc: '자립준비청년을 돕는 공인 멘토 또는 서포터입니다. 별도 승인 절차가 있습니다.',
  },
]

export default function RoleSelectPage() {
  const navigate  = useNavigate()
  const [selected, setSelected] = useState<Role | null>(null)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-primary h-1" />
      <div className="px-5 pt-5 pb-10 flex-1 flex flex-col">
        <button onClick={() => navigate(-1)} className="-ml-1 p-1.5 mb-5 self-start" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-text-basic" />
        </button>

        <div className="flex gap-1 mb-2">
          {[1,2,3,4].map((n) => (
            <div key={n} className={`step-bar ${n <= 2 ? 'bg-primary' : 'bg-border-light'}`} />
          ))}
        </div>
        <p className="text-xs text-text-disabled mb-8">2단계 / 4단계</p>

        <h2 className="text-xl font-bold text-text-basic mb-1">역할을 선택해주세요</h2>
        <p className="text-sm text-text-subtle mb-6">역할에 따라 맞춤형 서비스를 제공해드립니다</p>

        <div className="flex flex-col gap-3 flex-1">
          {roles.map((role) => {
            const active = selected === role.id
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors touch-manipulation ${
                  active
                    ? 'border-primary bg-primary-light'
                    : 'border-border-light bg-white hover:border-border-default'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-[2.8rem] leading-none">{role.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-sm mb-1 ${active ? 'text-primary' : 'text-text-basic'}`}>
                      {role.title}
                    </p>
                    <p className="text-xs text-text-subtle leading-relaxed">{role.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                      active ? 'border-primary bg-primary' : 'border-border-default'
                    }`}
                  >
                    {active && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => selected && navigate('/register/profile')}
          disabled={!selected}
          className="btn-primary w-full mt-6"
        >
          다음
        </button>
      </div>
    </div>
  )
}
