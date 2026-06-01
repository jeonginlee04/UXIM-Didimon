/** YYYY-MM-DD 형식인지 확인 */
export function isDateStr(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

/**
 * 날짜 표시 포맷
 * - "2026-01-02" → "26.01.02"
 * - "상시", "연중" 등 텍스트 → 그대로 반환
 * - 빈 문자열 → ""
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  if (isDateStr(dateStr)) {
    return dateStr.slice(2).replace(/-/g, '.')
  }
  return dateStr
}

/**
 * 시작~종료 날짜 범위 표시
 * - 둘 다 날짜: "26.01.02 ~ 26.12.31"
 * - 종료가 텍스트: "26.05.26 ~ 연중"
 * - 시작이 없고 종료가 텍스트: "상시"
 */
export function formatDateRange(start: string, end: string): string {
  const s = formatDate(start)
  const e = formatDate(end)
  if (!s && !e) return ''
  if (!s) return e
  if (!e) return s
  return `${s} ~ ${e}`
}

interface DDayResult {
  label: string
  urgent: boolean
  expired: boolean
}

/**
 * D-day 계산
 * - 유효한 날짜: D-숫자, D-Day, 마감
 * - 텍스트 날짜(상시 등): 해당 텍스트 그대로
 * - 빈 문자열: "상시"
 */
export function getDDay(endDate: string): DDayResult {
  if (!endDate || !isDateStr(endDate)) {
    return { label: endDate || '상시', urgent: false, expired: false }
  }
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  if (diff < 0)  return { label: '마감',       urgent: false, expired: true }
  if (diff === 0) return { label: 'D-Day',     urgent: true,  expired: false }
  if (diff <= 7)  return { label: `D-${diff}`, urgent: true,  expired: false }
  return            { label: `D-${diff}`,      urgent: false, expired: false }
}
