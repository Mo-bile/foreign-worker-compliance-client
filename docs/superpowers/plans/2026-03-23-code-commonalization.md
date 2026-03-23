# 코드 공통화 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 3회 이상 반복되는 코드를 공통화하여 유지보수성을 높인다. 과도한 추상화 없이 1단계만.

**Architecture:** 상수 → 유틸 함수 → 공통 컴포넌트 순서로 의존성 방향을 따라 구현. 각 태스크는 독립적으로 빌드/테스트 통과해야 한다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, React Hook Form, Zod, shadcn/ui, React Query

**Spec:** `docs/superpowers/specs/2026-03-23-code-commonalization-design.md`

---

## Task 1: 에러 메시지 상수 추출

**Files:**
- Create: `lib/constants/error-messages.ts`
- Test: `__tests__/lib/constants/error-messages.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/constants/error-messages.test.ts
import { describe, it, expect } from "vitest";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

describe("ERROR_MESSAGES", () => {
  it("모든_필수_키가_존재한다", () => {
    expect(ERROR_MESSAGES.SERVER_ERROR).toBe("서버 오류가 발생했습니다");
    expect(ERROR_MESSAGES.INVALID_REQUEST_FORMAT).toBe("잘못된 요청 형식입니다");
    expect(ERROR_MESSAGES.INVALID_INPUT).toBe("입력값이 올바르지 않습니다");
    expect(ERROR_MESSAGES.PAGE_REFRESH_SUFFIX).toBe("페이지를 새로고침해 주세요.");
  });

  it("as_const로_불변이다", () => {
    // @ts-expect-error — readonly check
    ERROR_MESSAGES.SERVER_ERROR = "changed";
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run __tests__/lib/constants/error-messages.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation**

```typescript
// lib/constants/error-messages.ts
export const ERROR_MESSAGES = {
  SERVER_ERROR: "서버 오류가 발생했습니다",
  INVALID_REQUEST_FORMAT: "잘못된 요청 형식입니다",
  INVALID_INPUT: "입력값이 올바르지 않습니다",
  PAGE_REFRESH_SUFFIX: "페이지를 새로고침해 주세요.",
} as const;
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run __tests__/lib/constants/error-messages.test.ts`
Expected: PASS

- [ ] **Step 5: Run full test suite**

Run: `npm test`
Expected: 136+ tests pass

- [ ] **Step 6: Commit**

```bash
git add lib/constants/error-messages.ts __tests__/lib/constants/error-messages.test.ts
git commit -m "feat: extract ERROR_MESSAGES constants"
```

---

## Task 2: 상태 스타일 상수 추출

**Files:**
- Create: `lib/constants/status.ts`
- Test: `__tests__/lib/constants/status.test.ts`
- Modify: `components/compliance/status-badge.tsx` — 로컬 `STATUS_CONFIG` 제거, 상수 import
- Modify: `components/dashboard/deadline-chart.tsx` — 로컬 `STATUS_CONFIG` 제거, 상수 import

주의: `DEADLINE_STATUS_LABELS`는 `types/api.ts:147-153`에 이미 존재. 새로 만들지 않음.

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/constants/status.test.ts
import { describe, it, expect } from "vitest";
import { DEADLINE_STATUS_BADGE_STYLES, DEADLINE_STATUS_CHART_COLORS } from "@/lib/constants/status";
import { DEADLINE_STATUSES } from "@/types/api";
import type { DeadlineStatus } from "@/types/api";

describe("DEADLINE_STATUS_BADGE_STYLES", () => {
  it("모든_DeadlineStatus에_대한_스타일이_존재한다", () => {
    for (const status of DEADLINE_STATUSES) {
      expect(DEADLINE_STATUS_BADGE_STYLES[status]).toBeDefined();
      expect(typeof DEADLINE_STATUS_BADGE_STYLES[status]).toBe("string");
    }
  });
});

describe("DEADLINE_STATUS_CHART_COLORS", () => {
  it("OVERDUE와_COMPLETED를_제외한_상태에_대한_색상이_존재한다", () => {
    expect(DEADLINE_STATUS_CHART_COLORS.URGENT).toBe("#ef4444");
    expect(DEADLINE_STATUS_CHART_COLORS.APPROACHING).toBe("#f59e0b");
    expect(DEADLINE_STATUS_CHART_COLORS.PENDING).toBe("#22c55e");
  });

  it("OVERDUE와_COMPLETED는_포함하지_않는다", () => {
    expect("OVERDUE" in DEADLINE_STATUS_CHART_COLORS).toBe(false);
    expect("COMPLETED" in DEADLINE_STATUS_CHART_COLORS).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run __tests__/lib/constants/status.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation**

```typescript
// lib/constants/status.ts
import type { DeadlineStatus } from "@/types/api";

