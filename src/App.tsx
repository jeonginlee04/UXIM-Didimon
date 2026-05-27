import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Onboarding
import SplashPage from './pages/onboarding/SplashPage'
import LoginPage from './pages/onboarding/LoginPage'
import RegisterPage from './pages/onboarding/RegisterPage'
import PhoneVerifyPage from './pages/onboarding/PhoneVerifyPage'
import RoleSelectPage from './pages/onboarding/RoleSelectPage'
import ProfileInputPage from './pages/onboarding/ProfileInputPage'
import InterestSelectPage from './pages/onboarding/InterestSelectPage'

// Main
import HomePage from './pages/HomePage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import AnnouncementDetailPage from './pages/AnnouncementDetailPage'
import RoadmapPage from './pages/RoadmapPage'
import ChecklistPage from './pages/ChecklistPage'
import MyPage from './pages/MyPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnboarded } = useAuthStore()
  if (!isAuthenticated || !isOnboarded) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
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
        <Route path="/register/role" element={<RoleSelectPage />} />
        <Route path="/register/profile" element={<ProfileInputPage />} />
        <Route path="/register/interest" element={<InterestSelectPage />} />

        {/* Main (protected) */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/announcements"
          element={
            <RequireAuth>
              <AnnouncementsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/announcements/:id"
          element={
            <RequireAuth>
              <AnnouncementDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/roadmap"
          element={
            <RequireAuth>
              <RoadmapPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checklist"
          element={
            <RequireAuth>
              <ChecklistPage />
            </RequireAuth>
          }
        />
        <Route
          path="/mypage"
          element={
            <RequireAuth>
              <MyPage />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
