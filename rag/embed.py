#!/usr/bin/env python3
"""
자립지원정책 문서 임베딩 스크립트
──────────────────────────────────────────────────────────────
사용법:
  # 텍스트 파일 기반 (기본)
  python embed.py --provider openai

  # 온통청년 API에서 직접 fetch하여 임베딩
  python embed.py --provider openai --source api

  # 파일 + API 동시 임베딩
  python embed.py --provider openai --source both

  # 파싱만 확인 (업로드 없음)
  python embed.py --dry-run --source api

  # 기존 데이터 삭제 후 재임베딩
  python embed.py --provider openai --reset --source api
──────────────────────────────────────────────────────────────
"""

import os
import re
import sys
import json
import argparse
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime
from typing import Protocol

from dotenv import load_dotenv

load_dotenv()

# ── 환경변수 ──────────────────────────────────────────────────

SUPABASE_URL         = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")  # service_role 키
OPENAI_API_KEY       = os.getenv("OPENAI_API_KEY", "")
YOUTH_API_KEY        = os.getenv("YOUTH_KEY", "54e72035-7ec7-4803-948a-c8d1a60cca5f")

# 온통청년 API
YOUTH_API_URL  = "https://www.youthcenter.go.kr/go/ythip/getPlcy"
YOUTH_PAGE_SIZE = 100  # 한 번에 가져올 정책 수

TABLE_NAME  = "documents"
CHUNK_MAX   = 400   # 청크 최대 글자 수
CHUNK_MIN   = 50    # 청크 최소 글자 수 (이 이하는 버림)
BATCH_SIZE  = 20    # 한 번에 임베딩할 청크 수


# ── 카테고리 매핑 ─────────────────────────────────────────────

CATEGORY_MAP: dict[str, str] = {
    "금융": "finance",    "finance":    "finance",
    "주거": "housing",    "housing":    "housing",
    "취업": "employment", "employment": "employment",
    "학업": "education",  "교육": "education", "education": "education",
    "생활": "culture",    "문화": "culture",   "culture":   "culture",
}

def normalize_category(raw: str) -> str:
    return CATEGORY_MAP.get(raw.strip(), CATEGORY_MAP.get(raw.strip().lower(), "기타"))


# ── 프론트매터 파서 ────────────────────────────────────────────

def parse_frontmatter(text: str) -> tuple[dict, str]:
    """
    파일 상단의 YAML-like 프론트매터 파싱.

    형식:
        ---
        title: 2026년 자립수당 신청 안내
        category: finance
        source: 보건복지부
        date: 2026-04-01
        ---
        본문 내용...
    """
    if not text.startswith("---"):
        return {}, text.strip()

    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text.strip()

    meta: dict[str, str] = {}
    for line in parts[1].strip().splitlines():
        if ":" in line:
            key, _, val = line.partition(":")
            meta[key.strip().lower()] = val.strip()

    return meta, parts[2].strip()


# ── 청커 ──────────────────────────────────────────────────────

def chunk_text(text: str) -> list[str]:
    """
    지원사업 단위의 텍스트를 200-400자 청크로 분할.

    전략:
      1. 이중 개행(\n\n)으로 단락 분리
      2. 단락을 누적하다 CHUNK_MAX 초과 시 새 청크 시작
      3. 단락 자체가 CHUNK_MAX 초과 시 문장 단위로 재분할
    """
    if len(text) <= CHUNK_MAX:
        return [text.strip()] if text.strip() else []

    paragraphs = re.split(r"\n{2,}", text)
    chunks: list[str] = []
    buf = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        candidate = (buf + "\n\n" + para).strip() if buf else para

        if len(candidate) <= CHUNK_MAX:
            buf = candidate
        else:
            if buf:
                chunks.append(buf)

            if len(para) <= CHUNK_MAX:
                buf = para
            else:
                # 문장 단위로 재분할
                for sent in re.split(r"(?<=[.。!?])\s+", para):
                    sent = sent.strip()
                    if not sent:
                        continue
                    candidate2 = (buf + " " + sent).strip() if buf else sent
                    if len(candidate2) <= CHUNK_MAX:
                        buf = candidate2
                    else:
                        if buf:
                            chunks.append(buf)
                        # 문장이 CHUNK_MAX 초과하면 강제 분할
                        while len(sent) > CHUNK_MAX:
                            chunks.append(sent[:CHUNK_MAX])
                            sent = sent[CHUNK_MAX:]
                        buf = sent

    if buf:
        chunks.append(buf)

    return [c for c in chunks if len(c.strip()) >= CHUNK_MIN]


