import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import { useAuthStore } from '../../store/authStore'
import pet1 from '../../assets/pet1.png'

export default function NicknameSettingPage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!nickname.trim()) return
    updateUser({ nickname: nickname.trim() })
    setSaved(true)
    setTimeout(() => navigate(-1), 800)
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      <Header title="별명 설정" showBack />

      <main className="px-5 py-6 flex flex-col gap-4">
        {/* Turtle */}
        <div className="flex items-end gap-3 mb-2">
          <img src={pet1} alt="" className="w-12 h-12 object-contain flex-shrink-0" />
          <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2.5 border border-border-light flex-1 shadow-sm">
            <p className="text-xs text-text-subtle leading-relaxed">
              앱에서 불릴 별명을 설정해보세요!
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">
            현재 별명
          </label>
          <div className="h-12 px-4 rounded-xl bg-bg-subtle text-sm text-text-disabled flex items-center">
            {user?.nickname ?? '설정된 별명이 없어요'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-subtle mb-1.5">
            새 별명
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setSaved(false) }}
            placeholder="별명을 입력하세요 (2~10자)"
            maxLength={10}
            className="input-field"
          />
          <p className="text-xs text-text-disabled mt-1 text-right">{nickname.length}/10</p>
        </div>

        <button
          onClick={handleSave}
          disabled={!nickname.trim() || saved}
          className="btn-primary"
        >
          {saved ? '✓ 저장됨' : '저장하기'}
        </button>
      </main>
    </div>
  )
}
