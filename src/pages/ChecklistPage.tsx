import { useState, useEffect } from 'react'
import { Plus, X, Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import BottomNav from '../components/common/BottomNav'
import pet1 from '../assets/pet1.png'
import { useTodoStore } from '../store/todoStore'
import { CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS } from '../types'
import type { Category, TodoStatus, Priority } from '../types'

const ALL_CATS: Category[] = [
  "finance",
  "housing",
  "employment",
  "education",
  "culture",
];

function getWeekDates(from: Date): Date[] {
  const monday = new Date(from);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function calcWeekOffset(today: Date, target: Date): number {
  const getMonday = (d: Date) => {
    const m = new Date(d)
    const day = m.getDay()
    m.setDate(m.getDate() + (day === 0 ? -6 : 1 - day))
    m.setHours(0, 0, 0, 0)
    return m
  }
  const diffMs = getMonday(target).getTime() - getMonday(today).getTime()
  return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']
const MONTH_KR = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function toDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

interface TodoForm {
  content: string
  category: Category
  dueDate: string
  priority: Priority
  hasNotification: boolean
}

const defaultForm: TodoForm = {
  content: '',
  category: 'finance',
  dueDate: '',
  priority: 'medium',
  hasNotification: false,
};

export default function ChecklistPage() {
  const { todos, addTodo, changeStatus, deleteTodo, updateTodo } = useTodoStore()

  const [searchParams] = useSearchParams();
  const prefilledContent = searchParams.get("content") ?? "";
  const prefilledCategory = (searchParams.get("category") ??
    "finance") as Category;

  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(toDateStr(today))
  const [filterStatus, setFilterStatus] = useState<TodoStatus | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [addform, setAddForm] = useState<TodoForm>({ ...defaultForm, dueDate: selectedDate, })

  useEffect(() => {
    if (prefilledContent) {
      setAddForm({
        ...defaultForm,
        content: prefilledContent,
        category: prefilledCategory,
        dueDate: toDateStr(today),
      });
      setShowAdd(true);
    }
  }, []);

  const [weekOffset, setWeekOffset] = useState(0)
  const [weekTransitioning, setWeekTransitioning] = useState(false)
  const [slideDir, setSlideDir] = useState<1 | -1>(1)

  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(today.getFullYear())
  const [pickerMonth, setPickerMonth] = useState(today.getMonth())

  const todayStr = toDateStr(today)

  const baseDate = new Date(today)
  baseDate.setDate(today.getDate() + weekOffset * 7)
  const weekDates = getWeekDates(baseDate)
  const displayYear = weekDates[0].getFullYear()
  const displayMonth = weekDates[0].getMonth() + 1

  const dayTodos = todos.filter((t) => t.dueDate === selectedDate)
  const filtered = filterStatus === 'all'
    ? dayTodos
    : dayTodos.filter((t) => t.status === filterStatus)

  const [showEdit, setShowEdit] = useState(false);
  const [editingTodo, setEditingTodo] = useState<(typeof todos)[number] | null>(
    null,
  );
  const [editForm, setEditForm] = useState<TodoForm>({ ...defaultForm });

  // 로드맵에서 넘어온 경우 자동으로 모달 열기
  useEffect(() => {
    if (prefilledContent) {
      setAddForm({
        ...defaultForm,
        content: prefilledContent,
        category: prefilledCategory,
        dueDate: toDateStr(today),
      });
      setShowAdd(true);
    }
  }, []);

  const doneCount = dayTodos.filter((t) => t.status === "done").length;
  const progressPct =
    dayTodos.length > 0 ? Math.round((doneCount / dayTodos.length) * 100) : 0;

  const navigateWeek = (dir: 1 | -1) => {
    if (weekTransitioning) return
    setSlideDir(dir)
    setWeekTransitioning(true)
    setTimeout(() => {
      setWeekOffset((prev) => prev + dir)
      setWeekTransitioning(false)
    }, 180)
  }

  const hasTodoOnDate = (dateStr: string) =>
    todos.some((t) => t.dueDate === dateStr);

  const handleAdd = () => {
    if (!addform.content.trim()) return;

    addTodo({
      content: addform.content.trim(),
      category: addform.category,
      dueDate: addform.dueDate || selectedDate,
      status: "todo",
      priority: addform.priority,
      hasNotification: addform.hasNotification,
    });

    setAddForm({ ...defaultForm, dueDate: selectedDate });
    setShowAdd(false);
  };

  const openEditModal = (todo: (typeof todos)[number]) => {
    setEditingTodo(todo);
    setEditForm({
      content: todo.content,
      category: todo.category,
      dueDate: todo.dueDate ?? selectedDate,
      priority: todo.priority,
      hasNotification: todo.hasNotification,
    });
    setShowEdit(true);
  };

  const handleEditSave = () => {
    if (!editingTodo) return;
    if (!editForm.content.trim()) return;

    updateTodo(editingTodo.id, {
      content: editForm.content.trim(),
      category: editForm.category,
      dueDate: editForm.dueDate,
      priority: editForm.priority,
      hasNotification: editForm.hasNotification,
    });

    setShowEdit(false);
    setEditingTodo(null);
  };
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

  const statusColors: Record<TodoStatus, string> = {
    todo: "bg-bg-subtle text-text-subtle",
    done: "bg-success-light text-success-text",
  };

  const turtleMsg =
    progressPct === 100
      ? "오늘 할 일을 다 완료했어요! 대단해요 🎉"
      : dayTodos.length === 0
        ? "오늘은 예정된 할 일이 없어요. 추가해볼까요?"
        : `오늘 ${dayTodos.length}개 중 ${doneCount}개 완료했어요. 화이팅!`;

  return (
    <div className="min-h-screen flex flex-col bg-bg-page pb-20">
      {/* Week calendar */}
      <div className="bg-white border-b border-border-light px-4 pt-6 pb-3 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-bold text-text-basic">할일</h1>
          <button
            onClick={() => {
              setPickerYear(displayYear)
              setPickerMonth(displayMonth - 1)
              setShowMonthPicker(true)
            }}
            className="text-xs font-bold text-primary cursor-pointer hover:opacity-70 transition-opacity"
          >
            {displayYear}년 {displayMonth}월
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1 flex-shrink-0 text-primary hover:opacity-70 transition-opacity touch-manipulation"
            aria-label="이전 주"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            className="flex-1 grid grid-cols-7 gap-1"
            style={{
              transition: 'opacity 0.18s ease, transform 0.18s ease',
              opacity: weekTransitioning ? 0 : 1,
              transform: weekTransitioning
                ? `translateX(${slideDir > 0 ? '-10px' : '10px'})`
                : 'translateX(0)',
            }}
          >
            {weekDates.map((date, idx) => {
              const ds = toDateStr(date)
              const isSelected = ds === selectedDate
              const isToday = ds === todayStr
              const hasDot = hasTodoOnDate(ds)
              return (
                <button
                  key={ds}
                  onClick={() => {
                    setSelectedDate(ds)
                    setAddForm((f) => ({ ...f, dueDate: ds }))
                  }}
                  className="flex flex-col items-center gap-1 touch-manipulation py-1"
                >
                  <span className={`text-[10px] font-medium ${
                    idx === 5 ? 'text-blue-500' : idx === 6 ? 'text-danger' : 'text-text-subtle'
                  }`}>
                    {DAY_LABELS[idx]}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : isToday
                      ? 'bg-primary-light text-primary'
                      : 'text-text-basic'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${hasDot ? 'bg-primary' : 'bg-transparent'}`} />
                </button>
              )
            })}
          </div>

          <button
            onClick={() => navigateWeek(1)}
            className="p-1 flex-shrink-0 text-primary hover:opacity-70 transition-opacity touch-manipulation"
            aria-label="다음 주"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 py-4">
        <div className="flex items-end gap-3 mb-4">
          <img
            src={pet1}
            alt=""
            className="w-14 h-14 object-contain flex-shrink-0"
          />
          <div className="relative bg-white rounded-2xl rounded-bl-none px-4 py-2.5 border border-border-light flex-1 shadow-sm">
            <p className="text-xs text-text-subtle leading-relaxed">
              {turtleMsg}
            </p>
          </div>
        </div>

        {dayTodos.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-text-subtle mb-1.5">
              <span>
                {selectedDate === todayStr ? "오늘" : selectedDate} 진행률
              </span>
              <span className="font-bold text-primary">{progressPct}%</span>
            </div>
            <div className="h-2 bg-bg-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          {(["all", "todo", "done"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`chip whitespace-nowrap ${filterStatus === s ? "active" : ""}`}
            >
              {s === "all" ? "전체" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-4xl">📋</span>
            <p className="text-sm text-text-subtle text-center">
              {dayTodos.length === 0
                ? "이 날은 할 일이 없어요."
                : "해당 상태의 할 일이 없어요."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((todo) => (
              <div key={todo.id} className="card-bordered p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      changeStatus(
                        todo.id,
                        todo.status === "done" ? "todo" : "done",
                      )
                    }
                    className="mt-0.5 flex-shrink-0 touch-manipulation"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        todo.status === "done"
                          ? "bg-primary border-primary"
                          : "border-border-default"
                      }`}
                    >
                      {todo.status === "done" && (
                        <span className="text-white text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-snug mb-1 ${
                        todo.status === "done"
                          ? "line-through text-text-disabled"
                          : "text-text-basic"
                      }`}
                    >
                      {todo.content}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[todo.status]}`}>
                        {STATUS_LABELS[todo.status]}
                      </span>

                      <span className="text-[10px] text-text-disabled">
                        {CATEGORY_ICONS[todo.category]}{" "}
                        {CATEGORY_LABELS[todo.category]}
                      </span>

                      {todo.hasNotification && (
                        <Bell size={11} className="text-primary" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-3">
                  <button
                    onClick={() => openEditModal(todo)}
                    className="flex-1 py-1 rounded-lg text-[11px] font-medium bg-primary text-white touch-manipulation"
                  >
                    수정
                  </button>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-1 py-1 rounded-lg text-[11px] font-medium bg-bg-subtle text-danger touch-manipulation"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pointer-events-none">
        <button
          onClick={() => setShowAdd(true)}
          className="pointer-events-auto w-full btn-primary shadow-md"
        >
          <Plus size={16} className="mr-1" /> 투두리스트 추가하기
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAdd(false)}
          />

          <div className="relative w-full max-w-[480px] mx-auto bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-basic">새 할 일 추가</h3>
              <button onClick={() => setShowAdd(false)}>
                <X size={20} className="text-text-disabled" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={addform.content}
                onChange={(e) => setAddForm({ ...addform, content: e.target.value })}
                placeholder="할 일 내용을 입력하세요"
                autoFocus
                className="input-field"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={addform.category}
                  onChange={(e) => setAddForm({ ...addform, category: e.target.value as Category })}
                  className="input-field text-sm"
                >
                  {ALL_CATS.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>

                <select
                  value={addform.priority}
                  onChange={(e) => setAddForm({ ...addform, priority: e.target.value as Priority })}
                  className="input-field text-sm"
                >
                  <option value="high">🔴 높음</option>
                  <option value="medium">🟡 보통</option>
                  <option value="low">⚪ 낮음</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-text-subtle mb-1">
                  마감일
                </label>
                <input
                  type="date"
                  value={addform.dueDate}
                  onChange={(e) => setAddForm({ ...addform, dueDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-text-basic">알림</span>
                <button
                  onClick={() => setAddForm({ ...addform, hasNotification: !addform.hasNotification })}
                  className={`toggle ${addform.hasNotification ? 'bg-primary' : 'bg-border-default'}`}
                >
                  <div className={`toggle-knob ${addform.hasNotification ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <button onClick={handleAdd} disabled={!addform.content.trim()} className="btn-primary">
                추가하기
              </button>
            </div>
          </div>
        </div>
        
      )}
      {showEdit && editingTodo && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowEdit(false);
              setEditingTodo(null);
            }}
          />

          <div className="relative w-full max-w-[480px] mx-auto bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-basic">할 일 수정</h3>
              <button
                onClick={() => {
                  setShowEdit(false);
                  setEditingTodo(null);
                }}
              >
                <X size={20} className="text-text-disabled" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                placeholder="할 일 내용을 수정하세요"
                autoFocus
                className="input-field"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      category: e.target.value as Category,
                    })
                  }
                  className="input-field text-sm"
                >
                  {ALL_CATS.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>

                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      priority: e.target.value as Priority,
                    })
                  }
                  className="input-field text-sm"
                >
                  <option value="high">🔴 높음</option>
                  <option value="medium">🟡 보통</option>
                  <option value="low">⚪ 낮음</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-text-subtle mb-1">
                  마감일
                </label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dueDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-text-basic">알림</span>
                <button
                  onClick={() =>
                    setEditForm({
                      ...editForm,
                      hasNotification: !editForm.hasNotification,
                    })
                  }
                  className={`toggle ${editForm.hasNotification ? "bg-primary" : "bg-border-default"}`}
                >
                  <div
                    className={`toggle-knob ${
                      editForm.hasNotification
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleEditSave}
                disabled={!editForm.content.trim()}
                className="btn-primary"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Month Picker popup */}
      {showMonthPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMonthPicker(false)} />
          <div className="relative w-full max-w-[340px] bg-white rounded-2xl px-4 pt-4 pb-5 shadow-xl animate-slide-up">
            {/* Picker header */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => {
                  if (pickerMonth === 0) { setPickerYear((y) => y - 1); setPickerMonth(11) }
                  else setPickerMonth((m) => m - 1)
                }}
                className="p-1.5 text-primary hover:opacity-70 transition-opacity touch-manipulation"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-bold text-text-basic">
                {pickerYear}년 {MONTH_KR[pickerMonth]}
              </span>
              <button
                onClick={() => {
                  if (pickerMonth === 11) { setPickerYear((y) => y + 1); setPickerMonth(0) }
                  else setPickerMonth((m) => m + 1)
                }}
                className="p-1.5 text-primary hover:opacity-70 transition-opacity touch-manipulation"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day-of-week header */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((label, idx) => (
                <div
                  key={label}
                  className={`text-center text-[10px] font-medium py-1 ${
                    idx === 5 ? 'text-blue-500' : idx === 6 ? 'text-danger' : 'text-text-subtle'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {getPickerDays().map((date, i) => {
                if (!date) return <div key={`empty-${i}`} />
                const ds = toDateStr(date)
                const isSelected = ds === selectedDate
                const isToday = ds === todayStr
                const hasDot = hasTodoOnDate(ds)
                const dow = date.getDay() === 0 ? 6 : date.getDay() - 1
                return (
                  <button
                    key={ds}
                    onClick={() => handlePickerDateSelect(date.getFullYear(), date.getMonth(), date.getDate())}
                    className="flex flex-col items-center py-0.5 touch-manipulation"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-white'
                        : isToday
                        ? 'bg-primary-light text-primary font-bold'
                        : dow === 5
                        ? 'text-blue-500'
                        : dow === 6
                        ? 'text-danger'
                        : 'text-text-basic'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className={`w-1 h-1 rounded-full mt-0.5 ${hasDot ? 'bg-primary' : 'bg-transparent'}`} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showEdit && editingTodo && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowEdit(false);
              setEditingTodo(null);
            }}
          />

          <div className="relative w-full max-w-[480px] mx-auto bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-basic">할 일 수정</h3>
              <button
                onClick={() => {
                  setShowEdit(false);
                  setEditingTodo(null);
                }}
              >
                <X size={20} className="text-text-disabled" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                placeholder="할 일 내용을 수정하세요"
                autoFocus
                className="input-field"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      category: e.target.value as Category,
                    })
                  }
                  className="input-field text-sm"
                >
                  {ALL_CATS.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>

                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      priority: e.target.value as Priority,
                    })
                  }
                  className="input-field text-sm"
                >
                  <option value="high">🔴 높음</option>
                  <option value="medium">🟡 보통</option>
                  <option value="low">⚪ 낮음</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-text-subtle mb-1">
                  마감일
                </label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dueDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-text-basic">알림</span>
                <button
                  onClick={() =>
                    setEditForm({
                      ...editForm,
                      hasNotification: !editForm.hasNotification,
                    })
                  }
                  className={`toggle ${editForm.hasNotification ? "bg-primary" : "bg-border-default"}`}
                >
                  <div
                    className={`toggle-knob ${
                      editForm.hasNotification
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleEditSave}
                disabled={!editForm.content.trim()}
                className="btn-primary"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
