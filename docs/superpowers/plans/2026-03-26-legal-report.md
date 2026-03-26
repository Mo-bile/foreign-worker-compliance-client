# Legal Changes & Compliance Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement two tab-navigated pages — "법령 변경 알림" (legal change timeline) and "컴플라이언스 리포트" (monthly compliance report) — with mock BFF data, query hooks, and full component tree.

**Architecture:** Route Group `(app)/(legal)/layout.tsx` provides shared tab navigation. Three BFF routes return mock data. Client-side filtering on legal changes. Legal card detail fetched on expand via `useQuery` with `enabled: isOpen`. DOMPurify sanitizes all AI HTML blocks.

**Tech Stack:** Next.js 16, React 19, TanStack Query, Tailwind CSS v4 (oklch), MSW v2, Vitest, isomorphic-dompurify

---

### Task 1: Type Definitions + Mock Data

**Files:**
- Create: `types/legal.ts`
- Create: `types/report.ts`
- Create: `mocks/legal-data.ts`
- Create: `mocks/report-data.ts`
- Test: `__tests__/types/legal-types.test.ts`
- Test: `__tests__/types/report-types.test.ts`

- [ ] **Step 1: Write type definitions**

`types/legal.ts`:
```typescript
import type { SignalColor } from "./shared";

// ─── Legal Changes List ─────────────────────────────
export type LegalStatus = "action_required" | "reference" | "resolved";
export type LegalSeverity = "critical" | "warning" | "info" | "resolved";

export interface LegalChange {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly lawName: string;
  readonly effectiveDate: string;
  readonly detectedDate: string;
  readonly severity: LegalSeverity;
  readonly status: LegalStatus;
  readonly badge: { readonly text: string; readonly color: SignalColor };
  readonly dDay?: number;
}

export interface LegalChangesResponse {
  readonly changes: readonly LegalChange[];
  readonly lastSyncedAt: string;
}

// ─── Legal Impact (Detail) ──────────────────────────
export interface LegalImpact {
  readonly changeId: string;
  readonly impacts: readonly string[];
  readonly aiAnalysis: string;
  readonly actions: readonly LegalAction[];
}

export interface LegalAction {
  readonly label: string;
  readonly primary?: boolean;
  readonly href?: string;
}
```

`types/report.ts`:
```typescript
import type { SignalColor } from "./shared";

export type CheckStatus = "done" | "miss" | "pending";

export interface ChecklistItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: CheckStatus;
  readonly date?: string;
  readonly badge?: { readonly text: string; readonly color: SignalColor };
}

export interface LegalChangeSummary {
  readonly title: string;
  readonly description: string;
  readonly color: SignalColor;
}

export type UrgencyLevel = "urgent" | "warning" | "normal";

export interface UpcomingItem {
  readonly title: string;
  readonly description: string;
  readonly urgency: UrgencyLevel;
}

export interface ComplianceReportResponse {
  readonly id: string;
  readonly title: string;
  readonly period: string;
  readonly score: number;
  readonly scoreChange: number;
  readonly aiSummary: string;
  readonly completed: readonly ChecklistItem[];
  readonly pending: readonly ChecklistItem[];
  readonly legalChanges: readonly LegalChangeSummary[];
  readonly upcoming: readonly UpcomingItem[];
}
```

- [ ] **Step 2: Write mock data**

`mocks/legal-data.ts`:
```typescript
import type { LegalChangesResponse, LegalImpact } from "@/types/legal";

export const mockLegalChangesResponse: LegalChangesResponse = {
  changes: [
    {
      id: "lc-1",
      title: "고용허가제 시행규칙 개정",
      icon: "📋",
      lawName: "외국인근로자의 고용 등에 관한 법률 시행규칙",
      effectiveDate: "2026-04-15",
      detectedDate: "2026-03-18",
      severity: "warning",
      status: "reference",
      badge: { text: "참고", color: "orange" },
      dDay: 22,
    },
    {
      id: "lc-2",
      title: "최저임금법 시행령 개정",
      icon: "⚖️",
      lawName: "최저임금법 시행령",
      effectiveDate: "2026-07-01",
      detectedDate: "2026-03-20",
      severity: "critical",
      status: "action_required",
      badge: { text: "조치 필요", color: "red" },
      dDay: 99,
    },
    {
      id: "lc-3",
      title: "한-캄보디아 사회보장협정",
      icon: "🌐",
      lawName: "사회보장협정",
      effectiveDate: "2026-03-01",
      detectedDate: "2026-02-15",
      severity: "resolved",
      status: "resolved",
      badge: { text: "확인 완료", color: "green" },
    },
  ],
  lastSyncedAt: "2026-03-24T06:00:00+09:00",
};

export const mockImpacts: Record<string, LegalImpact> = {
  "lc-1": {
    changeId: "lc-1",
    impacts: [
      "사업장 변경 사유가 확대되어 근로자의 이동 가능성 증가",
      "E-9/H-2 비자 근로자 11명 중 해당 사항 검토 필요",
      "직접적 조치 사항 없으나 주기적 점검 권장",
    ],
    aiAnalysis:
      '<p>이번 개정은 사업장 변경 사유를 확대하는 내용으로, 귀사에 <strong class="text-signal-orange">직접적인 리스크는 낮습니다</strong>. 다만, 근로 환경 개선을 통해 자발적 이직을 방지하는 것이 권장됩니다. 주기적인 근로조건 점검을 통해 사전 대응하시기 바랍니다.</p>',
    actions: [
      { label: "근로조건 점검 시작" },
      { label: "확인 완료 처리" },
    ],
  },
  "lc-2": {
    changeId: "lc-2",
    impacts: [
      "시간급 10,030원 → 10,360원 변경 (3.3% 인상)",
      "E-9 비자 근로자 3명의 현재 임금이 신규 최저임금 미달",
      "해당 근로자 근로계약서 갱신 필요",
    ],
    aiAnalysis:
      '<p>귀사 E-9 근로자 <strong class="text-signal-red">3명</strong>의 현재 시급이 개정 최저임금에 미달합니다. <strong class="text-signal-red">7월 1일</strong> 시행 전까지 근로계약서 갱신이 필요하며, 미이행 시 최저임금법 위반으로 <strong class="text-signal-red">벌칙 대상</strong>이 됩니다.</p>',
    actions: [
      { label: "계약서 갱신 시작", primary: true },
      { label: "영향 근로자 목록 보기" },
      { label: "확인 완료 처리" },
    ],
  },
};
```

