import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { useAnnouncementStore } from '../store/announcementStore'
import type { Category } from '../types'

// ─── 필터 옵션 정의 ─────────────────────────────────────────────────────────

const FIELD_OPTIONS: { key: Category | 'all'; label: string }[] = [
  { key: 'all',        label: '전체' },
  { key: 'finance',    label: '금융' },
  { key: 'housing',    label: '주거' },
  { key: 'employment', label: '취업' },
  { key: 'education',  label: '학업' },
  { key: 'culture',    label: '생활&문화' },
]

const DEADLINE_OPTIONS = ['모집중', '곧 마감', '마감']

const REGION_OPTIONS = [
  '서울', '경기', '인천', '강원',
  '충북', '충남', '세종', '대전',
  '전북', '전남', '광주', '경북',
  '경남', '부산', '대구', '울산',
  '제주',
]

const BENEFIT_OPTIONS = [
  '현금 지원', '장학금', '주거 지원', '식비 지원',
  '교통비 지원', '물품 지원', '교육 제공', '멘토링',
  '상담 지원', '취업 연계', '네트워킹', '기타',
]

const ELIGIBILITY_OPTIONS = ['청소년', '청년', '대학생', '졸업예정자']

// ─── 필터 섹션 컴포넌트 ──────────────────────────────────────────────────────

interface FilterSectionProps {
  title: string
  count: number
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, count, open, onToggle, children }: FilterSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-white active:bg-bg-subtle touch-manipulation"
      >
        <span className="text-sm font-bold text-text-basic">{title}</span>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
          {open
            ? <ChevronUp size={16} className="text-text-disabled" />
            : <ChevronDown size={16} className="text-text-disabled" />
          }
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}

      <div className="h-px bg-border-light mx-0" />
    </div>
  )
}

// ─── 필터 칩 컴포넌트 ────────────────────────────────────────────────────────

interface ChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

function FilterChip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-4 rounded-full text-xs font-semibold touch-manipulation transition-colors select-none
        ${selected
          ? 'bg-primary text-white'
          : 'bg-[#E0EFEC] text-primary'
        }`}
    >
      {label}
    </button>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function AnnouncementFilterPage() {
  const navigate = useNavigate()
  const {
    filterCategory,
    filterDeadlines,
    filterRegions,
    filterBenefits,
    filterEligibility,
    setFilterCategory,
    setFilterDeadlines,
    setFilterRegions,
    setFilterBenefits,
    setFilterEligibility,
    clearAllFilters,
    getTotalFilterCount,
  } = useAnnouncementStore()

  // 각 섹션의 로컬 임시 상태 (적용하기 누를 때 스토어에 반영)
  const [localCategory,    setLocalCategory]    = useState<Category | 'all'>(filterCategory)
  const [localDeadlines,   setLocalDeadlines]   = useState<string[]>(filterDeadlines)
  const [localRegions,     setLocalRegions]     = useState<string[]>(filterRegions)
  const [localBenefits,    setLocalBenefits]    = useState<string[]>(filterBenefits)
  const [localEligibility, setLocalEligibility] = useState<string[]>(filterEligibility)

  // 섹션 열림/닫힘
  const [open, setOpen] = useState<Record<string, boolean>>({
    분야: true,
    기간: true,
    지역: true,
    혜택유형: true,
    지원자격: true,
  })

  const toggle = (key: string) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))

  // 멀티 선택 토글 헬퍼
  const toggleItem = (arr: string[], item: string): string[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

  // 초기화
  const handleReset = () => {
    setLocalCategory('all')
    setLocalDeadlines([])
    setLocalRegions([])
    setLocalBenefits([])
    setLocalEligibility([])
  }

  // 적용하기
  const handleApply = () => {
    setFilterCategory(localCategory)
    setFilterDeadlines(localDeadlines)
    setFilterRegions(localRegions)
    setFilterBenefits(localBenefits)
    setFilterEligibility(localEligibility)
    navigate(-1)
  }

  // 현재 로컬 선택된 필터 총 개수
  const localCount =
    (localCategory !== 'all' ? 1 : 0) +
    localDeadlines.length +
    localRegions.length +
    localBenefits.length +
    localEligibility.length

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-border-light">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="mr-2 -ml-1 p-1.5 rounded-lg touch-manipulation active:bg-bg-subtle"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={22} className="text-text-basic" />
          </button>
          <h1 className="flex-1 text-base font-bold text-text-basic">지원공고</h1>
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-text-subtle active:text-primary touch-manipulation px-1"
          >
            초기화
          </button>
        </div>
      </header>

      {/* 필터 섹션 목록 */}
      <main className="flex-1 overflow-y-auto bg-white pb-24">

        {/* 분야 */}
        <FilterSection
          title="분야"
          count={localCategory !== 'all' ? 1 : 0}
          open={open['분야']}
          onToggle={() => toggle('분야')}
        >
          <div className="flex flex-wrap gap-2 pt-1">
            {FIELD_OPTIONS.map(({ key, label }) => (
              <FilterChip
                key={key}
                label={label}
                selected={localCategory === key}
                onClick={() => setLocalCategory(key)}
              />
            ))}
          </div>
        </FilterSection>

        {/* 기간 */}
        <FilterSection
          title="기간"
          count={localDeadlines.length}
          open={open['기간']}
          onToggle={() => toggle('기간')}
        >
          <div className="flex flex-wrap gap-2 pt-1">
            {DEADLINE_OPTIONS.map((opt) => (
              <FilterChip
                key={opt}
                label={opt}
                selected={localDeadlines.includes(opt)}
                onClick={() => setLocalDeadlines(toggleItem(localDeadlines, opt))}
              />
            ))}
          </div>
        </FilterSection>

        {/* 지역 */}
        <FilterSection
          title="지역"
          count={localRegions.length}
          open={open['지역']}
          onToggle={() => toggle('지역')}
        >
          <div className="flex flex-wrap gap-2 pt-1">
            {REGION_OPTIONS.map((region) => (
              <FilterChip
                key={region}
                label={region}
                selected={localRegions.includes(region)}
                onClick={() => setLocalRegions(toggleItem(localRegions, region))}
              />
            ))}
          </div>
        </FilterSection>

        {/* 혜택 유형 */}
        <FilterSection
          title="혜택 유형"
          count={localBenefits.length}
          open={open['혜택유형']}
          onToggle={() => toggle('혜택유형')}
        >
          <div className="flex flex-wrap gap-2 pt-1">
            {BENEFIT_OPTIONS.map((opt) => (
              <FilterChip
                key={opt}
                label={opt}
                selected={localBenefits.includes(opt)}
                onClick={() => setLocalBenefits(toggleItem(localBenefits, opt))}
              />
            ))}
          </div>
        </FilterSection>

        {/* 지원 자격 */}
        <FilterSection
          title="지원 자격"
          count={localEligibility.length}
          open={open['지원자격']}
          onToggle={() => toggle('지원자격')}
        >
          <div className="flex flex-wrap gap-2 pt-1">
            {ELIGIBILITY_OPTIONS.map((opt) => (
              <FilterChip
                key={opt}
                label={opt}
                selected={localEligibility.includes(opt)}
                onClick={() => setLocalEligibility(toggleItem(localEligibility, opt))}
              />
            ))}
          </div>
        </FilterSection>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-light px-5 py-4 max-w-[480px] mx-auto">
        <button
          onClick={handleApply}
          className="btn-primary rounded-xl"
        >
          {localCount > 0 ? `적용하기 (${localCount})` : '적용하기'}
        </button>
      </div>
    </div>
  )
}
