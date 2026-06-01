import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import AiChatButton from './components/AiChatButton'

// Onboarding
import SplashPage from './pages/onboarding/SplashPage'
import LoginPage from './pages/onboarding/LoginPage'
import RegisterPage from './pages/onboarding/RegisterPage'
import PhoneVerifyPage from './pages/onboarding/PhoneVerifyPage'
import InterestSelectPage from './pages/onboarding/InterestSelectPage'

// Main
import SearchPage from './pages/SearchPage'
import AnnouncementFilterPage from './pages/AnnouncementFilterPage'
import AnnouncementDetailPage from './pages/AnnouncementDetailPage'
import ChecklistPage from './pages/ChecklistPage'
import RoadmapPage from './pages/RoadmapPage'
import DailyQuestPage from './pages/roadmap/DailyQuestPage'
import CategoryDetailPage from './pages/roadmap/CategoryDetailPage'
import WeeklyCheckPage from './pages/roadmap/WeeklyCheckPage'
import MyPage from './pages/MyPage'
import NicknameSettingPage from './pages/mypage/NicknameSettingPage'
import EditProfilePage from './pages/mypage/EditProfilePage'
import NotificationSettingsPage from './pages/mypage/NotificationSettingsPage'
import KeywordSettingPage from './pages/mypage/KeywordSettingPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnboarded } = useAuthStore()
  if (!isAuthenticated || !isOnboarded) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function Guarded({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Splash */}
        <Route path="/" element={<SplashPage />} />

        {/* Onboarding */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/phone" element={<PhoneVerifyPage />} />
        <Route path="/register/interest" element={<InterestSelectPage />} />

        {/* Search tab */}
        <Route path="/search" element={<Guarded><SearchPage /></Guarded>} />
        <Route path="/search/filter" element={<Guarded><AnnouncementFilterPage /></Guarded>} />
        <Route path="/search/:id" element={<Guarded><AnnouncementDetailPage /></Guarded>} />

        {/* Checklist tab */}
        <Route path="/checklist" element={<Guarded><ChecklistPage /></Guarded>} />

        {/* Roadmap tab */}
        <Route path="/roadmap" element={<Guarded><RoadmapPage /></Guarded>} />
        <Route path="/roadmap/quest" element={<Guarded><DailyQuestPage /></Guarded>} />
        <Route path="/roadmap/category/:cat" element={<Guarded><CategoryDetailPage /></Guarded>} />
        <Route path="/roadmap/weekly-check" element={<Guarded><WeeklyCheckPage /></Guarded>} />

        {/* Mypage tab */}
        <Route path="/mypage" element={<Guarded><MyPage /></Guarded>} />
        <Route path="/mypage/nickname" element={<Guarded><NicknameSettingPage /></Guarded>} />
        <Route path="/mypage/edit" element={<Guarded><EditProfilePage /></Guarded>} />
        <Route path="/mypage/notifications" element={<Guarded><NotificationSettingsPage /></Guarded>} />
        <Route path="/mypage/keywords" element={<Guarded><KeywordSettingPage /></Guarded>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 전역 AI 채팅 버튼 — 인증된 사용자에게만 표시 */}
      <AiChatButton />
    </BrowserRouter>
  )
}
