require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── 환경변수 ──────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL   = process.env.SUPABASE_URL;
const SUPABASE_KEY   = process.env.SUPABASE_KEY;

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
    if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("SUPABASE_URL 또는 SUPABASE_KEY 환경변수가 설정되지 않았습니다.");
    _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

// ── API 인증키 ────────────────────────────────────────────────
const DATA_GO_KR_KEY = process.env.DATA_GO_KR_KEY ||
  "74888f61216f843cfa35821955d4d11f3c18a4c2c0d766e8aabd9f9103dd82c5";
const YOUTH_KEY  = process.env.YOUTH_KEY || "54e72035-7ec7-4803-948a-c8d1a60cca5f";
const WELFARE_KEY = process.env.WELFARE_KEY ||
  "758954077e0c61c99e6fa5f2cc45de5a53723e91674d12ab64e72fcf67c93236";
const WORK24_KEY = process.env.WORK24_KEY || DATA_GO_KR_KEY;

const API_TIMEOUT = 8000;

function isValidJson(data) {
  if (data === null || data === undefined) return false;
  if (typeof data === "string" && data.trim().startsWith("<")) return false;
  return true;
}

async function callApi(url, params, options = {}) {
  try {
    const response = await axios.get(url, {
      params,
      timeout: options.timeout ?? API_TIMEOUT,
      headers: options.headers,
    });
    return isValidJson(response.data) ? response.data : null;
  } catch (err) {
    console.error(`API 오류 [${url}]:`, err.message);
    return null;
  }
}

// ════════════════════════════════════════════════════════════
//  정부 데이터 API
// ════════════════════════════════════════════════════════════

// ✅ 보조금24 (행정안전부)
app.get("/api/subsidy", async (req, res) => {
  const data = await callApi(
    "https://api.odcloud.kr/api/15113968/v1/uddi:e7a38fd0-e38f-4c1f-91b6-b8b0bcc0e8f1",
    { serviceKey: DATA_GO_KR_KEY, page: 1, perPage: 30 }
  );
  res.json(data ?? { data: [] });
});

// ✅ 중앙부처복지서비스 (사회보장정보원)
app.get("/api/welfare/central", async (req, res) => {
  const data = await callApi(
    "https://api.odcloud.kr/api/15090532/v1/uddi:2aa7a9de-b60c-494f-90eb-5d3ac47a7cdb",
    { serviceKey: WELFARE_KEY, page: 1, perPage: 30 }
  );
  res.json(data ?? { data: [] });
});

// ✅ 지자체복지서비스 (사회보장정보원)
app.get("/api/welfare/local", async (req, res) => {
  const data = await callApi(
    "https://api.odcloud.kr/api/15108347/v1/uddi:6b72c6e8-de73-415d-a4d4-97a3c3f93b5c",
    { serviceKey: WELFARE_KEY, page: 1, perPage: 30 }
  );
  res.json(data ?? { data: [] });
});

// ✅ 공공임대주택 (국토교통부 마이홈포털)
app.get("/api/housing", async (req, res) => {
  const data = await callApi(
    "https://api.odcloud.kr/api/15058476/v1/uddi:f0c1f4c5-e29b-4f9d-a7c8-3c4a3f5d9f3e",
    { serviceKey: DATA_GO_KR_KEY, page: 1, perPage: 30 }
  );
  res.json(data ?? { data: [] });
});

// ✅ 워크넷 채용정보 (한국고용정보원)
async function fetchWorknetJobs(keyword = "") {
  const params = {
    authKey: WORK24_KEY,
    callTp: "L",
    returnType: "JSON",
    startPage: "1",
    display: "30",
    occupation: "",
    region: "",
  };
  if (keyword) params.keyword = keyword;
  return callApi("https://openapi.work24.go.kr/wk/a/e/1100/openApiSelectInfo.do", params);
}

app.get("/api/employment", async (req, res) => {
  const { keyword = "" } = req.query;
  const data = await fetchWorknetJobs(keyword);
  res.json(data ?? { wantedRoot: { wanted: [] } });
});

// ✅ 자원정보서비스 — 민간 복지 자원 (사회보장정보원)
async function fetchResources() {
  return callApi(
    "https://apis.data.go.kr/B554010/resourceInfoService/getResourceInfo",
    { serviceKey: DATA_GO_KR_KEY, pageNo: 1, numOfRows: 30, returnType: "json" }
  );
}

