# 페이지네이션 및 필터링 설계

## 개요

Worker(근로자 목록)와 Compliance(컴플라이언스 현황) 페이지에 페이지네이션과 필터링을 추가한다. 50명 이상의 데이터를 실무에서 효율적으로 탐색할 수 있도록 한다.

## 배경

- 현재 두 페이지 모두 전체 데이터를 한 번에 렌더링하여 50명 이상일 때 사용성이 떨어짐
- Worker 페이지에 이름/국적 검색 + 비자 유형 필터가 존재하지만, 페이지네이션과 상태/보험 필터가 없음
- Compliance 페이지에는 필터/페이지네이션이 전혀 없음

## 설계 결정

### 페이지네이션 전략: 클라이언트 사이드 + 서버 사이드 전환 대비

- **현재**: 전체 데이터를 한 번에 fetch → 프론트에서 필터링/페이지네이션 처리
- **향후**: 백엔드가 `page`, `size`, 필터 쿼리 파라미터를 지원하면 훅 내부 fetch URL만 변경
- **이유**: 백엔드가 아직 페이지네이션을 미지원하므로 클라이언트에서 처리하되, API 인터페이스를 서버 사이드와 호환되도록 설계

### 페이지 사이즈: 20건 고정

### 페이지 번호: 1-based

UI와 내부 로직 모두 1-based. 서버 사이드 전환 시 백엔드가 0-based를 사용하면 훅 내부에서 `page - 1`로 변환.

### 공통화 범위: 페이지네이션 UI만 공통 컴포넌트, 필터는 각 테이블 개별 구현

## 타입 정의 추가 (`types/api.ts`)

현재 코드베이스에서 Worker 상태와 보험 가입 상태가 타입 없이 문자열로 사용되고 있다. 필터 구현을 위해 다음 const enum과 레이블 맵을 `types/api.ts`에 추가한다.

### Worker 상태

```typescript
export const WORKER_STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED"] as const;
export type WorkerStatus = (typeof WORKER_STATUSES)[number];

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
  TERMINATED: "퇴사",
};
```

> 기존 `worker-table.tsx`에서 `ACTIVE: "활성"`으로 사용 중이므로 기존 레이블을 그대로 유지한다. `WORKER_STATUS_LABELS`와 `WORKER_STATUS_COLORS`를 `types/api.ts`로 이동하고 기존 로컬 정의를 제거한다.

### 보험 가입 상태

현재 백엔드가 한국어 문자열(`"의무"`, `"임의"`, `"면제"`)로 응답하므로 그대로 사용한다.

```typescript
export const INSURANCE_STATUSES = ["의무", "임의", "면제"] as const;
export type InsuranceStatus = (typeof INSURANCE_STATUSES)[number];

// INSURANCE_STATUS_LABELS는 불필요 (key === value). Select 옵션 생성 시 INSURANCE_STATUSES 배열을 직접 사용한다.
```

### 데드라인 유형 레이블

현재 `DEADLINE_TYPES` enum은 있지만 한국어 레이블 맵이 없다. 추가한다.

```typescript
export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  VISA_EXPIRY: "비자 만료",
  INSURANCE_ENROLLMENT: "보험 가입",
  CHANGE_REPORT: "변경 신고",
  CONTRACT_RENEWAL: "계약 갱신",
};
```

### 데드라인 상태 레이블

```typescript
export const DEADLINE_STATUS_LABELS: Record<DeadlineStatus, string> = {
  PENDING: "대기",
  APPROACHING: "임박",
  URGENT: "긴급",
  OVERDUE: "초과",
  COMPLETED: "완료",
};
```

## 컴포넌트 설계

### 1. 공통 페이지네이션 컴포넌트

**파일**: `components/ui/pagination-controls.tsx`

```typescript
interface PaginationControlsProps {
  currentPage: number;    // 1-based
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}
```

- 이전/다음 버튼 + 페이지 번호 표시
- shadcn/ui `Button` 활용
- "총 N건 중 X-Y" 정보 표시

**말줄임(ellipsis) 규칙:**
- 총 페이지 수 ≤ 7: 모두 표시
- 총 페이지 수 > 7: 현재 페이지 기준 앞뒤 1페이지 + 첫 페이지 + 마지막 페이지 표시, 나머지는 `...`
- 예: 현재 5페이지, 총 10페이지 → `1 ... 4 5 6 ... 10`

### 2. 공통 페이지네이션 유틸

**파일**: `lib/pagination.ts`

```typescript
const DEFAULT_PAGE_SIZE = 20;

interface PaginatedResult<T> {
  items: T[];           // "data" 대신 "items"로 React Query data와의 중첩 방지
  totalItems: number;
  totalPages: number;
  currentPage: number;  // 1-based
  pageSize: number;
}

function paginateItems<T>(
  items: readonly T[],
  page: number,           // 1-based
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginatedResult<T>;
```

- `page`가 범위 밖이면 마지막 유효 페이지로 클램핑
- 빈 배열이면 `{ items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize }`
- 서버 사이드 전환 시 이 함수를 API 응답 메타데이터로 대체

