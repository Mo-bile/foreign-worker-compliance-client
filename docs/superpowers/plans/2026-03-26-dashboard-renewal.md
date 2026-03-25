# Dashboard Renewal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing minimal dashboard (3 stat cards + deadline table/chart) to the full mockup design with urgent alerts, compliance gauge, visa distribution, insurance summary, AI insight, and mini deadline timeline.

**Architecture:** New `GET /api/dashboard` BFF endpoint returns aggregated dashboard data from mock. Client fetches via `useDashboard()` React Query hook. Dashboard page renders 7 component types in a 2-column grid layout (main + 360px sidebar).

**Tech Stack:** Next.js 16, React 19, TanStack Query v5, Recharts (existing), Tailwind CSS v4 (oklch), shadcn/ui, Lucide React, Vitest + Testing Library, MSW v2, isomorphic-dompurify (for AI content sanitization in both browser and jsdom/Node)

**Spec:** `docs/superpowers/specs/2026-03-26-dashboard-renewal-design.md`
**Mockup:** `../foreign-worker-compliance-project-management/design/ui-mockup-dashboard.html`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `types/dashboard.ts` | Dashboard API response TypeScript interfaces |
| `mocks/dashboard-data.ts` | Mock data matching mockup hardcoded values (follows existing `mocks/` convention) |
| `app/api/dashboard/route.ts` | BFF route handler returning mock/backend data |
| `lib/queries/use-dashboard.ts` | `useDashboard(companyId)` React Query hook |
| `components/dashboard/alert-card.tsx` | Urgent alert card (critical/warning/info) |
| `components/dashboard/compliance-gauge.tsx` | SVG semicircle gauge + breakdown |
| `components/dashboard/visa-distribution.tsx` | Horizontal bar chart for visa types |
| `components/dashboard/insurance-summary.tsx` | 4-column insurance status grid |
| `components/common/ai-insight-block.tsx` | Reusable AI analysis block + disclaimer (isomorphic-dompurify sanitized) |
| `components/dashboard/deadline-mini.tsx` | Mini timeline with urgency bars |
| `__tests__/types/dashboard-types.test.ts` | Type shape compile-time verification tests |
| `__tests__/mocks/dashboard-data.test.ts` | Mock data structure verification tests |
| `__tests__/pages/dashboard-page.test.tsx` | Dashboard page integration test |
| `__tests__/components/alert-card.test.tsx` | AlertCard unit tests |
| `__tests__/components/compliance-gauge.test.tsx` | ComplianceGauge unit tests |
| `__tests__/components/visa-distribution.test.tsx` | VisaDistribution unit tests |
| `__tests__/components/insurance-summary.test.tsx` | InsuranceSummary unit tests |
| `__tests__/components/ai-insight-block.test.tsx` | AiInsightBlock unit tests |
| `__tests__/components/deadline-mini.test.tsx` | DeadlineMini unit tests |
| `__tests__/api/dashboard-route.test.ts` | Dashboard route handler test |
| `__tests__/lib/use-dashboard.test.tsx` | useDashboard hook test |

### Modified Files
| File | Change |
|------|--------|
| `app/globals.css` | Sync CSS variables with mockup oklch values; add sidebar tokens |
| `components/dashboard/stat-card.tsx` | Add `variant`, `subtitle`, `change` props |
| `__tests__/components/stat-card.test.tsx` | Add tests for new props |
| `mocks/handlers.ts` | Add `GET /api/dashboard` handler (imports from `mocks/dashboard-data.ts`) |
| `app/(app)/page.tsx` | Complete rewrite with new layout + components |

---

## Task 1: Dashboard Types

**Files:**
- Create: `types/dashboard.ts`
- Test: `__tests__/types/dashboard-types.test.ts`

- [ ] **Step 1: Write the type definition file**

```typescript
// types/dashboard.ts

export type AlertLevel = "critical" | "warning" | "info";
export type DeadlineUrgency = "overdue" | "d7" | "d30" | "safe";

export interface AlertAction {
  readonly label: string;
  readonly href: string;
}

export interface DashboardAlert {
  readonly id: string;
  readonly level: AlertLevel;
  readonly title: string;
  readonly description: string;
  readonly dDay: number | null;
  readonly badgeText: string;
  readonly actions: readonly AlertAction[];
}

export interface VisaDistributionItem {
  readonly type: string;
  readonly count: number;
  readonly percentage: number;
}

export interface InsuranceSummaryItem {
  readonly type: string;
  readonly enrolled: number;
  readonly label: string;
  readonly status: "ok" | "warn";
  readonly statusText: string;
}

export interface ComplianceBreakdownItem {
  readonly label: string;
  readonly score: number;
}

export interface ComplianceScoreData {
  readonly total: number;
  readonly breakdown: readonly ComplianceBreakdownItem[];
}

export interface DashboardDeadline {
  readonly id: string;
  readonly title: string;
  readonly workerName: string;
  readonly visaType: string;
  readonly dDay: number;
  readonly urgency: DeadlineUrgency;
}

export interface DashboardStats {
  readonly totalWorkers: number;
  readonly visaBreakdown: readonly { readonly type: string; readonly count: number }[];
  readonly insuranceRate: number;
  readonly insuranceRateChange: number;
  readonly upcomingDeadlines: number;
  readonly deadlineBreakdown: { readonly d7: number; readonly d30: number };
  readonly urgentActions: number;
  readonly urgentBreakdown: { readonly visa: number; readonly insurance: number };
}

export interface DashboardResponse {
  readonly stats: DashboardStats;
  readonly alerts: readonly DashboardAlert[];
  readonly visaDistribution: readonly VisaDistributionItem[];
  readonly insuranceSummary: readonly InsuranceSummaryItem[];
  readonly complianceScore: ComplianceScoreData;
  readonly aiInsight: string;
  readonly upcomingDeadlines: readonly DashboardDeadline[];
}
```

- [ ] **Step 2: Write type guard tests**