# ── 파일 프로세서 ─────────────────────────────────────────────

def process_file(filepath: Path) -> list[dict]:
    """
    정책 텍스트 파일 → 청크 레코드 리스트 반환.

    파일명 컨벤션 (프론트매터 없을 때 폴백):
      {category}_{title}_{year}.txt
      예: finance_자립수당_2026.txt
    """
    raw = filepath.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(raw)

    stem_parts = filepath.stem.split("_")
    category   = normalize_category(meta.get("category", stem_parts[0] if stem_parts else "기타"))
    title      = meta.get("title",  "_".join(stem_parts[1:]) if len(stem_parts) > 1 else filepath.stem)
    source     = meta.get("source", filepath.name)
    date       = meta.get("date",   datetime.today().strftime("%Y-%m-%d"))

    chunks = chunk_text(body)
    records = []

    for idx, chunk in enumerate(chunks):
        records.append({
            "content":  chunk,
            "category": category,
            "metadata": {
                "title":        title,
                "source":       source,
                "date":         date,
                "chunk_index":  idx,
                "total_chunks": len(chunks),
                "filename":     filepath.name,
            },
        })

    return records


# ── 임베딩 프로바이더 ─────────────────────────────────────────

class Embedder(Protocol):
    DIM: int
    def embed_batch(self, texts: list[str]) -> list[list[float]]: ...


class OpenAIEmbedder:
    MODEL = "text-embedding-3-small"
    DIM   = 1536

    def __init__(self) -> None:
        try:
            from openai import OpenAI
        except ImportError:
            sys.exit("[ERROR] openai 패키지가 없습니다: pip install openai")
        if not OPENAI_API_KEY:
            sys.exit("[ERROR] OPENAI_API_KEY 환경변수를 설정하세요.")
        self.client = OpenAI(api_key=OPENAI_API_KEY)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        resp = self.client.embeddings.create(model=self.MODEL, input=texts)
        return [item.embedding for item in sorted(resp.data, key=lambda x: x.index)]


class HuggingFaceEmbedder:
    MODEL = "jhgan/ko-sbert-nli"
    DIM   = 768

    def __init__(self) -> None:
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            sys.exit("[ERROR] sentence-transformers 패키지가 없습니다: pip install sentence-transformers")
        print(f"  모델 로딩: {self.MODEL}  (첫 실행 시 ~400 MB 다운로드)")
        self.model = SentenceTransformer(self.MODEL)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return self.model.encode(texts, show_progress_bar=False).tolist()


# ── Supabase 업로더 ───────────────────────────────────────────

def get_supabase():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        sys.exit("[ERROR] SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 환경변수를 설정하세요.")
    try:
        from supabase import create_client
    except ImportError:
        sys.exit("[ERROR] supabase 패키지가 없습니다: pip install supabase")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def upload_batch(supabase, records: list[dict], embeddings: list[list[float]]) -> None:
    rows = [
        {
            "content":   rec["content"],
            "embedding": emb,
            "metadata":  rec["metadata"],
            "category":  rec["category"],
        }
        for rec, emb in zip(records, embeddings)
    ]
    supabase.table(TABLE_NAME).insert(rows).execute()


def reset_table(supabase) -> None:
    """테이블의 모든 행 삭제 (재임베딩용)."""
    supabase.table(TABLE_NAME).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("  기존 데이터 삭제 완료")


# ── 온통청년 API 페치 ──────────────────────────────────────────