### 3. Worker 페이지 필터링

**파일 변경**: `components/workers/worker-table.tsx`

**필터 항목 (총 4개)**:
| 필터 | 타입 | value | label |
|------|------|-------|-------|
| 이름/국적 검색 | 텍스트 입력 | 자유 입력 | (기존) |
| 비자 유형 | Select | `"ALL"` / `VISA_TYPES` 값 | `VISA_TYPE_LABELS` (기존) |
| 상태 | Select | `"ALL"` / `"ACTIVE"` / `"INACTIVE"` / `"TERMINATED"` | `WORKER_STATUS_LABELS` (신규) |
| 보험 가입 상태 | Select | `"ALL"` / `"의무"` / `"임의"` / `"면제"` | `INSURANCE_STATUS_LABELS` (신규) |

**보험 필터 로직**: `worker.insuranceEligibilities` 배열 내 선택한 `status` 값을 가진 항목이 하나라도 있으면 매칭

**필터 변경 시 동작**: 페이지를 1로 리셋

**스켈레톤 업데이트**: `WorkerTableSkeleton`에 신규 필터 2개의 스켈레톤 + 페이지네이션 영역 스켈레톤 추가

### 4. Worker React Query 훅 확장

**파일 변경**: `lib/queries/use-workers.ts`

```typescript
interface WorkerFilterParams {
  page: number;           // 1-based
  search: string;
  visaType: string;       // "ALL" | VisaType
  status: string;         // "ALL" | WorkerStatus
  insuranceStatus: string; // "ALL" | InsuranceStatus
}

function usePaginatedWorkers(params: WorkerFilterParams): {
  workers: PaginatedResult<WorkerResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
};
```

- 반환 필드명을 `workers`로 하여 React Query의 `data`와 중첩 방지
- `queryKey`: `["workers"]` — 기존 `useWorkers()`와 동일한 키를 사용하여 캐시 공유 (중복 fetch 방지). 훅 내부에서 전체 데이터에 클라이언트 사이드 필터+페이지네이션을 적용하는 래퍼 구조.
- 내부에서 전체 workers fetch → 필터링 → `paginateItems()` 적용
- 기존 `useWorkers()` 훅은 유지 (대시보드 등에서 사용)
- 기존 `useRegisterWorker`의 `invalidateQueries({ queryKey: ["workers"] })`가 동일 키이므로 자동 무효화

### 5. Compliance 페이지 필터링

**파일 변경**: `app/(app)/compliance/page.tsx`, `components/compliance/deadline-table.tsx`

**통합 필터 바 (페이지 상단, 두 섹션에 공유)**:
| 필터 | 타입 | value | label |
|------|------|-------|-------|
| 데드라인 유형 | Select | `"ALL"` / `DEADLINE_TYPES` 값 | `DEADLINE_TYPE_LABELS` |
| 상태 | Select | `"ALL"` / `DEADLINE_STATUSES` 값 | `DEADLINE_STATUS_LABELS` |

**각 섹션 독립 페이지네이션**: overdue 테이블과 upcoming 테이블이 각각 자기만의 `currentPage`를 관리

**필터 변경 시 동작**: 두 테이블의 `currentPage`를 모두 1로 리셋

**`DeadlineTable`의 `limit` prop 처리**:
- `limit` prop은 유지한다. 대시보드 페이지(`app/(app)/page.tsx`)에서 `DeadlineTable`을 `limit` prop과 함께 사용 중이다. worker 상세 페이지(`app/(app)/workers/[id]/page.tsx`)에서도 `DeadlineTable`을 사용하지만 `limit` 없이 전체 표시한다.
- `limit`과 페이지네이션은 상호 배타적으로 동작: `limit`이 주어지면 페이지네이션을 표시하지 않고 슬라이스만 적용, `limit`이 없으면 페이지네이션을 표시

### 6. Compliance React Query 훅 확장

**파일 변경**: `lib/queries/use-compliance.ts`

```typescript
interface ComplianceFilterValues {
  deadlineType: string;   // "ALL" | DeadlineType
  status: string;         // "ALL" | DeadlineStatus
}

function usePaginatedOverdueDeadlines(
  filters: ComplianceFilterValues,
  page: number              // 독립 페이지 — overdue용
): {
  deadlines: PaginatedResult<ComplianceDeadlineResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
};

function usePaginatedUpcomingDeadlines(
  days: number,
  filters: ComplianceFilterValues,
  page: number              // 독립 페이지 — upcoming용
): {
  deadlines: PaginatedResult<ComplianceDeadlineResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
};
```

