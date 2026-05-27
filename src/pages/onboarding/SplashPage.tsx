import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function SplashPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isOnboarded } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated && isOnboarded ? '/home' : '/login', { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [isAuthenticated, isOnboarded, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary">
      <div className="text-center animate-fade-in">
        {/* KRDS-style logo mark */}
        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mx-auto mb-5 shadow">
          <span className="text-[4rem] leading-none">🌱</span>
        </div>
        <h1 className="text-[3.2rem] font-black text-white mb-1 tracking-tight leading-tight">
          디딤온
        </h1>
        <p className="text-[1.3rem] text-primary-light font-medium">
          자립의 첫 걸음을 함께
        </p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-16 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-white/40 rounded-full animate-pulse-slow"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  )
}
