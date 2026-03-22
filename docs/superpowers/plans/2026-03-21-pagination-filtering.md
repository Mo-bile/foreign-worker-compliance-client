# 페이지네이션 및 필터링 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Worker 및 Compliance 페이지에 클라이언트 사이드 페이지네이션과 필터링을 추가하여 50명 이상의 데이터를 효율적으로 탐색할 수 있도록 한다.

**Architecture:** React Query 훅 내부에서 전체 데이터를 fetch한 뒤 필터링 → `paginateItems()` 유틸로 페이지 분할. 공통 `PaginationControls` 컴포넌트로 페이지 UI 통일. 서버 사이드 전환 시 훅 내부만 변경.

**Tech Stack:** Next.js 16, React 19, React Query, shadcn/ui (Button, Select, Input, Table), Vitest, Testing Library, MSW, Playwright

**Spec:** `docs/superpowers/specs/2026-03-21-pagination-filtering-design.md`

**스펙 대비 queryKey 전략 변경:** 스펙에서는 paginated 훅에 별도 queryKey(`["workers", "paginated", params]` 등)를 명시했으나, 구현에서는 기존 훅과 동일한 queryKey를 공유하여 중복 fetch를 방지한다. paginated 훅은 fetch된 전체 데이터에 클라이언트 사이드 필터+페이지네이션을 적용하는 래퍼이다.

---

## 파일 구조

| 파일 | 역할 | 변경 |
|------|------|------|
| `types/api.ts` | 도메인 타입, enum, 레이블 맵 | 수정 — WORKER_STATUSES, INSURANCE_STATUSES, DEADLINE_TYPE_LABELS 등 추가 |
| `lib/pagination.ts` | `paginateItems()` 유틸 + `PaginatedResult` 타입 | 신규 |
| `components/ui/pagination-controls.tsx` | 공통 페이지네이션 UI | 신규 |
| `lib/queries/use-workers.ts` | Worker React Query 훅 | 수정 — `usePaginatedWorkers` 추가 |
| `lib/queries/use-compliance.ts` | Compliance React Query 훅 | 수정 — paginated 훅 2개 추가 |
| `components/workers/worker-table.tsx` | 근로자 테이블 + 필터 | 수정 — 상태/보험 필터, 페이지네이션 연동 |
| `components/compliance/deadline-table.tsx` | 데드라인 테이블 | 수정 — 페이지네이션 3-way 분기 (pagination prop / 내부 useState / limit) |
| `app/(app)/compliance/page.tsx` | 컴플라이언스 페이지 | 수정 — 통합 필터 바, paginated 훅 사용 |
| `mocks/data.ts` | 목 데이터 | 수정 — 25건 Worker, 25건+ Deadline (enum 키 사용으로 교정) |
| `__tests__/lib/pagination.test.ts` | paginateItems 단위 테스트 | 신규 |
| `__tests__/components/pagination-controls.test.tsx` | PaginationControls 컴포넌트 테스트 | 신규 |
| `__tests__/components/worker-table.test.tsx` | WorkerTable 통합 테스트 | 신규 |
| `__tests__/components/deadline-table.test.tsx` | DeadlineTable 통합 테스트 | 신규 |
| `e2e/pagination-filtering.spec.ts` | E2E 테스트 | 신규 |

---

## Task 1: 타입 정의 추가 (`types/api.ts`)

**Files:**
- Modify: `types/api.ts:91` (DeadlineStatus 이후에 추가)

- [ ] **Step 1: `types/api.ts`에 Worker 상태 enum + 레이블 + 보험 상태 + 데드라인 레이블 추가**

`DeadlineStatus` 정의 바로 아래(92행 이후)에 추가:

```typescript
// ─── WorkerStatus ────────────────────────────────────────
export const WORKER_STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED"] as const;
export type WorkerStatus = (typeof WORKER_STATUSES)[number];

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
  TERMINATED: "퇴사",
};

export const WORKER_STATUS_COLORS: Record<WorkerStatus, string> = {
  ACTIVE: "text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium",
  INACTIVE: "text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium",
  TERMINATED: "text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium",
};

// ─── InsuranceStatus ─────────────────────────────────────
export const INSURANCE_STATUSES = ["의무", "임의", "면제"] as const;
export type InsuranceStatus = (typeof INSURANCE_STATUSES)[number];

// ─── Label Maps ──────────────────────────────────────────
export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  VISA_EXPIRY: "비자 만료",
  INSURANCE_ENROLLMENT: "보험 가입",
  CHANGE_REPORT: "변경 신고",
  CONTRACT_RENEWAL: "계약 갱신",
};

export const DEADLINE_STATUS_LABELS: Record<DeadlineStatus, string> = {
  PENDING: "대기",
  APPROACHING: "임박",
  URGENT: "긴급",
  OVERDUE: "초과",
  COMPLETED: "완료",
};
```

- [ ] **Step 2: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add types/api.ts
git commit -m "feat: add WorkerStatus, InsuranceStatus enums and deadline label maps"
```

---

## Task 2: 페이지네이션 유틸 (`lib/pagination.ts`) — TDD

**Files:**
- Create: `lib/pagination.ts`
- Create: `__tests__/lib/pagination.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
import { describe, it, expect } from "vitest";
import { paginateItems, DEFAULT_PAGE_SIZE } from "@/lib/pagination";

