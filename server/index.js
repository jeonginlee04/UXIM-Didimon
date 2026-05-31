const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 인증키
const DATA_GO_KR_KEY =
  "74888f61216f843cfa35821955d4d11f3c18a4c2c0d766e8aabd9f9103dd82c5";
const YOUTH_KEY = "54e72035-7ec7-4803-948a-c8d1a60cca5f";
const WELFARE_KEY =
  "758954077e0c61c99e6fa5f2cc45de5a53723e91674d12ab64e72fcf67c93236";

// ✅ 보조금24 API
app.get("/api/subsidy", async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.data.go.kr/data/15113968/openapi.do`,
      {
        params: {
          serviceKey: DATA_GO_KR_KEY,
          pageNo: 1,
          numOfRows: 10,
          returnType: "json",
        },
      },
    );
    res.json(response.data);
  } catch (err) {
    console.error("보조금24 API 오류:", err.message);
    res.status(500).json({ error: "보조금24 API 호출 실패" });
  }
});

// ✅ 한국사회보장정보원_중앙부처복지서비스 API
app.get("/api/welfare/central", async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.data.go.kr/data/15090532/openapi.do`,
      {
        params: {
          serviceKey: WELFARE_KEY,
          pageNo: 1,
          numOfRows: 10,
          returnType: "json",
        },
      },
    );
    res.json(response.data);
  } catch (err) {
    console.error("중앙부처복지 API 오류:", err.message);
    res.status(500).json({ error: "중앙부처복지 API 호출 실패" });
  }
});

// ✅ 한국사회보장정보원_지자체복지서비스 API
app.get("/api/welfare/local", async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.data.go.kr/data/15108347/openapi.do`,
      {
        params: {
          serviceKey: WELFARE_KEY,
          pageNo: 1,
          numOfRows: 10,
          returnType: "json",
        },
      },
    );
    res.json(response.data);
  } catch (err) {
    console.error("지자체복지 API 오류:", err.message);
    res.status(500).json({ error: "지자체복지 API 호출 실패" });
  }
});

// ✅ 국토교통부_공공임대주택 API
app.get("/api/housing", async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.data.go.kr/data/15058476/openapi.do`,
      {
        params: {
          serviceKey: DATA_GO_KR_KEY,
          pageNo: 1,
          numOfRows: 10,
          returnType: "json",
        },
      },
    );
    res.json(response.data);
  } catch (err) {
    console.error("공공임대주택 API 오류:", err.message);
    res.status(500).json({ error: "공공임대주택 API 호출 실패" });
  }
});

// ✅ 한국고용정보원_청년정책 API
app.get("/api/youth", async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.youthcenter.go.kr/cmnFooter/openapiIntro/oaiDoc`,
      { params: { apiKey: YOUTH_KEY, pageIndex: 1, pageSize: 10 } },
    );
    res.json(response.data);
  } catch (err) {
    console.error("청년정책 API 오류:", err.message);
    res.status(500).json({ error: "청년정책 API 호출 실패" });
  }
});

// ✅ 전체 공고 한번에 가져오기
app.get("/api/announcements", async (req, res) => {
  try {
    const [subsidy, central, local, housing, youth] = await Promise.allSettled([
      axios.get(`https://www.data.go.kr/data/15113968/openapi.do`, {
        params: {
          serviceKey: DATA_GO_KR_KEY,
          pageNo: 1,
          numOfRows: 10,
          returnType: "json",
        },
      }),
      axios.get(`https://www.data.go.kr/data/15090532/openapi.do`, {
        params: {
          serviceKey: WELFARE_KEY,
          pageNo: 1,
          numOfRows: 10,
          returnType: "json",
        },
      }),
      axios.get(`https://www.data.go.kr/data/15108347/openapi.do`, {
        params: {
          serviceKey: WELFARE_KEY,
          pageNo: 1,
          numOfRows: 10,
          returnType: "json",
        },
      }),
      axios.get(`https://www.data.go.kr/data/15058476/openapi.do`, {
        params: {
          serviceKey: DATA_GO_KR_KEY,
          pageNo: 1,
          numOfRows: 10,
          returnType: "json",
        },
      }),
      axios.get(`https://www.youthcenter.go.kr/cmnFooter/openapiIntro/oaiDoc`, {
        params: { apiKey: YOUTH_KEY, pageIndex: 1, pageSize: 10 },
      }),
    ]);

    res.json({
      subsidy: subsidy.status === "fulfilled" ? subsidy.value.data : null,
      central: central.status === "fulfilled" ? central.value.data : null,
      local: local.status === "fulfilled" ? local.value.data : null,
      housing: housing.status === "fulfilled" ? housing.value.data : null,
      youth: youth.status === "fulfilled" ? youth.value.data : null,
    });
  } catch (err) {
    console.error("전체 공고 API 오류:", err.message);
    res.status(500).json({ error: "전체 공고 API 호출 실패" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
