import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import { useAuthStore, defaultNotificationSettings } from '../../store/authStore'
import type { NotificationSettings } from '../../types'

const NOTIFICATION_ITEMS: { key: keyof NotificationSettings; label: string; desc: string }[] = [
  {
    key: 'newAnnouncement',
    label: '새로운 공고 알림',
    desc: '관심 키워드에 맞는 새 공고가 등록되면 알려드려요',
  },
  {
    key: 'deadlineAlert',
    label: '마감 임박 알림',
    desc: '스크랩한 공고 마감 7일 전에 알려드려요',
  },
  {
    key: 'todoReminder',
    label: '투두 리마인더',
    desc: '마감일이 다가오는 할 일을 알려드려요',
  },
  {
    key: 'questComplete',
    label: '퀘스트 알림',
    desc: '새로운 퀘스트가 등록되면 알려드려요',
  },
]

export default function NotificationSettingsPage() {
  const { user, updateUser } = useAuthStore()
  const settings = user?.notificationSettings ?? defaultNotificationSettings

  const toggle = (key: keyof NotificationSettings) => {
    updateUser({
      notificationSettings: { ...settings, [key]: !settings[key] },
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      <Header title="알림 설정" showBack />

      <main className="px-4 py-4">
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          {NOTIFICATION_ITEMS.map(({ key, label, desc }, idx) => (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-4 ${
                idx < NOTIFICATION_ITEMS.length - 1 ? 'border-b border-border-light' : ''
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-text-basic">{label}</p>
                <p className="text-xs text-text-subtle mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`toggle flex-shrink-0 ${settings[key] ? 'bg-primary' : 'bg-border-default'}`}
              >
                <div className={`toggle-knob ${settings[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-text-disabled text-center mt-4">
          알림은 기기 설정에서도 관리할 수 있어요
        </p>
      </main>
    </div>
  )
}
