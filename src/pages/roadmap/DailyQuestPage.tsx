import Header from '../../components/common/Header'
import { useRoadmapStore } from '../../store/roadmapStore'
import { useAuthStore } from '../../store/authStore'
import pet1 from '../../assets/pet1.png'

export default function DailyQuestPage() {
  const { dailyQuests, completeQuest } = useRoadmapStore()
  const { addExp } = useAuthStore()

  const completed = dailyQuests.filter((q) => q.isCompleted).length
  const total = dailyQuests.length
  const totalExp = dailyQuests.reduce((acc, q) => acc + (q.isCompleted ? q.expReward : 0), 0)

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      <Header title="일일 퀘스트" showBack />

      <main className="flex-1 px-4 py-5">
        {/* Turtle + header */}
        <div className="flex items-end gap-3 mb-5">
          <img src={pet1} alt="" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-border-light flex-1 shadow-sm">
            <p className="text-sm font-bold text-text-basic mb-0.5">오늘의 퀘스트</p>
            <p className="text-xs text-text-subtle">
              완료하면 EXP를 얻어 레벨을 올릴 수 있어요!
            </p>
          </div>
        </div>

        {/* Progress summary */}
        <div className="bg-primary-light rounded-xl px-4 py-3 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-primary">진행 현황</span>
            <span className="text-sm font-bold text-primary">
              {completed}/{total} · +{totalExp} EXP
            </span>
          </div>
          <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Quest list */}
        <div className="flex flex-col gap-3">
          {dailyQuests.map((quest) => (
            <div
              key={quest.id}
              className={`bg-white rounded-xl border-2 p-4 transition-colors ${
                quest.isCompleted ? 'border-primary bg-primary-light/30' : 'border-border-light'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => !quest.isCompleted && completeQuest(quest.id, addExp)}
                  disabled={quest.isCompleted}
                  className="mt-0.5 flex-shrink-0 touch-manipulation"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    quest.isCompleted
                      ? 'bg-primary border-primary'
                      : 'border-border-default'
                  }`}>
                    {quest.isCompleted && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>
                </button>

                <div className="flex-1">
                  <p className={`text-sm font-bold mb-0.5 ${
                    quest.isCompleted ? 'line-through text-text-disabled' : 'text-text-basic'
                  }`}>
                    {quest.title}
                  </p>
                  <p className="text-xs text-text-subtle">{quest.description}</p>
                </div>

                <div className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                  quest.isCompleted
                    ? 'bg-primary text-white'
                    : 'bg-warning-light text-warning-text'
                }`}>
                  +{quest.expReward} EXP
                </div>
              </div>
            </div>
          ))}
        </div>

        {completed === total && total > 0 && (
          <div className="mt-5 bg-primary rounded-xl p-4 text-center">
            <p className="text-white font-bold text-base mb-1">🎉 모든 퀘스트 완료!</p>
            <p className="text-primary-light text-xs">내일도 새로운 퀘스트가 기다리고 있어요</p>
          </div>
        )}
      </main>
    </div>
  )
}