```typescript
// __tests__/types/dashboard-types.test.ts
import { describe, it, expect } from "vitest";
import type {
  DashboardResponse,
  AlertLevel,
  DeadlineUrgency,
} from "@/types/dashboard";

describe("Dashboard Types", () => {
  it("AlertLevel_유니온이_3가지_값을_허용한다", () => {
    const levels: AlertLevel[] = ["critical", "warning", "info"];
    expect(levels).toHaveLength(3);
  });

  it("DeadlineUrgency_유니온이_4가지_값을_허용한다", () => {
    const urgencies: DeadlineUrgency[] = ["overdue", "d7", "d30", "safe"];
    expect(urgencies).toHaveLength(4);
  });

  it("DashboardResponse_구조가_올바르다", () => {
    const response: DashboardResponse = {
      stats: {
        totalWorkers: 12,
        visaBreakdown: [{ type: "E-9", count: 8 }],
        insuranceRate: 91.7,
        insuranceRateChange: 4.2,
        upcomingDeadlines: 5,
        deadlineBreakdown: { d7: 2, d30: 3 },
        urgentActions: 3,
        urgentBreakdown: { visa: 1, insurance: 2 },
      },
      alerts: [],
      visaDistribution: [],
      insuranceSummary: [],
      complianceScore: { total: 73, breakdown: [] },
      aiInsight: "test",
      upcomingDeadlines: [],
    };
    expect(response.stats.totalWorkers).toBe(12);
    expect(response.complianceScore.total).toBe(73);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run __tests__/types/dashboard-types.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 4: Commit**

```bash
git add types/dashboard.ts __tests__/types/dashboard-types.test.ts
git commit -m "feat: add dashboard response types"
```

---

## Task 2: CSS Variable Sync

**Files:**
- Modify: `app/globals.css:51-144` (`:root` and `.dark` blocks)

This task syncs the CSS variables with the mockup's oklch values. The main changes:
- Semantic tokens updated to mockup values (hue 260 base)
- Sidebar changes from light theme (`0.96` lightness) to dark theme (`0.17` lightness) — the existing sidebar component uses `--sidebar` CSS variable, so it will automatically adapt
- `--sidebar-muted` added (new variable)
- Dark mode `--border`/`--input` keep existing opacity syntax pattern to avoid visual regression

- [ ] **Step 1: Update `:root` block in globals.css**

Replace the `:root` block with values from `ui-mockup-dashboard.html` lines 9-60:

```css
:root {
  /* shadcn semantic tokens — Light */
  --background: oklch(0.99 0.00 0);
  --foreground: oklch(0.15 0.01 260);
  --card: oklch(1.00 0.00 0);
  --card-foreground: oklch(0.15 0.01 260);
  --popover: oklch(1.00 0.00 0);
  --popover-foreground: oklch(0.15 0.01 260);
  --primary: oklch(0.42 0.12 260);
  --primary-foreground: oklch(0.98 0.00 0);
  --secondary: oklch(0.96 0.01 260);
  --secondary-foreground: oklch(0.25 0.02 260);
  --muted: oklch(0.96 0.01 260);
  --muted-foreground: oklch(0.55 0.02 260);
  --accent: oklch(0.96 0.01 260);
  --accent-foreground: oklch(0.25 0.02 260);
  --destructive: oklch(0.55 0.20 25);
  --border: oklch(0.91 0.01 260);
  --input: oklch(0.91 0.01 260);
  --ring: oklch(0.42 0.12 260);
  --radius: 0.625rem;
  --accent-decorative: oklch(0.72 0.12 85);

  /* Signal colors */
  --signal-red: oklch(0.55 0.20 25);
  --signal-red-bg: oklch(0.92 0.04 25);
  --signal-orange: oklch(0.65 0.18 55);
  --signal-orange-bg: oklch(0.93 0.04 55);
  --signal-yellow: oklch(0.65 0.16 85);
  --signal-yellow-bg: oklch(0.95 0.04 85);
  --signal-blue: oklch(0.50 0.15 255);
  --signal-blue-bg: oklch(0.93 0.04 255);
  --signal-green: oklch(0.52 0.15 155);
  --signal-green-bg: oklch(0.94 0.04 155);
  --signal-gray: oklch(0.55 0.01 255);
  --signal-gray-bg: oklch(0.95 0.01 255);

  /* Chart */
  --chart-1: var(--signal-blue);
  --chart-2: var(--signal-green);
  --chart-3: var(--signal-orange);
  --chart-4: var(--signal-red);
  --chart-5: var(--accent-decorative);

  /* Sidebar — dark sidebar in light mode (per mockup) */
  --sidebar: oklch(0.17 0.02 260);
  --sidebar-foreground: oklch(0.85 0.01 260);
  --sidebar-primary: oklch(0.42 0.12 260);
  --sidebar-primary-foreground: oklch(0.95 0.00 0);
  --sidebar-accent: oklch(0.22 0.02 260);
  --sidebar-accent-foreground: oklch(0.95 0.00 0);
  --sidebar-border: oklch(0.25 0.02 260);
  --sidebar-ring: oklch(0.42 0.12 260);
  --sidebar-muted: oklch(0.55 0.02 260);
}
```

- [ ] **Step 2: Update `.dark` block**

Replace the `.dark` block. Note: `--border` and `--input` use solid values matching mockup (the existing opacity syntax `oklch(... / 12%)` is a Tailwind v4 convention that works differently from the mockup's approach — follow mockup for consistency across all Phase 1 screens):

```css
.dark {
  --background: oklch(0.13 0.01 260);
  --foreground: oklch(0.93 0.01 260);
  --card: oklch(0.17 0.01 260);
  --card-foreground: oklch(0.93 0.01 260);
  --popover: oklch(0.17 0.01 260);
  --popover-foreground: oklch(0.93 0.01 260);
  --primary: oklch(0.65 0.15 255);
  --primary-foreground: oklch(0.13 0.01 260);
  --secondary: oklch(0.22 0.02 260);
  --secondary-foreground: oklch(0.85 0.01 260);
  --muted: oklch(0.22 0.02 260);
  --muted-foreground: oklch(0.60 0.02 260);
  --accent: oklch(0.22 0.02 260);
  --accent-foreground: oklch(0.85 0.01 260);
  --destructive: oklch(0.60 0.22 25);
  --border: oklch(0.28 0.02 260);
  --input: oklch(0.28 0.02 260);
  --ring: oklch(0.65 0.15 255);
  --accent-decorative: oklch(0.72 0.12 85);

  /* Signal bg overrides */
  --signal-red-bg: oklch(0.22 0.06 25);
  --signal-orange-bg: oklch(0.22 0.06 55);
  --signal-yellow-bg: oklch(0.22 0.06 85);
  --signal-blue-bg: oklch(0.20 0.06 255);
  --signal-green-bg: oklch(0.20 0.06 155);
  --signal-gray-bg: oklch(0.22 0.01 255);

  /* Chart */
  --chart-1: var(--signal-blue);
  --chart-2: var(--signal-green);
  --chart-3: var(--signal-orange);
  --chart-4: var(--signal-red);
  --chart-5: var(--accent-decorative);

  /* Sidebar */
  --sidebar: oklch(0.12 0.02 260);
  --sidebar-foreground: oklch(0.85 0.01 260);
  --sidebar-primary: oklch(0.65 0.15 255);
  --sidebar-primary-foreground: oklch(0.13 0.01 260);
  --sidebar-accent: oklch(0.24 0.05 255);
  --sidebar-accent-foreground: oklch(0.95 0.00 0);
  --sidebar-border: oklch(0.28 0.02 260);
  --sidebar-ring: oklch(0.65 0.15 255);
  --sidebar-muted: oklch(0.55 0.02 260);
}
```

- [ ] **Step 3: Add signal color Tailwind mappings to `@theme inline`**

Add these lines inside the `@theme inline` block (after `--color-chart-5`):

```css
--color-signal-red: var(--signal-red);
--color-signal-red-bg: var(--signal-red-bg);
--color-signal-orange: var(--signal-orange);
--color-signal-orange-bg: var(--signal-orange-bg);
--color-signal-yellow: var(--signal-yellow);
--color-signal-yellow-bg: var(--signal-yellow-bg);
--color-signal-blue: var(--signal-blue);
--color-signal-blue-bg: var(--signal-blue-bg);
--color-signal-green: var(--signal-green);
--color-signal-green-bg: var(--signal-green-bg);
--color-signal-gray: var(--signal-gray);
--color-signal-gray-bg: var(--signal-gray-bg);
--color-sidebar-muted: var(--sidebar-muted);
```

This enables Tailwind classes like `text-signal-red`, `bg-signal-red-bg`, etc.

- [ ] **Step 4: Verify build still works**

Run: `npm run build`
Expected: Build succeeds (no CSS errors)

- [ ] **Step 5: Verify existing tests still pass**

Run: `npm run test`
Expected: All existing tests pass

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "refactor: sync CSS variables with design mockup oklch values"
```