export const DEADLINE_STATUS_BADGE_STYLES: Record<DeadlineStatus, string> = {
  OVERDUE: "bg-red-100 text-red-800 hover:bg-red-200",
  URGENT: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  APPROACHING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  PENDING: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  COMPLETED: "bg-green-100 text-green-800 hover:bg-green-200",
} as const;

type ChartableStatus = Exclude<DeadlineStatus, "OVERDUE" | "COMPLETED">;

export const DEADLINE_STATUS_CHART_COLORS: Record<ChartableStatus, string> = {
  URGENT: "#ef4444",
  APPROACHING: "#f59e0b",
  PENDING: "#22c55e",
} as const;
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run __tests__/lib/constants/status.test.ts`
Expected: PASS

- [ ] **Step 5: types/api.ts OVERDUE 라벨 수정**

`types/api.ts:151`에서 `OVERDUE: "초과"` → `OVERDUE: "기한초과"`로 변경.
현재 `status-badge.tsx`가 "기한초과"를 사용 중이므로, 공통 라벨로 통일할 때 기존 UI 동작을 유지하려면 이 변경이 필수.

```typescript
// types/api.ts (line 151)
// Before
OVERDUE: "초과",
// After
OVERDUE: "기한초과",
```

- [ ] **Step 6: Refactor status-badge.tsx — import 공통 상수**

`components/compliance/status-badge.tsx`에서:
- 로컬 `STATUS_CONFIG` 상수 제거
- `DEADLINE_STATUS_LABELS`를 `@/types/api`에서 import
- `DEADLINE_STATUS_BADGE_STYLES`를 `@/lib/constants/status`에서 import

```typescript
// components/compliance/status-badge.tsx (After)
import { Badge } from "@/components/ui/badge";
import { DEADLINE_STATUS_LABELS } from "@/types/api";
import type { DeadlineStatus } from "@/types/api";
import { DEADLINE_STATUS_BADGE_STYLES } from "@/lib/constants/status";

export function StatusBadge({ status }: { readonly status: DeadlineStatus }) {
  return (
    <Badge variant="secondary" className={DEADLINE_STATUS_BADGE_STYLES[status]}>
      {DEADLINE_STATUS_LABELS[status]}
    </Badge>
  );
}
```

- [ ] **Step 7: Refactor deadline-chart.tsx — import 공통 상수**

`components/dashboard/deadline-chart.tsx`에서:
- 로컬 `STATUS_CONFIG` 상수를 삭제
- `DEADLINE_STATUS_CHART_COLORS`를 `@/lib/constants/status`에서 import
- `DEADLINE_STATUS_LABELS`를 `@/types/api`에서 import
- `CHART_STATUSES` 배열은 그대로 유지 (차트 전용 필터링 로직)

교체 대상 (4곳):

1. **Tooltip rows 배열** (lines 103-107):
```typescript
// Before
const rows: { label: string; color: string; value: number }[] = [
  { ...STATUS_CONFIG.URGENT, value: datum.urgent },
  { ...STATUS_CONFIG.APPROACHING, value: datum.approaching },
  { ...STATUS_CONFIG.PENDING, value: datum.pending },
].filter((r) => r.value > 0);

// After
const rows: { label: string; color: string; value: number }[] = [
  { label: DEADLINE_STATUS_LABELS.URGENT, color: DEADLINE_STATUS_CHART_COLORS.URGENT, value: datum.urgent },
  { label: DEADLINE_STATUS_LABELS.APPROACHING, color: DEADLINE_STATUS_CHART_COLORS.APPROACHING, value: datum.approaching },
  { label: DEADLINE_STATUS_LABELS.PENDING, color: DEADLINE_STATUS_CHART_COLORS.PENDING, value: datum.pending },
].filter((r) => r.value > 0);
```

2. **Legend** (lines 157, 159):
```typescript
// Before
style={{ backgroundColor: STATUS_CONFIG[status].color }}
{STATUS_CONFIG[status].label}

