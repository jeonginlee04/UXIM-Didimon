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
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY 없음");
    _gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return _gemini;
}

function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

async function callApi(url, params) {
  try {
    const r = await axios.get(url, { params, timeout: API_TIMEOUT });
    return r.data && !(typeof r.data === 'string' && r.data.trim().startsWith('<')) ? r.data : null;
  } catch { return null; }
}

function mapYouthCategory(lclsfNm = "") {
  if (lclsfNm.includes("일자리")) return "employment";
  if (lclsfNm.includes("주거"))   return "housing";
  if (lclsfNm.includes("교육"))   return "education";
  if (lclsfNm.includes("금융"))   return "finance";
  return "culture";
}

async function searchByVector(query, interests) {
  try {
    const model = getGemini().getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent({
      content: { parts: [{ text: query }], role: "user" },
      taskType: "RETRIEVAL_QUERY",
    });
    const embedding = result.embedding.values;
    const filterCategory = interests?.length === 1 ? interests[0] : null;

    const { data, error } = await getSupabase().rpc("match_documents", {
      query_embedding:  embedding,
      match_threshold:  0.35,
      match_count:      6,
      filter_category:  filterCategory,
    });
    if (error) throw error;
    return data || [];
  } catch { return []; }
}

async function searchByKeyword(query) {
  const data = await callApi("https://www.youthcenter.go.kr/go/ythip/getPlcy", {
    apiKeyNm: YOUTH_KEY, pageNum: 1, pageSize: 20, rtnType: "json",
  });
  const list = data?.result?.youthPolicyList ?? [];
  const kws  = query.split(/\s+/).filter((w) => w.length > 1);
  return list
    .map((p) => {
      const text = [p.plcyNm, p.plcyExplnCn, p.plcyKywdNm].filter(Boolean).join(" ");
      const score = kws.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ p }) => ({
      content:  (p.plcyExplnCn || p.plcyNm || "").slice(0, 300),
      category: mapYouthCategory(p.lclsfNm),
      metadata: { title: p.plcyNm, source: p.sprvsnInstCdNm || "온통청년" },
    }));
}

const TODO_SYSTEM_PROMPT = `
너는 '디딤온'의 AI 도우미야. 자립준비청년을 위한 실천 가능한 투두 항목을 추천해줘.
반드시 JSON 배열만 반환해. 마크다운 코드블록 없이 순수 JSON만.

형식:
[{"title": "...", "category": "finance|housing|employment|education|culture", "reason": "...", "difficulty": "easy|medium|hard"}]

규칙:
- title은 구체적인 동작 (동사로 시작, 15자 이내)
- reason은 혜택 + 실천 이유 (1~2문장)
- 5개 반환
`.trim();

function getDefaultRecommendations(interests = []) {
  const pool = [
    { title: "자립수당 신청 자격 확인하기",       category: "finance",    reason: "보호종료 후 5년 이내 청년에게 월 40만원을 지원해요.",           difficulty: "easy" },
    { title: "주거급여 신청 가능 여부 확인하기",   category: "housing",    reason: "임차료 일부를 국가에서 지원해줘요. 소득 기준을 먼저 확인해봐요.", difficulty: "easy" },
    { title: "워크넷에서 관심 채용공고 찾아보기",  category: "employment", reason: "자립준비청년 우대 공고가 별도로 있어요.",                         difficulty: "easy" },
    { title: "국민내일배움카드 신청하기",          category: "education",  reason: "훈련비 최대 500만원을 지원해요. 자격증·직업훈련에 쓸 수 있어요.",  difficulty: "medium" },
    { title: "건강보험 피부양자 등록 여부 확인",   category: "culture",    reason: "보험료를 절약할 수 있어요.",                                     difficulty: "easy" },
  ];
  const first = interests[0];
  if (!first) return pool;
  const idx = pool.findIndex((p) => p.category === first);
  if (idx > 0) { const [item] = pool.splice(idx, 1); pool.unshift(item); }
  return pool;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userInterests = [], completedTodos = [], roadmapProgress = {} } = req.body ?? {};

  try {
    const query = (userInterests.join(" ") || "자립") + " 청년 지원 정책";
    let contextDocs = [];

    if (GEMINI_API_KEY && SUPABASE_URL && SUPABASE_KEY) {
      contextDocs = await searchByVector(query, userInterests);
    }
    if (contextDocs.length === 0) {
      contextDocs = await searchByKeyword(query);
    }

    const progressSummary = Object.entries(roadmapProgress)
      .map(([k, v]) => `${k}: ${Math.round((v ?? 0) * 100)}%`)
      .join(", ") || "시작 전";

    const contextBlock = contextDocs
      .slice(0, 4)
      .map((d) => `- ${d.metadata?.title ?? ""}: ${d.content.slice(0, 200)}`)
      .join("\n");

    const prompt = `사용자 정보:
- 관심 분야: ${userInterests.join(", ") || "미설정"}
- 완료한 항목: ${completedTodos.slice(0, 8).join(", ") || "없음"}
- 진행률: ${progressSummary}

[관련 자립 지원 정책]
${contextBlock || "정보 없음"}

위 정보를 바탕으로 지금 당장 실천할 수 있는 투두 5가지를 JSON으로 추천해줘.`;

    let recommendations = [];
    try {
      const model = getGemini().getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: TODO_SYSTEM_PROMPT,
      });
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const jsonStr = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      recommendations = JSON.parse(jsonStr);
      if (!Array.isArray(recommendations)) throw new Error("배열 아님");
    } catch {
      recommendations = getDefaultRecommendations(userInterests);
    }

    res.json({ recommendations: recommendations.slice(0, 5) });
  } catch (err) {
    console.error("[recommend-todos]", err.message);
    res.json({ recommendations: getDefaultRecommendations(userInterests) });
  }
}