app.get("/api/resources", async (req, res) => {
  const data = await fetchResources();
  res.json(data ?? { response: { body: { items: [] } } });
});

// ✅ 온통청년 — 카테고리별 병렬 수집 + 중복 제거
const YOUTH_CATEGORIES = ["일자리", "주거", "교육", "금융", "복지문화"];
const YOUTH_PAGE_SIZE  = 100;

async function fetchAllYouthPolicies() {
  const results = await Promise.allSettled(
    YOUTH_CATEGORIES.map((cat) =>
      callApi("https://www.youthcenter.go.kr/go/ythip/getPlcy", {
        apiKeyNm: YOUTH_KEY,
        pageNum:  1,
        pageSize: YOUTH_PAGE_SIZE,
        rtnType:  "json",
        lclsfNm:  cat,
      })
    )
  );

  const seen   = new Set();
  const merged = [];

  for (const r of results) {
    if (r.status !== "fulfilled" || !r.value) continue;
    const list = r.value?.result?.youthPolicyList ?? [];
    for (const item of list) {
      const id = item.plcyNo;
      if (id && seen.has(id)) continue;
      if (id) seen.add(id);
      merged.push(item);
    }
  }

  return { result: { youthPolicyList: merged } };
}

app.get("/api/youth", async (req, res) => {
  const data = await fetchAllYouthPolicies();
  res.json(data);
});

// ✅ 전체 공고 통합 (모든 소스 병렬 수집)
app.get("/api/announcements", async (req, res) => {
  const [subsidyR, centralR, localR, housingR, youthR, employmentR, resourcesR] =
    await Promise.allSettled([
      callApi(
        "https://api.odcloud.kr/api/15113968/v1/uddi:e7a38fd0-e38f-4c1f-91b6-b8b0bcc0e8f1",
        { serviceKey: DATA_GO_KR_KEY, page: 1, perPage: 30 }
      ),
      callApi(
        "https://api.odcloud.kr/api/15090532/v1/uddi:2aa7a9de-b60c-494f-90eb-5d3ac47a7cdb",
        { serviceKey: WELFARE_KEY, page: 1, perPage: 30 }
      ),
      callApi(
        "https://api.odcloud.kr/api/15108347/v1/uddi:6b72c6e8-de73-415d-a4d4-97a3c3f93b5c",
        { serviceKey: WELFARE_KEY, page: 1, perPage: 30 }
      ),
      callApi(
        "https://api.odcloud.kr/api/15058476/v1/uddi:f0c1f4c5-e29b-4f9d-a7c8-3c4a3f5d9f3e",
        { serviceKey: DATA_GO_KR_KEY, page: 1, perPage: 30 }
      ),
      fetchAllYouthPolicies(),
      fetchWorknetJobs(),
      fetchResources(),
    ]);

  res.json({
    subsidy:    subsidyR.value    ?? null,
    central:    centralR.value    ?? null,
    local:      localR.value      ?? null,
    housing:    housingR.value    ?? null,
    youth:      youthR.value      ?? null,
    employment: employmentR.value ?? null,
    resources:  resourcesR.value  ?? null,
  });
});

// ════════════════════════════════════════════════════════════
//  RAG 공통 유틸
// ════════════════════════════════════════════════════════════

// 벡터 임베딩 (Gemini text-embedding-004)
async function embedQuestion(question) {
  const model = getGemini().getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent({
    content: { parts: [{ text: question }], role: "user" },
    taskType: "RETRIEVAL_QUERY",
  });
  return result.embedding.values;
}

// Supabase 벡터 검색
async function searchByVector(embedding, userCategory, matchCount = 5) {
  const supabase = getSupabase();
  const filterCategory = userCategory?.length === 1 ? userCategory[0] : null;

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0.35,
    match_count: matchCount,
    filter_category: filterCategory,
  });
  if (error) throw new Error(`Supabase: ${error.message}`);

  if (filterCategory && (!data || data.length < 2)) {
    const { data: fb, error: fbErr } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: 0.35,
      match_count: matchCount,
      filter_category: null,
    });
    if (fbErr) throw new Error(`Supabase fallback: ${fbErr.message}`);
    const seen = new Set((data || []).map((d) => d.id));
    const merged = [...(data || [])];
    for (const doc of fb || []) {
      if (!seen.has(doc.id)) merged.push(doc);
      if (merged.length >= matchCount) break;
    }
    return merged;
  }
  return data || [];
}

