import { useState, useEffect } from 'react'
import { Plus, X, Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import BottomNav from '../components/common/BottomNav'
import pet1 from '../assets/pet1.png'
import { useTodoStore } from '../store/todoStore'
import { CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS } from '../types'
import type { Category, TodoStatus, Priority } from '../types'

const ALL_CATS: Category[] = ['finance', 'housing', 'employment', 'education', 'culture']

const DAY_LABELS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const DAY_LABELS_KR = ['월', '화', '수', '목', '금', '토', '일']
const MONTH_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

function getWeekDates(from: Date): Date[] {
  const monday = new Date(from)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function calcWeekOffset(today: Date, target: Date): number {
  const getMonday = (d: Date) => {
    const m = new Date(d)
    const day = m.getDay()
    m.setDate(m.getDate() + (day === 0 ? -6 : 1 - day))
    m.setHours(0, 0, 0, 0)
    return m
  }
  return Math.round((getMonday(target).getTime() - getMonday(today).getTime()) / (7 * 86400000))
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface TodoForm {
  content: string
  category: Category
  dueDate: string
  priority: Priority
  hasNotification: boolean
}

const defaultForm: TodoForm = { content: '', category: 'finance', dueDate: '', priority: 'medium', hasNotification: false }

export default function ChecklistPage() {
  const { todos, addTodo, changeStatus, deleteTodo, updateTodo } = useTodoStore()
  const [searchParams] = useSearchParams()
  const prefilledContent = searchParams.get('content') ?? ''
  const prefilledCategory = (searchParams.get('category') ?? 'finance') as Category

  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(toDateStr(today))
  const [filterStatus, setFilterStatus] = useState<TodoStatus | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [addform, setAddForm] = useState<TodoForm>({ ...defaultForm, dueDate: toDateStr(today) })
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekTransitioning, setWeekTransitioning] = useState(false)
  const [slideDir, setSlideDir] = useState<1 | -1>(1)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(today.getFullYear())
  const [pickerMonth, setPickerMonth] = useState(today.getMonth())
  const [showEdit, setShowEdit] = useState(false)
  const [editingTodo, setEditingTodo] = useState<(typeof todos)[number] | null>(null)
  const [editForm, setEditForm] = useState<TodoForm>({ ...defaultForm })

  useEffect(() => {
    if (prefilledContent) {
      setAddForm({ ...defaultForm, content: prefilledContent, category: prefilledCategory, dueDate: toDateStr(today) })
      setShowAdd(true)
    }
  }, [])

  const todayStr = toDateStr(today)
  const baseDate = new Date(today)
  baseDate.setDate(today.getDate() + weekOffset * 7)
  const weekDates = getWeekDates(baseDate)
  const displayYear = weekDates[0].getFullYear()
  const displayMonth = weekDates[0].getMonth() + 1

  const dayTodos = todos.filter((t) => t.dueDate === selectedDate)
  const filtered = filterStatus === 'all' ? dayTodos : dayTodos.filter((t) => t.status === filterStatus)
  const doneCount = dayTodos.filter((t) => t.status === 'done').length
  const progressPct = dayTodos.length > 0 ? Math.round((doneCount / dayTodos.length) * 100) : 0

  const navigateWeek = (dir: 1 | -1) => {
    if (weekTransitioning) return
    setSlideDir(dir)
    setWeekTransitioning(true)
    setTimeout(() => { setWeekOffset((p) => p + dir); setWeekTransitioning(false) }, 180)
  }

  const hasTodoOnDate = (ds: string) => todos.some((t) => t.dueDate === ds)

  const handleAdd = () => {
    if (!addform.content.trim()) return
    addTodo({ content: addform.content.trim(), category: addform.category, dueDate: addform.dueDate || selectedDate, status: 'todo', priority: addform.priority, hasNotification: addform.hasNotification })
    setAddForm({ ...defaultForm, dueDate: selectedDate })
    setShowAdd(false)
  }

  const openEditModal = (todo: (typeof todos)[number]) => {
    setEditingTodo(todo)
    setEditForm({ content: todo.content, category: todo.category, dueDate: todo.dueDate ?? selectedDate, priority: todo.priority, hasNotification: todo.hasNotification })
    setShowEdit(true)
  }

  const handleEditSave = () => {
    if (!editingTodo || !editForm.content.trim()) return
    updateTodo(editingTodo.id, { content: editForm.content.trim(), category: editForm.category, dueDate: editForm.dueDate, priority: editForm.priority, hasNotification: editForm.hasNotification })
    setShowEdit(false)
    setEditingTodo(null)
  }

  const handlePickerDateSelect = (year: number, month: number, day: number) => {
    const target = new Date(year, month, day)
    const ds = toDateStr(target)
    setSelectedDate(ds)
    setAddForm((f) => ({ ...f, dueDate: ds }))
    setWeekOffset(calcWeekOffset(today, target))
    setShowMonthPicker(false)
  }

  const getPickerDays = () => {
    const firstDay = new Date(pickerYear, pickerMonth, 1)
    const lastDate = new Date(pickerYear, pickerMonth + 1, 0).getDate()
    const firstDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    const cells: (Date | null)[] = Array(firstDow).fill(null)
    for (let d = 1; d <= lastDate; d++) cells.push(new Date(pickerYear, pickerMonth, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  const turtleMsg =
    progressPct === 100
      ? '오늘 할 일을 다 완료했어요! 대단해요 🎉'
      : dayTodos.length === 0
      ? '작은 실천이 변화를 만들어요'
      : `이번주 미완료한 일 ${dayTodos.length - doneCount}개를 확인해볼까요?`

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* 주간 캘린더 헤더 */}
      <div className="bg-white sticky top-0 z-30">
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <button
            onClick={() => { setPickerYear(displayYear); setPickerMonth(displayMonth - 1); setShowMonthPicker(true) }}
            className="text-[14px] font-bold text-[#1f2024] touch-manipulation"
          >
            {displayYear}년 {displayMonth}월
          </button>
        </div>

        <div className="flex items-center px-2 pb-3">
          <button onClick={() => navigateWeek(-1)} className="p-2 text-[#62ad9e] touch-manipulation flex-shrink-0">
            <ChevronLeft size={18} />
          </button>

          <div
            className="flex-1 flex"
            style={{ transition: 'opacity 0.18s, transform 0.18s', opacity: weekTransitioning ? 0 : 1, transform: weekTransitioning ? `translateX(${slideDir > 0 ? '-8px' : '8px'})` : 'none' }}
          >
            {weekDates.map((date, idx) => {
              const ds = toDateStr(date)
              const isSelected = ds === selectedDate
              const isToday = ds === todayStr
              const hasDot = hasTodoOnDate(ds)
              return (
                <button
                  key={ds}
                  onClick={() => { setSelectedDate(ds); setAddForm((f) => ({ ...f, dueDate: ds })) }}
                  className="flex-1 flex flex-col items-center gap-1 py-1 touch-manipulation"
                >
                  <span className="text-[10px] font-semibold text-[#8f9098] tracking-widest uppercase">
                    {DAY_LABELS_EN[idx]}
                  </span>
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base transition-colors ${
                    isSelected
                      ? 'bg-[#62ad9e] text-white'
                      : isToday
                      ? 'border border-black text-[#494a50]'
                      : 'text-[#494a50]'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${hasDot ? 'bg-[#62ad9e]' : 'bg-transparent'}`} />
                </button>
              )
            })}
          </div>

          <button onClick={() => navigateWeek(1)} className="p-2 text-[#62ad9e] touch-manipulation flex-shrink-0">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="h-px bg-[#e8e9f1] mx-4" />
      </div>

      <main className="flex-1 px-6 pt-4 pb-24">
        {/* 섹션 헤더 */}
        <p className="text-[14px] font-bold text-[#1f2024] mb-4">투두리스트</p>

        {/* 진행률 */}
        {dayTodos.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#71727a] mb-1.5">
              <span>{selectedDate === todayStr ? '오늘' : selectedDate} 진행률</span>
              <span className="font-bold text-[#62ad9e]">{progressPct}%</span>
            </div>
            <div className="h-[21px] bg-[#e8e9f1] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: 'linear-gradient(to right, #284741, #62ad9e)' }} />
            </div>
          </div>
        )}

        {/* 상태 필터 */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {(['all', 'todo', 'done'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-shrink-0 h-8 px-4 rounded-full text-xs font-semibold touch-manipulation transition-colors ${
                filterStatus === s ? 'bg-[#62ad9e] text-white' : 'bg-[#f8f9fe] text-[#71727a]'
              }`}
            >
              {s === 'all' ? '전체' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* 투두 목록 (Action Sheet 스타일) */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-4xl">📋</span>
            <p className="text-sm text-[#71727a] text-center">
              {dayTodos.length === 0 ? '이 날은 할 일이 없어요.' : '해당 상태의 할 일이 없어요.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {filtered.map((todo, idx) => (
              <div key={todo.id}>
                <div className="flex items-center gap-3 px-5 py-4">
                  {/* 체크 원 */}
                  <button
                    onClick={() => changeStatus(todo.id, todo.status === 'done' ? 'todo' : 'done')}
                    className="flex-shrink-0 touch-manipulation"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      todo.status === 'done' ? 'bg-[#62ad9e]' : 'bg-[#c5c6cc]'
                    }`}>
                      {todo.status === 'done' && <span className="text-white text-[9px] font-bold">✓</span>}
                    </div>
                  </button>

                  {/* 텍스트 */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-semibold leading-snug ${
                      todo.status === 'done' ? 'line-through text-[#71727a]' : 'text-[#71727a]'
                    }`}>
                      {todo.content}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#8f9098]">
                        {CATEGORY_ICONS[todo.category]} {CATEGORY_LABELS[todo.category]}
                      </span>
                      {todo.hasNotification && <Bell size={10} className="text-[#62ad9e]" />}
                    </div>
                  </div>

                  {/* 수정/삭제 */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEditModal(todo)} className="text-[10px] font-semibold text-[#62ad9e] bg-[#e0efec] rounded-lg px-2.5 py-1 touch-manipulation">
                      수정
                    </button>
                    <button onClick={() => deleteTodo(todo.id)} className="text-[10px] font-semibold text-[#8f9098] bg-[#f8f9fe] rounded-lg px-2.5 py-1 touch-manipulation">
                      삭제
                    </button>
                  </div>
                </div>
                {idx < filtered.length - 1 && <div className="h-px bg-[#f8f9fe] mx-5" />}
              </div>
            ))}
          </div>
        )}

        {/* 거북이 말풍선 */}
        <div className="mt-6 flex items-end gap-3">
          <div className="relative bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-[#c5c6cc] flex-1 shadow-sm">
            <p className="text-[12px] font-bold text-[#1f2024] mb-0.5">
              {progressPct === 100 ? '모두 완료!' : '작은 실천이 변화를 만들어요'}
            </p>
            <p className="text-[10px] text-[#71727a] leading-relaxed">{turtleMsg}</p>
          </div>
          <img src={pet1} alt="" className="w-16 h-16 object-contain flex-shrink-0" />
        </div>
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-[480px] px-6 pointer-events-none">
        <button onClick={() => setShowAdd(true)} className="pointer-events-auto btn-primary shadow-md gap-2">
          <Plus size={16} /> 투두리스트 추가하기
        </button>
      </div>

      {/* 추가 모달 */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-[480px] mx-auto bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1f2024]">새 할 일 추가</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-[#8f9098]" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input type="text" value={addform.content} onChange={(e) => setAddForm({ ...addform, content: e.target.value })} placeholder="할 일 내용을 입력하세요" autoFocus className="input-field" />
              <div className="grid grid-cols-2 gap-2">
                <select value={addform.category} onChange={(e) => setAddForm({ ...addform, category: e.target.value as Category })} className="input-field text-sm">
                  {ALL_CATS.map((cat) => <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}</option>)}
                </select>
                <select value={addform.priority} onChange={(e) => setAddForm({ ...addform, priority: e.target.value as Priority })} className="input-field text-sm">
                  <option value="high">🔴 높음</option>
                  <option value="medium">🟡 보통</option>
                  <option value="low">⚪ 낮음</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#71727a] mb-1">마감일</label>
                <input type="date" value={addform.dueDate} onChange={(e) => setAddForm({ ...addform, dueDate: e.target.value })} className="input-field" />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-[#1f2024]">알림</span>
                <button onClick={() => setAddForm({ ...addform, hasNotification: !addform.hasNotification })} className={`toggle ${addform.hasNotification ? 'bg-primary' : 'bg-[#c5c6cc]'}`}>
                  <div className={`toggle-knob ${addform.hasNotification ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <button onClick={handleAdd} disabled={!addform.content.trim()} className="btn-primary">추가하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEdit && editingTodo && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowEdit(false); setEditingTodo(null) }} />
          <div className="relative w-full max-w-[480px] mx-auto bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1f2024]">할 일 수정</h3>
              <button onClick={() => { setShowEdit(false); setEditingTodo(null) }}><X size={20} className="text-[#8f9098]" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input type="text" value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} placeholder="할 일 내용을 수정하세요" autoFocus className="input-field" />
              <div className="grid grid-cols-2 gap-2">
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })} className="input-field text-sm">
                  {ALL_CATS.map((cat) => <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}</option>)}
                </select>
                <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })} className="input-field text-sm">
                  <option value="high">🔴 높음</option>
                  <option value="medium">🟡 보통</option>
                  <option value="low">⚪ 낮음</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#71727a] mb-1">마감일</label>
                <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} className="input-field" />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-[#1f2024]">알림</span>
                <button onClick={() => setEditForm({ ...editForm, hasNotification: !editForm.hasNotification })} className={`toggle ${editForm.hasNotification ? 'bg-primary' : 'bg-[#c5c6cc]'}`}>
                  <div className={`toggle-knob ${editForm.hasNotification ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <button onClick={handleEditSave} disabled={!editForm.content.trim()} className="btn-primary">수정 완료</button>
            </div>
          </div>
        </div>
      )}

      {/* 월 피커 */}
      {showMonthPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMonthPicker(false)} />
          <div className="relative w-full max-w-[340px] bg-white rounded-2xl px-4 pt-4 pb-5 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => { if (pickerMonth === 0) { setPickerYear((y) => y - 1); setPickerMonth(11) } else setPickerMonth((m) => m - 1) }} className="p-1.5 text-[#62ad9e] touch-manipulation"><ChevronLeft size={18} /></button>
              <span className="text-sm font-bold text-[#1f2024]">{pickerYear}년 {MONTH_KR[pickerMonth]}</span>
              <button onClick={() => { if (pickerMonth === 11) { setPickerYear((y) => y + 1); setPickerMonth(0) } else setPickerMonth((m) => m + 1) }} className="p-1.5 text-[#62ad9e] touch-manipulation"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS_KR.map((label, idx) => (
                <div key={label} className={`text-center text-[10px] font-medium py-1 ${idx === 5 ? 'text-blue-500' : idx === 6 ? 'text-red-500' : 'text-[#71727a]'}`}>{label}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {getPickerDays().map((date, i) => {
                if (!date) return <div key={`e-${i}`} />
                const ds = toDateStr(date)
                const isSelected = ds === selectedDate
                const isToday = ds === todayStr
                const hasDot = hasTodoOnDate(ds)
                const dow = date.getDay() === 0 ? 6 : date.getDay() - 1
                return (
                  <button key={ds} onClick={() => handlePickerDateSelect(date.getFullYear(), date.getMonth(), date.getDate())} className="flex flex-col items-center py-0.5 touch-manipulation">
                    <div className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-medium transition-colors ${isSelected ? 'bg-[#62ad9e] text-white' : isToday ? 'border border-black text-[#494a50] font-bold' : dow === 5 ? 'text-blue-500' : dow === 6 ? 'text-red-500' : 'text-[#1f2024]'}`}>
                      {date.getDate()}
                    </div>
                    <div className={`w-1 h-1 rounded-full mt-0.5 ${hasDot ? 'bg-[#62ad9e]' : 'bg-transparent'}`} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