---

## Task 3: Mock Data + isomorphic-dompurify Setup

**Files:**
- Create: `mocks/dashboard-data.ts`
- Test: `__tests__/mocks/dashboard-data.test.ts`

- [ ] **Step 1: Install isomorphic-dompurify**

Run: `npm install isomorphic-dompurify`

`isomorphic-dompurify` wraps DOMPurify to work in both browser and Node/jsdom environments. This is needed because `AiInsightBlock` (Task 10) runs in both browser (production) and jsdom (Vitest tests). Regular `dompurify` may fail in Node without a `window` object.

- [ ] **Step 2: Create mock data file**

Follow existing convention: mock data lives in `mocks/` directory (alongside `mocks/data.ts` and `mocks/handlers.ts`).

```typescript
// mocks/dashboard-data.ts
import type { DashboardResponse } from "@/types/dashboard";

export const mockDashboard: DashboardResponse = {
  stats: {
    totalWorkers: 12,
    visaBreakdown: [
      { type: "E-9", count: 8 },
      { type: "H-2", count: 3 },
      { type: "E-7", count: 1 },
    ],
    insuranceRate: 91.7,
    insuranceRateChange: 4.2,
    upcomingDeadlines: 5,
    deadlineBreakdown: { d7: 2, d30: 3 },
    urgentActions: 3,
    urgentBreakdown: { visa: 1, insurance: 2 },
  },
  alerts: [
    {
      id: "1",
      level: "critical",
      title: "비자 만료 임박 — Nguyen Van A",
      description: "E-9 비자가 2026.03.28에 만료됩니다. 즉시 연장 신청이 필요합니다.",
      dDay: 4,
      badgeText: "D-4",
      actions: [
        { label: "비자 연장 신청", href: "/workers/1" },
        { label: "근로자 상세", href: "/workers/1" },
      ],
    },
    {
      id: "2",
      level: "warning",
      title: "건강보험 미가입 — Pham Thi B",
      description: "입사 후 14일이 경과했으나 건강보험 취득신고가 완료되지 않았습니다.",
      dDay: 0,
      badgeText: "D-0",
      actions: [
        { label: "일정 확인", href: "/deadlines" },
        { label: "조치하기", href: "/workers/2" },
      ],
    },
    {
      id: "3",
      level: "info",
      title: "법령 변경 — 2026년 최저임금 고시",
      description: "7월 1일부터 시간급 10,620원으로 변경. 귀사 근로자 3명의 계약서 확인 필요.",
      dDay: null,
      badgeText: "정보",
      actions: [{ label: "자세히 보기", href: "/legal-changes" }],
    },
  ],
  visaDistribution: [
    { type: "E-9", count: 8, percentage: 66.7 },
    { type: "H-2", count: 3, percentage: 25.0 },
    { type: "E-7", count: 1, percentage: 8.3 },
  ],
  insuranceSummary: [
    { type: "national_pension", enrolled: 10, label: "국민연금", status: "ok", statusText: "✓ 가입" },
    { type: "health", enrolled: 11, label: "건강보험", status: "warn", statusText: "1 미가입" },
    { type: "employment", enrolled: 9, label: "고용보험", status: "warn", statusText: "1 미가입" },
    { type: "industrial_accident", enrolled: 12, label: "산재보험", status: "ok", statusText: "✓ 전원" },
  ],
  complianceScore: {
    total: 73,
    breakdown: [
      { label: "보험 가입", score: 92 },
      { label: "데드라인 준수", score: 65 },
      { label: "임금 경쟁력", score: 62 },
    ],
  },
  aiInsight:
    '귀사의 외국인 근로자 임금 수준은 경기도 안산시 식료품제조업 동종업계 대비 <strong>하위 30%</strong>에 해당합니다. 최근 동종업계의 사업장 변경율이 증가 추세(전분기 대비 +12%)이므로, 인력 유출 방지를 위한 임금 경쟁력 개선을 권장드립니다. 또한 Nguyen Van A 근로자의 비자 만료가 4일 남았으므로 <strong>즉시 연장 신청</strong>을 진행하세요.',
  upcomingDeadlines: [
    { id: "d1", title: "비자 연장 신청", workerName: "Nguyen Van A", visaType: "E-9", dDay: 4, urgency: "overdue" },
    { id: "d2", title: "건강보험 취득신고", workerName: "Pham Thi B", visaType: "E-9", dDay: 0, urgency: "d7" },
    { id: "d3", title: "근로계약 갱신", workerName: "Rahman C", visaType: "H-2", dDay: 21, urgency: "d30" },
    { id: "d4", title: "비자 만료", workerName: "Li Wei D", visaType: "E-7", dDay: 45, urgency: "d30" },
    { id: "d5", title: "고용변동 신고", workerName: "Tran E", visaType: "E-9", dDay: 58, urgency: "safe" },
  ],
};
```

- [ ] **Step 3: Write mock data verification test**

```typescript
// __tests__/mocks/dashboard-data.test.ts
import { describe, it, expect } from "vitest";
import { mockDashboard } from "@/mocks/dashboard-data";

describe("mockDashboard", () => {
  it("stats_필드가_올바른_구조를_갖는다", () => {
    expect(mockDashboard.stats.totalWorkers).toBe(12);
    expect(mockDashboard.stats.visaBreakdown).toHaveLength(3);
    expect(mockDashboard.stats.insuranceRate).toBe(91.7);
    expect(mockDashboard.stats.urgentActions).toBe(3);
  });

  it("alerts가_3개_있다", () => {
    expect(mockDashboard.alerts).toHaveLength(3);
    expect(mockDashboard.alerts[0].level).toBe("critical");
    expect(mockDashboard.alerts[1].level).toBe("warning");
    expect(mockDashboard.alerts[2].level).toBe("info");
  });

  it("complianceScore_total이_73이다", () => {
    expect(mockDashboard.complianceScore.total).toBe(73);
    expect(mockDashboard.complianceScore.breakdown).toHaveLength(3);
  });

  it("upcomingDeadlines가_5개_있다", () => {
    expect(mockDashboard.upcomingDeadlines).toHaveLength(5);
  });

  it("모든_alert에_actions가_있다", () => {
    for (const alert of mockDashboard.alerts) {
      expect(alert.actions.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run __tests__/mocks/dashboard-data.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mocks/dashboard-data.ts __tests__/mocks/dashboard-data.test.ts package.json package-lock.json
git commit -m "feat: add dashboard mock data and isomorphic-dompurify dependency"
```

---

## Task 4: MSW Handler + API Route