// 조사 제거 후 핵심 키워드 추출
function extractKeywords(text) {
  return text
    .split(/[\s,.!?]+/)
    .map((w) => w.replace(/[은는이가을를에서으로도의와과]+$/, ""))
    .filter(
      (w) =>
        w.length > 1 &&
        !["있어", "해줘", "알려", "주세요", "어떤", "하나", "추천", "뭐가", "뭐야", "관련", "지원", "있나요", "해요", "할게요", "하면"].includes(w)
    );
}

// 질문 카테고리 추정
function getCategoryFromQuestion(question) {
  if (/주거|임대|전세|월세|주택|집/.test(question)) return "주거";
  if (/취업|일자리|고용|채용|구직|알바/.test(question)) return "일자리";
  if (/교육|학업|장학|학비|훈련|자격증/.test(question)) return "교육";
  if (/금융|저축|대출|수당|지원금|현금|통장/.test(question)) return "금융";
  if (/건강|병원|의료|보험|정신|심리/.test(question)) return "복지문화";
  return "";
}

// 채팅 의도 감지
function detectIntent(question) {
  if (/공고|정책|프로그램|사업|지원 사업|어떤.*지원|찾아|검색|알려줘|있어/.test(question)) return "policy_search";
  if (/어떻게|방법|절차|순서|단계|하려면|신청 방법|하는 법/.test(question)) return "procedure";
  if (/힘들|걱정|불안|무서|모르겠|어렵|외로|우울/.test(question)) return "emotional";
  return "general";
}

// 온통청년 키워드 검색 (폴백)
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
    policy.plcySprtCn    && `■ 지원 내용\n${policy.plcySprtCn}`,
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

// 정책을 Announcement 카드 형식으로 변환
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
    description:  policy.plcyExplnCn || "",
    tags:         (policy.plcyKywdNm || "").split(/[,\s]+/).filter(Boolean).slice(0, 4),
    bookmarkCount: 0,
    isBookmarked:  false,
    targetAge:    policy.ageNmCn || "",
    amount:       policy.plcySprtCn ? policy.plcySprtCn.slice(0, 50) : "",
    refUrl1:      policy.refUrlAddr1 || "",
    refUrl2:      policy.refUrlAddr2 || "",
  };
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

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    docs:  top.map((x) => policyToDoc(x.p)),
    cards: top.map((x) => policyToCard(x.p)),
  };
}

// Gemini 텍스트 생성
async function callGemini(prompt, systemPrompt) {
  const model = getGemini().getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ════════════════════════════════════════════════════════════
//  AI 채팅 (POST /api/ai/chat)
//  intent: policy_search → 공고 카드 + 답변
//          procedure     → 절차 안내
//          emotional     → 공감 응답
//          general       → 일반 답변
// ════════════════════════════════════════════════════════════

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

app.post("/api/ai/chat", async (req, res) => {
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

    // 1순위: 벡터 검색
    if (GEMINI_API_KEY && SUPABASE_URL && SUPABASE_KEY) {
      try {
        const embedding = await embedQuestion(q);
        docs = await searchByVector(embedding, userCategory, 5);
        if (docs.length > 0) searchMode = "vector";
      } catch (vecErr) {
        console.warn(`[ai/chat] 벡터 검색 실패 → 키워드 검색으로 전환:`, vecErr.message);
      }
    }

    // 2순위: 키워드 검색 (폴백)
    if (docs.length === 0) {
      const result = await searchByKeyword(q);
      docs  = result.docs;
      cards = result.cards;
    }

    // policy_search 의도면 온통청년 직접 검색으로 카드 보강
    if (intent === "policy_search" && cards.length === 0) {
      const result = await searchByKeyword(q);
      cards = result.cards;
    }

    console.log(`[ai/chat] intent=${intent} mode=${searchMode} docs=${docs.length} cards=${cards.length}`);

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

      answer = await callGemini(
        `[참고 문서]\n${contextBlocks}${categoryHint}\n\n[질문]\n${q}`,
        CHAT_SYSTEM_PROMPT
      );
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

    if (msg.includes("환경변수")) {
      return res.status(503).json({ error: `서버 설정 오류: ${msg}` });
    }
    if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || err.status === 429) {
      return res.status(429).json({ error: "RATE_LIMITED" });
    }
    if (
      msg.includes("API_KEY_SERVICE_BLOCKED") ||
      msg.includes("SERVICE_DISABLED") ||
      msg.includes("API_KEY_INVALID") ||
      msg.includes("invalid api key") ||
      err.status === 403
    ) {
      return res.status(403).json({ error: "GEMINI_API_DISABLED" });
    }
    res.status(500).json({ error: "AI 응답 생성 중 오류가 발생했습니다." });
  }
});

