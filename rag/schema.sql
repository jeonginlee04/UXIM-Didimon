-- ============================================================
--  디딤온 RAG — Supabase pgvector 스키마
--  Supabase Dashboard > SQL Editor 에서 순서대로 실행하세요.
-- ============================================================

-- 1. pgvector 확장 활성화
create extension if not exists vector;


-- 2. documents 테이블
--    embedding 차원:
--      OpenAI text-embedding-3-small  → 1536
--      HuggingFace jhgan/ko-sbert-nli → 768  (아래 주석 참고)
create table if not exists documents (
  id          uuid        primary key default gen_random_uuid(),
  content     text        not null,
  embedding   vector(1536),            -- HuggingFace 사용 시 768 로 변경
  metadata    jsonb       not null default '{}',
  category    text        check (
                category in (
                  'finance', 'housing', 'employment',
                  'education', 'culture', '기타'
                )
              ),
  created_at  timestamptz not null default now()
);

comment on table  documents              is '자립지원정책 RAG 문서 청크';
comment on column documents.content     is '정책 텍스트 청크 (200-400자)';
comment on column documents.embedding   is 'text-embedding-3-small 벡터 (1536차원)';
comment on column documents.metadata    is '{"title","source","date","chunk_index","total_chunks","filename"}';
comment on column documents.category    is 'finance | housing | employment | education | culture | 기타';


-- 3. HNSW 벡터 인덱스 (코사인 유사도 기반 ANN 검색)
--    pgvector >= 0.5.0 필요 (Supabase 기본 제공)
create index if not exists documents_embedding_hnsw_idx
  on documents
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- 4. 카테고리 필터 인덱스
create index if not exists documents_category_idx
  on documents (category);

-- 5. metadata JSONB 인덱스 (title 검색 등)
create index if not exists documents_metadata_idx
  on documents using gin (metadata);


-- ============================================================
--  유사도 검색 함수
--  사용 예:
--    select * from match_documents(
--      '[0.1, 0.2, ...]'::vector,
--      match_threshold => 0.7,
--      match_count     => 5,
--      filter_category => 'finance'
--    );
-- ============================================================
create or replace function match_documents(
  query_embedding  vector(1536),        -- HuggingFace 사용 시 768 로 변경
  match_threshold  float   default 0.7,
  match_count      int     default 5,
  filter_category  text    default null
)
returns table (
  id          uuid,
  content     text,
  metadata    jsonb,
  category    text,
  similarity  float
)
language sql stable
as $$
  select
    d.id,
    d.content,
    d.metadata,
    d.category,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where
    (filter_category is null or d.category = filter_category)
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;


-- ============================================================
--  Row Level Security (선택)
--  임베딩 업로드는 service_role 키로만, 읽기는 공개
-- ============================================================
alter table documents enable row level security;

-- 읽기: 누구나 허용 (anon key 사용 가능)
create policy "anon_read"
  on documents for select
  using (true);

-- 쓰기: service_role 전용 (embed.py 에서 SUPABASE_SERVICE_KEY 사용)
create policy "service_write"
  on documents for insert
  with check (auth.role() = 'service_role');

create policy "service_delete"
  on documents for delete
  using (auth.role() = 'service_role');
