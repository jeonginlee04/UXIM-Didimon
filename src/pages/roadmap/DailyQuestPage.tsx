import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRoadmapStore } from '../../store/roadmapStore'
import { useAuthStore } from '../../store/authStore'
import pet1 from '../../assets/pet1.png'

export default function DailyQuestPage() {
  const navigate = useNavigate()
  const { dailyQuests, completeQuest } = useRoadmapStore()
  const { addExp } = useAuthStore()

  const completed = dailyQuests.filter((q) => q.isCompleted).length
  const total = dailyQuests.length
  const totalExp = dailyQuests.reduce((acc, q) => acc + (q.isCompleted ? q.expReward : 0), 0)
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fe]">
      {/* 헤더 */}
      <div className="h-14 flex items-center px-4 bg-white">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 touch-manipulation">
          <ChevronLeft size={22} className="text-[#1f2024]" />
        </button>
        <h1 className="flex-1 text-[14px] font-bold text-[#1f2024] text-center mr-8">일일 퀘스트</h1>
      </div>

      <main className="flex-1 px-4 py-5">
        {/* 거북이 + 말풍선 */}
        <div className="flex items-end gap-3 mb-5">
          <img src={pet1} alt="" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-[#c5c6cc] flex-1 shadow-sm">
            <p className="text-[13px] font-bold text-[#1f2024] mb-0.5">오늘의 퀘스트</p>
            <p className="text-[11px] text-[#71727a]">완료하면 EXP를 얻어 레벨을 올릴 수 있어요!</p>
          </div>
        </div>

        {/* 진행 요약 */}
        <div className="bg-[#e0efec] rounded-2xl px-4 py-3 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-[#3d8070]">진행 현황</span>
            <span className="text-[13px] font-bold text-[#3d8070]">
              {completed}/{total} · +{totalExp} EXP
            </span>
          </div>
          <div className="h-2 bg-[#3d8070]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#62ad9e] rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* 퀘스트 목록 */}
        <div className="flex flex-col gap-3">
          {dailyQuests.map((quest) => (
            <div
              key={quest.id}
              className={`bg-white rounded-2xl border-2 p-4 transition-colors shadow-sm ${
                quest.isCompleted ? 'border-[#62ad9e] bg-[#e0efec]/30' : 'border-[#e8e9f1]'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => !quest.isCompleted && completeQuest(quest.id, addExp)}
                  disabled={quest.isCompleted}
                  className="mt-0.5 flex-shrink-0 touch-manipulation"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    quest.isCompleted ? 'bg-[#62ad9e] border-[#62ad9e]' : 'border-[#c5c6cc]'
                  }`}>
                    {quest.isCompleted && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-bold mb-0.5 ${
                    quest.isCompleted ? 'line-through text-[#8f9098]' : 'text-[#1f2024]'
                  }`}>
                    {quest.title}
                  </p>
                  <p className="text-[11px] text-[#71727a]">{quest.description}</p>
                </div>

                <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  quest.isCompleted ? 'bg-[#62ad9e] text-white' : 'bg-[#fff1ce] text-[#c9960a]'
                }`}>
                  +{quest.expReward} EXP
                </span>
              </div>
            </div>
          ))}
        </div>

        {completed === total && total > 0 && (
          <div className="mt-5 bg-[#62ad9e] rounded-2xl p-4 text-center">
            <p className="text-white font-bold text-base mb-1">🎉 모든 퀘스트 완료!</p>
            <p className="text-[#e0efec] text-xs">내일도 새로운 퀘스트가 기다리고 있어요</p>
          </div>
        )}
      </main>
    </div>
  )
}