// ════════════════════════════════════════════════════════════
//  AI 맞춤 투두 추천 (POST /api/ai/recommend-todos)
// ════════════════════════════════════════════════════════════

const TODO_SYSTEM_PROMPT = `
너는 '디딤온'의 AI 도우미야. 자립준비청년을 위한 실천 가능한 투두 항목을 추천해줘.
반드시 JSON 배열만 반환해. 마크다운 코드블록 없이 순수 JSON만.

형식:
[
  {
    "title": "자립수당 신청하기",
    "category": "finance",
    "reason": "보호종료 후 5년 이내 청년에게 월 40만원을 지원해요. 지금 신청하면 이번 달부터 받을 수 있어요.",
    "difficulty": "easy"
  }
]

규칙:
- category: finance / housing / employment / education / culture 중 하나만
- difficulty: easy / medium / hard 중 하나
- title은 구체적인 동작 (동사로 시작)
- reason은 왜 중요한지 + 실제 혜택 1~2문장
- 5개 반환
`.trim();

app.post("/api/ai/recommend-todos", async (req, res) => {
  const { userInterests = [], completedTodos = [], roadmapProgress = {} } = req.body ?? {};

  try {
    // 관심 분야 기반 RAG 검색
    let contextDocs = [];
    if (GEMINI_API_KEY && SUPABASE_URL && SUPABASE_KEY && userInterests.length > 0) {
      try {
        const query = userInterests.join(" ") + " 자립 지원 정책 신청";
        const embedding = await embedQuestion(query);
        contextDocs = await searchByVector(embedding, userInterests, 6);
      } catch (e) {
        console.warn("[recommend-todos] 벡터 검색 실패:", e.message);
      }
    }

    // 폴백: 키워드 검색
    if (contextDocs.length === 0) {
      const query = (userInterests[0] || "자립") + " 청년 지원";
      const result = await searchByKeyword(query);
      contextDocs = result.docs;
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
      const raw = await callGemini(prompt, TODO_SYSTEM_PROMPT);
      // JSON만 추출 (마크다운 코드블록 제거)
      const jsonStr = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      recommendations = JSON.parse(jsonStr);
      if (!Array.isArray(recommendations)) throw new Error("배열이 아님");
    } catch (parseErr) {
      console.warn("[recommend-todos] JSON 파싱 실패, 기본 추천 반환:", parseErr.message);
      recommendations = getDefaultTodoRecommendations(userInterests);
    }

    res.json({ recommendations: recommendations.slice(0, 5) });
  } catch (err) {
    console.error("[recommend-todos] 오류:", err.message);
    res.json({ recommendations: getDefaultTodoRecommendations(userInterests) });
  }
});

function getDefaultTodoRecommendations(interests = []) {
  const defaults = [
    { title: "자립수당 신청 자격 확인하기", category: "finance", reason: "보호종료 후 5년 이내 청년에게 월 40만원을 지원해요. 먼저 자격 조건을 확인해보세요.", difficulty: "easy" },
    { title: "주거급여 신청 가능 여부 확인하기", category: "housing", reason: "임차료를 지원받을 수 있어요. 소득·재산 기준을 먼저 체크해보세요.", difficulty: "easy" },
    { title: "워크넷에서 청년 채용공고 검색하기", category: "employment", reason: "자립준비청년 우대 채용공고가 있어요. 관심 직무를 검색해보세요.", difficulty: "easy" },
    { title: "국민내일배움카드 신청하기", category: "education", reason: "훈련비 최대 500만원을 지원해요. 취업·창업 준비에 활용할 수 있어요.", difficulty: "medium" },
    { title: "건강보험 지역가입자 피부양자 등록 확인", category: "culture", reason: "보험료를 절약할 수 있어요. 가족 등록 여부를 확인해보세요.", difficulty: "easy" },
  ];

  if (interests.includes("finance"))    return [defaults[0], ...defaults.filter((_, i) => i !== 0)];
  if (interests.includes("housing"))    return [defaults[1], ...defaults.filter((_, i) => i !== 1)];
  if (interests.includes("employment")) return [defaults[2], ...defaults.filter((_, i) => i !== 2)];
  return defaults;
}