**Files:**
- Create: `app/api/dashboard/route.ts`
- Modify: `mocks/handlers.ts`
- Test: `__tests__/api/dashboard-route.test.ts`

- [ ] **Step 1: Write the failing route test**

```typescript
// __tests__/api/dashboard-route.test.ts
import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/dashboard/route";
import type { DashboardResponse } from "@/types/dashboard";

describe("GET /api/dashboard", () => {
  it("대시보드_데이터를_반환한다", async () => {
    const request = new Request("http://localhost:3000/api/dashboard?companyId=1");
    const response = await GET(request as any);
    expect(response.status).toBe(200);

    const data: DashboardResponse = await response.json();
    expect(data.stats.totalWorkers).toBe(12);
    expect(data.alerts).toHaveLength(3);
    expect(data.complianceScore.total).toBe(73);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/api/dashboard-route.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Create API route handler**

```typescript
// app/api/dashboard/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { mockDashboard } from "@/mocks/dashboard-data";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual backend call when BE is ready
    // const companyId = request.nextUrl.searchParams.get("companyId");
    // const data = await apiClient.get<DashboardResponse>(
    //   `/api/companies/${companyId}/dashboard`,
    // );
    return NextResponse.json(mockDashboard);
  } catch (error) {
    return handleRouteError(error, "GET /api/dashboard");
  }
}
```

- [ ] **Step 4: Add MSW handler for dashboard**

In `mocks/handlers.ts`, add the import and handler:

```typescript
// Add import at top
import { mockDashboard } from "@/mocks/dashboard-data";

// Add handler callback before handler registration
const getDashboard: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockDashboard);

// Add to handlers array (both BACKEND and jsdom paths)
http.get(`${BACKEND}/api/dashboard`, getDashboard),
http.get("*/api/dashboard", getDashboard),
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run __tests__/api/dashboard-route.test.ts`
Expected: PASS

- [ ] **Step 6: Run all existing tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add app/api/dashboard/route.ts mocks/handlers.ts __tests__/api/dashboard-route.test.ts
git commit -m "feat: add dashboard API route with mock data"
```

---

## Task 5: useDashboard Hook

**Files:**
- Create: `lib/queries/use-dashboard.ts`
- Test: `__tests__/lib/use-dashboard.test.tsx`

- [ ] **Step 1: Write the failing hook test**

```tsx
// __tests__/lib/use-dashboard.test.tsx
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useDashboard } from "@/lib/queries/use-dashboard";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useDashboard", () => {
  it("대시보드_데이터를_성공적으로_반환한다", async () => {
    const { result } = renderHook(() => useDashboard(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.stats.totalWorkers).toBe(12);
    expect(result.current.data?.alerts).toHaveLength(3);
    expect(result.current.data?.complianceScore.total).toBe(73);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/lib/use-dashboard.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Create the hook**

```typescript
// lib/queries/use-dashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { DashboardResponse } from "@/types/dashboard";

