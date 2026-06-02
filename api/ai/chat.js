import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL   = process.env.SUPABASE_URL;
const SUPABASE_KEY   = process.env.SUPABASE_KEY;
const YOUTH_KEY      = process.env.YOUTH_KEY || "54e72035-7ec7-4803-948a-c8d1a60cca5f";
const API_TIMEOUT    = 5000;

let _gemini   = null;
let _supabase = null;

function getGemini() {
  if (!_gemini) {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    _gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return _gemini;
}

function getSupabase() {
  if (!_supabase) {
    if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("SUPABASE_URL 또는 SUPABASE_KEY 없음");
    _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

function isValidJson(data) {
  if (data === null || data === undefined) return false;
  if (typeof data === "string" && data.trim().startsWith("<")) return false;
  return true;
}

async function callApi(url, params) {
  try {
    const response = await axios.get(url, { params, timeout: API_TIMEOUT });
    return isValidJson(response.data) ? response.data : null;
  } catch (err) {
    console.error(`API 오류 [${url}]:`, err.message);
    return null;
  }
}

// 채팅 의도 감지
function detectIntent(question) {
  if (/공고|정책|프로그램|사업|지원 사업|어떤.*지원|찾아|검색|알려줘|있어/.test(question)) return "policy_search";
  if (/어떻게|방법|절차|순서|단계|하려면|신청 방법|하는 법/.test(question)) return "procedure";
  if (/힘들|걱정|불안|무서|모르겠|어렵|외로|우울/.test(question)) return "emotional";
  return "general";
}

function extractKeywords(text) {
  return text
    .split(/[\s,.!?]+/)
    .map((w) => w.replace(/[은는이가을를에서으로도의와과]+$/, ""))
    .filter((w) => w.length > 1 && !["있어", "해줘", "알려", "주세요", "어떤", "하나", "추천", "뭐가", "뭐야", "관련", "지원"].includes(w));
}

function getCategoryFromQuestion(question) {
  if (/주거|임대|전세|월세|주택|집/.test(question))          return "주거";
  if (/취업|일자리|고용|채용|구직|알바/.test(question))        return "일자리";
  if (/교육|학업|장학|학비|훈련|자격증/.test(question))       return "교육";
  if (/금융|저축|대출|수당|지원금|현금|통장/.test(question))   return "금융";
  if (/건강|병원|의료|보험|정신|심리/.test(question))          return "복지문화";
  return "";
}

function mapYouthCategory(lclsfNm = "") {
  if (lclsfNm.includes("일자리")) return "employment";
  if (lclsfNm.includes("주거"))   return "housing";
  if (lclsfNm.includes("교육"))   return "education";
  if (lclsfNm.includes("금융"))   return "finance";
  return "culture";
}

function formatDate(ymd = "") {
  const t = ymd.trim();
  return t.length === 8 ? `${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}` : (t || "");
}

function policyToDoc(policy) {
  const parts = [
    policy.plcyExplnCn,
    policy.plcySprtCn     && `■ 지원 내용\n${policy.plcySprtCn}`,
    policy.plcyAplyMthdCn && `■ 신청 방법\n${policy.plcyAplyMthdCn}`,
  ].filter(Boolean);
  return {
    content:  parts.join("\n\n") || policy.plcyNm,
    category: mapYouthCategory(policy.lclsfNm),
    metadata: {
      title:    policy.plcyNm,
      source:   policy.sprvsnInstCdNm || "온통청년",
      date:     formatDate(policy.bizPrdBgngYmd),
      end_date: formatDate(policy.bizPrdEndYmd) || policy.bizPrdEtcCn || "",
      keywords: policy.plcyKywdNm || "",
      url:      policy.refUrlAddr1 || "",
    },
  };
}

function policyToCard(policy) {
  return {
    id:           policy.plcyNo || `youth-${Date.now()}-${Math.random()}`,
    title:        policy.plcyNm || "정책 정보",
    organization: policy.sprvsnInstCdNm || "온통청년",
    category:     mapYouthCategory(policy.lclsfNm),
    region:       policy.spotNm || "전국",
    benefitType:  policy.lclsfNm || "",
    startDate:    formatDate(policy.bizPrdBgngYmd),
    endDate:      formatDate(policy.bizPrdEndYmd) || policy.bizPrdEtcCn || "",
    description:  (policy.plcyExplnCn || "").slice(0, 200),
    tags:         (policy.plcyKywdNm || "").split(/[,\s]+/).filter(Boolean).slice(0, 4),
    bookmarkCount: 0,
    isBookmarked:  false,
    targetAge:    policy.ageNmCn || "",
    amount:       policy.plcySprtCn ? policy.plcySprtCn.slice(0, 50) : "",
    refUrl1:      policy.refUrlAddr1 || "",
    refUrl2:      policy.refUrlAddr2 || "",
  };
}

async function embedQuestion(question) {
  const model = getGemini().getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent({
    content: { parts: [{ text: question }], role: "user" },
    taskType: "RETRIEVAL_QUERY",
  });
  return result.embedding.values;
}

async function searchByVector(embedding, userCategory) {
  const supabase = getSupabase();
  const filterCategory = userCategory?.length === 1 ? userCategory[0] : null;

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0.35,
    match_count: 5,
    filter_category: filterCategory,
  });
  if (error) throw new Error(`Supabase: ${error.message}`);

  if (filterCategory && (!data || data.length < 2)) {
    const { data: fb, error: fbErr } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: 0.35,
      match_count: 5,
      filter_category: null,
    });
    if (fbErr) throw new Error(`Supabase fallback: ${fbErr.message}`);
    const seen = new Set((data || []).map((d) => d.id));
    const merged = [...(data || [])];
    for (const doc of fb || []) {
      if (!seen.has(doc.id)) merged.push(doc);
      if (merged.length >= 5) break;
    }
    return merged;
  }
  return data || [];
}