// ════════════════════════════════════════════════════════════
//  AI 주간 점검 피드백 (POST /api/ai/weekly-feedback)
// ════════════════════════════════════════════════════════════

const FEEDBACK_SYSTEM_PROMPT = `
너는 '디딤온'의 AI 도우미야. 자립준비청년의 이번 주 활동을 분석하고 따뜻한 피드백을 제공해.
반드시 JSON만 반환해. 마크다운 코드블록 없이 순수 JSON만.

형식:
{
  "feedback": "이번 주 전체 피드백 (2~3문장, 구체적으로)",
  "strengths": "잘한 점 (1문장)",
  "suggestions": ["다음 주 구체적 제안 1", "다음 주 구체적 제안 2", "다음 주 구체적 제안 3"],
  "encouragement": "응원 메시지 (1문장, 따뜻하게)"
}

규칙:
- 완료율이 낮아도 비난하지 말고 따뜻하게
- suggestions는 실천 가능한 구체적 행동
- encouragement는 자립 여정을 응원하는 메시지
`.trim();

app.post("/api/ai/weekly-feedback", async (req, res) => {
  const {
    completed    = [],
    incomplete   = [],
    answers      = {},
    userInterests = [],
  } = req.body ?? {};

  try {
    const completionRate = completed.length + incomplete.length > 0
      ? Math.round((completed.length / (completed.length + incomplete.length)) * 100)
      : 0;

    const prompt = `이번 주 자립준비청년의 활동 기록:
- 완료한 항목 (${completed.length}개): ${completed.join(", ") || "없음"}
- 미완료 항목 (${incomplete.length}개): ${incomplete.join(", ") || "없음"}
- 완료율: ${completionRate}%
- 주간 점검 답변: ${Object.values(answers).filter(Boolean).join(" / ") || "없음"}
- 관심 분야: ${userInterests.join(", ") || "미설정"}

위 내용을 바탕으로 JSON 형식으로 피드백을 제공해줘.`;

    let feedback;
    try {
      const raw = await callGemini(prompt, FEEDBACK_SYSTEM_PROMPT);
      const jsonStr = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      feedback = JSON.parse(jsonStr);
      if (!feedback.feedback) throw new Error("필드 없음");
    } catch (parseErr) {
      console.warn("[weekly-feedback] JSON 파싱 실패, 기본 피드백 반환");
      feedback = getDefaultFeedback(completed.length, incomplete.length);
    }

    res.json({ feedback });
  } catch (err) {
    console.error("[weekly-feedback] 오류:", err.message);
    res.json({ feedback: getDefaultFeedback(completed.length, incomplete.length) });
  }
});

function getDefaultFeedback(completedCount, incompleteCount) {
  const total = completedCount + incompleteCount;
  const rate  = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return {
    feedback:      `이번 주 ${total}개 중 ${completedCount}개를 완료하셨어요 (${rate}%). 한 걸음씩 나아가고 있는 게 느껴져요!`,
    strengths:     completedCount > 0 ? `${completedCount}개를 완료하며 꾸준히 실천했어요 💪` : "이번 주는 쉬어가는 시간이었을 거예요. 그것도 필요해요.",
    suggestions:   ["미완료 항목 중 가장 쉬운 것 하나부터 다시 도전해보세요", "매일 하나씩 작은 목표를 세워보세요", "완료한 항목을 보며 스스로 칭찬해주세요"],
    encouragement: "자립은 마라톤이에요. 오늘도 열심히 하고 있는 당신이 대단해요! 🐢",
  };
}

// ════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
