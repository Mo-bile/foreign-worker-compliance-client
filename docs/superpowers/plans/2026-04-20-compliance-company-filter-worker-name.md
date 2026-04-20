# Compliance companyId 필터 + workerName 표시 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** compliance 쿼리에 companyId 필터를 추가하고, 데드라인 테이블에 workerName을 표시한다.

**Architecture:** `types/api.ts` 타입 변경 → BFF 라우트에 companyId 전달 → 쿼리 훅에 companyId 파라미터 → 컴플라이언스 페이지에서 useCompanyContext 연결 → 데드라인 테이블 UI 변경 → mock/테스트 업데이트

**Tech Stack:** Next.js 16, React 19, TanStack Query v5, Vitest

---

### Task 1: types/api.ts + mock 데이터 — workerName 추가

**Files:**
- Modify: `types/api.ts:339-346` (ComplianceDeadlineResponse)
- Modify: `mocks/data.ts:282-377` (deadline mock 데이터)

- [ ] **Step 1: Update ComplianceDeadlineResponse type**

`types/api.ts`에서 `ComplianceDeadlineResponse`에 `workerName` 추가:

```ts
export interface ComplianceDeadlineResponse {
  readonly id: number;
  readonly workerId: number;
  readonly workerName: string;
  readonly deadlineType: DeadlineType;
  readonly dueDate: string;
  readonly status: DeadlineStatus;
  readonly description: string;
}
```

- [ ] **Step 2: Update mock data — worker name lookup + generators**

`mocks/data.ts`에서:

1. deadline 생성 함수에서 workerName을 workerId로부터 조회. mockWorkers 배열에서 이름을 가져오는 헬퍼 추가:

```ts
function getWorkerName(workerId: number): string {
  const worker = mockWorkers.find((w) => w.id === workerId);
  return worker?.name ?? `Worker-${workerId}`;
}
```

2. `generateOverdueDeadline`과 `generateUpcomingDeadline`에 `workerName` 추가:

```ts
function generateOverdueDeadline(id: number): ComplianceDeadlineResponse {
  const typeIdx = id % SAMPLE_DEADLINE_TYPES.length;
  const type = SAMPLE_DEADLINE_TYPES[typeIdx];
  const workerId = (id % 25) + 1;
  return {
    id,
    workerId,
    workerName: getWorkerName(workerId),
    deadlineType: type,
    dueDate: `2025-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 28) + 1).padStart(2, "0")}`,
    status: "OVERDUE",
    description: SAMPLE_DEADLINE_DESCS[type],
  };
}
```

`generateUpcomingDeadline`도 동일하게 `workerName: getWorkerName(workerId)` 추가.

3. 수동 작성 deadline(id:1, id:2, id:3, id:4, id:5)에도 `workerName` 추가:

```ts
{ id: 1, workerId: 1, workerName: "Nguyen Van Minh", deadlineType: "VISA_EXPIRY", ... },
{ id: 2, workerId: 2, workerName: "Zhang Wei", deadlineType: "HEALTH_INSURANCE_ENROLLMENT", ... },
{ id: 3, workerId: 1, workerName: "Nguyen Van Minh", deadlineType: "CONTRACT_RENEWAL", ... },
{ id: 4, workerId: 2, workerName: "Zhang Wei", deadlineType: "CHANGE_REPORT", ... },
{ id: 5, workerId: 1, workerName: "Nguyen Van Minh", deadlineType: "VISA_EXPIRY", ... },
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E "data\.ts|api\.ts" | head -10`
Expected: 일부 소비자 파일에서 에러 가능 (테스트 fixture에 workerName 누락) — Task 5에서 수정

- [ ] **Step 4: Commit**

```bash
git add types/api.ts mocks/data.ts
git commit -m "feat: ComplianceDeadlineResponse에 workerName 추가 + mock 데이터 업데이트"
```

---

### Task 2: BFF 라우트 — companyId 전달

**Files:**
- Modify: `app/api/compliance/overdue/route.ts`
- Modify: `app/api/compliance/upcoming/route.ts`