- `page`를 `filters`와 분리하여 두 훅이 독립적으로 페이지를 관리할 수 있도록 설계
- `queryKey`: 기존 훅과 동일한 키 사용 — `usePaginatedOverdueDeadlines` → `["compliance", "overdue"]`, `usePaginatedUpcomingDeadlines` → `["compliance", "upcoming", days]`. 캐시를 공유하여 중복 fetch를 방지하고, 차트용 `useUpcomingDeadlines(30)`과 동시 마운트 시에도 네트워크 요청 1회만 발생.
- 기존 `useOverdueDeadlines()`, `useUpcomingDeadlines()` 훅은 유지 (대시보드, 차트에서 사용)
- 30초 refetchInterval 유지

## 에러 및 빈 상태 처리

### 에러 상태

기존 컴포넌트에 에러 처리가 없으므로, 이번 작업 범위에서는 기존 패턴을 따른다 (에러 시 빈 테이블 표시). 에러 UI 개선은 별도 작업으로 분리.

### 빈 필터 결과

- 전체 데이터 0건: "데이터가 없습니다" (기존 메시지 유지)
- 필터 적용 후 결과 0건: "조건에 맞는 결과가 없습니다" (필터 리셋 버튼 없이 메시지만)

## 캐시 무효화

- `usePaginatedWorkers`의 `queryKey`는 `["workers", "paginated", params]`
- 기존 `useRegisterWorker` mutation의 `invalidateQueries({ queryKey: ["workers"] })`가 React Query 부분 매칭으로 `["workers", "paginated", ...]`도 무효화한다
- 이 동작은 의도된 것이며, 신규 등록 후 목록이 자동 갱신되어야 하므로 올바른 동작

## 레이아웃

### Worker 페이지
- 상단: 제목 + 신규 등록 버튼
- 필터 바: 검색 입력 + 비자유형/상태/보험상태 셀렉트가 한 줄에 배치 (flex-wrap)
- 테이블: 이름, 국적, 비자 유형, 비자 만료일, 상태, 보험 컬럼
- 하단: 페이지네이션 컨트롤 ("총 N명 중 X-Y" + 페이지 버튼)

### Compliance 페이지
- 상단: 제목
- 통합 필터 바: 배경색 구분된 카드 안에 데드라인 유형 + 상태 셀렉트
- 기한 초과 섹션: DeadlineTable + 독립 페이지네이션
- 임박 섹션: DeadlineTable + DeadlineChart 2컬럼 그리드 (기존 유지) + 독립 페이지네이션

## 서버 사이드 전환 가이드

백엔드가 페이지네이션 API를 지원하게 되면:

1. **Route Handler 변경**: `app/api/workers/route.ts` 등에서 쿼리 파라미터(`page`, `size`, `search`, `visaType` 등)를 백엔드로 전달
2. **훅 내부 변경**: `usePaginatedWorkers` 등에서 클라이언트 사이드 filter/slice 로직 제거, API 응답의 페이지 메타데이터 사용. `page - 1`로 0-based 변환 (백엔드가 0-based인 경우)
3. **`paginateItems()` 제거**: 더 이상 필요 없음
4. **컴포넌트 변경 없음**: `PaginationControls`와 필터 UI는 동일한 props를 받으므로 변경 불필요

## 변경 파일 목록

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `types/api.ts` | 수정 (필수) | `WORKER_STATUSES`, `INSURANCE_STATUSES`, `DEADLINE_TYPE_LABELS`, `DEADLINE_STATUS_LABELS` 추가 |
| `components/ui/pagination-controls.tsx` | 신규 | 공통 페이지네이션 UI 컴포넌트 |
| `lib/pagination.ts` | 신규 | `paginateItems()` 유틸 + `PaginatedResult` 타입 |
| `lib/queries/use-workers.ts` | 수정 | `usePaginatedWorkers` 훅 추가 |
| `lib/queries/use-compliance.ts` | 수정 | `usePaginatedOverdueDeadlines`, `usePaginatedUpcomingDeadlines` 훅 추가 |
| `components/workers/worker-table.tsx` | 수정 | 상태/보험 필터 추가, 페이지네이션 연동, 로컬 상수를 types/api.ts import로 교체, 스켈레톤 업데이트 |
| `components/compliance/deadline-table.tsx` | 수정 | 페이지네이션 연동, `limit`과 페이지네이션 상호 배타 처리 |
| `app/(app)/compliance/page.tsx` | 수정 | 통합 필터 바 추가, 필터 상태 관리, paginated 훅 사용 |

## 테스트 계획

- **단위 테스트**: `paginateItems()` 유틸 함수 — 정상 케이스, 빈 배열, 범위 초과 클램핑, 마지막 페이지
- **컴포넌트 테스트**: `PaginationControls` 렌더링, 페이지 클릭/이전/다음 이벤트, 비활성 상태, 말줄임 표시
- **통합 테스트**: `WorkerTable` 필터 4종 조합 + 페이지네이션, `DeadlineTable` 필터 + 페이지네이션
- **E2E 테스트**: Worker 페이지 필터링 → 페이지 이동 → 필터 변경 시 1페이지 리셋 플로우
- **MSW 핸들러**: 테스트에서 50건 이상 목 데이터 반환하도록 `mocks/data.ts`, `mocks/handlers.ts` 업데이트 필요
