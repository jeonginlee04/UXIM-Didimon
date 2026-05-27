import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import { useAuthStore } from '../../store/authStore'
import pet1 from '../../assets/pet1.png'

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()

  const [name, setName] = useState(user?.name ?? '')
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return
    updateUser({ name: name.trim(), birthDate, email })
    setSaved(true)
    setTimeout(() => navigate(-1), 800)
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      <Header title="개인정보 변경" showBack />

      <main className="px-5 py-6 flex flex-col gap-4">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center overflow-hidden">
              <img src={pet1} alt="프로필" className="w-16 h-16 object-contain" />
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow">
              <span className="text-white text-xs">✏</span>
            </button>
          </div>
          <p className="text-xs text-text-disabled mt-2">사진 변경</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false) }}
            placeholder="이름을 입력하세요"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">생년월일</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => { setBirthDate(e.target.value); setSaved(false) }}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">전화번호</label>
          <div className="h-12 px-4 rounded-xl bg-bg-subtle text-sm text-text-disabled flex items-center">
            {user?.phone} <span className="ml-2 text-xs text-text-disabled">(변경 불가)</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">
            이메일 <span className="font-normal text-text-disabled">(선택)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSaved(false) }}
            placeholder="이메일을 입력하세요"
            className="input-field"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={!name.trim() || saved}
            className="btn-primary"
          >
            {saved ? '✓ 저장됨' : '저장하기'}
          </button>
        </div>
      </main>
    </div>
  )
}
