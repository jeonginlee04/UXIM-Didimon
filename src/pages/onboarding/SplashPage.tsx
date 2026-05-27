import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import pet1 from '../../assets/pet1.png'

export default function SplashPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isOnboarded } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated && isOnboarded ? '/roadmap' : '/login', { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [isAuthenticated, isOnboarded, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary">
      <div className="text-center animate-fade-in">
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <img src={pet1} alt="디딤온 거북이" className="w-20 h-20 object-contain" />
        </div>
        <h1 className="text-[3rem] font-black text-white mb-2 tracking-tight">디딤온</h1>
        <p className="text-base text-primary-light font-medium">자립의 첫 걸음을 함께</p>
      </div>

      <div className="absolute bottom-16 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-white/50 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>
    </div>
  )
}