`mocks/report-data.ts`:
```typescript
import type { ComplianceReportResponse } from "@/types/report";

export const mockComplianceReport: ComplianceReportResponse = {
  id: "rpt-2026-03",
  title: "2026년 3월 컴플라이언스 월간 리포트",
  period: "안산제조 주식회사 · 2026.03.01 ~ 2026.03.24 · 자동 생성",
  score: 73,
  scoreChange: 4,
  aiSummary:
    '<p>이번 달 종합 점수는 <strong class="text-signal-orange">73점</strong>으로 전월 대비 <strong class="text-signal-green">4점 상승</strong>했습니다. 보험 관련 의무사항 이행이 우수하나, 비자 연장 및 건강보험 처리 지연 건에 대한 즉각적인 조치가 필요합니다.</p>',
  completed: [
    { id: "c1", title: "Tran E 고용변동 신고", description: "외국인 고용변동 신고 완료", status: "done", date: "03.05" },
    { id: "c2", title: "Rahman C 건강보험 취득신고", description: "건강보험 자격취득 신고 완료", status: "done", date: "03.10" },
    { id: "c3", title: "분기 산재보험 정산", description: "2026년 1분기 산재보험료 정산 완료", status: "done", date: "03.15" },
    { id: "c4", title: "사회보장협정 확인", description: "한-캄보디아 사회보장협정 적용 확인", status: "done", date: "03.18" },
    { id: "c5", title: "Li Wei D 근로계약 갱신", description: "근로계약 갱신 완료 (2026.04~2027.03)", status: "done", date: "03.20" },
  ],
  pending: [
    {
      id: "p1",
      title: "Nguyen Van A 비자 연장",
      description: "E-9 비자 만료 임박 — 즉시 연장 신청 필요",
      status: "miss",
      badge: { text: "D-4", color: "red" },
    },
    {
      id: "p2",
      title: "Pham Thi B 건강보험 취득신고",
      description: "입사 후 14일 초과 — 즉시 신고 필요",
      status: "miss",
      badge: { text: "지연", color: "red" },
    },
    {
      id: "p3",
      title: "최저임금 대응 (3건)",
      description: "7월 시행 전 근로계약서 갱신 필요",
      status: "pending",
      badge: { text: "D-99", color: "orange" },
    },
  ],
  legalChanges: [
    { title: "최저임금법 시행령 개정", description: "시간급 10,030원 → 10,360원 변경, E-9 근로자 3명 계약서 갱신 필요", color: "red" },
    { title: "고용허가제 시행규칙 개정", description: "사업장 변경 사유 확대, 직접 조치 불필요하나 모니터링 권장", color: "orange" },
  ],
  upcoming: [
    { title: "Li Wei D 비자 만료", description: "2026.04.15 만료 — 연장 신청 준비", urgency: "urgent" },
    { title: "Rahman C 근로계약 만료", description: "2026.04.30 만료 — 갱신 여부 결정 필요", urgency: "warning" },
    { title: "분기 보험료 납부", description: "2026.04.10 마감 — 2분기 산재보험료", urgency: "normal" },
  ],
};
```

- [ ] **Step 3: Write type validation tests**

`__tests__/types/legal-types.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { mockLegalChangesResponse, mockImpacts } from "@/mocks/legal-data";

describe("Legal types mock data shape", () => {
  it("LegalChangesResponse has required fields", () => {
    expect(mockLegalChangesResponse.changes).toHaveLength(3);
    expect(mockLegalChangesResponse.lastSyncedAt).toBeTruthy();
    for (const c of mockLegalChangesResponse.changes) {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.severity).toBeTruthy();
      expect(c.status).toBeTruthy();
      expect(c.badge.text).toBeTruthy();
      expect(c.badge.color).toBeTruthy();
    }
  });

  it("LegalImpact has required fields", () => {
    for (const impact of Object.values(mockImpacts)) {
      expect(impact.changeId).toBeTruthy();
      expect(impact.impacts.length).toBeGreaterThan(0);
      expect(impact.aiAnalysis).toBeTruthy();
      expect(impact.actions.length).toBeGreaterThan(0);
    }
  });

  it("resolved change has no impact data", () => {
    expect(mockImpacts["lc-3"]).toBeUndefined();
  });
});
```

`__tests__/types/report-types.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { mockComplianceReport } from "@/mocks/report-data";

describe("Report types mock data shape", () => {
  it("ComplianceReportResponse has required fields", () => {
    expect(mockComplianceReport.score).toBe(73);
    expect(mockComplianceReport.scoreChange).toBe(4);
    expect(mockComplianceReport.completed).toHaveLength(5);
    expect(mockComplianceReport.pending).toHaveLength(3);
    expect(mockComplianceReport.legalChanges).toHaveLength(2);
    expect(mockComplianceReport.upcoming).toHaveLength(3);
  });

  it("ChecklistItem has valid status values", () => {
    const validStatuses = ["done", "miss", "pending"];
    for (const item of [...mockComplianceReport.completed, ...mockComplianceReport.pending]) {
      expect(validStatuses).toContain(item.status);
    }
  });

  it("UpcomingItem has valid urgency values", () => {
    const validUrgencies = ["urgent", "warning", "normal"];
    for (const item of mockComplianceReport.upcoming) {
      expect(validUrgencies).toContain(item.urgency);
    }
  });
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/types/legal-types.test.ts __tests__/types/report-types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add types/legal.ts types/report.ts mocks/legal-data.ts mocks/report-data.ts __tests__/types/
git commit -m "feat: add legal/report type definitions and mock data"
```

---

### Task 2: BFF Routes + Query Hooks + MSW Handlers

**Files:**
- Create: `app/api/legal-changes/route.ts`
- Create: `app/api/legal-changes/[id]/impacts/route.ts`
- Create: `app/api/reports/route.ts`
- Create: `lib/queries/use-legal-changes.ts`
- Create: `lib/queries/use-legal-impact.ts`
- Create: `lib/queries/use-compliance-report.ts`
- Modify: `mocks/handlers.ts`
- Test: `__tests__/api/legal-changes-route.test.ts`
- Test: `__tests__/api/legal-impacts-route.test.ts`
- Test: `__tests__/api/reports-route.test.ts`

- [ ] **Step 1: Write BFF route tests**

`__tests__/api/legal-changes-route.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/legal-changes/route";

function makeGetRequest(url: string) {
  const parsed = new URL(url);
  const request = new Request(url);
  Object.defineProperty(request, "nextUrl", { value: parsed });
  return request as unknown as Parameters<typeof GET>[0];
}

describe("GET /api/legal-changes", () => {
  it("유효한_companyId로_법령변경을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/legal-changes?companyId=1"));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.changes).toHaveLength(3);
    expect(data.lastSyncedAt).toBeTruthy();
  });

  it("companyId가_없으면_400을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/legal-changes"));
    expect(response.status).toBe(400);
  });

  it("companyId가_유효하지_않으면_400을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/legal-changes?companyId=abc"));
    expect(response.status).toBe(400);
  });
});
```

`__tests__/api/legal-impacts-route.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/legal-changes/[id]/impacts/route";

function makeGetRequest(url: string) {
  const parsed = new URL(url);
  const request = new Request(url);
  Object.defineProperty(request, "nextUrl", { value: parsed });
  return request as unknown as Parameters<typeof GET>[0];
}

describe("GET /api/legal-changes/[id]/impacts", () => {
  it("유효한_id로_영향분석을_반환한다", async () => {
    const response = await GET(
      makeGetRequest("http://localhost:3000/api/legal-changes/lc-1/impacts?companyId=1"),
      { params: Promise.resolve({ id: "lc-1" }) },
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.changeId).toBe("lc-1");
    expect(data.impacts.length).toBeGreaterThan(0);
  });

  it("존재하지_않는_id면_404를_반환한다", async () => {
    const response = await GET(
      makeGetRequest("http://localhost:3000/api/legal-changes/nonexistent/impacts?companyId=1"),
      { params: Promise.resolve({ id: "nonexistent" }) },
    );
    expect(response.status).toBe(404);
  });

  it("companyId가_없으면_400을_반환한다", async () => {
    const response = await GET(
      makeGetRequest("http://localhost:3000/api/legal-changes/lc-1/impacts"),
      { params: Promise.resolve({ id: "lc-1" }) },
    );
    expect(response.status).toBe(400);
  });
});
```