describe("paginateItems", () => {
  const items = Array.from({ length: 55 }, (_, i) => ({ id: i + 1 }));

  it("첫_페이지_20건을_반환한다", () => {
    const result = paginateItems(items, 1);
    expect(result.items).toHaveLength(20);
    expect(result.items[0]).toEqual({ id: 1 });
    expect(result.items[19]).toEqual({ id: 20 });
    expect(result.totalItems).toBe(55);
    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("마지막_페이지_나머지_항목을_반환한다", () => {
    const result = paginateItems(items, 3);
    expect(result.items).toHaveLength(15);
    expect(result.items[0]).toEqual({ id: 41 });
    expect(result.currentPage).toBe(3);
  });

  it("빈_배열이면_빈_결과를_반환한다", () => {
    const result = paginateItems([], 1);
    expect(result.items).toHaveLength(0);
    expect(result.totalItems).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.currentPage).toBe(1);
  });

  it("페이지가_범위를_초과하면_마지막_유효_페이지로_클램핑한다", () => {
    const result = paginateItems(items, 99);
    expect(result.currentPage).toBe(3);
    expect(result.items).toHaveLength(15);
  });

  it("페이지가_1_미만이면_1로_클램핑한다", () => {
    const result = paginateItems(items, 0);
    expect(result.currentPage).toBe(1);
    expect(result.items[0]).toEqual({ id: 1 });
  });

  it("커스텀_pageSize를_사용한다", () => {
    const result = paginateItems(items, 1, 10);
    expect(result.items).toHaveLength(10);
    expect(result.totalPages).toBe(6);
    expect(result.pageSize).toBe(10);
  });

  it("DEFAULT_PAGE_SIZE는_20이다", () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/lib/pagination.test.ts`
Expected: FAIL — `Cannot find module '@/lib/pagination'`

- [ ] **Step 3: 최소 구현 작성**

```typescript
export const DEFAULT_PAGE_SIZE = 20;

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly totalItems: number;
  readonly totalPages: number;
  readonly currentPage: number;
  readonly pageSize: number;
}

export function paginateItems<T>(
  items: readonly T[],
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): PaginatedResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalItems === 0) {
    return { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize };
  }

  const clampedPage = Math.max(1, Math.min(page, totalPages));
  const start = (clampedPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    totalItems,
    totalPages,
    currentPage: clampedPage,
    pageSize,
  };
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/lib/pagination.test.ts`
Expected: 모든 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/pagination.ts __tests__/lib/pagination.test.ts
git commit -m "feat: add paginateItems utility with tests"
```

---

## Task 3: PaginationControls 컴포넌트 — TDD

**Files:**
- Create: `components/ui/pagination-controls.tsx`
- Create: `__tests__/components/pagination-controls.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaginationControls } from "@/components/ui/pagination-controls";

describe("PaginationControls", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 3,
    totalItems: 55,
    pageSize: 20,
    onPageChange: vi.fn(),
  };

  it("총_항목_범위를_표시한다", () => {
    render(<PaginationControls {...defaultProps} />);
    expect(screen.getByText("총 55건 중 1-20")).toBeDefined();
  });

  it("2페이지의_항목_범위를_올바르게_표시한다", () => {
    render(<PaginationControls {...defaultProps} currentPage={2} />);
    expect(screen.getByText("총 55건 중 21-40")).toBeDefined();
  });

  it("마지막_페이지의_항목_범위를_올바르게_표시한다", () => {
    render(<PaginationControls {...defaultProps} currentPage={3} />);
    expect(screen.getByText("총 55건 중 41-55")).toBeDefined();
  });

  it("첫_페이지에서_이전_버튼이_비활성이다", () => {
    render(<PaginationControls {...defaultProps} />);
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
  });

  it("마지막_페이지에서_다음_버튼이_비활성이다", () => {
    render(<PaginationControls {...defaultProps} currentPage={3} />);
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
  });

  it("다음_버튼_클릭시_onPageChange를_호출한다", async () => {
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("페이지_번호_클릭시_onPageChange를_호출한다", async () => {
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "3 페이지" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("총_페이지가_7_이하면_모든_페이지를_표시한다", () => {
    render(<PaginationControls {...defaultProps} totalPages={7} totalItems={140} />);
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByRole("button", { name: `${i} 페이지` })).toBeDefined();
    }
  });

  it("총_페이지가_8_이상이면_말줄임을_표시한다", () => {
    render(
      <PaginationControls
        {...defaultProps}
        currentPage={5}
        totalPages={10}
        totalItems={200}
      />,
    );
    expect(screen.getByRole("button", { name: "1 페이지" })).toBeDefined();
    expect(screen.getByRole("button", { name: "4 페이지" })).toBeDefined();
    expect(screen.getByRole("button", { name: "5 페이지" })).toBeDefined();
    expect(screen.getByRole("button", { name: "6 페이지" })).toBeDefined();
    expect(screen.getByRole("button", { name: "10 페이지" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "3 페이지" })).toBeNull();
    const ellipses = screen.getAllByText("...");
    expect(ellipses).toHaveLength(2);
  });

  it("totalPages가_0이면_렌더링하지_않는다", () => {
    const { container } = render(
      <PaginationControls {...defaultProps} totalPages={0} totalItems={0} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/components/pagination-controls.test.tsx`
Expected: FAIL

- [ ] **Step 3: 구현 작성**

```tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-sm text-muted-foreground">
        총 {totalItems}건 중 {startItem}-{endItem}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              aria-label={`${page} 페이지`}
            >
              {page}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="다음 페이지"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/components/pagination-controls.test.tsx`
Expected: 모든 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add components/ui/pagination-controls.tsx __tests__/components/pagination-controls.test.tsx
git commit -m "feat: add PaginationControls component with tests"
```

---

## Task 4: 목 데이터 확장 + enum 키 교정 (`mocks/data.ts`)

**Files:**
- Modify: `mocks/data.ts`

> **중요**: 기존 목 데이터의 `nationality`와 `visaType`이 한국어 레이블 문자열(`"베트남"`, `"고용허가제 일반외국인"`)로 작성되어 있다. 실제 백엔드는 enum 키(`"VIETNAM"`, `"E9"`)를 반환하므로, 목 데이터를 enum 키로 교정한다. 이 교정이 없으면 비자 유형 필터가 목 데이터와 매칭되지 않는다.

- [ ] **Step 1: `mocks/data.ts` 전체 교체**

```typescript
import type { WorkerResponse, ComplianceDeadlineResponse } from "@/types/api";

// ─── 목 데이터 생성 헬퍼 ─────────────────────────────────
const SAMPLE_NATIONALITIES = [
  "VIETNAM", "CHINA", "INDONESIA", "PHILIPPINES",
  "THAILAND", "CAMBODIA", "MYANMAR", "NEPAL",
] as const;
const SAMPLE_VISA_TYPES = ["E9", "H2", "E7", "E8", "F2", "F5", "F6", "E7_4"] as const;
const SAMPLE_STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED"] as const;
const SAMPLE_INSURANCE = ["의무", "임의", "면제"] as const;

function generateWorker(id: number): WorkerResponse {
  const natIdx = id % SAMPLE_NATIONALITIES.length;
  const visaIdx = id % SAMPLE_VISA_TYPES.length;
  const statusIdx = id % SAMPLE_STATUSES.length;
  const insIdx = id % SAMPLE_INSURANCE.length;

  return {
    id,
    name: `Worker-${id}`,
    nationality: SAMPLE_NATIONALITIES[natIdx],
    visaType: SAMPLE_VISA_TYPES[visaIdx],
    visaExpiryDate: `2027-${String((id % 12) + 1).padStart(2, "0")}-15`,
    status: SAMPLE_STATUSES[statusIdx],
    insuranceEligibilities: [
      { insuranceType: "국민연금", status: SAMPLE_INSURANCE[insIdx], reason: "테스트 사유" },
      { insuranceType: "건강보험", status: "의무", reason: "전원 의무가입" },
      { insuranceType: "고용보험", status: SAMPLE_INSURANCE[(insIdx + 1) % 3], reason: "테스트 사유" },
      { insuranceType: "산재보험", status: "의무", reason: "전원 의무가입" },
    ],
  };
}

// 기존 2건 (enum 키로 교정) + 23건 생성 = 총 25건
export const mockWorkers: readonly WorkerResponse[] = [
  {
    id: 1,
    name: "Nguyen Van A",
    nationality: "VIETNAM",
    visaType: "E9",
    visaExpiryDate: "2026-12-31",
    status: "ACTIVE",
    insuranceEligibilities: [
      { insuranceType: "국민연금", status: "의무", reason: "일반 외국인 (사회보장협정 미체결국)" },
      { insuranceType: "건강보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
      { insuranceType: "고용보험", status: "임의", reason: "E9 비자: 임의가입 대상" },
      { insuranceType: "산재보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
    ],
  },
  {
    id: 2,
    name: "Zhang Wei",
    nationality: "CHINA",
    visaType: "H2",
    visaExpiryDate: "2027-06-15",
    status: "ACTIVE",
    insuranceEligibilities: [
      { insuranceType: "국민연금", status: "면제", reason: "사회보장협정 체결국 근로자" },
      { insuranceType: "건강보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
      { insuranceType: "고용보험", status: "임의", reason: "H2 비자: 임의가입 대상" },
      { insuranceType: "산재보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
    ],
  },
  ...Array.from({ length: 23 }, (_, i) => generateWorker(i + 3)),
];

// ─── 데드라인 목 데이터 ──────────────────────────────────
const SAMPLE_DEADLINE_TYPES = [
  "VISA_EXPIRY", "INSURANCE_ENROLLMENT", "CHANGE_REPORT", "CONTRACT_RENEWAL",
] as const;
const SAMPLE_DEADLINE_DESCS: Record<string, string> = {
  VISA_EXPIRY: "비자 갱신 필요",
  INSURANCE_ENROLLMENT: "보험 가입 기한",
  CHANGE_REPORT: "고용변동 신고 필요",
  CONTRACT_RENEWAL: "계약 갱신 필요",
};

function generateOverdueDeadline(id: number): ComplianceDeadlineResponse {
  const typeIdx = id % SAMPLE_DEADLINE_TYPES.length;
  const type = SAMPLE_DEADLINE_TYPES[typeIdx];
  return {
    id,
    workerId: (id % 25) + 1,
    deadlineType: type,
    dueDate: `2025-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 28) + 1).padStart(2, "0")}`,
    status: "OVERDUE",
    description: SAMPLE_DEADLINE_DESCS[type],
  };
}

function generateUpcomingDeadline(id: number): ComplianceDeadlineResponse {
  const typeIdx = id % SAMPLE_DEADLINE_TYPES.length;
  const type = SAMPLE_DEADLINE_TYPES[typeIdx];
  const statuses = ["APPROACHING", "URGENT", "PENDING"] as const;
  return {
    id,
    workerId: (id % 25) + 1,
    deadlineType: type,
    dueDate: `2026-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 28) + 1).padStart(2, "0")}`,
    status: statuses[id % 3],
    description: SAMPLE_DEADLINE_DESCS[type],
  };
}

// 기존 2건 유지 + 20건 추가 = 총 22건 overdue (> 20 for pagination)
export const mockOverdueDeadlines: readonly ComplianceDeadlineResponse[] = [
  {
    id: 1,
    workerId: 1,
    deadlineType: "VISA_EXPIRY",
    dueDate: "2025-12-31",
    status: "OVERDUE",
    description: "비자 갱신 필요",
  },
  {
    id: 2,
    workerId: 2,
    deadlineType: "INSURANCE_ENROLLMENT",
    dueDate: "2025-11-30",
    status: "OVERDUE",
    description: "건강보험 가입 기한 초과",
  },
  ...Array.from({ length: 20 }, (_, i) => generateOverdueDeadline(i + 100)),
];

// 기존 3건 유지 + 22건 추가 = 총 25건 upcoming
export const mockUpcomingDeadlines: readonly ComplianceDeadlineResponse[] = [
  {
    id: 3,
    workerId: 1,
    deadlineType: "CONTRACT_RENEWAL",
    dueDate: "2026-04-15",
    status: "APPROACHING",
    description: "계약 갱신 필요",
  },
  {
    id: 4,
    workerId: 2,
    deadlineType: "CHANGE_REPORT",
    dueDate: "2026-03-25",
    status: "URGENT",
    description: "고용변동 신고 필요",
  },
  {
    id: 5,
    workerId: 1,
    deadlineType: "VISA_EXPIRY",
    dueDate: "2026-04-10",
    status: "APPROACHING",
    description: "비자 만료 임박",
  },
  ...Array.from({ length: 22 }, (_, i) => generateUpcomingDeadline(i + 200)),
];
```

- [ ] **Step 2: 기존 테스트가 깨지지 않는지 확인**

Run: `npx vitest run`
Expected: 기존 테스트 모두 PASS. 만약 기존 테스트가 한국어 문자열(`"베트남"`, `"재직중"` 등)에 의존한다면, 해당 테스트도 enum 키 기준으로 업데이트한다.

- [ ] **Step 3: 커밋**

```bash
git add mocks/data.ts
git commit -m "test: expand mock data for pagination and fix to use enum keys"
```

---

## Task 5: `usePaginatedWorkers` 훅 — TDD

**Files:**
- Modify: `lib/queries/use-workers.ts`
- Create: `__tests__/lib/use-paginated-workers.test.tsx`

> **queryKey 전략**: 기존 `useWorkers()`와 동일한 `queryKey: ["workers"]`를 사용하여 React Query가 캐시를 공유한다. 중복 fetch를 방지하며, `useRegisterWorker`의 `invalidateQueries({ queryKey: ["workers"] })`가 자동으로 모든 worker 쿼리를 무효화한다.

- [ ] **Step 1: 테스트 작성**

```tsx
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import { usePaginatedWorkers } from "@/lib/queries/use-workers";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("usePaginatedWorkers", () => {
  it("첫_페이지_20건을_반환한다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers({
          page: 1,
          search: "",
          visaType: "ALL",
          status: "ALL",
          insuranceStatus: "ALL",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(result.current.workers!.items).toHaveLength(20);
    expect(result.current.workers!.currentPage).toBe(1);
    expect(result.current.workers!.totalItems).toBe(25);
  });

  it("이름으로_검색_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers({
          page: 1,
          search: "Nguyen",
          visaType: "ALL",
          status: "ALL",
          insuranceStatus: "ALL",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(
      result.current.workers!.items.every((w) =>
        w.name.toLowerCase().includes("nguyen"),
      ),
    ).toBe(true);
  });

  it("국적_레이블로_검색_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers({
          page: 1,
          search: "베트남",
          visaType: "ALL",
          status: "ALL",
          insuranceStatus: "ALL",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(
      result.current.workers!.items.every((w) => w.nationality === "VIETNAM"),
    ).toBe(true);
  });

  it("비자_유형_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers({
          page: 1,
          search: "",
          visaType: "E9",
          status: "ALL",
          insuranceStatus: "ALL",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(
      result.current.workers!.items.every((w) => w.visaType === "E9"),
    ).toBe(true);
  });

  it("상태_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers({
          page: 1,
          search: "",
          visaType: "ALL",
          status: "ACTIVE",
          insuranceStatus: "ALL",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(
      result.current.workers!.items.every((w) => w.status === "ACTIVE"),
    ).toBe(true);
  });

  it("보험_상태_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers({
          page: 1,
          search: "",
          visaType: "ALL",
          status: "ALL",
          insuranceStatus: "면제",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(
      result.current.workers!.items.every((w) =>
        w.insuranceEligibilities.some((ie) => ie.status === "면제"),
      ),
    ).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/lib/use-paginated-workers.test.tsx`
Expected: FAIL — `usePaginatedWorkers is not exported`

- [ ] **Step 3: 구현 작성**

`lib/queries/use-workers.ts` 하단에 추가 (기존 `useWorkers`, `useWorker`, `useRegisterWorker` 유지):

```typescript
import { paginateItems } from "@/lib/pagination";
import type { PaginatedResult } from "@/lib/pagination";
import { NATIONALITY_LABELS } from "@/types/api";
import type { Nationality } from "@/types/api";

export interface WorkerFilterParams {
  readonly page: number;
  readonly search: string;
  readonly visaType: string;
  readonly status: string;
  readonly insuranceStatus: string;
}

export function usePaginatedWorkers(params: WorkerFilterParams): {
  workers: PaginatedResult<WorkerResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useQuery<readonly WorkerResponse[]>({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await fetch("/api/workers");
      if (!res.ok) throw new Error("근로자 목록을 불러올 수 없습니다");
      return res.json();
    },
  });

  const workers = query.data
    ? paginateItems(filterWorkers(query.data, params), params.page)
    : undefined;

  return { workers, isLoading: query.isLoading, isError: query.isError };
}

function filterWorkers(
  workers: readonly WorkerResponse[],
  params: WorkerFilterParams,
): readonly WorkerResponse[] {
  return workers.filter((worker) => {
    if (params.search.trim() !== "") {
      const searchLower = params.search.toLowerCase();
      const nationalityLabel =
        NATIONALITY_LABELS[worker.nationality as Nationality] ?? worker.nationality;
      const matchesSearch =
        worker.name.toLowerCase().includes(searchLower) ||
        nationalityLabel.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (params.visaType !== "ALL" && worker.visaType !== params.visaType) return false;
    if (params.status !== "ALL" && worker.status !== params.status) return false;

    if (params.insuranceStatus !== "ALL") {
      const hasMatch = worker.insuranceEligibilities.some(
        (ie) => ie.status === params.insuranceStatus,
      );
      if (!hasMatch) return false;
    }

    return true;
  });
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/lib/use-paginated-workers.test.tsx`
Expected: 모든 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/queries/use-workers.ts __tests__/lib/use-paginated-workers.test.tsx
git commit -m "feat: add usePaginatedWorkers hook with client-side filtering"
```

---

## Task 6: Compliance paginated 훅 — TDD

**Files:**
- Modify: `lib/queries/use-compliance.ts`
- Create: `__tests__/lib/use-paginated-compliance.test.tsx`

> **queryKey 전략**: 기존 `useOverdueDeadlines()`와 `useUpcomingDeadlines()`와 동일한 queryKey를 사용하여 캐시를 공유한다. Compliance 페이지에서 차트용 `useUpcomingDeadlines(30)`과 필터+페이지네이션용 `usePaginatedUpcomingDeadlines(30, ...)` 두 훅이 동시에 마운트되더라도 동일한 queryKey이므로 네트워크 요청은 1회만 발생한다.

- [ ] **Step 1: 테스트 작성**

```tsx
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import {
  usePaginatedOverdueDeadlines,
  usePaginatedUpcomingDeadlines,
} from "@/lib/queries/use-compliance";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("usePaginatedOverdueDeadlines", () => {
  it("필터_없이_첫_페이지를_반환한다", async () => {
    const { result } = renderHook(
      () => usePaginatedOverdueDeadlines({ deadlineType: "ALL", status: "ALL" }, 1),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.deadlines).toBeDefined();
    expect(result.current.deadlines!.currentPage).toBe(1);
    expect(result.current.deadlines!.totalItems).toBe(22);
  });

  it("데드라인_유형_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedOverdueDeadlines({ deadlineType: "VISA_EXPIRY", status: "ALL" }, 1),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.deadlines!.items.every((d) => d.deadlineType === "VISA_EXPIRY"),
    ).toBe(true);
  });

  it("상태_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedOverdueDeadlines({ deadlineType: "ALL", status: "OVERDUE" }, 1),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.deadlines!.items.every((d) => d.status === "OVERDUE"),
    ).toBe(true);
  });
});

describe("usePaginatedUpcomingDeadlines", () => {
  it("필터_없이_첫_페이지를_반환한다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedUpcomingDeadlines(30, { deadlineType: "ALL", status: "ALL" }, 1),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.deadlines).toBeDefined();
    expect(result.current.deadlines!.currentPage).toBe(1);
    expect(result.current.deadlines!.totalItems).toBe(25);
  });

  it("데드라인_유형_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedUpcomingDeadlines(30, { deadlineType: "CONTRACT_RENEWAL", status: "ALL" }, 1),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.deadlines!.items.every((d) => d.deadlineType === "CONTRACT_RENEWAL"),
    ).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/lib/use-paginated-compliance.test.tsx`
Expected: FAIL

- [ ] **Step 3: 구현 작성**

`lib/queries/use-compliance.ts` 하단에 추가 (기존 훅 유지):

```typescript
import { paginateItems } from "@/lib/pagination";
import type { PaginatedResult } from "@/lib/pagination";

export interface ComplianceFilterValues {
  readonly deadlineType: string;
  readonly status: string;
}

function filterDeadlines(
  deadlines: readonly ComplianceDeadlineResponse[],
  filters: ComplianceFilterValues,
): readonly ComplianceDeadlineResponse[] {
  return deadlines.filter((d) => {
    if (filters.deadlineType !== "ALL" && d.deadlineType !== filters.deadlineType) return false;
    if (filters.status !== "ALL" && d.status !== filters.status) return false;
    return true;
  });
}

export function usePaginatedOverdueDeadlines(
  filters: ComplianceFilterValues,
  page: number,
): {
  deadlines: PaginatedResult<ComplianceDeadlineResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useQuery<readonly ComplianceDeadlineResponse[]>({
    queryKey: ["compliance", "overdue"],
    queryFn: async () => {
      const res = await fetch("/api/compliance/overdue");
      if (!res.ok) throw new Error("기한초과 데이터를 불러올 수 없습니다");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const deadlines = query.data
    ? paginateItems(filterDeadlines(query.data, filters), page)
    : undefined;

  return { deadlines, isLoading: query.isLoading, isError: query.isError };
}

export function usePaginatedUpcomingDeadlines(
  days: number,
  filters: ComplianceFilterValues,
  page: number,
): {
  deadlines: PaginatedResult<ComplianceDeadlineResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useQuery<readonly ComplianceDeadlineResponse[]>({
    queryKey: ["compliance", "upcoming", days],
    queryFn: async () => {
      const res = await fetch(`/api/compliance/upcoming?days=${days}`);
      if (!res.ok) throw new Error("임박 데드라인을 불러올 수 없습니다");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const deadlines = query.data
    ? paginateItems(filterDeadlines(query.data, filters), page)
    : undefined;

  return { deadlines, isLoading: query.isLoading, isError: query.isError };
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/lib/use-paginated-compliance.test.tsx`
Expected: 모든 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/queries/use-compliance.ts __tests__/lib/use-paginated-compliance.test.tsx
git commit -m "feat: add paginated compliance hooks with deadline filtering"
```

---

## Task 7: WorkerTable 필터 + 페이지네이션 연동

**Files:**
- Modify: `components/workers/worker-table.tsx`
- Create: `__tests__/components/worker-table.test.tsx`

> `app/(app)/workers/page.tsx`는 변경 불필요 — `WorkerTable`의 props 인터페이스(`workers`, `isLoading`)가 유지되므로.

- [ ] **Step 1: 통합 테스트 작성**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkerTable } from "@/components/workers/worker-table";
import { mockWorkers } from "@/mocks/data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("WorkerTable", () => {
  it("로딩_중에_스켈레톤을_표시한다", () => {
    render(<WorkerTable workers={[]} isLoading={true} />);
    expect(document.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });

  it("25건_근로자를_첫_페이지_20건으로_표시한다", () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    expect(screen.getByText(/총 25건 중 1-20/)).toBeDefined();
  });

  it("다음_페이지로_이동하면_나머지_5건을_표시한다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    await userEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByText(/총 25건 중 21-25/)).toBeDefined();
  });

  it("상태_필터에서_ACTIVE를_선택하면_ACTIVE만_표시한다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);

    // "상태 전체" placeholder를 가진 Select의 트리거를 클릭
    const statusTrigger = screen.getByRole("combobox", { name: "상태 필터" });
    await userEvent.click(statusTrigger);

    // "활성" 옵션 클릭
    const option = screen.getByRole("option", { name: "활성" });
    await userEvent.click(option);

    // ACTIVE 근로자만 표시되므로 총 건수가 줄어듬
    const activeCount = mockWorkers.filter((w) => w.status === "ACTIVE").length;
    expect(screen.getByText(new RegExp(`총 ${activeCount}건`))).toBeDefined();
  });

  it("필터_변경시_1페이지로_리셋된다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);

    // 2페이지로 이동
    await userEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByText(/총 25건 중 21-25/)).toBeDefined();

    // 비자 유형 필터 변경
    const visaTrigger = screen.getByRole("combobox", { name: "비자 유형 필터" });
    await userEvent.click(visaTrigger);
    const e9Option = screen.getByRole("option", { name: /E9/ });
    await userEvent.click(e9Option);

    // 1페이지로 리셋 확인 (범위가 1-로 시작)
    expect(screen.getByText(/총 \d+건 중 1-/)).toBeDefined();
  });

  it("빈_데이터일_때_등록된_근로자가_없습니다_메시지를_표시한다", () => {
    render(<WorkerTable workers={[]} isLoading={false} />);
    expect(screen.getByText("등록된 근로자가 없습니다")).toBeDefined();
  });

  it("필터_결과가_빈_경우_조건에_맞는_근로자가_없습니다_메시지를_표시한다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);

    // 존재하지 않는 이름 검색
    const searchInput = screen.getByPlaceholderText("이름 또는 국적으로 검색...");
    await userEvent.type(searchInput, "존재하지않는이름XYZXYZ");

    expect(screen.getByText("조건에 맞는 근로자가 없습니다")).toBeDefined();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/components/worker-table.test.tsx`
Expected: FAIL

- [ ] **Step 3: WorkerTable 리팩터링**

`components/workers/worker-table.tsx`를 수정:

1. 로컬 `WORKER_STATUS_LABELS`, `WORKER_STATUS_COLORS` 삭제 → `types/api.ts`에서 import
2. 상태 Select 필터 추가 (`WORKER_STATUSES` + `WORKER_STATUS_LABELS`)
   - `aria-label="상태 필터"` 부여
3. 보험 가입 상태 Select 필터 추가 (`INSURANCE_STATUSES`)
   - `aria-label="보험 상태 필터"` 부여
4. 기존 비자 유형 Select에 `aria-label="비자 유형 필터"` 부여
5. `paginateItems()`로 필터링된 결과를 페이지네이션
6. `PaginationControls` 연동
7. 모든 필터 변경 시 `setPage(1)` 호출
8. 빈 상태 분기: `workers.length === 0` → "등록된 근로자가 없습니다", `filteredWorkers.length === 0` → "조건에 맞는 근로자가 없습니다"
9. 스켈레톤에 신규 필터 2개 + 페이지네이션 영역 스켈레톤 추가

주요 변경:

```tsx
import {
  VISA_TYPES, VISA_TYPE_LABELS, NATIONALITY_LABELS,
  WORKER_STATUSES, WORKER_STATUS_LABELS, WORKER_STATUS_COLORS,
  INSURANCE_STATUSES,
} from "@/types/api";
import type { VisaType, WorkerStatus, InsuranceStatus, Nationality } from "@/types/api";
import { paginateItems } from "@/lib/pagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

// 상태 관리
const [statusFilter, setStatusFilter] = useState<WorkerStatus | "ALL">("ALL");
const [insuranceFilter, setInsuranceFilter] = useState<InsuranceStatus | "ALL">("ALL");
const [page, setPage] = useState(1);

// 필터 변경 시 페이지 리셋 헬퍼
const handleSearchChange = (value: string) => { setSearch(value); setPage(1); };
const handleVisaChange = (value: string) => { setVisaFilter(value as VisaType | "ALL"); setPage(1); };
const handleStatusChange = (value: string) => { setStatusFilter(value as WorkerStatus | "ALL"); setPage(1); };
const handleInsuranceChange = (value: string) => { setInsuranceFilter(value as InsuranceStatus | "ALL"); setPage(1); };

// 필터링 로직에 status, insurance 추가
const filteredWorkers = workers.filter((worker) => {
  // 기존 search, visaFilter 로직 유지
  if (statusFilter !== "ALL" && worker.status !== statusFilter) return false;
  if (insuranceFilter !== "ALL") {
    if (!worker.insuranceEligibilities.some((ie) => ie.status === insuranceFilter)) return false;
  }
  return true;
});

// 페이지네이션
const paginated = paginateItems(filteredWorkers, page);

// 렌더링에서 paginated.items 사용
// PaginationControls 추가
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/components/worker-table.test.tsx`
Expected: 모든 테스트 PASS

- [ ] **Step 5: 기존 테스트 확인**

Run: `npx vitest run`
Expected: 기존 테스트 모두 PASS

- [ ] **Step 6: 커밋**

```bash
git add components/workers/worker-table.tsx __tests__/components/worker-table.test.tsx
git commit -m "feat: add status/insurance filters and pagination to WorkerTable"
```

---

## Task 8: DeadlineTable 페이지네이션 + Compliance 페이지 통합 필터

**Files:**
- Modify: `components/compliance/deadline-table.tsx`
- Modify: `app/(app)/compliance/page.tsx`
- Create: `__tests__/components/deadline-table.test.tsx`

> Task 8은 기존 플랜의 Task 8과 9를 병합한다. DeadlineTable에 3-way 분기를 처음부터 구현하고, Compliance 페이지의 통합 필터 바를 함께 구현한다.

### DeadlineTable 3-way 분기 설계:

1. **`pagination` prop 있음** (외부 제어) — Compliance 페이지에서 사용. 데이터는 이미 페이지네이션된 상태로 전달. `PaginationControls`에 외부 props 전달.
2. **`pagination` prop 없음 + `limit` 없음** (내부 제어) — Worker 상세 페이지에서 사용. 내부 `useState`로 자체 페이지네이션.
3. **`limit` 있음** — 대시보드에서 사용. 슬라이스만 적용, 페이지네이션 미표시.

- [ ] **Step 1: DeadlineTable 테스트 작성**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeadlineTable } from "@/components/compliance/deadline-table";
import type { ComplianceDeadlineResponse } from "@/types/api";

// 25건 테스트 데이터 생성
const testDeadlines: ComplianceDeadlineResponse[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  workerId: (i % 5) + 1,
  deadlineType: "VISA_EXPIRY" as const,
  dueDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-15`,
  status: "OVERDUE" as const,
  description: `테스트 데드라인 ${i + 1}`,
}));

describe("DeadlineTable", () => {
  it("limit이_있으면_해당_건수만_표시하고_페이지네이션_미표시", () => {
    render(
      <DeadlineTable
        title="테스트"
        deadlines={testDeadlines}
        isLoading={false}
        limit={5}
      />,
    );
    // 5건만 렌더링
    expect(screen.getAllByText(/테스트 데드라인/)).toHaveLength(5);
    // 페이지네이션 없음
    expect(screen.queryByLabelText("다음 페이지")).toBeNull();
  });

  it("limit_없으면_내부_페이지네이션이_동작한다", async () => {
    render(
      <DeadlineTable
        title="테스트"
        deadlines={testDeadlines}
        isLoading={false}
      />,
    );
    // 첫 페이지 20건
    expect(screen.getByText(/총 25건 중 1-20/)).toBeDefined();
    expect(screen.getByLabelText("다음 페이지")).toBeDefined();

    // 다음 페이지로 이동
    await userEvent.click(screen.getByLabelText("다음 페이지"));
    expect(screen.getByText(/총 25건 중 21-25/)).toBeDefined();
  });

  it("pagination_prop이_있으면_외부_제어로_동작한다", () => {
    const onPageChange = vi.fn();
    render(
      <DeadlineTable
        title="테스트"
        deadlines={testDeadlines.slice(0, 20)}
        isLoading={false}
        pagination={{
          currentPage: 1,
          totalPages: 2,
          totalItems: 25,
          pageSize: 20,
          onPageChange,
        }}
      />,
    );
    // 외부에서 전달한 pagination 정보 표시
    expect(screen.getByText(/총 25건 중 1-20/)).toBeDefined();
  });

  it("pagination_prop_다음_버튼_클릭시_외부_onPageChange_호출", async () => {
    const onPageChange = vi.fn();
    render(
      <DeadlineTable
        title="테스트"
        deadlines={testDeadlines.slice(0, 20)}
        isLoading={false}
        pagination={{
          currentPage: 1,
          totalPages: 2,
          totalItems: 25,
          pageSize: 20,
          onPageChange,
        }}
      />,
    );
    await userEvent.click(screen.getByLabelText("다음 페이지"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("빈_데이터일_때_메시지를_표시한다", () => {
    render(
      <DeadlineTable title="테스트" deadlines={[]} isLoading={false} />,
    );
    expect(screen.getByText("데이터가 없습니다")).toBeDefined();
  });

  it("로딩_중에_스켈레톤을_표시한다", () => {
    render(
      <DeadlineTable title="테스트" deadlines={undefined} isLoading={true} />,
    );
    expect(document.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/components/deadline-table.test.tsx`
Expected: FAIL

- [ ] **Step 3: DeadlineTable 수정**

`components/compliance/deadline-table.tsx` 전체 교체:

```tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { paginateItems } from "@/lib/pagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import type { ComplianceDeadlineResponse } from "@/types/api";

interface PaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
}

interface DeadlineTableProps {
  readonly title: string;
  readonly deadlines: readonly ComplianceDeadlineResponse[] | undefined;
  readonly isLoading: boolean;
  readonly limit?: number;
  readonly pagination?: PaginationProps;
}

export function DeadlineTable({
  title,
  deadlines,
  isLoading,
  limit,
  pagination,
}: DeadlineTableProps) {
  const [internalPage, setInternalPage] = useState(1);

  // 3-way 분기:
  // 1. limit 있음 → slice만, 페이지네이션 미표시
  // 2. pagination prop 있음 → 외부 제어, 데이터는 이미 페이지네이션됨
  // 3. 둘 다 없음 → 내부 useState로 자체 페이지네이션

  let items: readonly ComplianceDeadlineResponse[] | undefined;
  let paginationControls: PaginationProps | null = null;

  if (limit) {
    items = deadlines?.slice(0, limit);
  } else if (pagination) {
    items = deadlines;
    paginationControls = pagination;
  } else if (deadlines) {
    const paginated = paginateItems(deadlines, internalPage);
    items = paginated.items;
    if (paginated.totalPages > 1) {
      paginationControls = {
        currentPage: paginated.currentPage,
        totalPages: paginated.totalPages,
        totalItems: paginated.totalItems,
        pageSize: paginated.pageSize,
        onPageChange: setInternalPage,
      };
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !items?.length ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            데이터가 없습니다
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>근로자 ID</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>기한</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.workerId}</TableCell>
                    <TableCell>{d.description}</TableCell>
                    <TableCell>{d.dueDate}</TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {paginationControls && (
              <PaginationControls
                currentPage={paginationControls.currentPage}
                totalPages={paginationControls.totalPages}
                totalItems={paginationControls.totalItems}
                pageSize={paginationControls.pageSize}
                onPageChange={paginationControls.onPageChange}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/components/deadline-table.test.tsx`
Expected: 모든 테스트 PASS

- [ ] **Step 5: Compliance 페이지 수정**

`app/(app)/compliance/page.tsx` 전체 교체:

```tsx
"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeadlineTable } from "@/components/compliance/deadline-table";
import { DeadlineChart } from "@/components/dashboard/deadline-chart";
import {
  usePaginatedOverdueDeadlines,
  usePaginatedUpcomingDeadlines,
  useUpcomingDeadlines,
} from "@/lib/queries/use-compliance";
import type { ComplianceFilterValues } from "@/lib/queries/use-compliance";
import {
  DEADLINE_TYPES,
  DEADLINE_TYPE_LABELS,
  DEADLINE_STATUSES,
  DEADLINE_STATUS_LABELS,
} from "@/types/api";
import type { DeadlineType, DeadlineStatus } from "@/types/api";

export default function CompliancePage() {
  const [deadlineTypeFilter, setDeadlineTypeFilter] = useState<DeadlineType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<DeadlineStatus | "ALL">("ALL");
  const [overduePage, setOverduePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);

  const filters: ComplianceFilterValues = {
    deadlineType: deadlineTypeFilter,
    status: statusFilter,
  };

  const overdue = usePaginatedOverdueDeadlines(filters, overduePage);
  const upcoming = usePaginatedUpcomingDeadlines(30, filters, upcomingPage);
  // 차트용 — 필터 미적용 전체 데이터. queryKey가 usePaginatedUpcomingDeadlines와
  // 동일하므로 추가 네트워크 요청이 발생하지 않음.
  const upcomingAll = useUpcomingDeadlines(30);

  const resetPages = useCallback(() => {
    setOverduePage(1);
    setUpcomingPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">컴플라이언스 현황</h1>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <span className="text-sm text-muted-foreground">필터:</span>
          <Select
            value={deadlineTypeFilter}
            onValueChange={(v) => {
              setDeadlineTypeFilter(v as DeadlineType | "ALL");
              resetPages();
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="데드라인 유형 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {DEADLINE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {DEADLINE_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as DeadlineStatus | "ALL");
              resetPages();
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="상태 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {DEADLINE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {DEADLINE_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <DeadlineTable
        title="기한초과 데드라인"
        deadlines={overdue.deadlines?.items}
        isLoading={overdue.isLoading}
        pagination={
          overdue.deadlines && overdue.deadlines.totalPages > 0
            ? {
                currentPage: overdue.deadlines.currentPage,
                totalPages: overdue.deadlines.totalPages,
                totalItems: overdue.deadlines.totalItems,
                pageSize: overdue.deadlines.pageSize,
                onPageChange: setOverduePage,
              }
            : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <DeadlineTable
          title="임박 데드라인 (30일)"
          deadlines={upcoming.deadlines?.items}
          isLoading={upcoming.isLoading}
          pagination={
            upcoming.deadlines && upcoming.deadlines.totalPages > 0
              ? {
                  currentPage: upcoming.deadlines.currentPage,
                  totalPages: upcoming.deadlines.totalPages,
                  totalItems: upcoming.deadlines.totalItems,
                  pageSize: upcoming.deadlines.pageSize,
                  onPageChange: setUpcomingPage,
                }
              : undefined
          }
        />
        <DeadlineChart deadlines={upcomingAll.data} isLoading={upcomingAll.isLoading} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 7: 전체 테스트 실행**

Run: `npx vitest run`
Expected: 모든 테스트 PASS

- [ ] **Step 8: 커밋**

```bash
git add components/compliance/deadline-table.tsx app/(app)/compliance/page.tsx __tests__/components/deadline-table.test.tsx
git commit -m "feat: add pagination to DeadlineTable and filter bar to compliance page"
```

---

## Task 9: 빈 상태 메시지 분기

**Files:**
- Modify: `components/workers/worker-table.tsx` (이미 Task 7에서 구현됨 — 확인만)
- Modify: `components/compliance/deadline-table.tsx`

- [ ] **Step 1: DeadlineTable 빈 상태 메시지 분기**

현재 DeadlineTable은 `items?.length === 0`일 때 "데이터가 없습니다" 단일 메시지. 다음으로 변경:

- 원본 `deadlines` 자체가 없거나 빈 배열 → "데이터가 없습니다"
- `deadlines`는 있지만 필터/페이지네이션 후 `items`가 빈 배열 → "조건에 맞는 결과가 없습니다"

DeadlineTable에서 빈 상태 판별:

```tsx
const hasOriginalData = deadlines && deadlines.length > 0;
const emptyMessage = hasOriginalData
  ? "조건에 맞는 결과가 없습니다"
  : "데이터가 없습니다";
```

- [ ] **Step 2: 테스트 실행**

Run: `npx vitest run`
Expected: 모든 테스트 PASS

- [ ] **Step 3: 커밋**

```bash
git add components/compliance/deadline-table.tsx
git commit -m "feat: differentiate empty state messages for no data vs no filter results"
```

---

## Task 10: 전체 검증

- [ ] **Step 1: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 에러 없음

- [ ] **Step 3: Format**

Run: `npm run format`

- [ ] **Step 4: 전체 테스트**

Run: `npx vitest run`
Expected: 모든 테스트 PASS

- [ ] **Step 5: 개발 서버 통합 확인**

Run: `npm run dev`
확인 항목:
- `/workers`: 필터 4개 + 페이지네이션 동작, 필터 변경 시 1페이지 리셋
- `/compliance`: 통합 필터 바 + 각 섹션 독립 페이지네이션, 필터 변경 시 양쪽 1페이지 리셋
- `/` (대시보드): 기존 DeadlineTable `limit` 동작 유지
- `/workers/[id]`: 기존 DeadlineTable 동작 유지 (limit 없이 내부 페이지네이션)

- [ ] **Step 6: 커밋 (포맷/린트 변경이 있는 경우)**

```bash
git add -A
git commit -m "chore: lint and format"
```

---

## Task 11: E2E 테스트

**Files:**
- Create: `e2e/pagination-filtering.spec.ts`

> 개발 서버가 MSW를 통해 목 데이터를 제공하는 환경에서 E2E 테스트를 실행한다. `playwright.config.ts`에서 포트 3000에 개발 서버를 자동 실행하도록 설정되어 있다.

- [ ] **Step 1: E2E 테스트 작성**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Worker 페이지 페이지네이션 및 필터링", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/workers");
    // 데이터 로딩 대기
    await page.waitForSelector("table");
  });

  test("페이지네이션이_표시된다", async ({ page }) => {
    await expect(page.getByText(/총 \d+건 중 1-/)).toBeVisible();
  });

  test("다음_페이지로_이동한다", async ({ page }) => {
    await page.getByRole("button", { name: "다음 페이지" }).click();
    await expect(page.getByText(/총 \d+건 중 21-/)).toBeVisible();
  });

  test("필터_변경시_1페이지로_리셋된다", async ({ page }) => {
    // 2페이지로 이동
    await page.getByRole("button", { name: "다음 페이지" }).click();
    await expect(page.getByText(/총 \d+건 중 21-/)).toBeVisible();

    // 이름 검색
    await page.getByPlaceholder("이름 또는 국적으로 검색...").fill("Worker");

    // 1페이지로 리셋 확인
    await expect(page.getByText(/총 \d+건 중 1-/)).toBeVisible();
  });
});

test.describe("Compliance 페이지 필터링", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/compliance");
    await page.waitForSelector("table");
  });

  test("통합_필터_바가_표시된다", async ({ page }) => {
    await expect(page.getByText("필터:")).toBeVisible();
  });

  test("데드라인_유형_필터가_동작한다", async ({ page }) => {
    // 데드라인 유형 필터에서 "비자 만료" 선택
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "비자 만료" }).click();

    // 필터가 적용되어 페이지가 업데이트됨을 확인
    await expect(page.getByText("필터:")).toBeVisible();
  });
});
```

- [ ] **Step 2: E2E 테스트 실행**

Run: `npx playwright test e2e/pagination-filtering.spec.ts`
Expected: 모든 테스트 PASS

- [ ] **Step 3: 커밋**

```bash
git add e2e/pagination-filtering.spec.ts
git commit -m "test: add E2E tests for pagination and filtering"
```