- [ ] **Step 1: Update overdue route**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId");
  const params = companyId ? `?companyId=${companyId}` : "";
  try {
    const deadlines = await apiClient.get<ComplianceDeadlineResponse[]>(
      `/api/compliance/overdue${params}`,
    );
    return NextResponse.json(deadlines);
  } catch (error) {
    return handleRouteError(error, "GET /api/compliance/overdue");
  }
}
```

- [ ] **Step 2: Update upcoming route**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const days = searchParams.get("days") ?? "30";
  const companyId = searchParams.get("companyId");
  const params = new URLSearchParams({ days });
  if (companyId) params.set("companyId", companyId);
  try {
    const deadlines = await apiClient.get<ComplianceDeadlineResponse[]>(
      `/api/compliance/upcoming?${params.toString()}`,
    );
    return NextResponse.json(deadlines);
  } catch (error) {
    return handleRouteError(error, "GET /api/compliance/upcoming");
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/compliance/overdue/route.ts app/api/compliance/upcoming/route.ts
git commit -m "feat: compliance BFF 라우트에 companyId 쿼리 파라미터 전달"
```

---

### Task 3: 쿼리 훅 — companyId 파라미터 추가

**Files:**
- Modify: `lib/queries/use-compliance.ts`

- [ ] **Step 1: Update useOverdueDeadlines**

```ts
export function useOverdueDeadlines(companyId?: number | null) {
  return useQuery<readonly ComplianceDeadlineResponse[]>({
    queryKey: ["compliance", "overdue", { companyId }],
    queryFn: () => {
      const params = companyId ? `?companyId=${companyId}` : "";
      return fetchApi<readonly ComplianceDeadlineResponse[]>(
        `/api/compliance/overdue${params}`,
        "기한초과 데이터를 불러올 수 없습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
    refetchInterval: 30_000,
  });
}
```

- [ ] **Step 2: Update useUpcomingDeadlines**

```ts
export function useUpcomingDeadlines(days: number = 30, companyId?: number | null) {
  return useQuery<readonly ComplianceDeadlineResponse[]>({
    queryKey: ["compliance", "upcoming", days, { companyId }],
    queryFn: () => {
      const params = new URLSearchParams({ days: String(days) });
      if (companyId) params.set("companyId", String(companyId));
      return fetchApi<readonly ComplianceDeadlineResponse[]>(
        `/api/compliance/upcoming?${params.toString()}`,
        "임박 데드라인을 불러올 수 없습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
    refetchInterval: 30_000,
  });
}
```

- [ ] **Step 3: Update usePaginatedOverdueDeadlines**

```ts
export function usePaginatedOverdueDeadlines(
  companyId: number | null,
  filters: ComplianceFilterValues,
  page: number,
): {
  deadlines: PaginatedResult<ComplianceDeadlineResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useOverdueDeadlines(companyId);

  const deadlines = query.data
    ? paginateItems(filterDeadlines(query.data, filters), page)
    : undefined;

  return { deadlines, isLoading: query.isLoading, isError: query.isError };
}
```

- [ ] **Step 4: Update usePaginatedUpcomingDeadlines**

```ts
export function usePaginatedUpcomingDeadlines(
  days: number,
  companyId: number | null,
  filters: ComplianceFilterValues,
  page: number,
): {
  deadlines: PaginatedResult<ComplianceDeadlineResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useUpcomingDeadlines(days, companyId);

  const deadlines = query.data
    ? paginateItems(filterDeadlines(query.data, filters), page)
    : undefined;

  return { deadlines, isLoading: query.isLoading, isError: query.isError };
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/queries/use-compliance.ts
git commit -m "feat: compliance 쿼리 훅에 companyId 파라미터 추가"
```

---

### Task 4: 컴플라이언스 페이지 + 데드라인 테이블 UI

**Files:**
- Modify: `app/(app)/compliance/page.tsx`
- Modify: `components/compliance/deadline-table.tsx`