`__tests__/api/reports-route.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/reports/route";

function makeGetRequest(url: string) {
  const parsed = new URL(url);
  const request = new Request(url);
  Object.defineProperty(request, "nextUrl", { value: parsed });
  return request as unknown as Parameters<typeof GET>[0];
}

describe("GET /api/reports", () => {
  it("유효한_companyId로_리포트를_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/reports?companyId=1"));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.score).toBe(73);
    expect(data.completed).toHaveLength(5);
  });

  it("companyId가_없으면_400을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/reports"));
    expect(response.status).toBe(400);
  });

  it("companyId가_0이면_400을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/reports?companyId=0"));
    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/api/legal-changes-route.test.ts __tests__/api/legal-impacts-route.test.ts __tests__/api/reports-route.test.ts`
Expected: FAIL (routes not yet created)

- [ ] **Step 3: Implement BFF routes**

`app/api/legal-changes/route.ts`:
```typescript
import { NextResponse, type NextRequest } from "next/server";
import { mockLegalChangesResponse } from "@/mocks/legal-data";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) {
    return NextResponse.json({ message: "companyId required" }, { status: 400 });
  }

  const companyId = Number(raw);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 companyId" }, { status: 400 });
  }

  try {
    // TODO: Replace with apiClient.get<LegalChangesResponse>(`/api/legal-changes?companyId=${companyId}`)
    return NextResponse.json(mockLegalChangesResponse);
  } catch (error) {
    return handleRouteError(error, "GET /api/legal-changes");
  }
}
```

`app/api/legal-changes/[id]/impacts/route.ts`:
```typescript
import { NextResponse, type NextRequest } from "next/server";
import { mockImpacts } from "@/mocks/legal-data";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) {
    return NextResponse.json({ message: "companyId required" }, { status: 400 });
  }

  const companyId = Number(raw);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 companyId" }, { status: 400 });
  }

  try {
    const impact = mockImpacts[id];
    if (!impact) {
      return NextResponse.json({ message: "not found" }, { status: 404 });
    }
    // TODO: Replace with apiClient.get<LegalImpact>(`/api/legal-changes/${id}/impacts?companyId=${companyId}`)
    return NextResponse.json(impact);
  } catch (error) {
    return handleRouteError(error, `GET /api/legal-changes/${id}/impacts`);
  }
}
```

`app/api/reports/route.ts`:
```typescript
import { NextResponse, type NextRequest } from "next/server";
import { mockComplianceReport } from "@/mocks/report-data";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) {
    return NextResponse.json({ message: "companyId required" }, { status: 400 });
  }

  const companyId = Number(raw);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 companyId" }, { status: 400 });
  }

  try {
    // TODO: Replace with apiClient.get<ComplianceReportResponse>(`/api/reports?companyId=${companyId}`)
    return NextResponse.json(mockComplianceReport);
  } catch (error) {
    return handleRouteError(error, "GET /api/reports");
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/api/legal-changes-route.test.ts __tests__/api/legal-impacts-route.test.ts __tests__/api/reports-route.test.ts`
Expected: PASS

- [ ] **Step 5: Write query hooks**

`lib/queries/use-legal-changes.ts`:
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { LegalChangesResponse } from "@/types/legal";

export function useLegalChanges(companyId: number | null | undefined) {
  return useQuery<LegalChangesResponse>({
    queryKey: ["legal-changes", companyId],
    queryFn: () => {
      if (companyId == null || companyId <= 0) {
        return Promise.reject(new Error("유효하지 않은 사업장 ID입니다"));
      }
      return fetchApi<LegalChangesResponse>(
        `/api/legal-changes?companyId=${companyId}`,
        "법령 변경 조회에 실패했습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
  });
}
```

`lib/queries/use-legal-impact.ts`:
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { LegalImpact } from "@/types/legal";

export function useLegalImpact(
  changeId: string,
  companyId: number | null | undefined,
  enabled: boolean,
) {
  return useQuery<LegalImpact>({
    queryKey: ["legal-impact", changeId, companyId],
    queryFn: () => {
      if (companyId == null || companyId <= 0) {
        return Promise.reject(new Error("유효하지 않은 사업장 ID입니다"));
      }
      return fetchApi<LegalImpact>(
        `/api/legal-changes/${changeId}/impacts?companyId=${companyId}`,
        "영향 분석 조회에 실패했습니다",
      );
    },
    enabled: enabled && companyId != null && companyId > 0,
  });
}
```

`lib/queries/use-compliance-report.ts`:
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { ComplianceReportResponse } from "@/types/report";

export function useComplianceReport(companyId: number | null | undefined) {
  return useQuery<ComplianceReportResponse>({
    queryKey: ["compliance-report", companyId],
    queryFn: () => {
      if (companyId == null || companyId <= 0) {
        return Promise.reject(new Error("유효하지 않은 사업장 ID입니다"));
      }
      return fetchApi<ComplianceReportResponse>(
        `/api/reports?companyId=${companyId}`,
        "리포트 조회에 실패했습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
  });
}
```

- [ ] **Step 6: Add MSW handlers**

In `mocks/handlers.ts`, add imports at top:
```typescript
import { mockLegalChangesResponse, mockImpacts } from "./legal-data";
import { mockComplianceReport } from "./report-data";
```

Add handler callbacks:
```typescript
const getLegalChanges: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockLegalChangesResponse);

const getLegalImpact: Parameters<typeof http.get>[1] = ({ params }) => {
  const impact = mockImpacts[params.id as string];
  if (!impact) return new HttpResponse(null, { status: 404 });
  return HttpResponse.json(impact);
};

const getReport: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockComplianceReport);
```

Add to handlers array (impacts BEFORE legal-changes for correct matching):
```typescript
// Legal Changes
http.get(`${BACKEND}/api/legal-changes/:id/impacts`, getLegalImpact),
http.get("*/api/legal-changes/:id/impacts", getLegalImpact),
http.get(`${BACKEND}/api/legal-changes`, getLegalChanges),
http.get("*/api/legal-changes", getLegalChanges),

// Reports
http.get(`${BACKEND}/api/reports`, getReport),
http.get("*/api/reports", getReport),
```

- [ ] **Step 7: Commit**

```bash
git add app/api/legal-changes/ app/api/reports/ lib/queries/use-legal-changes.ts lib/queries/use-legal-impact.ts lib/queries/use-compliance-report.ts mocks/handlers.ts __tests__/api/legal-changes-route.test.ts __tests__/api/legal-impacts-route.test.ts __tests__/api/reports-route.test.ts
git commit -m "feat: add BFF routes, query hooks, and MSW handlers for legal/report"
```

---

### Task 3: Tab Layout + Legal Sub-Components

**Files:**
- Create: `app/(app)/(legal)/layout.tsx`
- Create: `components/legal/filter-bar.tsx`
- Create: `components/legal/sync-status.tsx`
- Create: `components/legal/impact-box.tsx`
- Create: `components/legal/ai-insight-block.tsx`
- Create: `components/legal/action-row.tsx`
- Test: `__tests__/components/legal/filter-bar.test.tsx`
- Test: `__tests__/components/legal/sync-status.test.tsx`
- Test: `__tests__/components/legal/impact-box.test.tsx`
- Test: `__tests__/components/legal/action-row.test.tsx`

- [ ] **Step 1: Write component tests**

`__tests__/components/legal/filter-bar.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FilterBar } from "@/components/legal/filter-bar";

describe("FilterBar", () => {
  it("renders all filter chips", () => {
    render(<FilterBar activeFilter="all" onFilterChange={vi.fn()} />);
    expect(screen.getByText("전체")).toBeInTheDocument();
    expect(screen.getByText("영향있음")).toBeInTheDocument();
    expect(screen.getByText("조치필요")).toBeInTheDocument();
    expect(screen.getByText("확인완료")).toBeInTheDocument();
  });

  it("marks active chip with aria-pressed", () => {
    render(<FilterBar activeFilter="action_required" onFilterChange={vi.fn()} />);
    expect(screen.getByText("조치필요")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("전체")).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onFilterChange when chip clicked", async () => {
    const onChange = vi.fn();
    render(<FilterBar activeFilter="all" onFilterChange={onChange} />);
    await userEvent.click(screen.getByText("조치필요"));
    expect(onChange).toHaveBeenCalledWith("action_required");
  });
});
```

`__tests__/components/legal/sync-status.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SyncStatus } from "@/components/legal/sync-status";

