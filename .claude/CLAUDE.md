# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Dev server (port 3000)
npm run dev:mock     # Dev with MSW mock server (no backend needed)
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest (all unit tests)
npm run test:watch   # Vitest watch mode
npm run test:e2e     # Playwright E2E tests
npx vitest run __tests__/path/to/file.test.ts   # Single test file
```

**Environment:** `BACKEND_URL=http://localhost:8080` (see `.env.example`)

## Tech Stack (version-sensitive)

| 패키지 | 버전 | 주의사항 |
|--------|------|---------|
| Next.js | 16.2.0 | **training data와 다름** — `node_modules/next/dist/docs/` 참조 필수 |
| React | 19.2.4 | `use()`, Server Components 등 신규 API |
| Zod | **v4** | v3와 API 차이 있음 (`z.enum({ error })` 등) |
| TanStack Query | v5 | `useQuery({ queryKey, queryFn })` 객체 형식 |
| Tailwind CSS | v4 | `@import "tailwindcss"`, `@theme inline` 문법 |
| shadcn/ui | v4 (base-nova) | `@base-ui/react` 기반 |
| react-hook-form | v7 | `@hookform/resolvers/zod` 연동 |
| MSW | v2 | `http.get()` / `HttpResponse.json()` 패턴 |
| react-markdown | latest | AI 리포트 마크다운 렌더링, `disallowedElements`로 XSS 방지 |
| Recharts | v3 | 대시보드 차트. 벤치마크는 HTML 바 사용 (jsdom 호환) |

## Architecture

**Foreign Worker Compliance (FWC)** — Next.js 16 + React 19 frontend, Spring Boot backend, BFF 패턴.

코드 작성/수정 시 `fwc-architecture` 스킬에 데이터 흐름, 컴포넌트 구조, 스타일링, 테스트 등 상세 가이드가 있음.

### 디렉토리 개요

```
app/(app)/          페이지 + 레이아웃 (인증 후)
app/(auth)/         로그인 등 인증 페이지
app/api/            BFF Route Handlers → apiClient → Spring Boot
components/ui/      shadcn/ui 공통 UI
components/{domain} 도메인별 컴포넌트
lib/queries/        React Query 훅 (fetchApi/mutateApi → /api/*)
lib/transforms/     BE→FE 응답 변환 순수 함수
lib/contexts/       CompanyProvider (회사 스코핑)
lib/constants/      에러 메시지, signal 색상 등 상수
types/              Zod 스키마 + 도메인 타입 (api.ts에 공통, 도메인별 분리)
mocks/              MSW 핸들러 + mock 데이터
__tests__/          Vitest 테스트 (소스 구조 미러링)
e2e/                Playwright E2E
```

## 실수하기 쉬운 규약

- **CSS 변수는 oklch 형식** — `var(--color-name)` 직접 사용. `hsl(var(--xxx))` 쓰면 SVG에서 검정 폴백
- **dDay 부호 규약** — 양수 = 초과(overdue), 0 = 당일, 음수 = N일 남음. 일반 직관과 반대
- **MSW 핸들러 이중 등록** — 새 API 모킹 시 `BACKEND` 경로(dev 서버용)와 `*` 경로(jsdom 테스트용) 모두 등록
- **BFF transform이 있는 API의 MSW** — `BACKEND` 경로는 BE 원시 형식, `*` 경로는 FE 변환 형식 반환
- **BFF 라우트의 try/catch 분리** — API 호출과 transform을 별도 try/catch로 분리 (502 vs 5xx 구분)
- **서버사이드 로캘** — `toLocaleString()` 등에 `"ko-KR"` 명시 필수
- **벤치마크 데이터 정직성** — `nationalTurnoverDesireRate`(이직희망률)는 FE에 전달되지 않음. BE AI 프롬프트에서만 사용. `turnoverRate`(실제 이직률)과 절대 나란히 비교 금지
- **벤치마크 점수** — `managementScore` = `managementCheck.score` (동일 값). Zod `.refine()`으로 검증 중. 불일치 시 파싱 에러
- **Zod 스키마 위치** — 벤치마크 타입은 `types/benchmark.ts`에 스키마+타입 함께 정의 (`z.infer`). Company/Worker 타입은 `types/api.ts`
- **포지셔닝 필드** — `region`(enum 코드) vs `regionName`(한글 표시명). UI에서는 항상 `regionName`/`industryCategoryName` 사용