// After
style={{ backgroundColor: DEADLINE_STATUS_CHART_COLORS[status] }}
{DEADLINE_STATUS_LABELS[status]}
```

3. **Bar fill** (line 218):
```typescript
// Before
fill={STATUS_CONFIG[status].color}
// After
fill={DEADLINE_STATUS_CHART_COLORS[status]}
```

주의: `deadline-chart.tsx`의 `CHART_STATUSES`는 `"PENDING" | "APPROACHING" | "URGENT"` 타입이며 차트 전용이므로 그대로 둔다.

- [ ] **Step 8: Run full test suite + build**

Run: `npm test && npm run build`
Expected: All tests pass, build succeeds

- [ ] **Step 9: Commit**

```bash
git add types/api.ts lib/constants/status.ts __tests__/lib/constants/status.test.ts components/compliance/status-badge.tsx components/dashboard/deadline-chart.tsx
git commit -m "refactor: extract deadline status styles to shared constants"
```

---

## Task 3: API Route 에러 핸들링 유틸

**Files:**
- Create: `lib/api-route-utils.ts`
- Test: `__tests__/lib/api-route-utils.test.ts`
- Modify: 7개 Route Handler 파일 (적용)

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/api-route-utils.test.ts
import { describe, it, expect, vi } from "vitest";
import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";
import { ApiError } from "@/lib/api-client";

describe("handleRouteError", () => {
  it("ApiError이면_해당_status와_message를_반환한다", () => {
    const error = new ApiError(404, "Not Found", "사업장을 찾을 수 없습니다");
    const res = handleRouteError(error, "GET /api/companies/1");
    expect(res.status).toBe(404);
  });

  it("일반_에러이면_500과_기본_메시지를_반환한다", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = handleRouteError(new Error("unknown"), "GET /api/workers");
    expect(res.status).toBe(500);
    expect(consoleSpy).toHaveBeenCalledWith(
      "[GET /api/workers] Unexpected error:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});

describe("parseRequestBody", () => {
  it("유효한_JSON이면_data를_반환한다", async () => {
    const body = JSON.stringify({ name: "test" });
    const request = new Request("http://localhost", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
    const result = await parseRequestBody(request);
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { data: unknown }).data).toEqual({ name: "test" });
  });

  it("JSON_파싱_실패시_400_NextResponse를_반환한다", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      body: "not json",
    });
    const result = await parseRequestBody(request);
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});

describe("validateSchema", () => {
  const schema = z.object({ name: z.string().min(1, "이름은 필수입니다") });

  it("유효한_데이터면_data를_반환한다", () => {
    const result = validateSchema(schema, { name: "test" });
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { data: { name: string } }).data).toEqual({ name: "test" });
  });

  it("유효하지_않은_데이터면_400_NextResponse를_반환한다", () => {
    const result = validateSchema(schema, { name: "" });
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run __tests__/lib/api-route-utils.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation**

```typescript
// lib/api-route-utils.ts
import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { ApiError } from "@/lib/api-client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

export function handleRouteError(error: unknown, context: string): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  console.error(`[${context}] Unexpected error:`, error);
  return NextResponse.json(
    { message: ERROR_MESSAGES.SERVER_ERROR },
    { status: 500 },
  );
}

export async function parseRequestBody(
  request: Request,
): Promise<{ data: unknown } | NextResponse> {
  try {
    const data: unknown = await request.json();
    return { data };
  } catch {
    return NextResponse.json(
      { message: ERROR_MESSAGES.INVALID_REQUEST_FORMAT },
      { status: 400 },
    );
  }
}

export function validateSchema<T>(
  schema: ZodSchema<T>,
  body: unknown,
): { data: T } | NextResponse {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_INPUT;
    return NextResponse.json({ message: firstError }, { status: 400 });
  }
  return { data: parsed.data };
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run __tests__/lib/api-route-utils.test.ts`
Expected: PASS

- [ ] **Step 5: Refactor — `app/api/companies/route.ts` 적용**

Before (43줄) → After (~20줄). 가장 많은 패턴이 적용되는 파일부터 시작.

```typescript
// app/api/companies/route.ts (After)
import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { createCompanyRequestSchema } from "@/types/api";
import type { CompanyResponse } from "@/types/api";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";

export async function GET() {
  try {
    const companies = await apiClient.get<CompanyResponse[]>("/api/companies");
    return NextResponse.json(companies);
  } catch (error) {
    return handleRouteError(error, "GET /api/companies");
  }
}

