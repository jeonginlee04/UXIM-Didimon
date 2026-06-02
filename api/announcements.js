import axios from 'axios';

const DATA_GO_KR_KEY = process.env.DATA_GO_KR_KEY ||
  "74888f61216f843cfa35821955d4d11f3c18a4c2c0d766e8aabd9f9103dd82c5";
const YOUTH_KEY  = process.env.YOUTH_KEY || "54e72035-7ec7-4803-948a-c8d1a60cca5f";
const WELFARE_KEY = process.env.WELFARE_KEY ||
  "758954077e0c61c99e6fa5f2cc45de5a53723e91674d12ab64e72fcf67c93236";
const WORK24_KEY = process.env.WORK24_KEY || DATA_GO_KR_KEY;
const API_TIMEOUT = 5000;

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

const YOUTH_CATEGORIES = ["일자리", "주거", "교육", "금융", "복지문화"];
const YOUTH_PAGE_SIZE  = 40;

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

async function fetchWorknetJobs() {
  return callApi("https://openapi.work24.go.kr/wk/a/e/1100/openApiSelectInfo.do", {
    authKey:    WORK24_KEY,
    callTp:     "L",
    returnType: "JSON",
    startPage:  "1",
    display:    "30",
    occupation: "",
    region:     "",
  });
}

async function fetchResources() {
  return callApi(
    "https://apis.data.go.kr/B554010/resourceInfoService/getResourceInfo",
    { serviceKey: DATA_GO_KR_KEY, pageNo: 1, numOfRows: 30, returnType: "json" }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