async function searchByKeyword(question) {
  const data = await callApi("https://www.youthcenter.go.kr/go/ythip/getPlcy", {
    apiKeyNm: YOUTH_KEY, pageNum: 1, pageSize: 30, rtnType: "json",
  });

  const list = data?.result?.youthPolicyList;
  if (!list?.length) return { docs: [], cards: [] };

  const keywords = extractKeywords(question);
  const catHint  = getCategoryFromQuestion(question);

  const scored = list.map((p) => {
    const text = [p.plcyNm, p.plcyExplnCn, p.plcyKywdNm, p.lclsfNm, p.mclsfNm, p.plcySprtCn]
      .filter(Boolean).join(" ");
    let score = keywords.reduce((s, w) => s + (text.includes(w) ? 2 : 0), 0);
    if (catHint && p.lclsfNm?.includes(catHint)) score += 3;
    return { p, score };
  });

  const top = scored.sort((a, b) => b.score - a.score).slice(0, 5);
  return {
    docs:  top.map((x) => policyToDoc(x.p)),
    cards: top.map((x) => policyToCard(x.p)),
  };
}

const CHAT_SYSTEM_PROMPT = `
너는 '디딤온'의 AI 도우미 '디디몬'이야. 보호종료 자립준비청년(18~29세)의 자립을 따뜻하게 돕는 역할을 해.

[답변 원칙]
1. 반드시 아래에 제공된 [참고 문서] 내용만을 근거로 답변해.
2. 문서에 없는 정보는 절대 만들어내지 말고, "현재 제공된 정보에서는 찾을 수 없어요. 관련 기관에 직접 문의해보는 걸 추천해요 😊"라고 안내해.
3. 지원사업을 안내할 때는:
   - 지원 대상 (누가 받을 수 있는지)
   - 지원 내용 (얼마나, 어떤 혜택인지)
   - 신청 방법 (어디서, 어떻게 신청하는지)
   - 마감일 또는 신청 기간 (있다면)
4. 말투는 따뜻하고 친근하게. 대화하듯 자연스럽게.
5. 답변은 200~400자 내외로. 필요하면 ■ 또는 • 로 구조화해줘.
6. 감정적 어려움을 표현할 때는 먼저 공감하고, 도움받을 수 있는 자원을 안내해줘.
7. 마지막에는 격려 문구를 자연스럽게 붙여줘.
`.trim();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, userCategory = [] } = req.body ?? {};

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "question 필드가 필요합니다." });
  }

  const q = question.trim();
  const intent = detectIntent(q);

  try {
    let docs  = [];
    let cards = [];
    let searchMode = "api";

    if (GEMINI_API_KEY && SUPABASE_URL && SUPABASE_KEY) {
      try {
        const embedding = await embedQuestion(q);
        docs = await searchByVector(embedding, userCategory);
        if (docs.length > 0) searchMode = "vector";
      } catch (vecErr) {
        console.warn(`[ai/chat] 벡터 검색 실패 → 키워드 검색으로 전환:`, vecErr.message);
      }
    }

    if (docs.length === 0) {
      const result = await searchByKeyword(q);
      docs  = result.docs;
      cards = result.cards;
    }

    if (intent === "policy_search" && cards.length === 0) {
      const result = await searchByKeyword(q);
      cards = result.cards;
    }

    console.log(`[ai/chat] intent=${intent} mode=${searchMode} docs=${docs.length}`);

    if (docs.length === 0) {
      return res.json({
        answer: "죄송해요, 관련 정보를 찾지 못했어요. 더 구체적으로 질문해주시면 도움이 될 것 같아요 😊",
        sources: [],
        announcements: [],
        intent,
      });
    }

    let answer;
    try {
      const contextBlocks = docs
        .map((d, i) => {
          const meta = d.metadata ?? {};
          const period = meta.end_date
            ? `${meta.date || ""}${meta.date && meta.end_date ? " ~ " : ""}${meta.end_date}`
            : (meta.date || "-");
          return `[문서 ${i + 1}] 제목: ${meta.title ?? "-"} | 출처: ${meta.source ?? "미상"} | 기간: ${period}\n${d.content}`;
        })
        .join("\n\n---\n\n");

      const categoryHint = userCategory?.length > 0
        ? `\n\n사용자의 관심 분야: ${userCategory.join(", ")}`
        : "";

      const model = getGemini().getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: CHAT_SYSTEM_PROMPT,
      });

      const result = await model.generateContent(
        `[참고 문서]\n${contextBlocks}${categoryHint}\n\n[질문]\n${q}`
      );
      answer = result.response.text();
    } catch (genErr) {
      console.warn("[ai/chat] Gemini 생성 실패 → 문서 요약 폴백:", (genErr.message ?? "").slice(0, 80));
      const fallback = docs
        .slice(0, 3)
        .map((d) => {
          const t = d.metadata?.title ?? "관련 정책";
          const src = d.metadata?.source ?? "";
          const period = [d.metadata?.date, d.metadata?.end_date].filter(Boolean).join(" ~ ");
          return `• ${t}${src ? ` (${src})` : ""}${period ? ` | ${period}` : ""}\n  ${d.content.slice(0, 150)}…`;
        })
        .join("\n\n");
      answer = `관련 정책 정보를 찾았어요 😊\n\n${fallback}\n\n더 자세한 내용은 각 기관에 문의해보세요!`;
    }

    const sources = [...new Set(docs.map((d) => d.metadata?.source).filter(Boolean))];
    res.json({
      answer,
      sources,
      announcements: intent === "policy_search" ? cards.slice(0, 3) : [],
      intent,
    });
  } catch (err) {
    const msg = err.message ?? "";
    console.error("[ai/chat] 오류:", msg);

    if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || err.status === 429) {
      return res.status(429).json({ error: "RATE_LIMITED" });
    }
    if (msg.includes("API_KEY_INVALID") || err.status === 403) {
      return res.status(403).json({ error: "GEMINI_API_DISABLED" });
    }
    res.status(500).json({ error: "AI 응답 생성 중 오류가 발생했습니다." });
  }
}