export async function POST(request: NextRequest) {
  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validated = validateSchema(createCompanyRequestSchema, bodyResult.data);
  if (validated instanceof NextResponse) return validated;

  try {
    const company = await apiClient.post<CompanyResponse>("/api/companies", validated.data);
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "POST /api/companies");
  }
}
```

- [ ] **Step 6: Refactor — `app/api/companies/[id]/route.ts` 적용**

동일 패턴. `parseId` 로직은 그대로 유지 (2회 사용이지만 Route별 ID 필드명이 다를 수 있음).

- [ ] **Step 7: Refactor — `app/api/workers/route.ts` 적용**

주의: POST에서 Zod 검증 없이 바로 `apiClient.post`에 전달 중 (백엔드에서 검증). `validateSchema` 없이 `parseRequestBody` + `handleRouteError`만 적용.

- [ ] **Step 8: Refactor — `app/api/workers/[id]/route.ts` 적용**

`handleRouteError`만 적용.

- [ ] **Step 9: Refactor — 나머지 3개 compliance Route Handler 적용**

`app/api/compliance/overdue/route.ts`, `upcoming/route.ts`, `worker/[id]/route.ts` — 모두 `handleRouteError`만 적용.

- [ ] **Step 10: Run full test suite + build**

Run: `npm test && npm run build`
Expected: All tests pass, build succeeds

- [ ] **Step 11: Commit**

```bash
git add lib/api-route-utils.ts __tests__/lib/api-route-utils.test.ts app/api/
git commit -m "refactor: extract API route error handling utilities"
```

---

## Task 4: React Query 공통 fetch 유틸

**Files:**
- Modify: `lib/queries/query-utils.ts` — `fetchApi`, `mutateApi` 추가
- Test: `__tests__/lib/queries/query-utils.test.ts`
- Modify: `lib/queries/use-workers.ts` — `fetchApi`/`mutateApi` 적용
- Modify: `lib/queries/use-companies.ts` — `fetchApi`/`mutateApi` 적용
- Modify: `lib/queries/use-compliance.ts` — `fetchApi` 적용

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/queries/query-utils.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchApi, mutateApi, throwResponseError } from "@/lib/queries/query-utils";

// global.fetch mock
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

afterEach(() => {
  mockFetch.mockReset();
});

describe("fetchApi", () => {
  it("성공시_JSON_데이터를_반환한다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: 1 }]),
    });
    const result = await fetchApi<{ id: number }[]>("/api/test", "에러");
    expect(result).toEqual([{ id: 1 }]);
    expect(mockFetch).toHaveBeenCalledWith("/api/test");
  });

  it("실패시_에러를_던진다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "서버 에러" }),
    });
    await expect(fetchApi("/api/test", "fallback")).rejects.toThrow("서버 에러");
  });
});

describe("mutateApi", () => {
  it("성공시_JSON_데이터를_반환한다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });
    const result = await mutateApi<{ id: number }>("/api/test", "POST", { name: "x" }, "에러");
    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledWith("/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });
  });

  it("실패시_에러를_던진다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: "잘못된 입력" }),
    });
    await expect(mutateApi("/api/test", "POST", {}, "fallback")).rejects.toThrow("잘못된 입력");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run __tests__/lib/queries/query-utils.test.ts`
Expected: FAIL (`fetchApi` not found)

- [ ] **Step 3: Write implementation — `fetchApi`, `mutateApi` 추가**

`lib/queries/query-utils.ts` 기존 `throwResponseError` 아래에 추가:

```typescript
// lib/queries/query-utils.ts (추가할 부분)

export async function fetchApi<T>(endpoint: string, errorMessage: string): Promise<T> {
  const res = await fetch(endpoint);
  if (!res.ok) return throwResponseError(res, errorMessage);
  return res.json();
}

export async function mutateApi<T>(
  endpoint: string,
  method: string,
  data: unknown,
  errorMessage: string,
): Promise<T> {
  const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return throwResponseError(res, errorMessage);
  return res.json();
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run __tests__/lib/queries/query-utils.test.ts`
Expected: PASS

- [ ] **Step 5: Refactor — `use-companies.ts` 적용**

각 훅의 `queryFn`/`mutationFn` 내부를 `fetchApi`/`mutateApi`로 교체.

```typescript
// Before
queryFn: async () => {
  const res = await fetch("/api/companies");
  if (!res.ok) await throwResponseError(res, "사업장 목록을 불러올 수 없습니다");
  return res.json();
},

// After
queryFn: () => fetchApi<readonly CompanyResponse[]>(
  "/api/companies", "사업장 목록을 불러올 수 없습니다",
),
```

적용 대상: `useCompanies`, `useCompany`, `useCreateCompany`, `useUpdateCompany`

주의: `useUpdateCompany`의 `mutationFn`은 `({ id, data }) => mutateApi(...)` 형태로, id를 endpoint에 포함시키고 data만 body로 전달.

```typescript
mutationFn: ({ id, data }) => mutateApi<CompanyResponse>(
  `/api/companies/${id}`, "PUT", data, "사업장 수정에 실패했습니다",
),
```

- [ ] **Step 6: Refactor — `use-workers.ts` 적용**

`useWorkers`, `useWorker`, `useRegisterWorker`에 적용.

주의: `useWorkers`는 동적 endpoint이므로:
```typescript
queryFn: () => fetchApi<readonly WorkerResponse[]>(
  `/api/workers${params}`, "근로자 목록을 불러올 수 없습니다",
),
```

- [ ] **Step 7: Refactor — `use-compliance.ts` 적용**

`useOverdueDeadlines`, `useUpcomingDeadlines`, `useWorkerDeadlines`에 `fetchApi` 적용.