- [ ] **Step 1: Update compliance page — useCompanyContext 연결**

`app/(app)/compliance/page.tsx`:

1. import 추가:
```ts
import { useCompanyContext } from "@/lib/contexts/company-context";
```

2. 컴포넌트 내부 상단에 companyId 가져오기:
```ts
const { selectedCompanyId } = useCompanyContext();
```

3. 훅 호출 변경:
```ts
// FROM:
const overdueAll = useOverdueDeadlines();
const overdue = usePaginatedOverdueDeadlines(filters, overduePage);
const upcoming = usePaginatedUpcomingDeadlines(30, filters, upcomingPage);
const upcomingAll = useUpcomingDeadlines(30);

// TO:
const overdueAll = useOverdueDeadlines(selectedCompanyId);
const overdue = usePaginatedOverdueDeadlines(selectedCompanyId, filters, overduePage);
const upcoming = usePaginatedUpcomingDeadlines(30, selectedCompanyId, filters, upcomingPage);
const upcomingAll = useUpcomingDeadlines(30, selectedCompanyId);
```

- [ ] **Step 2: Update deadline table — workerName 표시**

`components/compliance/deadline-table.tsx`:

1. 헤더 변경:
```tsx
// FROM:
<TableHead>근로자 ID</TableHead>

// TO:
<TableHead>근로자</TableHead>
```

2. 셀 변경:
```tsx
// FROM:
<TableCell>{d.workerId}</TableCell>

// TO:
<TableCell>{d.workerName} ({d.workerId})</TableCell>
```

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/compliance/page.tsx" components/compliance/deadline-table.tsx
git commit -m "feat: compliance 페이지 companyId 스코핑 + 데드라인 테이블 workerName 표시"
```

---

### Task 5: 테스트 업데이트

**Files:**
- Modify: `__tests__/lib/use-paginated-compliance.test.tsx`
- Modify: `__tests__/components/deadline-table.test.tsx`
- Modify: `__tests__/components/deadline-chart.test.tsx`

- [ ] **Step 1: Update deadline-table test fixtures**

`__tests__/components/deadline-table.test.tsx`의 `testDeadlines` fixture에 `workerName` 추가:

```ts
const testDeadlines: ComplianceDeadlineResponse[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  workerId: (i % 5) + 1,
  workerName: `Worker-${(i % 5) + 1}`,
  deadlineType: "VISA_EXPIRY" as const,
  dueDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-15`,
  status: "OVERDUE" as const,
  description: `테스트 데드라인 ${i + 1}`,
}));
```

- [ ] **Step 2: Update deadline-chart test fixtures**

`__tests__/components/deadline-chart.test.tsx`에서 `ComplianceDeadlineResponse` fixture에 `workerName` 추가. 파일을 열어 fixture를 찾고 각 객체에 `workerName: "테스트"` 추가.

- [ ] **Step 3: Update use-paginated-compliance test — companyId 파라미터**

`__tests__/lib/use-paginated-compliance.test.tsx`:

`usePaginatedOverdueDeadlines` 호출에 companyId 추가:
```ts
// FROM:
() => usePaginatedOverdueDeadlines({ deadlineType: "ALL", status: "ALL" }, 1),

// TO:
() => usePaginatedOverdueDeadlines(1, { deadlineType: "ALL", status: "ALL" }, 1),
```

`usePaginatedUpcomingDeadlines` 호출에 companyId 추가:
```ts
// FROM:
() => usePaginatedUpcomingDeadlines(30, { deadlineType: "ALL", status: "ALL" }, 1),

// TO:
() => usePaginatedUpcomingDeadlines(30, 1, { deadlineType: "ALL", status: "ALL" }, 1),
```

모든 테스트 호출에서 동일하게 companyId=1 추가.

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add __tests__/
git commit -m "test: compliance 테스트에 companyId + workerName 반영"
```

---

### Task 6: 최종 검증

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (기존 에러 제외)

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: 새 에러 없음
