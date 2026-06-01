import type { Announcement, Category } from '../types'

const SERVER_URL = ''

/** 온통청년 lclsfNm/mclsfNm → 필터 옵션과 매핑되는 benefitType으로 정규화 */
function normalizeBenefitType(raw: string): string {
  const t = (raw || '').trim()
  if (!t) return '청년지원'
  if (/일자리|취업|고용|직업/.test(t)) return '취업 지원'
  if (/주거|임대|전세|주택/.test(t))   return '주거 지원'
  if (/교육|학업|장학|훈련/.test(t))   return '학비 지원'
  if (/금융|저축|대출|수당|현금/.test(t)) return '현금 지원'
  if (/복지|문화|생활/.test(t))        return '서비스 지원'
  return t
}

function guessCategory(text: string): Category {
  const t = (text || '').toLowerCase()
  if (/주거|임대|전세|월세|주택|housing/.test(t)) return 'housing'
  if (/취업|고용|직업|일자리|채용|구직|알바/.test(t)) return 'employment'
  if (/장학|교육|학업|학비|훈련|학교|공부/.test(t)) return 'education'
  if (/금융|저축|대출|수당|지원금|현금|통장|적금|기본소득/.test(t)) return 'finance'
  return 'culture'
}

/** 보조금/복지/주거 등 일반 API용 — 날짜 없으면 기본값 반환 */
function toDateStr(raw?: string): string {
  if (!raw) return '2026-12-31'
  const m = raw.match(/(\d{4})[-.\s/]?(\d{1,2})[-.\s/]?(\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  return '2026-12-31'
}

/** 온통청년 API 전용 — YYYYMMDD 8자리 숫자이면 YYYY-MM-DD 반환, 공백/비정상이면 '' */
function parseYouthYmd(raw: string): string {
  const t = raw.trim()
  if (/^\d{8}$/.test(t)) return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`
  return ''
}

/**
 * 온통청년 사업 기간 파싱
 * - 날짜가 유효(8자리)하면 YYYY-MM-DD 반환
 * - 날짜가 공백/비어있으면 etc 텍스트(상시/연중/5년간…) 반환
 */
function parseYouthPeriod(
  bgndYmd: string,
  endYmd: string,
  etcCn: string,
): { startDate: string; endDate: string } {
  const etc = etcCn.trim()
  const start = parseYouthYmd(bgndYmd)
  const end   = parseYouthYmd(endYmd)
  return {
    startDate: start,
    endDate:   end || (etc || '상시'),   // 날짜 없으면 etc 텍스트
  }
}

type ItemMap = Record<string, unknown>

function extractItems(data: unknown): ItemMap[] {
  if (!data || typeof data !== 'object') return []
  if (Array.isArray(data)) return data as ItemMap[]
  const d = data as ItemMap
  // ✅ 온통청년 신규 API: { resultCode, result: { youthPolicyList: [...] } }
  if (d.result && typeof d.result === 'object') {
    const result = d.result as ItemMap
    if (Array.isArray(result.youthPolicyList)) return result.youthPolicyList as ItemMap[]
  }
  // data.go.kr v2 format: { data: [...] }
  if (Array.isArray(d.data)) return d.data as ItemMap[]
  // data.go.kr XML→JSON format: { response: { body: { items: { item: [...] } } } }
  const body = (d.response as ItemMap)?.body as ItemMap | undefined
  if (body) {
    const items = body.items as ItemMap | undefined
    if (Array.isArray(items?.item)) return items!.item as ItemMap[]
    if (items?.item && typeof items.item === 'object') return [items.item as ItemMap]
  }
  // 온통청년 구 API fallback
  if (Array.isArray(d.youthPolicyList)) return d.youthPolicyList as ItemMap[]
  return []
}

function s(item: ItemMap, ...keys: string[]): string {
  for (const k of keys) {
    const v = item[k]
    if (v != null && String(v).trim()) return String(v).trim()
  }
  return ''
}

export async function fetchAllAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${SERVER_URL}/api/announcements`, {
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error('서버 오류')
  const raw = (await res.json()) as ItemMap

  const results: Announcement[] = []

  // 보조금24
  extractItems(raw.subsidy).forEach((item, i) => {
    const title = s(item, 'svcNm', '서비스명', 'bizNm')
    if (!title) return
    results.push({
      id: `subsidy-${s(item, 'svcId') || i}`,
      title,
      organization: s(item, 'jurMnofNm', '소관기관명', '주관기관명', '기관명') || '보조금24',
      category: guessCategory(title),
      region: s(item, '지역', 'areaNm') || '전국',
      benefitType: s(item, 'srvTypNm', '서비스유형', 'bizTypNm') || '현금 지원',
      startDate: toDateStr(s(item, 'aplySttsDe', '신청시작일', 'strtDt')),
      endDate: toDateStr(s(item, 'applyDdlnDe', '신청마감일', 'endDt')),
      description: s(item, '지원내용', 'ctPfmCn', 'svcofrTelno'),
      tags: ['보조금24'],
      bookmarkCount: 0,
      isBookmarked: false,
      targetAge: s(item, '지원대상', 'trgtNm') || undefined,
      amount: s(item, '지원금액', 'sprtAmt') || undefined,
    })
  })

  // 중앙부처 복지서비스
  extractItems(raw.central).forEach((item, i) => {
    const title = s(item, '서비스명', 'svcNm')
    if (!title) return
    results.push({
      id: `central-${s(item, '서비스ID', 'svcId') || i}`,
      title,
      organization: s(item, '소관기관명', '주관기관명', 'jurMnofNm') || '복지부',
      category: guessCategory(title),
      region: s(item, '지역', 'areaNm') || '전국',
      benefitType: s(item, '서비스유형', 'srvTypNm') || '복지서비스',
      startDate: toDateStr(s(item, '신청기간시작일', 'aplySttsDe')),
      endDate: toDateStr(s(item, '신청기간종료일', '신청기한', 'applyDdlnDe')),
      description: s(item, '서비스목적요약', '지원내용'),
      tags: ['중앙복지'],
      bookmarkCount: 0,
      isBookmarked: false,
      targetAge: s(item, '지원대상', '신청자격') || undefined,
      amount: s(item, '지원금액') || undefined,
    })
  })

  // 지자체 복지서비스
  extractItems(raw.local).forEach((item, i) => {
    const title = s(item, '서비스명', 'svcNm')
    if (!title) return
    const region = s(item, '광역시도명', '지역', 'areaNm') || '전국'
    results.push({
      id: `local-${s(item, '서비스ID', 'svcId') || i}`,
      title,
      organization: s(item, '소관기관명', '지자체명', '기관명') || region,
      category: guessCategory(title),
      region,
      benefitType: s(item, '서비스유형', 'srvTypNm') || '복지서비스',
      startDate: toDateStr(s(item, '신청기간시작일', 'aplySttsDe')),
      endDate: toDateStr(s(item, '신청기간종료일', '신청기한', 'applyDdlnDe')),
      description: s(item, '서비스목적요약', '지원내용'),
      tags: ['지자체복지'],
      bookmarkCount: 0,
      isBookmarked: false,
      targetAge: s(item, '지원대상', '신청자격') || undefined,
      amount: s(item, '지원금액') || undefined,
    })
  })

  // 공공임대주택
  extractItems(raw.housing).forEach((item, i) => {
    const title = s(item, '공고명', '주택명', 'houseNm', 'pblancNm')
    if (!title) return
    results.push({
      id: `housing-${s(item, '공고번호', 'pblancNo') || i}`,
      title,
      organization: s(item, '공급기관', '기관명', 'suplyInsttNm') || 'LH',
      category: 'housing',
      region: s(item, '공급지역', '지역', 'suplyAreaNm') || '전국',
      benefitType: '주거 지원',
      startDate: toDateStr(s(item, '모집시작일', '신청시작일', 'rcptBgnDe')),
      endDate: toDateStr(s(item, '모집종료일', '신청종료일', 'rcptEndDe')),
      description: s(item, '공고내용', 'pblancCn'),
      tags: ['공공임대', '주거'],
      bookmarkCount: 0,
      isBookmarked: false,
      targetAge: s(item, '입주자격') || undefined,
      amount: s(item, '임대보증금', '임대료') || undefined,
    })
  })

  // 청년정책 — 온통청년 신규 API 필드명 기준
  extractItems(raw.youth).forEach((item, i) => {
    const title = s(item, 'plcyNm')
    if (!title) return

    const lclsf      = s(item, 'lclsfNm')
    const mclsf      = s(item, 'mclsfNm')
    const explnCn    = s(item, 'plcyExplnCn')
    const sprtCn     = s(item, 'plcySprtCn')
    const aplyMthdCn = s(item, 'plcyAplyMthdCn')
    const kywdNm     = s(item, 'plcyKywdNm')
    const aplyUrl    = s(item, 'aplyUrlAddr')
    const refUrl1    = s(item, 'refUrlAddr1')
    const refUrl2    = s(item, 'refUrlAddr2')
    const ageInfo    = s(item, 'ageInfo', 'ageLmtEndVal')
    const sprtCash   = s(item, 'sprtCn', 'sprtCash')
    const region     = s(item, 'rgnNm') || '전국'

    // 지원 대상 나이 정보 조합
    const ageMin = s(item, 'ageLmtBgngVal')
    const ageMax = s(item, 'ageLmtEndVal')
    const targetAge = ageMin && ageMax
      ? `만 ${ageMin}~${ageMax}세`
      : ageInfo || undefined

    // 지원 금액/내용 요약
    const amount = sprtCash || s(item, 'sprtAmt') || undefined

    const descParts = [
      explnCn,
      sprtCn     && `■ 지원 내용\n${sprtCn}`,
      aplyMthdCn && `■ 신청 방법\n${aplyMthdCn}`,
    ].filter(Boolean)

    const { startDate, endDate } = parseYouthPeriod(
      s(item, 'bizPrdBgngYmd'),
      s(item, 'bizPrdEndYmd'),
      s(item, 'bizPrdEtcCn'),
    )

    // 키워드 문자열을 개별 태그로 분리 (쉼표/공백 구분)
    const kwdTags = kywdNm
      ? kywdNm.split(/[,，\s]+/).map((k: string) => k.trim()).filter((k: string) => k.length > 0)
      : []

    // benefitType: 필터 옵션과 매핑되는 값으로 정규화
    const rawBenefit = mclsf || lclsf || ''
    const benefitType = normalizeBenefitType(rawBenefit)

    results.push({
      id: `youth-${s(item, 'plcyNo') || i}`,
      title,
      organization: s(item, 'sprvsnInstCdNm', 'operInstCdNm') || '온통청년',
      category: guessCategory(`${lclsf} ${mclsf} ${title}`),
      region,
      benefitType,
      startDate,
      endDate,
      description: descParts.join('\n\n'),
      tags: ['청년정책', lclsf, mclsf, ...kwdTags].filter(
        (t, idx, arr) => !!t && arr.indexOf(t) === idx  // 중복 제거
      ),
      bookmarkCount: 0,
      isBookmarked: false,
      targetAge,
      amount,
      keyword: kywdNm || undefined,
      detailUrl: aplyUrl || undefined,
      refUrl1: refUrl1 || undefined,
      refUrl2: refUrl2 || undefined,
    })
  })

  return results
}