LCLSF_CATEGORY: dict[str, str] = {
    "일자리": "employment",
    "주거":   "housing",
    "교육":   "education",
    "금융":   "finance",
    "복지":   "culture",
    "문화":   "culture",
    "건강":   "culture",
    "참여":   "culture",
    "권리":   "culture",
}

def map_lclsf_to_category(lclsf: str) -> str:
    """대분류명 → 카테고리 키 변환."""
    for keyword, cat in LCLSF_CATEGORY.items():
        if keyword in lclsf:
            return cat
    return "culture"


def fetch_youth_policies(page_num: int = 1, page_size: int = YOUTH_PAGE_SIZE) -> list[dict]:
    """온통청년 API에서 청년정책 목록 가져오기."""
    params = urllib.parse.urlencode({
        "apiKeyNm": YOUTH_API_KEY,
        "pageNum":  page_num,
        "pageSize": page_size,
        "rtnType":  "json",
    })
    url = f"{YOUTH_API_URL}?{params}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    if data.get("resultCode") != 200:
        raise RuntimeError(f"API 오류: {data.get('resultMessage')}")
    return data["result"]["youthPolicyList"]


def policy_to_records(policy: dict) -> list[dict]:
    """청년정책 항목 1개 → RAG 청크 레코드 변환."""
    plcy_no  = policy.get("plcyNo", "")
    title    = policy.get("plcyNm", "").strip()
    lclsf    = policy.get("lclsfNm", "")
    mclsf    = policy.get("mclsfNm", "")
    org      = policy.get("sprvsnInstCdNm", "") or policy.get("operInstCdNm", "") or "청년정책"
    expl     = policy.get("plcyExplnCn", "").strip()
    sprt     = policy.get("plcySprtCn", "").strip()
    aply     = policy.get("plcyAplyMthdCn", "").strip()
    kywds    = policy.get("plcyKywdNm", "")
    bgng_ymd = policy.get("bizPrdBgngYmd", "")
    end_ymd  = policy.get("bizPrdEndYmd", "")

    # 날짜 포맷 변환 YYYYMMDD → YYYY-MM-DD
    def fmt_date(d: str) -> str:
        if len(d) == 8 and d.isdigit():
            return f"{d[:4]}-{d[4:6]}-{d[6:]}"
        return d or datetime.today().strftime("%Y-%m-%d")

    category = map_lclsf_to_category(lclsf)

    # 본문 구성 (200~400자 청크 기준)
    parts = []
    if title:
        parts.append(title)
    if expl:
        parts.append(expl)
    if sprt:
        parts.append(f"■ 지원 내용\n{sprt}")
    if aply:
        parts.append(f"■ 신청 방법\n{aply}")
    full_text = "\n\n".join(parts)

    # 청킹
    chunks = chunk_text(full_text)
    meta_base = {
        "title":    title,
        "source":   org,
        "date":     fmt_date(bgng_ymd),
        "end_date": fmt_date(end_ymd),
        "plcyNo":   plcy_no,
        "lclsfNm":  lclsf,
        "mclsfNm":  mclsf,
        "keywords": kywds,
        "filename": f"api_youth_{plcy_no}",
    }

    records = []
    for idx, chunk in enumerate(chunks):
        records.append({
            "content":  chunk,
            "category": category,
            "metadata": {**meta_base, "chunk_index": idx, "total_chunks": len(chunks)},
        })
    return records


def fetch_all_youth_records(max_pages: int = 5) -> list[dict]:
    """여러 페이지에 걸쳐 청년정책 전체 수집."""
    all_records: list[dict] = []
    for page in range(1, max_pages + 1):
        print(f"  📡  온통청년 API 페이지 {page}/{max_pages} 요청 중…")
        try:
            policies = fetch_youth_policies(page_num=page, page_size=YOUTH_PAGE_SIZE)
        except Exception as e:
            print(f"  ⚠️  페이지 {page} 실패: {e}")
            break
        if not policies:
            break
        for policy in policies:
            all_records.extend(policy_to_records(policy))
        print(f"       {len(policies)}개 정책 → {sum(len(policy_to_records(p)) for p in policies)}개 청크 추가")
        if len(policies) < YOUTH_PAGE_SIZE:
            break  # 마지막 페이지
    return all_records


