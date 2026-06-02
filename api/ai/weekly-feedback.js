import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let _gemini = null;

function getGemini() {
  if (!_gemini) {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY 없음");
    _gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return _gemini;
}

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
- suggestions는 실천 가능한 구체적 행동 (동사로 시작)
- encouragement는 자립 여정을 응원하는 메시지
`.trim();

function getDefaultFeedback(completedCount, incompleteCount) {
  const total = completedCount + incompleteCount;
  const rate  = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  return {
    feedback:      `이번 주 ${total}개 중 ${completedCount}개를 완료하셨어요 (${rate}%). 한 걸음씩 나아가고 있어요!`,
    strengths:     completedCount > 0 ? `${completedCount}개를 완료하며 꾸준히 실천했어요 💪` : "이번 주는 쉬어가는 시간이었을 거예요. 그것도 필요해요.",
    suggestions:   ["미완료 항목 중 가장 쉬운 것 하나부터 시작해보세요", "매일 아침 오늘 할 일 하나를 정해보세요", "완료한 항목을 체크하며 스스로 칭찬해주세요"],
    encouragement: "자립은 마라톤이에요. 오늘도 열심히 하고 있는 당신이 대단해요! 🐢",
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { completed = [], incomplete = [], answers = {}, userInterests = [] } = req.body ?? {};

  try {
    const total = completed.length + incomplete.length;
    const rate  = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    const prompt = `이번 주 자립준비청년의 활동 기록:
- 완료한 항목 (${completed.length}개): ${completed.join(", ") || "없음"}
- 미완료 항목 (${incomplete.length}개): ${incomplete.join(", ") || "없음"}
- 완료율: ${rate}%
- 주간 점검 답변: ${Object.values(answers).filter(Boolean).join(" / ") || "없음"}
- 관심 분야: ${userInterests.join(", ") || "미설정"}

위 내용을 바탕으로 JSON 형식으로 피드백을 제공해줘.`;

    let feedback;
    try {
      const model = getGemini().getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: FEEDBACK_SYSTEM_PROMPT,
      });
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const jsonStr = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      feedback = JSON.parse(jsonStr);
      if (!feedback.feedback) throw new Error("필드 없음");
    } catch {
      feedback = getDefaultFeedback(completed.length, incomplete.length);
    }

    res.json({ feedback });
  } catch (err) {
    console.error("[weekly-feedback]", err.message);
    res.json({ feedback: getDefaultFeedback(completed.length, incomplete.length) });
  }
}
