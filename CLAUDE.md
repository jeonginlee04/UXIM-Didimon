# 디딤온 (Didimon)

자립준비청년을 위한 자립 로드맵 앱

## 프로젝트 개요

- **대상 사용자**: 보호종료 자립준비청년 (18~29세)
- **목적**: 금융·주거·취업·학업·생활문화 전반의 자립을 단계별로 지원

## 기술 스택

- **프론트엔드**: React + TypeScript (Vite), Tailwind CSS, Zustand
- **백엔드(현재)**: Node.js / Express (`server/index.js`)
- **백엔드(예정)**: Spring Boot 전환 예정
- **라우팅**: React Router v6

## 카테고리 체계

| key | 한글 |
|-----|------|
| `finance` | 금융 |
| `housing` | 주거 |
| `employment` | 취업 |
| `education` | 학업 |
| `culture` | 생활&문화 |

## 코딩 규칙

- TypeScript strict 모드 사용
- 컴포넌트는 함수형으로 작성
- 외부 API 호출 로직은 `src/services/` 에 분리
- 상태 관리는 Zustand (`src/store/`)
- 공통 컴포넌트는 `src/components/common/`
- 타입 정의는 `src/types/index.ts` 에 집중 관리

## 개발 서버 실행

```bash
npm run dev        # 프론트(Vite) + 백엔드(Node) 동시 실행
npm run dev:front  # Vite만 실행
npm run dev:server # Node 서버만 실행 (port 3001)
```