# ── 메인 ─────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="자립지원정책 문서를 임베딩하여 Supabase에 저장합니다."
    )
    parser.add_argument(
        "--provider", choices=["openai", "huggingface"], default="openai",
        help="임베딩 모델 (기본: openai)",
    )
    parser.add_argument(
        "--source", choices=["file", "api", "both"], default="file",
        help="데이터 소스: file=텍스트 파일, api=온통청년 API, both=둘 다 (기본: file)",
    )
    parser.add_argument(
        "--dir", default="data/policies",
        help="정책 텍스트 파일 디렉토리 (기본: data/policies)",
    )
    parser.add_argument(
        "--pages", type=int, default=3,
        help="API 소스 사용 시 최대 페이지 수, 1페이지=100건 (기본: 3)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="파싱 결과만 출력하고 업로드하지 않음",
    )
    parser.add_argument(
        "--reset", action="store_true",
        help="업로드 전 기존 데이터 삭제",
    )
    args = parser.parse_args()

    all_records: list[dict] = []

    # ── 텍스트 파일 수집 ──
    if args.source in ("file", "both"):
        policies_dir = Path(args.dir)
        if not policies_dir.exists():
            if args.source == "file":
                sys.exit(f"[ERROR] 디렉토리 없음: {policies_dir}")
            print(f"[WARN] 파일 디렉토리 없음: {policies_dir} — API 소스만 사용합니다.")
        else:
            txt_files = sorted(policies_dir.glob("*.txt"))
            print(f"\n📂  {policies_dir}  ({len(txt_files)}개 파일)\n")
            for f in txt_files:
                recs = process_file(f)
                print(f"  ✓  {f.name:<40}  →  {len(recs)} 청크")
                all_records.extend(recs)

    # ── 온통청년 API 수집 ──
    if args.source in ("api", "both"):
        print(f"\n🌐  온통청년 API  (최대 {args.pages}페이지 × {YOUTH_PAGE_SIZE}건)\n")
        api_records = fetch_all_youth_records(max_pages=args.pages)
        print(f"  API 수집 완료: {len(api_records)}개 청크")
        all_records.extend(api_records)

    print(f"\n  총 청크: {len(all_records)}개")

    # ── dry-run ──
    if args.dry_run:
        print("\n── dry-run 미리보기 ──────────────────────")
        for i, r in enumerate(all_records, 1):
            print(f"[{i:02d}] ({r['category']}) {r['content'][:80].replace(chr(10),' ')}…")
            print(f"      메타: {json.dumps(r['metadata'], ensure_ascii=False)}")
        return

    # ── 임베딩 모델 초기화 ──
    print(f"\n⚙️  임베딩 프로바이더: {args.provider}")
    embedder: Embedder = OpenAIEmbedder() if args.provider == "openai" else HuggingFaceEmbedder()

    # ── Supabase 초기화 ──
    print("🔗  Supabase 연결 중…")
    supabase = get_supabase()

    if args.reset:
        print("🗑️  기존 데이터 초기화 중…")
        reset_table(supabase)

    # ── 배치 임베딩 + 업로드 ──
    total = len(all_records)
    print(f"\n🚀  임베딩 + 업로드 시작 (배치 크기: {BATCH_SIZE})\n")

    for start in range(0, total, BATCH_SIZE):
        batch     = all_records[start : start + BATCH_SIZE]
        texts     = [r["content"] for r in batch]
        embeddings = embedder.embed_batch(texts)
        upload_batch(supabase, batch, embeddings)

        end = min(start + BATCH_SIZE, total)
        print(f"  [{end:>4}/{total}]  업로드 완료")

    print(f"\n✅  완료! {total}개 청크가 Supabase '{TABLE_NAME}' 테이블에 저장되었습니다.")


if __name__ == "__main__":
    main()