주의: `use-compliance.ts`는 현재 `throw new Error(msg)` 사용 중 (`throwResponseError` 아님). `fetchApi`로 교체하면 에러 형태가 `throwResponseError`로 통일됨 — 이것이 올바른 변경.

- [ ] **Step 8: Run full test suite + build**

Run: `npm test && npm run build`
Expected: All tests pass, build succeeds

- [ ] **Step 9: Commit**

```bash
git add lib/queries/query-utils.ts __tests__/lib/queries/query-utils.test.ts lib/queries/use-workers.ts lib/queries/use-companies.ts lib/queries/use-compliance.ts
git commit -m "refactor: extract fetchApi/mutateApi query utilities"
```

---

## Task 5: EmptyState 공통 컴포넌트

**Files:**
- Create: `components/common/empty-state.tsx`
- Test: `__tests__/components/common/empty-state.test.tsx`
- Modify: `components/workers/worker-table.tsx` — 로컬 empty state div 교체
- Modify: `components/companies/company-table.tsx` — 로컬 empty state div 교체
- Modify: `components/compliance/deadline-table.tsx:67,82-84` — empty state 교체

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/components/common/empty-state.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/common/empty-state";

describe("EmptyState", () => {
  it("메시지를_렌더링한다", () => {
    render(<EmptyState message="데이터가 없습니다" />);
    expect(screen.getByText("데이터가 없습니다")).toBeInTheDocument();
  });

  it("action이_있으면_함께_렌더링한다", () => {
    render(<EmptyState message="없습니다" action={<button>등록</button>} />);
    expect(screen.getByText("없습니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "등록" })).toBeInTheDocument();
  });

  it("variant_error이면_text-destructive_클래스를_적용한다", () => {
    render(<EmptyState message="에러 발생" variant="error" />);
    const p = screen.getByText("에러 발생");
    expect(p.className).toContain("text-destructive");
  });

  it("기본_variant는_text-destructive를_포함하지_않는다", () => {
    render(<EmptyState message="기본 상태" />);
    const p = screen.getByText("기본 상태");
    expect(p.className).not.toContain("text-destructive");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run __tests__/components/common/empty-state.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation**

```typescript
// components/common/empty-state.tsx
interface EmptyStateProps {
  readonly message: string;
  readonly action?: React.ReactNode;
  readonly variant?: "default" | "error";
}

export function EmptyState({ message, action, variant = "default" }: EmptyStateProps) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
      <p className={variant === "error" ? "text-destructive" : undefined}>
        {message}
      </p>
      {action}
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run __tests__/components/common/empty-state.test.tsx`
Expected: PASS

- [ ] **Step 5: Refactor — worker-table.tsx 적용**

`components/workers/worker-table.tsx:149-156`의 두 empty state div를 교체:

```typescript
// Before (lines 149-156)
{workers.length === 0 ? (
  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
    등록된 근로자가 없습니다
  </div>
) : filteredWorkers.length === 0 ? (
  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
    조건에 맞는 근로자가 없습니다
  </div>
) : (

// After
{workers.length === 0 ? (
  <EmptyState message="등록된 근로자가 없습니다" />
) : filteredWorkers.length === 0 ? (
  <EmptyState message="조건에 맞는 근로자가 없습니다" />
) : (
```

- [ ] **Step 6: Refactor — company-table.tsx 적용**

`components/companies/company-table.tsx:137-149`. CTA 버튼이 있는 케이스는 `action` prop 사용:

```typescript
// After
{companies.length === 0 ? (
  <EmptyState
    message="등록된 사업장이 없습니다"
    action={
      <Link href="/companies/new">
        <Button variant="outline" size="sm">첫 사업장을 등록해보세요</Button>
      </Link>
    }
  />
) : filtered.length === 0 ? (
  <EmptyState message="조건에 맞는 사업장이 없습니다" />
) : (
```

- [ ] **Step 7: Refactor — deadline-table.tsx 적용**

`components/compliance/deadline-table.tsx:82-84`의 에러 상태와 빈 상태 교체:

```typescript
// Before (line 82-84)
) : isError ? (
  <p className="text-destructive text-sm py-4 text-center">
    데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.
  </p>

// After
) : isError ? (
  <EmptyState message="데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요." variant="error" />
```

주의: 빈 상태(`emptyMessage`)는 `deadline-table.tsx:67`에서 동적 메시지를 사용하므로, 해당 부분도 `EmptyState`로 교체.

- [ ] **Step 8: Run full test suite + build**

Run: `npm test && npm run build`
Expected: All tests pass, build succeeds

- [ ] **Step 9: Commit**

```bash
git add components/common/empty-state.tsx __tests__/components/common/empty-state.test.tsx components/workers/worker-table.tsx components/companies/company-table.tsx components/compliance/deadline-table.tsx
git commit -m "refactor: extract EmptyState common component"
```

---

## Task 6: FilterSelect 공통 컴포넌트

**Files:**
- Create: `components/common/filter-select.tsx`
- Test: `__tests__/components/common/filter-select.test.tsx`
- Modify: `components/workers/worker-table.tsx` — 3개 Select 교체
- Modify: `components/companies/company-table.tsx` — 2개 Select 교체

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/components/common/filter-select.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterSelect } from "@/components/common/filter-select";

const options = ["A", "B", "C"] as const;
const labelMap: Record<string, string> = { A: "옵션 A", B: "옵션 B", C: "옵션 C" };

describe("FilterSelect", () => {
  it("placeholder를_aria-label로_설정한다", () => {
    render(
      <FilterSelect
        value="ALL"
        onValueChange={() => {}}
        placeholder="테스트 필터"
        options={[...options]}
        labelMap={labelMap}
      />,
    );
    expect(screen.getByRole("combobox", { name: "테스트 필터" })).toBeInTheDocument();
  });

  it("labelMap_없으면_value를_그대로_표시한다", async () => {
    const user = userEvent.setup();
    render(
      <FilterSelect
        value="ALL"
        onValueChange={() => {}}
        placeholder="필터"
        options={[...options]}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("전체_옵션이_항상_첫번째에_있다", async () => {
    const user = userEvent.setup();
    render(
      <FilterSelect
        value="ALL"
        onValueChange={() => {}}
        placeholder="필터"
        options={[...options]}
        labelMap={labelMap}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText("전체")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run __tests__/components/common/filter-select.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation**

```typescript
// components/common/filter-select.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps<T extends string> {
  readonly value: T | "ALL";
  readonly onValueChange: (value: T | "ALL") => void;
  readonly placeholder: string;
  readonly options: readonly T[];
  readonly labelMap?: Readonly<Record<T, string>>;
  readonly className?: string;
}

export function FilterSelect<T extends string>({
  value,
  onValueChange,
  placeholder,
  options,
  labelMap,
  className = "w-48",
}: FilterSelectProps<T>) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className} aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">전체</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labelMap ? labelMap[option] : option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run __tests__/components/common/filter-select.test.tsx`
Expected: PASS

- [ ] **Step 5: Refactor — worker-table.tsx 3개 Select 교체**

`components/workers/worker-table.tsx:108-146`의 3개 Select를 교체.

주의: visa Select는 `{visa} — {VISA_TYPE_LABELS[visa]}` 포맷을 사용하므로, 별도 labelMap을 인라인 생성하거나 상수로 정의:

```typescript
// worker-table.tsx 상단에 추가
const VISA_FILTER_LABELS: Record<VisaType, string> = Object.fromEntries(
  VISA_TYPES.map((v) => [v, `${v} — ${VISA_TYPE_LABELS[v]}`]),
) as Record<VisaType, string>;
```

insurance Select는 `labelMap` 없이 사용 (`INSURANCE_STATUSES`가 이미 한글).

```typescript
// After
<FilterSelect
  value={visaFilter}
  onValueChange={handleVisaChange}
  placeholder="비자 유형 전체"
  options={[...VISA_TYPES]}
  labelMap={VISA_FILTER_LABELS}
/>
<FilterSelect
  value={statusFilter}
  onValueChange={handleStatusChange}
  placeholder="상태 전체"
  options={[...WORKER_STATUSES]}
  labelMap={WORKER_STATUS_LABELS}
  className="w-40"
/>
<FilterSelect
  value={insuranceFilter}
  onValueChange={handleInsuranceChange}
  placeholder="보험 상태 전체"
  options={[...INSURANCE_STATUSES]}
  className="w-44"
/>
```

- [ ] **Step 6: Refactor — company-table.tsx 2개 Select 교체**

`components/companies/company-table.tsx:97-134`의 2개 Select를 교체.

주의: 현재 `onValueChange`에 인라인 로직 (`setPage(1)` 포함)이 있으므로, handler를 추출하거나 onValueChange 내에서 처리:

```typescript
<FilterSelect
  value={regionFilter}
  onValueChange={(v) => { setRegionFilter(v as FilterOption<Region>); setPage(1); }}
  placeholder="지역 전체"
  options={[...REGIONS]}
  labelMap={REGION_LABELS}
  className="w-40"
/>
<FilterSelect
  value={industryFilter}
  onValueChange={(v) => { setIndustryFilter(v as FilterOption<IndustryCategory>); setPage(1); }}
  placeholder="업종 전체"
  options={[...INDUSTRY_CATEGORIES]}
  labelMap={INDUSTRY_CATEGORY_LABELS}
  className="w-40"
/>
```

- [ ] **Step 7: 사용하지 않는 Select import 제거**

교체 후 `worker-table.tsx`와 `company-table.tsx`에서 직접 사용하지 않는 `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` import를 제거.

- [ ] **Step 8: Run full test suite + build**

Run: `npm test && npm run build`
Expected: All tests pass, build succeeds

- [ ] **Step 9: Commit**

```bash
git add components/common/filter-select.tsx __tests__/components/common/filter-select.test.tsx components/workers/worker-table.tsx components/companies/company-table.tsx
git commit -m "refactor: extract FilterSelect common component"
```

---

## Task 7: FormField 공통 컴포넌트

**Files:**
- Create: `components/form/form-field.tsx`
- Test: `__tests__/components/form/form-field.test.tsx`

이 태스크에서는 컴포넌트를 만들고 테스트만 한다. 실제 폼에 적용하는 것은 Task 8 (CompanyForm 통합) 에서 함께 수행.

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/components/form/form-field.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { FormField } from "@/components/form/form-field";

const schema = z.object({ name: z.string().min(1, "이름은 필수입니다") });
type TestForm = z.infer<typeof schema>;

function TestWrapper() {
  const { register, handleSubmit, formState: { errors } } = useForm<TestForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "" },
  });
  return (
    <form onSubmit={handleSubmit(() => {})}>
      <FormField<TestForm>
        label="이름"
        name="name"
        register={register}
        errors={errors}
        placeholder="홍길동"
      />
      <button type="submit">제출</button>
    </form>
  );
}

function ChildrenWrapper() {
  const { register, formState: { errors } } = useForm<TestForm>({
    defaultValues: { name: "" },
  });
  return (
    <FormField<TestForm> label="이름" name="name" register={register} errors={errors}>
      <select id="name" data-testid="custom-select">
        <option value="a">A</option>
      </select>
    </FormField>
  );
}

describe("FormField", () => {
  it("라벨과_입력_필드를_렌더링한다", () => {
    render(<TestWrapper />);
    expect(screen.getByLabelText("이름")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("홍길동")).toBeInTheDocument();
  });

  it("에러가_있으면_에러_메시지를_표시한다", async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);
    await user.click(screen.getByText("제출"));
    expect(await screen.findByText("이름은 필수입니다")).toBeInTheDocument();
  });

  it("children이_있으면_Input_대신_렌더링한다", () => {
    render(<ChildrenWrapper />);
    expect(screen.getByTestId("custom-select")).toBeInTheDocument();
    // Input은 렌더링되지 않아야 함
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run __tests__/components/form/form-field.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation**

```typescript
// components/form/form-field.tsx
import type { FieldError, FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldProps<T extends FieldValues> {
  readonly label: string;
  readonly name: Path<T>;
  readonly register: UseFormRegister<T>;
  readonly errors: FieldErrors<T>;
  readonly type?: "text" | "number" | "date" | "tel" | "email";
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly registerOptions?: Parameters<UseFormRegister<T>>[1];
  readonly children?: React.ReactNode;
}

export function FormField<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  disabled,
  className,
  registerOptions,
  children,
}: FormFieldProps<T>) {
  const error = errors[name] as FieldError | undefined;
  return (
    <div className={className ?? "flex flex-col gap-1.5"}>
      <Label htmlFor={name}>{label}</Label>
      {children ?? (
        <Input
          id={name}
          type={type}
          {...register(name, registerOptions)}
          aria-invalid={!!error}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}
```

주의사항:
- `registerOptions`를 prop으로 받아 `valueAsNumber: true` 같은 옵션 지원
- `className`을 prop으로 받아 `md:col-span-2` 같은 커스텀 레이아웃 지원

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run __tests__/components/form/form-field.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/form/form-field.tsx __tests__/components/form/form-field.test.tsx
git commit -m "feat: add FormField common component"
```

---

## Task 8: CompanyForm Create/Edit 통합 + FormField 적용

**Files:**
- Modify: `components/companies/company-form.tsx` — 전면 리팩토링
- Verify: `__tests__/components/company-form.test.tsx` — 기존 테스트 통과 확인

이 태스크는 기존 테스트가 이미 create/edit 모드를 커버하므로 기존 테스트를 regression guard로 활용.

- [ ] **Step 1: 기존 테스트가 통과하는지 확인**

Run: `npx vitest run __tests__/components/company-form.test.tsx`
Expected: PASS (현재 상태 기준선)

- [ ] **Step 2: CompanyForm 리팩토링**

`CreateCompanyForm` (47-258행)과 `EditCompanyForm` (260-462행)을 하나의 내부 함수로 병합.

핵심 변경:
1. `CompanyFormProps` discriminated union 유지 (타입 안전성)
2. `useForm` 스키마: mode에 따라 `createCompanyRequestSchema` / `updateCompanyRequestSchema` 선택
3. 사업자번호 필드: `mode === "edit"`이면 disabled Input으로 별도 처리
4. 나머지 필드: `FormField` 컴포넌트로 교체
5. Select 필드(region, industryCategory): `FormField`의 `children` prop + `Controller` 사용

mode별 분기 포인트:
- 스키마: `mode === "create" ? createCompanyRequestSchema : updateCompanyRequestSchema`
- defaultValues: create는 빈 객체, edit는 `props.defaultValues`
- onSubmit: create → `createMutation.mutate(data)`, edit → `updateMutation.mutate({ id, data })`
- CardTitle: "사업장 등록" / "사업장 수정"
- Button: "등록" / "수정"
- 리다이렉트: `/companies` / `/companies/${companyId}`
- 사업자번호: create → `FormField`로 입력, edit → `<Input id="businessNumber" value={props.businessNumber} disabled />` (register 없이 표시만. `businessNumber`는 `CompanyFormEditProps`에서 별도 prop으로 전달됨 — `UpdateCompanyRequest`에 포함되지 않기 때문)

주의: `CreateCompanyRequest`와 `UpdateCompanyRequest`는 동일한 필드 구조 (businessNumber 제외). `useForm`의 제네릭 타입은 `CreateCompanyRequest | UpdateCompanyRequest`가 아니라 mode에 따라 분기:

```typescript
// 타입 안전한 분기
const isEdit = props.mode === "edit";
const schema = isEdit ? updateCompanyRequestSchema : createCompanyRequestSchema;
const form = useForm({
  resolver: standardSchemaResolver(schema),
  defaultValues: isEdit ? props.defaultValues : {},
});
```

- [ ] **Step 3: 기존 테스트가 여전히 통과하는지 확인**

Run: `npx vitest run __tests__/components/company-form.test.tsx`
Expected: PASS

- [ ] **Step 4: Run full test suite + build**

Run: `npm test && npm run build`
Expected: All tests pass, build succeeds

- [ ] **Step 5: Commit**

```bash
git add components/companies/company-form.tsx
git commit -m "refactor: merge CreateCompanyForm/EditCompanyForm + apply FormField"
```

---

## Task 9: worker-form.tsx에 FormField 적용

**Files:**
- Modify: `components/workers/worker-form.tsx` — 단순 Input 필드를 FormField로 교체
- Verify: `__tests__/components/worker-form.test.tsx` — 기존 테스트 통과 확인

- [ ] **Step 1: 기존 테스트 기준선 확인**

Run: `npx vitest run __tests__/components/worker-form.test.tsx`
Expected: PASS

- [ ] **Step 2: 단순 Input 필드를 FormField로 교체**

`worker-form.tsx`에서 `register` 기반 단순 Input 필드만 교체. Controller 기반 Select 필드(국적, 비자유형, 사업장)는 복잡한 커스텀 로직이 있으므로 그대로 유지.

교체 대상 (register 패턴인 것만):
- 이름 (name) — lines 89-98
- 전화번호 (phone) — register 기반이면 교체
- 입국일 (entryDate)
- 계약시작일/종료일 (contractStartDate, contractEndDate)

교체하지 않는 것:
- 사업장 (companyId) — Controller + 비동기 로딩 + 에러/빈 상태 분기
- 국적 (nationalityCode) — Controller + Select
- 비자유형 (visaType) — Controller + Select

- [ ] **Step 3: 기존 테스트 통과 확인**

Run: `npx vitest run __tests__/components/worker-form.test.tsx`
Expected: PASS

- [ ] **Step 4: Run full test suite + build**

Run: `npm test && npm run build`
Expected: All tests pass, build succeeds

- [ ] **Step 5: Commit**

```bash
git add components/workers/worker-form.tsx
git commit -m "refactor: apply FormField to worker-form"
```

---

## Task 10: 최종 검증 + 정리

- [ ] **Step 1: 전체 빌드 + 린트 + 테스트**

Run: `npm run lint && npm run build && npm test`
Expected: lint 0 errors, build success, all tests pass

- [ ] **Step 2: 사용하지 않는 import 정리**

각 수정된 파일에서 더 이상 직접 사용하지 않는 import 제거:
- `status-badge.tsx`: 로컬 `STATUS_CONFIG` 제거 확인
- `deadline-chart.tsx`: 로컬 `STATUS_CONFIG` 제거 확인
- `worker-table.tsx`: Select 관련 import 제거 확인
- `company-table.tsx`: Select 관련 import 제거 확인

- [ ] **Step 3: 최종 빌드 + 테스트**

Run: `npm run lint && npm run build && npm test`
Expected: Everything passes

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: clean up unused imports after commonalization"
```