describe("SyncStatus", () => {
  it("renders formatted sync date", () => {
    render(<SyncStatus lastSyncedAt="2026-03-24T06:00:00+09:00" />);
    expect(screen.getByText(/법제처 API 마지막 동기화/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});
```

`__tests__/components/legal/impact-box.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImpactBox } from "@/components/legal/impact-box";

describe("ImpactBox", () => {
  it("renders all impact items", () => {
    const impacts = ["영향 1", "영향 2", "영향 3"];
    render(<ImpactBox impacts={impacts} />);
    for (const impact of impacts) {
      expect(screen.getByText(`→ ${impact}`)).toBeInTheDocument();
    }
  });

  it("renders title", () => {
    render(<ImpactBox impacts={["영향 1"]} />);
    expect(screen.getByText("귀사 영향 분석")).toBeInTheDocument();
  });
});
```

`__tests__/components/legal/action-row.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ActionRow } from "@/components/legal/action-row";
import type { LegalAction } from "@/types/legal";

describe("ActionRow", () => {
  it("renders all action buttons", () => {
    const actions: LegalAction[] = [
      { label: "계약서 갱신 시작", primary: true },
      { label: "확인 완료 처리" },
    ];
    render(<ActionRow actions={actions} />);
    expect(screen.getByText("계약서 갱신 시작")).toBeInTheDocument();
    expect(screen.getByText("확인 완료 처리")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/components/legal/`
Expected: FAIL

- [ ] **Step 3: Implement tab layout**

`app/(app)/(legal)/layout.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/legal-changes", label: "법령 변경 알림" },
  { href: "/reports", label: "컴플라이언스 리포트" },
] as const;

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg bg-secondary p-1">
        {TABS.map(({ href, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Implement legal sub-components**

`components/legal/filter-bar.tsx`:
```tsx
import { cn } from "@/lib/utils";

export type FilterValue = "all" | "affected" | "action_required" | "resolved";

const FILTERS: readonly { readonly value: FilterValue; readonly label: string }[] = [
  { value: "all", label: "전체" },
  { value: "affected", label: "영향있음" },
  { value: "action_required", label: "조치필요" },
  { value: "resolved", label: "확인완료" },
];

interface FilterBarProps {
  readonly activeFilter: FilterValue;
  readonly onFilterChange: (filter: FilterValue) => void;
}

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div role="group" aria-label="법령 필터" className="flex gap-2">
      {FILTERS.map(({ value, label }) => {
        const isActive = activeFilter === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onFilterChange(value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
```

`components/legal/sync-status.tsx`:
```tsx
interface SyncStatusProps {
  readonly lastSyncedAt: string;
}

export function SyncStatus({ lastSyncedAt }: SyncStatusProps) {
  const formatted = new Date(lastSyncedAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <p className="text-right text-xs text-muted-foreground">
      법제처 API 마지막 동기화: {formatted}
    </p>
  );
}
```

`components/legal/impact-box.tsx`:
```tsx
interface ImpactBoxProps {
  readonly impacts: readonly string[];
}

export function ImpactBox({ impacts }: ImpactBoxProps) {
  return (
    <div className="rounded-lg bg-secondary p-4">
      <h4 className="mb-2 text-sm font-semibold">귀사 영향 분석</h4>
      <ul className="space-y-1">
        {impacts.map((impact) => (
          <li key={impact} className="text-sm text-muted-foreground">
            → {impact}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

`components/legal/ai-insight-block.tsx`:
```tsx
"use client";

import DOMPurify from "isomorphic-dompurify";

interface AiInsightBlockProps {
  readonly html: string;
}

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ["strong", "em", "br", "p"] as string[],
  ALLOWED_ATTR: ["class"] as string[],
};

export function AiInsightBlock({ html }: AiInsightBlockProps) {
  const sanitized = DOMPurify.sanitize(html, PURIFY_CONFIG);

  return (
    <div className="rounded-lg bg-secondary p-4">
      <span className="mb-3 inline-block rounded-full bg-background px-3 py-1 text-xs font-medium">
        ✦ AI 영향 분석
      </span>
      {/* Sanitized HTML rendered via DOMPurify — see PURIFY_CONFIG above */}
      <div
        className="space-y-2 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </div>
  );
}
```

`components/legal/action-row.tsx`:
```tsx
"use client";

import { toast } from "sonner";
import type { LegalAction } from "@/types/legal";
import { cn } from "@/lib/utils";

interface ActionRowProps {
  readonly actions: readonly LegalAction[];
}

export function ActionRow({ actions }: ActionRowProps) {
  return (
    <div className="flex gap-2 pt-2">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => toast("준비 중입니다")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            action.primary
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border text-foreground hover:bg-secondary",
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run __tests__/components/legal/`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/\(legal\)/layout.tsx components/legal/ __tests__/components/legal/
git commit -m "feat: add tab layout and legal sub-components"
```

---

### Task 4: LegalTimeline + LegalCard

**Files:**
- Create: `components/legal/legal-timeline.tsx`
- Create: `components/legal/legal-card.tsx`
- Test: `__tests__/components/legal/legal-card.test.tsx`

- [ ] **Step 1: Write LegalCard test**

`__tests__/components/legal/legal-card.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LegalCard } from "@/components/legal/legal-card";
import type { LegalChange } from "@/types/legal";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const mockChange: LegalChange = {
  id: "lc-1",
  title: "고용허가제 시행규칙 개정",
  icon: "📋",
  lawName: "외국인근로자의 고용 등에 관한 법률 시행규칙",
  effectiveDate: "2026-04-15",
  detectedDate: "2026-03-18",
  severity: "warning",
  status: "reference",
  badge: { text: "참고", color: "orange" },
  dDay: 22,
};

const resolvedChange: LegalChange = {
  id: "lc-3",
  title: "한-캄보디아 사회보장협정",
  icon: "🌐",
  lawName: "사회보장협정",
  effectiveDate: "2026-03-01",
  detectedDate: "2026-02-15",
  severity: "resolved",
  status: "resolved",
  badge: { text: "확인 완료", color: "green" },
};

describe("LegalCard", () => {
  it("renders card header with title and badge", () => {
    render(<LegalCard change={mockChange} companyId={1} />, { wrapper: Wrapper });
    expect(screen.getByText("고용허가제 시행규칙 개정")).toBeInTheDocument();
    expect(screen.getByText("참고")).toBeInTheDocument();
    expect(screen.getByText("D-22")).toBeInTheDocument();
  });

  it("expands on click to show body", async () => {
    render(<LegalCard change={mockChange} companyId={1} />, { wrapper: Wrapper });
    const header = screen.getByRole("button");
    expect(header).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
  });

  it("resolved card renders as non-expandable div without button", () => {
    const { container } = render(<LegalCard change={resolvedChange} companyId={1} />, { wrapper: Wrapper });
    expect(screen.getByText("한-캄보디아 사회보장협정")).toBeInTheDocument();
    expect(container.querySelector("button[aria-expanded]")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/legal/legal-card.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement LegalTimeline and LegalCard**

`components/legal/legal-timeline.tsx`:
```tsx
import type { LegalChange } from "@/types/legal";
import { LegalCard } from "./legal-card";
import { cn } from "@/lib/utils";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-signal-red",
  warning: "bg-signal-orange",
  info: "bg-signal-blue",
  resolved: "bg-signal-green",
};

interface LegalTimelineProps {
  readonly changes: readonly LegalChange[];
  readonly companyId: number;
}

export function LegalTimeline({ changes, companyId }: LegalTimelineProps) {
  return (
    <div role="list" className="relative space-y-4 pl-6">
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
      {changes.map((change) => (
        <div key={change.id} role="listitem" className="relative">
          <div
            className={cn(
              "absolute -left-3.5 top-4 h-3 w-3 rounded-full border-2 border-background",
              SEVERITY_COLORS[change.severity] ?? "bg-signal-gray",
            )}
          />
          <LegalCard change={change} companyId={companyId} />
        </div>
      ))}
    </div>
  );
}
```

`components/legal/legal-card.tsx`:
```tsx
"use client";

import { useState, useId } from "react";
import { useLegalImpact } from "@/lib/queries/use-legal-impact";
import { ImpactBox } from "./impact-box";
import { AiInsightBlock } from "./ai-insight-block";
import { ActionRow } from "./action-row";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LegalChange } from "@/types/legal";

const BADGE_COLORS: Record<string, string> = {
  red: "bg-signal-red-bg text-signal-red",
  orange: "bg-signal-orange-bg text-signal-orange",
  yellow: "bg-signal-yellow-bg text-signal-yellow",
  green: "bg-signal-green-bg text-signal-green",
  blue: "bg-signal-blue-bg text-signal-blue",
  gray: "bg-signal-gray-bg text-signal-gray",
};

interface LegalCardProps {
  readonly change: LegalChange;
  readonly companyId: number;
}

export function LegalCard({ change, companyId }: LegalCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bodyId = useId();
  const isResolved = change.status === "resolved";

  const { data, isLoading, isError, refetch } = useLegalImpact(
    change.id,
    companyId,
    isOpen,
  );

  const header = (
    <>
      <div className="flex items-center gap-2">
        <span className="text-xl">{change.icon}</span>
        <span className="text-sm font-semibold">{change.title}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        시행일: {change.effectiveDate} · 감지일: {change.detectedDate} · {change.lawName}
      </p>
      <div className="mt-2 flex gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", BADGE_COLORS[change.badge.color])}>
          {change.badge.text}
        </span>
        {change.dDay != null && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            D-{change.dDay}
          </span>
        )}
      </div>
    </>
  );

  if (isResolved) {
    return <div className="rounded-lg border p-4 opacity-70">{header}</div>;
  }

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        className="w-full p-4 text-left"
      >
        {header}
      </button>
      {isOpen && (
        <div id={bodyId} className="space-y-4 border-t px-4 pb-4 pt-3">
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
          {isError && (
            <div className="rounded-md bg-destructive/5 p-3 text-center">
              <p className="text-sm text-destructive">영향 분석을 불러오지 못했습니다</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-xs text-primary hover:underline"
              >
                다시 시도
              </button>
            </div>
          )}
          {data && (
            <>
              <ImpactBox impacts={data.impacts} />
              <AiInsightBlock html={data.aiAnalysis} />
              <ActionRow actions={data.actions} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/components/legal/legal-card.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/legal/legal-timeline.tsx components/legal/legal-card.tsx __tests__/components/legal/legal-card.test.tsx
git commit -m "feat: add LegalTimeline and LegalCard components"
```

---

### Task 5: Legal Changes Page

**Files:**
- Create: `app/(app)/(legal)/legal-changes/page.tsx`
- Test: `__tests__/pages/legal-changes.test.tsx`

- [ ] **Step 1: Write page test**

`__tests__/pages/legal-changes.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({ selectedCompanyId: 1 }),
}));

vi.mock("@/lib/queries/use-legal-changes", () => ({
  useLegalChanges: () => ({
    data: {
      changes: [
        {
          id: "lc-1", title: "고용허가제 시행규칙 개정", icon: "📋",
          lawName: "시행규칙", effectiveDate: "2026-04-15", detectedDate: "2026-03-18",
          severity: "warning", status: "reference",
          badge: { text: "참고", color: "orange" }, dDay: 22,
        },
        {
          id: "lc-2", title: "최저임금법 시행령 개정", icon: "⚖️",
          lawName: "시행령", effectiveDate: "2026-07-01", detectedDate: "2026-03-20",
          severity: "critical", status: "action_required",
          badge: { text: "조치 필요", color: "red" }, dDay: 99,
        },
        {
          id: "lc-3", title: "한-캄보디아 사회보장협정", icon: "🌐",
          lawName: "사회보장협정", effectiveDate: "2026-03-01", detectedDate: "2026-02-15",
          severity: "resolved", status: "resolved",
          badge: { text: "확인 완료", color: "green" },
        },
      ],
      lastSyncedAt: "2026-03-24T06:00:00+09:00",
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

import LegalChangesPage from "@/app/(app)/(legal)/legal-changes/page";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("LegalChangesPage", () => {
  it("renders all legal changes", () => {
    render(<LegalChangesPage />, { wrapper: Wrapper });
    expect(screen.getByText("고용허가제 시행규칙 개정")).toBeInTheDocument();
    expect(screen.getByText("최저임금법 시행령 개정")).toBeInTheDocument();
    expect(screen.getByText("한-캄보디아 사회보장협정")).toBeInTheDocument();
  });

  it("filters by action_required", async () => {
    render(<LegalChangesPage />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText("조치필요"));
    expect(screen.getByText("최저임금법 시행령 개정")).toBeInTheDocument();
    expect(screen.queryByText("고용허가제 시행규칙 개정")).not.toBeInTheDocument();
    expect(screen.queryByText("한-캄보디아 사회보장협정")).not.toBeInTheDocument();
  });

  it("filters by resolved", async () => {
    render(<LegalChangesPage />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText("확인완료"));
    expect(screen.getByText("한-캄보디아 사회보장협정")).toBeInTheDocument();
    expect(screen.queryByText("최저임금법 시행령 개정")).not.toBeInTheDocument();
  });
});

```

Also create `__tests__/pages/legal-changes-states.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({ selectedCompanyId: null }),
}));
vi.mock("@/lib/queries/use-legal-changes", () => ({
  useLegalChanges: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
}));

import LegalChangesPage from "@/app/(app)/(legal)/legal-changes/page";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("LegalChangesPage — no company selected", () => {
  it("shows no-company message when selectedCompanyId is null", () => {
    render(<LegalChangesPage />, { wrapper: Wrapper });
    expect(screen.getByText("사업장을 선택해주세요")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/pages/legal-changes.test.tsx __tests__/pages/legal-changes-states.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement Legal Changes page**

`app/(app)/(legal)/legal-changes/page.tsx`:
```tsx
"use client";

import { useState, useMemo } from "react";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { useLegalChanges } from "@/lib/queries/use-legal-changes";
import { FilterBar, type FilterValue } from "@/components/legal/filter-bar";
import { SyncStatus } from "@/components/legal/sync-status";
import { LegalTimeline } from "@/components/legal/legal-timeline";
import { Skeleton } from "@/components/ui/skeleton";
import type { LegalChange } from "@/types/legal";

function applyFilter(changes: readonly LegalChange[], filter: FilterValue): readonly LegalChange[] {
  switch (filter) {
    case "all":
      return changes;
    case "affected":
      return changes.filter((c) => c.status !== "resolved");
    case "action_required":
      return changes.filter((c) => c.status === "action_required");
    case "resolved":
      return changes.filter((c) => c.status === "resolved");
  }
}

export default function LegalChangesPage() {
  const { selectedCompanyId } = useCompanyContext();
  const { data, isLoading, isError, error } = useLegalChanges(selectedCompanyId);
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredChanges = useMemo(
    () => (data ? applyFilter(data.changes, filter) : []),
    [data, filter],
  );

  if (selectedCompanyId == null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">사업장을 선택해주세요</p>
        <p className="mt-2 text-sm text-muted-foreground">
          법령 변경 알림을 확인하려면 상단에서 사업장을 먼저 선택해야 합니다.
        </p>
      </div>
    );
  }

  if (isLoading) return <LegalChangesSkeleton />;

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">법령 변경 조회에 실패했습니다</p>
        <p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar activeFilter={filter} onFilterChange={setFilter} />
        <SyncStatus lastSyncedAt={data.lastSyncedAt} />
      </div>
      {filteredChanges.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">등록된 법령 변경이 없습니다</p>
        </div>
      ) : (
        <LegalTimeline changes={filteredChanges} companyId={selectedCompanyId} />
      )}
    </div>
  );
}

function LegalChangesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="space-y-4 pl-6">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/pages/legal-changes.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/\(legal\)/legal-changes/page.tsx __tests__/pages/legal-changes.test.tsx __tests__/pages/legal-changes-states.test.tsx
git commit -m "feat: add Legal Changes page with client-side filtering"
```

---

### Task 6: Report Components

**Files:**
- Create: `components/report/report-header-card.tsx`
- Create: `components/report/report-section.tsx`
- Create: `components/report/checklist-item.tsx`
- Create: `components/report/legal-change-summary.tsx`
- Create: `components/report/upcoming-grid.tsx`
- Create: `components/report/export-buttons.tsx`
- Create: `components/report/disclaimer.tsx`
- Test: `__tests__/components/report/report-header-card.test.tsx`
- Test: `__tests__/components/report/checklist-item.test.tsx`
- Test: `__tests__/components/report/upcoming-grid.test.tsx`
- Test: `__tests__/components/report/legal-change-summary.test.tsx`
- Test: `__tests__/components/legal/ai-insight-block.test.tsx`

- [ ] **Step 1: Write component tests**

`__tests__/components/report/report-header-card.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReportHeaderCard } from "@/components/report/report-header-card";

describe("ReportHeaderCard", () => {
  it("renders score and title", () => {
    render(
      <ReportHeaderCard
        title="2026년 3월 리포트"
        period="안산제조 주식회사"
        score={73}
        scoreChange={4}
        aiSummary="<p>테스트</p>"
      />,
    );
    expect(screen.getByText("73")).toBeInTheDocument();
    expect(screen.getByText("2026년 3월 리포트")).toBeInTheDocument();
    expect(screen.getByText(/\+4/)).toBeInTheDocument();
  });
});
```

`__tests__/components/report/checklist-item.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChecklistItemRow } from "@/components/report/checklist-item";

describe("ChecklistItemRow", () => {
  it("renders done status with check icon", () => {
    render(
      <ChecklistItemRow
        item={{ id: "c1", title: "고용변동 신고", description: "완료", status: "done", date: "03.05" }}
      />,
    );
    expect(screen.getByText("고용변동 신고")).toBeInTheDocument();
    expect(screen.getByLabelText("완료")).toBeInTheDocument();
  });

  it("renders miss status with warning icon", () => {
    render(
      <ChecklistItemRow
        item={{ id: "p1", title: "비자 연장", description: "미완료", status: "miss", badge: { text: "D-4", color: "red" } }}
      />,
    );
    expect(screen.getByLabelText("미완료")).toBeInTheDocument();
    expect(screen.getByText("D-4")).toBeInTheDocument();
  });

  it("renders pending status", () => {
    render(
      <ChecklistItemRow
        item={{ id: "p3", title: "최저임금 대응", description: "진행중", status: "pending" }}
      />,
    );
    expect(screen.getByLabelText("진행중")).toBeInTheDocument();
  });
});
```

`__tests__/components/report/upcoming-grid.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { UpcomingGrid } from "@/components/report/upcoming-grid";
import type { UpcomingItem } from "@/types/report";

describe("UpcomingGrid", () => {
  const items: UpcomingItem[] = [
    { title: "비자 만료", description: "2026.04.15", urgency: "urgent" },
    { title: "계약 만료", description: "2026.04.30", urgency: "warning" },
    { title: "보험료 납부", description: "2026.04.10", urgency: "normal" },
  ];

  it("renders all upcoming items", () => {
    render(<UpcomingGrid items={items} />);
    expect(screen.getByText("비자 만료")).toBeInTheDocument();
    expect(screen.getByText("계약 만료")).toBeInTheDocument();
    expect(screen.getByText("보험료 납부")).toBeInTheDocument();
  });

  it("applies correct urgency color classes", () => {
    render(<UpcomingGrid items={items} />);
    const urgentCard = screen.getByText("비자 만료").closest("div")!;
    const warningCard = screen.getByText("계약 만료").closest("div")!;
    const normalCard = screen.getByText("보험료 납부").closest("div")!;
    expect(urgentCard).toHaveClass("border-l-signal-red");
    expect(warningCard).toHaveClass("border-l-signal-orange");
    expect(normalCard).toHaveClass("border-l-signal-blue");
  });
});
```

`__tests__/components/report/legal-change-summary.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LegalChangeSummaryGrid } from "@/components/report/legal-change-summary";
import type { LegalChangeSummary } from "@/types/report";

describe("LegalChangeSummaryGrid", () => {
  const items: LegalChangeSummary[] = [
    { title: "최저임금법", description: "개정 내용", color: "red" },
    { title: "고용허가제", description: "시행규칙 변경", color: "orange" },
  ];

  it("renders all summary items", () => {
    render(<LegalChangeSummaryGrid items={items} />);
    expect(screen.getByText("최저임금법")).toBeInTheDocument();
    expect(screen.getByText("고용허가제")).toBeInTheDocument();
  });

  it("applies correct border color classes", () => {
    render(<LegalChangeSummaryGrid items={items} />);
    const redCard = screen.getByText("최저임금법").closest("div")!;
    const orangeCard = screen.getByText("고용허가제").closest("div")!;
    expect(redCard).toHaveClass("border-l-signal-red");
    expect(orangeCard).toHaveClass("border-l-signal-orange");
  });
});
```

`__tests__/components/legal/ai-insight-block.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AiInsightBlock } from "@/components/legal/ai-insight-block";

describe("AiInsightBlock", () => {
  it("renders sanitized HTML content", () => {
    render(<AiInsightBlock html='<p>테스트 <strong class="text-signal-red">강조</strong></p>' />);
    expect(screen.getByText("강조")).toBeInTheDocument();
    expect(screen.getByText("강조").tagName).toBe("STRONG");
  });

  it("strips disallowed tags", () => {
    const { container } = render(<AiInsightBlock html='<p>안전</p><script>alert("xss")</script>' />);
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("안전")).toBeInTheDocument();
  });

  it("renders AI label", () => {
    render(<AiInsightBlock html="<p>내용</p>" />);
    expect(screen.getByText("✦ AI 영향 분석")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/components/report/ __tests__/components/legal/ai-insight-block.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement report components**

`components/report/report-header-card.tsx`:
```tsx
"use client";

import DOMPurify from "isomorphic-dompurify";

interface ReportHeaderCardProps {
  readonly title: string;
  readonly period: string;
  readonly score: number;
  readonly scoreChange: number;
  readonly aiSummary: string;
}

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ["strong", "em", "br", "p"] as string[],
  ALLOWED_ATTR: ["class"] as string[],
};

export function ReportHeaderCard({ title, period, score, scoreChange, aiSummary }: ReportHeaderCardProps) {
  const sanitized = DOMPurify.sanitize(aiSummary, PURIFY_CONFIG);
  const changeSign = scoreChange > 0 ? "+" : "";

  return (
    <div className="rounded-lg border p-6">
      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-5xl font-bold text-signal-orange">{score}</span>
          <span className="text-xs text-muted-foreground">종합 점수</span>
          <span className="text-xs font-medium text-signal-green">
            {changeSign}{scoreChange} 전월 대비
          </span>
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-xs text-muted-foreground">{period}</p>
          <div
            className="space-y-2 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />
        </div>
      </div>
    </div>
  );
}
```

`components/report/report-section.tsx`:
```tsx
interface ReportSectionProps {
  readonly icon: string;
  readonly title: string;
  readonly count: number;
  readonly children: React.ReactNode;
}

export function ReportSection({ icon, title, count, children }: ReportSectionProps) {
  return (
    <section className="rounded-lg border">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">
          {icon} {title} ({count}건)
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
```

`components/report/checklist-item.tsx`:
```tsx
import type { ChecklistItem } from "@/types/report";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  done: { icon: "✓", color: "text-signal-green bg-signal-green-bg", label: "완료" },
  miss: { icon: "!", color: "text-signal-red bg-signal-red-bg", label: "미완료" },
  pending: { icon: "⏳", color: "text-signal-yellow bg-signal-yellow-bg", label: "진행중" },
} as const;

const BADGE_COLORS: Record<string, string> = {
  red: "bg-signal-red-bg text-signal-red",
  orange: "bg-signal-orange-bg text-signal-orange",
  yellow: "bg-signal-yellow-bg text-signal-yellow",
  green: "bg-signal-green-bg text-signal-green",
  blue: "bg-signal-blue-bg text-signal-blue",
  gray: "bg-signal-gray-bg text-signal-gray",
};

interface ChecklistItemRowProps {
  readonly item: ChecklistItem;
}

export function ChecklistItemRow({ item }: ChecklistItemRowProps) {
  const config = STATUS_CONFIG[item.status];

  return (
    <div className="flex items-center gap-3 py-2">
      <span
        aria-label={config.label}
        className={cn("flex h-5 w-5 items-center justify-center rounded-full text-xs", config.color)}
      >
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
      {item.date && <span className="text-xs text-muted-foreground">{item.date}</span>}
      {item.badge && (
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", BADGE_COLORS[item.badge.color])}>
          {item.badge.text}
        </span>
      )}
    </div>
  );
}
```

`components/report/legal-change-summary.tsx`:
```tsx
import type { LegalChangeSummary } from "@/types/report";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, { border: string; bg: string }> = {
  red: { border: "border-l-signal-red", bg: "bg-signal-red-bg" },
  orange: { border: "border-l-signal-orange", bg: "bg-signal-orange-bg" },
  yellow: { border: "border-l-signal-yellow", bg: "bg-signal-yellow-bg" },
  green: { border: "border-l-signal-green", bg: "bg-signal-green-bg" },
  blue: { border: "border-l-signal-blue", bg: "bg-signal-blue-bg" },
  gray: { border: "border-l-signal-gray", bg: "bg-signal-gray-bg" },
};

interface LegalChangeSummaryGridProps {
  readonly items: readonly LegalChangeSummary[];
}

export function LegalChangeSummaryGrid({ items }: LegalChangeSummaryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const colors = COLOR_MAP[item.color] ?? COLOR_MAP.gray;
        return (
          <div
            key={item.title}
            className={cn("rounded-md border-l-[3px] p-3", colors.border, colors.bg)}
          >
            <p className="text-[13px] font-semibold">{item.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}
```

`components/report/upcoming-grid.tsx`:
```tsx
import type { UpcomingItem } from "@/types/report";
import { cn } from "@/lib/utils";

const URGENCY_COLORS: Record<string, string> = {
  urgent: "border-l-signal-red",
  warning: "border-l-signal-orange",
  normal: "border-l-signal-blue",
};

interface UpcomingGridProps {
  readonly items: readonly UpcomingItem[];
}

export function UpcomingGrid({ items }: UpcomingGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.title}
          className={cn(
            "rounded-md border-l-[3px] bg-secondary p-3",
            URGENCY_COLORS[item.urgency] ?? "border-l-signal-blue",
          )}
        >
          <p className="text-[13px] font-semibold">{item.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
```

`components/report/export-buttons.tsx`:
```tsx
"use client";

import { Download, Mail } from "lucide-react";
import { toast } from "sonner";

export function ExportButtons() {
  return (
    <div className="flex justify-center gap-3">
      <button
        type="button"
        onClick={() => toast("준비 중입니다")}
        className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
      >
        <Download className="h-4 w-4" />
        PDF로 다운로드
      </button>
      <button
        type="button"
        onClick={() => toast("준비 중입니다")}
        className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
      >
        <Mail className="h-4 w-4" />
        이메일로 전송
      </button>
    </div>
  );
}
```

`components/report/disclaimer.tsx`:
```tsx
export function Disclaimer() {
  return (
    <p className="text-center text-xs text-muted-foreground">
      ⚖ 본 서비스는 법률 자문이 아닌 관리 보조 도구입니다.
    </p>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/components/report/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/report/ __tests__/components/report/ __tests__/components/legal/ai-insight-block.test.tsx
git commit -m "feat: add compliance report components"
```

---

### Task 7: Compliance Report Page

**Files:**
- Create: `app/(app)/(legal)/reports/page.tsx`
- Test: `__tests__/pages/reports.test.tsx`

- [ ] **Step 1: Write page test**

`__tests__/pages/reports.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({ selectedCompanyId: 1 }),
}));

vi.mock("@/lib/queries/use-compliance-report", () => ({
  useComplianceReport: () => ({
    data: {
      id: "rpt-1",
      title: "2026년 3월 리포트",
      period: "안산제조 주식회사",
      score: 73,
      scoreChange: 4,
      aiSummary: "<p>테스트</p>",
      completed: [
        { id: "c1", title: "고용변동 신고", description: "완료", status: "done", date: "03.05" },
      ],
      pending: [
        { id: "p1", title: "비자 연장", description: "미완료", status: "miss", badge: { text: "D-4", color: "red" } },
      ],
      legalChanges: [
        { title: "최저임금법", description: "개정", color: "red" },
      ],
      upcoming: [
        { title: "비자 만료", description: "2026.04.15", urgency: "urgent" },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

import ReportsPage from "@/app/(app)/(legal)/reports/page";

describe("ReportsPage", () => {
  it("renders report header with score", () => {
    render(<ReportsPage />);
    expect(screen.getByText("73")).toBeInTheDocument();
    expect(screen.getByText("2026년 3월 리포트")).toBeInTheDocument();
  });

  it("renders completed section", () => {
    render(<ReportsPage />);
    expect(screen.getByText("고용변동 신고")).toBeInTheDocument();
  });

  it("renders pending section", () => {
    render(<ReportsPage />);
    expect(screen.getByText("비자 연장")).toBeInTheDocument();
  });

  it("renders legal changes section", () => {
    render(<ReportsPage />);
    expect(screen.getByText("최저임금법")).toBeInTheDocument();
  });

  it("renders upcoming section", () => {
    render(<ReportsPage />);
    expect(screen.getByText("비자 만료")).toBeInTheDocument();
  });

  it("renders disclaimer", () => {
    render(<ReportsPage />);
    expect(screen.getByText(/법률 자문이 아닌 관리 보조 도구/)).toBeInTheDocument();
  });
});

```

Also create `__tests__/pages/reports-states.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({ selectedCompanyId: null }),
}));
vi.mock("@/lib/queries/use-compliance-report", () => ({
  useComplianceReport: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
}));

import ReportsPage from "@/app/(app)/(legal)/reports/page";

describe("ReportsPage — no company selected", () => {
  it("shows no-company message when selectedCompanyId is null", () => {
    render(<ReportsPage />);
    expect(screen.getByText("사업장을 선택해주세요")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/pages/reports.test.tsx __tests__/pages/reports-states.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement Compliance Report page**

`app/(app)/(legal)/reports/page.tsx`:
```tsx
"use client";

import { useCompanyContext } from "@/lib/contexts/company-context";
import { useComplianceReport } from "@/lib/queries/use-compliance-report";
import { ReportHeaderCard } from "@/components/report/report-header-card";
import { ReportSection } from "@/components/report/report-section";
import { ChecklistItemRow } from "@/components/report/checklist-item";
import { LegalChangeSummaryGrid } from "@/components/report/legal-change-summary";
import { UpcomingGrid } from "@/components/report/upcoming-grid";
import { ExportButtons } from "@/components/report/export-buttons";
import { Disclaimer } from "@/components/report/disclaimer";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const { selectedCompanyId } = useCompanyContext();
  const { data, isLoading, isError, error } = useComplianceReport(selectedCompanyId);

  if (selectedCompanyId == null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">사업장을 선택해주세요</p>
        <p className="mt-2 text-sm text-muted-foreground">
          컴플라이언스 리포트를 확인하려면 상단에서 사업장을 먼저 선택해야 합니다.
        </p>
      </div>
    );
  }

  if (isLoading) return <ReportSkeleton />;

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">리포트 조회에 실패했습니다</p>
        <p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <ReportHeaderCard
        title={data.title}
        period={data.period}
        score={data.score}
        scoreChange={data.scoreChange}
        aiSummary={data.aiSummary}
      />

      <ReportSection icon="✅" title="완료된 의무사항" count={data.completed.length}>
        <div className="divide-y">
          {data.completed.map((item) => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
        </div>
      </ReportSection>

      <ReportSection icon="⚠️" title="미완료/진행 중" count={data.pending.length}>
        <div className="divide-y">
          {data.pending.map((item) => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
        </div>
      </ReportSection>

      <ReportSection icon="📋" title="이달의 법령 변경" count={data.legalChanges.length}>
        <LegalChangeSummaryGrid items={data.legalChanges} />
      </ReportSection>

      <ReportSection icon="📅" title="다음 달 예정" count={data.upcoming.length}>
        <UpcomingGrid items={data.upcoming} />
      </ReportSection>

      <ExportButtons />
      <Disclaimer />
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/pages/reports.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/\(legal\)/reports/page.tsx __tests__/pages/reports.test.tsx __tests__/pages/reports-states.test.tsx
git commit -m "feat: add Compliance Report page"
```

---

### Task 8: Sidebar + Build Verification

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Test: `__tests__/components/sidebar-legal.test.tsx`

- [ ] **Step 1: Write sidebar test**

`__tests__/components/sidebar-legal.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/legal-changes",
}));

import { Sidebar } from "@/components/layout/sidebar";

describe("Sidebar legal items", () => {
  it("renders 법령 변경 알림 nav item", () => {
    render(<Sidebar />);
    expect(screen.getByText("법령 변경 알림")).toBeInTheDocument();
  });

  it("renders 컴플라이언스 리포트 nav item", () => {
    render(<Sidebar />);
    expect(screen.getByText("컴플라이언스 리포트")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/sidebar-legal.test.tsx`
Expected: FAIL

- [ ] **Step 3: Add nav items to sidebar**

In `components/layout/sidebar.tsx`, add imports:
```typescript
import { FileText, ClipboardList } from "lucide-react";
```

Add to `NAV_ITEMS` array (after the last item):
```typescript
{ href: "/legal-changes", label: "법령 변경 알림", icon: FileText },
{ href: "/reports", label: "컴플라이언스 리포트", icon: ClipboardList },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/components/sidebar-legal.test.tsx`
Expected: PASS

- [ ] **Step 5: Run full test suite and build**

Run: `npm run test && npm run build`
Expected: All tests PASS, build succeeds

- [ ] **Step 6: Commit**

```bash
git add components/layout/sidebar.tsx __tests__/components/sidebar-legal.test.tsx
git commit -m "feat: add legal/report nav items to sidebar"
```