export function useDashboard(companyId: number | undefined) {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard", companyId],
    queryFn: () =>
      fetchApi<DashboardResponse>(
        `/api/dashboard?companyId=${companyId}`,
        "대시보드 데이터를 불러올 수 없습니다",
      ),
    enabled: companyId !== undefined && companyId > 0,
    refetchInterval: 30_000,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/lib/use-dashboard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/queries/use-dashboard.ts __tests__/lib/use-dashboard.test.tsx
git commit -m "feat: add useDashboard React Query hook"
```

---

## Task 6: StatCard Enhancement

**Files:**
- Modify: `components/dashboard/stat-card.tsx`
- Modify: `__tests__/components/stat-card.test.tsx`

- [ ] **Step 1: Write failing tests for new props**

Add these tests to `__tests__/components/stat-card.test.tsx`:

```tsx
it("urgent_variant에서_signal-red-bg_배경을_적용한다", () => {
  const { container } = render(
    <StatCard
      title="긴급 조치"
      value={3}
      icon={Users}
      isLoading={false}
      variant="urgent"
    />,
  );
  const card = container.firstElementChild as HTMLElement;
  expect(card.className).toContain("bg-signal-red-bg");
});

it("subtitle을_렌더링한다", () => {
  render(
    <StatCard
      title="등록 근로자"
      value={12}
      icon={Users}
      isLoading={false}
      subtitle="E-9 8명 · H-2 3명 · E-7 1명"
    />,
  );
  expect(screen.getByText("E-9 8명 · H-2 3명 · E-7 1명")).toBeDefined();
});

it("change_prop으로_변동을_표시한다", () => {
  render(
    <StatCard
      title="보험 가입률"
      value={91.7}
      icon={Users}
      isLoading={false}
      change={{ direction: "up", text: "전월 대비 4.2%p 개선" }}
    />,
  );
  expect(screen.getByText(/전월 대비 4.2%p 개선/)).toBeDefined();
});

it("change_up일_때_signal-green_색상이다", () => {
  const { container } = render(
    <StatCard
      title="보험"
      value={91}
      icon={Users}
      isLoading={false}
      change={{ direction: "up", text: "개선" }}
    />,
  );
  const changeEl = container.querySelector("[data-testid='stat-change']") as HTMLElement;
  expect(changeEl.className).toContain("text-signal-green");
});

it("change_down일_때_signal-red_색상이다", () => {
  const { container } = render(
    <StatCard
      title="보험"
      value={80}
      icon={Users}
      isLoading={false}
      change={{ direction: "down", text: "하락" }}
    />,
  );
  const changeEl = container.querySelector("[data-testid='stat-change']") as HTMLElement;
  expect(changeEl.className).toContain("text-signal-red");
});

it("valueSuffix를_렌더링한다", () => {
  render(
    <StatCard
      title="보험 가입률"
      value={91.7}
      icon={Users}
      isLoading={false}
      valueSuffix="%"
    />,
  );
  expect(screen.getByText("%")).toBeDefined();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/components/stat-card.test.tsx`
Expected: FAIL (new props not recognized)

- [ ] **Step 3: Update StatCard component**

```tsx
// components/dashboard/stat-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  readonly title: string;
  readonly value: number | undefined;
  readonly icon: LucideIcon;
  readonly isLoading: boolean;
  readonly isError?: boolean;
  readonly className?: string;
  readonly variant?: "default" | "urgent";
  readonly subtitle?: string;
  readonly valueSuffix?: string;
  readonly change?: {
    readonly direction: "up" | "down";
    readonly text: string;
  };
}

export function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  isError,
  className,
  variant = "default",
  subtitle,
  valueSuffix,
  change,
}: StatCardProps) {
  const isUrgent = variant === "urgent";

  return (
    <Card
      className={cn(
        "border-t-[3px]",
        isUrgent && "bg-signal-red-bg border-signal-red/30",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle
          className={cn(
            "text-sm font-medium",
            isUrgent ? "text-signal-red" : "text-muted-foreground",
          )}
        >
          {title}
        </CardTitle>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            isUrgent
              ? "bg-signal-red-bg text-signal-red"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : isError ? (
          <p className="text-2xl font-bold text-destructive">—</p>
        ) : (
          <>
            <p
              className={cn(
                "font-bold",
                isUrgent
                  ? "text-5xl text-signal-red"
                  : "text-2xl",
              )}
            >
              {value ?? 0}
              {valueSuffix && (
                <span className="text-base font-normal">{valueSuffix}</span>
              )}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {change && (
              <p
                data-testid="stat-change"
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs",
                  change.direction === "up"
                    ? "text-signal-green"
                    : "text-signal-red",
                )}
              >
                {change.direction === "up" ? "↑" : "↓"} {change.text}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `npx vitest run __tests__/components/stat-card.test.tsx`
Expected: PASS (all tests including existing ones)

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/stat-card.tsx __tests__/components/stat-card.test.tsx
git commit -m "feat: enhance StatCard with urgent variant, subtitle, and change indicator"
```

---

## Task 7: AlertCard Component

**Files:**
- Create: `components/dashboard/alert-card.tsx`
- Test: `__tests__/components/alert-card.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// __tests__/components/alert-card.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertCard } from "@/components/dashboard/alert-card";
import type { DashboardAlert } from "@/types/dashboard";

const criticalAlert: DashboardAlert = {
  id: "1",
  level: "critical",
  title: "비자 만료 임박 — Nguyen Van A",
  description: "E-9 비자가 2026.03.28에 만료됩니다.",
  dDay: 4,
  badgeText: "D-4",
  actions: [
    { label: "비자 연장 신청", href: "/workers/1" },
    { label: "근로자 상세", href: "/workers/1" },
  ],
};

const warningAlert: DashboardAlert = {
  id: "2",
  level: "warning",
  title: "건강보험 미가입 — Pham Thi B",
  description: "입사 후 14일이 경과했으나 건강보험 취득신고가 완료되지 않았습니다.",
  dDay: 0,
  badgeText: "D-0",
  actions: [
    { label: "일정 확인", href: "/deadlines" },
    { label: "조치하기", href: "/workers/2" },
  ],
};

const infoAlert: DashboardAlert = {
  id: "3",
  level: "info",
  title: "법령 변경",
  description: "최저임금 변경",
  dDay: null,
  badgeText: "정보",
  actions: [{ label: "자세히 보기", href: "/legal-changes" }],
};

describe("AlertCard", () => {
  it("제목과_설명을_렌더링한다", () => {
    render(<AlertCard alert={criticalAlert} />);
    expect(screen.getByText("비자 만료 임박 — Nguyen Van A")).toBeDefined();
    expect(screen.getByText("E-9 비자가 2026.03.28에 만료됩니다.")).toBeDefined();
  });

  it("뱃지_텍스트를_표시한다", () => {
    render(<AlertCard alert={criticalAlert} />);
    expect(screen.getByText("D-4")).toBeDefined();
  });

  it("액션_버튼들을_렌더링한다", () => {
    render(<AlertCard alert={criticalAlert} />);
    expect(screen.getByText("비자 연장 신청")).toBeDefined();
    expect(screen.getByText("근로자 상세")).toBeDefined();
  });

  it("critical_레벨에_signal-red-bg_배경이다", () => {
    const { container } = render(<AlertCard alert={criticalAlert} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("bg-signal-red-bg");
  });

  it("warning_레벨에_signal-orange-bg_배경이다", () => {
    const { container } = render(<AlertCard alert={warningAlert} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("bg-signal-orange-bg");
  });

  it("info_레벨에_signal-blue-bg_배경이다", () => {
    const { container } = render(<AlertCard alert={infoAlert} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("bg-signal-blue-bg");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/components/alert-card.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement AlertCard**

```tsx
// components/dashboard/alert-card.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DashboardAlert, AlertLevel } from "@/types/dashboard";

const levelStyles: Record<AlertLevel, {
  bg: string;
  dot: string;
  btn: string;
  badge: string;
  border: string;
}> = {
  critical: {
    bg: "bg-signal-red-bg",
    dot: "bg-signal-red",
    btn: "bg-signal-red text-white hover:shadow-md",
    badge: "bg-signal-red text-white",
    border: "border-signal-red/30",
  },
  warning: {
    bg: "bg-signal-orange-bg",
    dot: "bg-signal-orange",
    btn: "bg-signal-orange text-white hover:shadow-md",
    badge: "bg-signal-orange text-white",
    border: "border-signal-orange/30",
  },
  info: {
    bg: "bg-signal-blue-bg",
    dot: "bg-signal-blue",
    btn: "bg-signal-blue text-white hover:shadow-md",
    badge: "bg-signal-blue text-white",
    border: "border-signal-blue/30",
  },
};

interface AlertCardProps {
  readonly alert: DashboardAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const style = levelStyles[alert.level];

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border p-4 transition-shadow hover:shadow-md",
        style.bg,
        style.border,
      )}
    >
      <div className="flex flex-1 items-center gap-3">
        <div className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)} />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold">{alert.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {alert.description}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {alert.actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all",
              style.btn,
            )}
          >
            {action.label}
          </Link>
        ))}
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
          style.badge,
        )}
      >
        {alert.badgeText}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/components/alert-card.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/alert-card.tsx __tests__/components/alert-card.test.tsx
git commit -m "feat: add AlertCard component for dashboard urgent alerts"
```

---

## Task 8: ComplianceGauge Component

**Files:**
- Create: `components/dashboard/compliance-gauge.tsx`
- Test: `__tests__/components/compliance-gauge.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// __tests__/components/compliance-gauge.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComplianceGauge } from "@/components/dashboard/compliance-gauge";
import type { ComplianceScoreData } from "@/types/dashboard";

const scoreData: ComplianceScoreData = {
  total: 73,
  breakdown: [
    { label: "보험 가입", score: 92 },
    { label: "데드라인 준수", score: 65 },
    { label: "임금 경쟁력", score: 62 },
  ],
};

describe("ComplianceGauge", () => {
  it("총점을_표시한다", () => {
    render(<ComplianceGauge data={scoreData} />);
    expect(screen.getByText("73")).toBeDefined();
  });

  it("100점_만점_라벨을_표시한다", () => {
    render(<ComplianceGauge data={scoreData} />);
    expect(screen.getByText("100점 만점")).toBeDefined();
  });

  it("breakdown_항목을_렌더링한다", () => {
    render(<ComplianceGauge data={scoreData} />);
    expect(screen.getByText("보험 가입")).toBeDefined();
    expect(screen.getByText("92")).toBeDefined();
    expect(screen.getByText("데드라인 준수")).toBeDefined();
    expect(screen.getByText("65")).toBeDefined();
    expect(screen.getByText("임금 경쟁력")).toBeDefined();
    expect(screen.getByText("62")).toBeDefined();
  });

  it("등급_스케일을_표시한다", () => {
    render(<ComplianceGauge data={scoreData} />);
    expect(screen.getByText("우수")).toBeDefined();
    expect(screen.getByText("양호")).toBeDefined();
    expect(screen.getByText("주의")).toBeDefined();
    expect(screen.getByText("위험")).toBeDefined();
  });

  it("SVG_게이지를_렌더링한다", () => {
    const { container } = render(<ComplianceGauge data={scoreData} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/components/compliance-gauge.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement ComplianceGauge**

```tsx
// components/dashboard/compliance-gauge.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplianceScoreData } from "@/types/dashboard";

function getScoreColor(score: number): string {
  if (score >= 90) return "text-signal-green";
  if (score >= 70) return "text-signal-orange";
  if (score >= 50) return "text-signal-yellow";
  return "text-signal-red";
}

// Arc length for 180-degree semicircle with r=80: π * 80 ≈ 251.3
const ARC_LENGTH = 251.3;

interface ComplianceGaugeProps {
  readonly data: ComplianceScoreData;
}

export function ComplianceGauge({ data }: ComplianceGaugeProps) {
  const offset = ARC_LENGTH * (1 - data.total / 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
          컴플라이언스 점수
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-4">
          <svg className="h-[120px] w-[200px]" viewBox="0 0 200 120">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.55 0.20 25)" />
                <stop offset="30%" stopColor="oklch(0.65 0.18 55)" />
                <stop offset="60%" stopColor="oklch(0.65 0.16 85)" />
                <stop offset="100%" stopColor="oklch(0.52 0.15 155)" />
              </linearGradient>
            </defs>
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              className="stroke-border"
              strokeWidth={16}
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth={16}
              strokeLinecap="round"
              strokeDasharray={ARC_LENGTH}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <p className={cn("mt-[-8px] text-[40px] font-extrabold", getScoreColor(data.total))}>
            {data.total}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">100점 만점</p>
        </div>

        {/* Grade scale */}
        <div className="mt-4 flex justify-around gap-2 border-t pt-3 text-[11px]">
          <div className="flex-1 text-center">
            <span className="block font-semibold text-signal-green">90+</span>
            <span className="mt-0.5 block text-muted-foreground">우수</span>
          </div>
          <div className="flex-1 text-center">
            <span className="block font-semibold text-signal-orange">70~89</span>
            <span className="mt-0.5 block text-muted-foreground">양호</span>
          </div>
          <div className="flex-1 text-center">
            <span className="block font-semibold text-signal-yellow">50~69</span>
            <span className="mt-0.5 block text-muted-foreground">주의</span>
          </div>
          <div className="flex-1 text-center">
            <span className="block font-semibold text-signal-red">50 미만</span>
            <span className="mt-0.5 block text-muted-foreground">위험</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {data.breakdown.map((item) => (
            <div key={item.label} className="rounded-lg bg-secondary p-3 text-center">
              <p className={cn("text-lg font-bold", getScoreColor(item.score))}>
                {item.score}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run __tests__/components/compliance-gauge.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/compliance-gauge.tsx __tests__/components/compliance-gauge.test.tsx
git commit -m "feat: add ComplianceGauge SVG semicircle component"
```

---

## Task 9: VisaDistribution + InsuranceSummary Components

**Files:**
- Create: `components/dashboard/visa-distribution.tsx`
- Create: `components/dashboard/insurance-summary.tsx`
- Test: `__tests__/components/visa-distribution.test.tsx`
- Test: `__tests__/components/insurance-summary.test.tsx`

- [ ] **Step 1: Write failing VisaDistribution tests**

```tsx
// __tests__/components/visa-distribution.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VisaDistribution } from "@/components/dashboard/visa-distribution";
import type { VisaDistributionItem } from "@/types/dashboard";

const items: VisaDistributionItem[] = [
  { type: "E-9", count: 8, percentage: 66.7 },
  { type: "H-2", count: 3, percentage: 25.0 },
  { type: "E-7", count: 1, percentage: 8.3 },
];

describe("VisaDistribution", () => {
  it("비자_유형_라벨을_렌더링한다", () => {
    render(<VisaDistribution items={items} />);
    expect(screen.getByText("E-9")).toBeDefined();
    expect(screen.getByText("H-2")).toBeDefined();
    expect(screen.getByText("E-7")).toBeDefined();
  });

  it("인원수를_렌더링한다", () => {
    render(<VisaDistribution items={items} />);
    expect(screen.getByText("8명")).toBeDefined();
    expect(screen.getByText("3명")).toBeDefined();
    expect(screen.getByText("1명")).toBeDefined();
  });

  it("카드_제목을_표시한다", () => {
    render(<VisaDistribution items={items} />);
    expect(screen.getByText("비자 유형별 분포")).toBeDefined();
  });
});
```

- [ ] **Step 2: Write failing InsuranceSummary tests**

```tsx
// __tests__/components/insurance-summary.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InsuranceSummary } from "@/components/dashboard/insurance-summary";
import type { InsuranceSummaryItem } from "@/types/dashboard";

const items: InsuranceSummaryItem[] = [
  { type: "national_pension", enrolled: 10, label: "국민연금", status: "ok", statusText: "✓ 가입" },
  { type: "health", enrolled: 11, label: "건강보험", status: "warn", statusText: "1 미가입" },
  { type: "employment", enrolled: 9, label: "고용보험", status: "warn", statusText: "1 미가입" },
  { type: "industrial_accident", enrolled: 12, label: "산재보험", status: "ok", statusText: "✓ 전원" },
];

describe("InsuranceSummary", () => {
  it("보험_유형_라벨을_렌더링한다", () => {
    render(<InsuranceSummary items={items} />);
    expect(screen.getByText("국민연금")).toBeDefined();
    expect(screen.getByText("건강보험")).toBeDefined();
    expect(screen.getByText("고용보험")).toBeDefined();
    expect(screen.getByText("산재보험")).toBeDefined();
  });

  it("가입_인원수를_렌더링한다", () => {
    render(<InsuranceSummary items={items} />);
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("11")).toBeDefined();
  });

  it("상태_텍스트를_렌더링한다", () => {
    render(<InsuranceSummary items={items} />);
    expect(screen.getByText("✓ 가입")).toBeDefined();
    expect(screen.getByText("1 미가입")).toBeDefined();
  });

  it("카드_제목을_표시한다", () => {
    render(<InsuranceSummary items={items} />);
    expect(screen.getByText("4대보험 현황")).toBeDefined();
  });

  it("보험_의무_안내_툴팁이_있다", () => {
    render(<InsuranceSummary items={items} />);
    expect(
      screen.getByTitle("비자 유형별 보험 가입 의무가 상이합니다"),
    ).toBeDefined();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run __tests__/components/visa-distribution.test.tsx __tests__/components/insurance-summary.test.tsx`
Expected: FAIL

- [ ] **Step 4: Implement VisaDistribution**

```tsx
// components/dashboard/visa-distribution.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisaDistributionItem } from "@/types/dashboard";

const barColors: Record<string, string> = {
  "E-9": "bg-signal-blue",
  "H-2": "bg-signal-green",
  "E-7": "bg-signal-orange",
};

interface VisaDistributionProps {
  readonly items: readonly VisaDistributionItem[];
}

export function VisaDistribution({ items }: VisaDistributionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-muted-foreground" />
          비자 유형별 분포
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {items.map((item) => (
          <div key={item.type} className="flex items-center gap-2.5">
            <span className="w-9 text-xs font-semibold">{item.type}</span>
            <div className="relative h-6 flex-1 overflow-hidden rounded bg-secondary">
              <div
                className={cn(
                  "h-full rounded transition-[width] duration-600 ease-out",
                  barColors[item.type] ?? "bg-signal-gray",
                )}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="w-9 text-right text-xs font-semibold">
              {item.count}명
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Implement InsuranceSummary**

```tsx
// components/dashboard/insurance-summary.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsuranceSummaryItem } from "@/types/dashboard";

interface InsuranceSummaryProps {
  readonly items: readonly InsuranceSummaryItem[];
}

export function InsuranceSummary({ items }: InsuranceSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-muted-foreground" />
          4대보험 현황
          <Info
            className="h-3.5 w-3.5 cursor-help text-muted-foreground"
            title="비자 유형별 보험 가입 의무가 상이합니다"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <div
              key={item.type}
              className="rounded-lg bg-secondary p-3 text-center"
            >
              <p className="text-xl font-bold">{item.enrolled}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p
                className={cn(
                  "mt-0.5 text-[10px]",
                  item.status === "ok"
                    ? "text-signal-green"
                    : "text-signal-orange",
                )}
              >
                {item.statusText}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run __tests__/components/visa-distribution.test.tsx __tests__/components/insurance-summary.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add components/dashboard/visa-distribution.tsx components/dashboard/insurance-summary.tsx __tests__/components/visa-distribution.test.tsx __tests__/components/insurance-summary.test.tsx
git commit -m "feat: add VisaDistribution and InsuranceSummary components"
```

---

## Task 10: AiInsightBlock + DeadlineMini Components

**Files:**
- Create: `components/common/ai-insight-block.tsx`
- Create: `components/dashboard/deadline-mini.tsx`
- Test: `__tests__/components/ai-insight-block.test.tsx`
- Test: `__tests__/components/deadline-mini.test.tsx`

- [ ] **Step 1: Write failing AiInsightBlock tests**

```tsx
// __tests__/components/ai-insight-block.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AiInsightBlock } from "@/components/common/ai-insight-block";

describe("AiInsightBlock", () => {
  it("AI_분석_태그를_표시한다", () => {
    render(<AiInsightBlock content="테스트 인사이트" />);
    expect(screen.getByText("✦ AI 분석")).toBeDefined();
  });

  it("콘텐츠를_렌더링한다", () => {
    render(<AiInsightBlock content="<strong>중요</strong> 내용" />);
    expect(screen.getByText("중요")).toBeDefined();
  });

  it("면책_고지를_표시한다", () => {
    render(<AiInsightBlock content="테스트" />);
    expect(
      screen.getByText(/본 서비스는 법률 자문이 아닌 관리 보조 도구입니다/),
    ).toBeDefined();
  });

  it("면책_고지를_숨길_수_있다", () => {
    render(<AiInsightBlock content="테스트" showDisclaimer={false} />);
    expect(
      screen.queryByText(/본 서비스는 법률 자문이 아닌 관리 보조 도구입니다/),
    ).toBeNull();
  });

  it("XSS_스크립트를_제거한다", () => {
    const { container } = render(
      <AiInsightBlock content='<script>alert("xss")</script>안전한 텍스트' />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("안전한 텍스트")).toBeDefined();
  });
});
```

- [ ] **Step 2: Write failing DeadlineMini tests**

```tsx
// __tests__/components/deadline-mini.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeadlineMini } from "@/components/dashboard/deadline-mini";
import type { DashboardDeadline } from "@/types/dashboard";

const deadlines: DashboardDeadline[] = [
  { id: "1", title: "비자 연장", workerName: "Nguyen", visaType: "E-9", dDay: 4, urgency: "overdue" },
  { id: "2", title: "보험 신고", workerName: "Pham", visaType: "E-9", dDay: 0, urgency: "d7" },
  { id: "3", title: "계약 갱신", workerName: "Rahman", visaType: "H-2", dDay: 21, urgency: "d30" },
];

describe("DeadlineMini", () => {
  it("데드라인_제목을_렌더링한다", () => {
    render(<DeadlineMini deadlines={deadlines} />);
    expect(screen.getByText("비자 연장")).toBeDefined();
    expect(screen.getByText("보험 신고")).toBeDefined();
    expect(screen.getByText("계약 갱신")).toBeDefined();
  });

  it("근로자명과_비자타입을_렌더링한다", () => {
    render(<DeadlineMini deadlines={deadlines} />);
    expect(screen.getByText("Nguyen · E-9")).toBeDefined();
  });

  it("D-day를_렌더링한다", () => {
    render(<DeadlineMini deadlines={deadlines} />);
    expect(screen.getByText("D-4")).toBeDefined();
    expect(screen.getByText("D-0")).toBeDefined();
    expect(screen.getByText("D-21")).toBeDefined();
  });

  it("카드_제목을_표시한다", () => {
    render(<DeadlineMini deadlines={deadlines} />);
    expect(screen.getByText("다가오는 데드라인")).toBeDefined();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run __tests__/components/ai-insight-block.test.tsx __tests__/components/deadline-mini.test.tsx`
Expected: FAIL

- [ ] **Step 4: Implement AiInsightBlock**

Uses `isomorphic-dompurify` to sanitize HTML content before rendering. This prevents XSS even though the content comes from our backend — defense in depth. `isomorphic-dompurify` works in both browser and Node/jsdom (Vitest).

```tsx
// components/common/ai-insight-block.tsx
"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface AiInsightBlockProps {
  readonly content: string;
  readonly title?: string;
  readonly showDisclaimer?: boolean;
}

export function AiInsightBlock({
  content,
  title = "AI 인사이트",
  showDisclaimer = true,
}: AiInsightBlockProps) {
  const sanitizedContent = useMemo(
    () => DOMPurify.sanitize(content, { ALLOWED_TAGS: ["strong", "em", "br"] }),
    [content],
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-secondary p-3.5">
          <span className="mb-2 ml-[22px] inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            ✦ AI 분석
          </span>
          <div
            className="pl-[22px] text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
        {showDisclaimer && (
          <p className="mt-2 border-t pt-2 text-center text-[10px] text-muted-foreground">
            ⚖ 본 서비스는 법률 자문이 아닌 관리 보조 도구입니다. 정확한 판단은 전문가와 상담하세요.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Implement DeadlineMini**

```tsx
// components/dashboard/deadline-mini.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardDeadline, DeadlineUrgency } from "@/types/dashboard";
import Link from "next/link";

const urgencyColors: Record<DeadlineUrgency, string> = {
  overdue: "bg-signal-red",
  d7: "bg-signal-orange",
  d30: "bg-signal-yellow",
  safe: "bg-signal-green",
};

const dDayColors: Record<DeadlineUrgency, string> = {
  overdue: "text-signal-red",
  d7: "text-signal-orange",
  d30: "text-signal-yellow",
  safe: "text-foreground",
};

interface DeadlineMiniProps {
  readonly deadlines: readonly DashboardDeadline[];
}

export function DeadlineMini({ deadlines }: DeadlineMiniProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-muted-foreground" />
            다가오는 데드라인
          </CardTitle>
          <Link href="/deadlines" className="text-xs text-primary hover:underline">
            전체 →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {deadlines.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2.5 rounded-lg bg-secondary p-2.5 text-[13px]"
          >
            <div
              className={cn(
                "h-8 w-1 shrink-0 rounded-sm",
                urgencyColors[item.urgency],
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {item.workerName} · {item.visaType}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-xs font-semibold",
                dDayColors[item.urgency],
              )}
            >
              D-{item.dDay}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run __tests__/components/ai-insight-block.test.tsx __tests__/components/deadline-mini.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add components/common/ai-insight-block.tsx components/dashboard/deadline-mini.tsx __tests__/components/ai-insight-block.test.tsx __tests__/components/deadline-mini.test.tsx
git commit -m "feat: add AiInsightBlock and DeadlineMini components"
```

---

## Task 11: Dashboard Page Assembly

**Files:**
- Modify: `app/(app)/page.tsx` (complete rewrite)

- [ ] **Step 1: Write integration test**

```tsx
// __tests__/pages/dashboard-page.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import DashboardPage from "@/app/(app)/page";

// Mock company context
vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({ selectedCompanyId: 1, companies: [] }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("DashboardPage", () => {
  it("모든_대시보드_섹션을_렌더링한다", async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("등록 근로자")).toBeDefined();
    });

    // Stat cards
    expect(screen.getByText("12")).toBeDefined();
    expect(screen.getByText("보험 가입률")).toBeDefined();
    expect(screen.getByText("긴급 조치 필요")).toBeDefined();

    // Alerts
    expect(screen.getByText(/비자 만료 임박/)).toBeDefined();
    expect(screen.getByText(/건강보험 미가입/)).toBeDefined();

    // Sections
    expect(screen.getByText("비자 유형별 분포")).toBeDefined();
    expect(screen.getByText("4대보험 현황")).toBeDefined();
    expect(screen.getByText("AI 인사이트")).toBeDefined();
    expect(screen.getByText("컴플라이언스 점수")).toBeDefined();
    expect(screen.getByText("다가오는 데드라인")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/pages/dashboard-page.test.tsx`
Expected: FAIL (page not yet rewritten)

- [ ] **Step 3: Rewrite the dashboard page**

```tsx
// app/(app)/page.tsx
"use client";

import { Users, Shield, Clock, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { AlertCard } from "@/components/dashboard/alert-card";
import { ComplianceGauge } from "@/components/dashboard/compliance-gauge";
import { VisaDistribution } from "@/components/dashboard/visa-distribution";
import { InsuranceSummary } from "@/components/dashboard/insurance-summary";
import { AiInsightBlock } from "@/components/common/ai-insight-block";
import { DeadlineMini } from "@/components/dashboard/deadline-mini";
import { useDashboard } from "@/lib/queries/use-dashboard";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function DashboardPage() {
  const { selectedCompanyId } = useCompanyContext();
  const { data, isLoading, isError } = useDashboard(selectedCompanyId ?? undefined);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-destructive">대시보드를 불러올 수 없습니다</p>
        <p className="mt-2 text-sm text-muted-foreground">잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="space-y-6">
      {/* Stat Cards: 3 normal + 1 urgent (row-span-2) */}
      <div className="grid grid-cols-[repeat(3,1fr)_1fr] gap-4">
        <StatCard
          title="등록 근로자"
          value={stats.totalWorkers}
          icon={Users}
          isLoading={false}
          className="border-t-[color:var(--signal-blue)]"
          subtitle={stats.visaBreakdown
            .map((v) => `${v.type} ${v.count}명`)
            .join(" · ")}
        />
        <StatCard
          title="보험 가입률"
          value={stats.insuranceRate}
          icon={Shield}
          isLoading={false}
          className="border-t-[color:var(--signal-green)]"
          valueSuffix="%"
          change={{
            direction: stats.insuranceRateChange >= 0 ? "up" : "down",
            text: `전월 대비 ${Math.abs(stats.insuranceRateChange)}%p ${stats.insuranceRateChange >= 0 ? "개선" : "하락"}`,
          }}
        />
        <StatCard
          title="다가오는 데드라인"
          value={stats.upcomingDeadlines}
          icon={Clock}
          isLoading={false}
          className="border-t-[color:var(--signal-orange)]"
          subtitle={`D-7 이내 ${stats.deadlineBreakdown.d7}건 · D-30 이내 ${stats.deadlineBreakdown.d30}건`}
        />
        <div className="col-start-4 row-span-2">
          <StatCard
            title="긴급 조치 필요"
            value={stats.urgentActions}
            icon={AlertTriangle}
            isLoading={false}
            variant="urgent"
            className="h-full border-t-[color:var(--signal-red)]"
            subtitle={`비자 만료 ${stats.urgentBreakdown.visa} · 보험 미가입 ${stats.urgentBreakdown.insurance}`}
          />
        </div>
      </div>

      {/* Main Grid: Left content + Right 360px sidebar */}
      <div className="grid grid-cols-[1fr_360px] gap-5">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Urgent Alerts */}
          <section>
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">⚡ 긴급 알림</h2>
              <Link href="/deadlines" className="text-xs text-primary hover:underline">
                전체 보기 →
              </Link>
            </div>
            <div className="space-y-2.5">
              {data.alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </section>

          {/* Visa Distribution + Insurance Summary */}
          <div className="grid grid-cols-2 gap-4">
            <VisaDistribution items={data.visaDistribution} />
            <InsuranceSummary items={data.insuranceSummary} />
          </div>

          {/* AI Insight */}
          <AiInsightBlock content={data.aiInsight} />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <ComplianceGauge data={data.complianceScore} />
          <DeadlineMini deadlines={data.upcomingDeadlines} />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-[1fr_360px] gap-5">
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Run all tests (including integration test)**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add app/(app)/page.tsx __tests__/pages/dashboard-page.test.tsx
git commit -m "feat: assemble dashboard page with all new components and integration test"
```

---

## Task 12: Visual Verification + Cleanup

- [ ] **Step 1: Start dev server and visually verify**

Run: `npm run dev`
Open: `http://localhost:3000`

Check:
- [ ] **Sidebar**: Dark sidebar with light text (light→dark change from CSS sync). Nav items, logo, user card all readable
- [ ] 4 stat cards with correct layout (3+1, urgent card spans 2 rows)
- [ ] 3 alert cards (critical red, warning orange, info blue)
- [ ] Visa distribution bars with correct percentages
- [ ] 4대보험 grid with ok/warn status colors + info tooltip
- [ ] AI insight block with ✦ tag and disclaimer
- [ ] Compliance gauge SVG with score 73
- [ ] Deadline mini timeline with urgency bars
- [ ] Dark mode toggle works correctly (including sidebar staying dark)
- [ ] No layout overflow or misalignment
- [ ] Existing pages (workers, companies, compliance) still look correct with new CSS values

- [ ] **Step 2: Fix any visual issues found**

- [ ] **Step 3: Run lint + format**

Run: `npm run lint && npm run format`

- [ ] **Step 4: Final test run**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 5: Create feature branch and commit**

```bash
git checkout -b feat/dashboard-renewal
# Cherry-pick or merge all commits from epic branch
git push -u origin feat/dashboard-renewal
```
