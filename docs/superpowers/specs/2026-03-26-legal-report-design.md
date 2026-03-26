# Legal Changes & Compliance Report Screen Design Spec

## Overview

Two separate pages sharing a tab-based Layout: "법령 변경 알림" (legal change notifications with timeline UI) and "컴플라이언스 리포트" (monthly compliance report). Route Group `(app)/(legal)` provides shared tab navigation. Data from `GET /api/legal-changes`, `GET /api/legal-changes/{id}/impacts`, and `GET /api/reports`. Mock phase returns hardcoded data matching the HTML mockup.

## Architecture

Route Group Layout pattern: `(app)/(legal)/layout.tsx` renders tab navigation, child pages render content. Two independent API domains — legal changes (list + detail) and compliance report. Client-side filtering for legal change status (전체/영향있음/조치필요/확인완료). Legal card detail fetched on expand via `useQuery` with `enabled: isOpen`.

**Chart strategy**: No charts needed. Pure HTML/CSS components — timeline, checklists, grids.

## Route & Data Flow

```
types/legal.ts                              → Legal change types (NEW)
types/report.ts                             → Compliance report types (NEW)
mocks/legal-data.ts                         → Legal mock data (NEW)
mocks/report-data.ts                        → Report mock data (NEW)
app/api/legal-changes/route.ts              → BFF GET handler — list (NEW)
app/api/legal-changes/[id]/impacts/route.ts → BFF GET handler — detail (NEW)
app/api/reports/route.ts                    → BFF GET handler (NEW)
lib/queries/use-legal-changes.ts            → useQuery hook for list (NEW)
lib/queries/use-legal-impact.ts             → useQuery hook for detail, enabled: isOpen (NEW)
lib/queries/use-compliance-report.ts        → useQuery hook for report (NEW)
app/(app)/(legal)/layout.tsx                → Tab navigation layout (NEW)
app/(app)/(legal)/legal-changes/page.tsx    → Legal changes page (NEW)
app/(app)/(legal)/reports/page.tsx          → Compliance report page (NEW)
```

## Component Tree

### Legal Changes (`legal-changes/page.tsx`)

```
page.tsx
├── FilterBar                    — 필터 칩 (전체/영향있음/조치필요/확인완료)
├── SyncStatus                   — "법제처 API 마지막 동기화: 2026.03.24 06:00"
└── LegalTimeline                — 타임라인 컨테이너 (왼쪽 세로선 + dots)
    └── LegalCard (×N)           — 접이식 카드
        ├── LegalCardHeader      — 아이콘 + 제목 + 메타 + 배지
        └── LegalCardBody        — 펼침 시 (상세 API 호출)
            ├── ImpactBox        — "귀사 영향 분석" 박스 + 항목 리스트
            ├── AiInsightBlock   — ✦ AI 영향 분석 (DOMPurify sanitized, non-collapsible — distinct from Benchmark's CollapsibleInsight)
            └── ActionRow        — 액션 버튼들 (mock: toast)
```

### Compliance Report (`reports/page.tsx`)

```
page.tsx
├── ReportHeaderCard             — 점수(73) + 제목 + 기간 + AI 종합 요약
├── ReportSection (×4)           — 공통 셸: 아이콘 + 제목(N건) + 바디
│   ├── CompletedSection         — 완료된 의무사항 — ChecklistItem (✓)
│   ├── PendingSection           — 미완료/진행 중 — ChecklistItem (!/⏳) + 배지
│   ├── LegalChangesSection      — 이달의 법령 변경 — 2-col 그리드 카드
│   └── UpcomingSection          — 다음 달 예정 — 3-col 그리드 카드
├── ExportButtons                — PDF 다운로드 + 이메일 전송 (toast)
└── Disclaimer                   — 면책 고지
```

## File Structure

```
types/legal.ts                                    — Legal change types (NEW)
types/report.ts                                   — Compliance report types (NEW)
mocks/legal-data.ts                               — Legal mock data (NEW)
mocks/report-data.ts                              — Report mock data (NEW)
app/api/legal-changes/route.ts                    — BFF list handler (NEW)
app/api/legal-changes/[id]/impacts/route.ts       — BFF detail handler (NEW)
app/api/reports/route.ts                          — BFF report handler (NEW)
lib/queries/use-legal-changes.ts                  — List query hook (NEW)
lib/queries/use-legal-impact.ts                   — Detail query hook (NEW)
lib/queries/use-compliance-report.ts              — Report query hook (NEW)
app/(app)/(legal)/layout.tsx                      — Tab navigation layout (NEW)
app/(app)/(legal)/legal-changes/page.tsx          — Legal changes page (NEW)
app/(app)/(legal)/reports/page.tsx                — Report page (NEW)
components/legal/filter-bar.tsx                   — Filter chips (NEW)
components/legal/sync-status.tsx                  — Sync timestamp display (NEW)
components/legal/legal-timeline.tsx               — Timeline container (NEW)
components/legal/legal-card.tsx                   — Collapsible legal card (NEW)
components/legal/impact-box.tsx                   — Impact analysis box (NEW)
components/legal/ai-insight-block.tsx              — AI 영향 분석 block, non-collapsible (NEW)
components/legal/action-row.tsx                   — Action buttons (NEW)
components/report/report-header-card.tsx          — Score + AI summary (NEW)
components/report/report-section.tsx              — Common section shell (NEW)
components/report/checklist-item.tsx              — Checklist item (NEW)
components/report/legal-change-summary.tsx        — Legal change summary card (NEW)
components/report/upcoming-grid.tsx               — Upcoming obligations grid (NEW)
components/report/export-buttons.tsx              — PDF/email buttons, Lucide Download + Mail icons (NEW)
components/report/disclaimer.tsx                  — 면책 고지 (NEW)
components/layout/sidebar.tsx                     — Add 2 nav items (MODIFY)
mocks/handlers.ts                                 — Add MSW handlers (MODIFY)
```

## Type Definitions

### types/legal.ts

```typescript
import type { SignalColor } from "./shared";

// ─── Legal Changes List ─────────────────────────────
export type LegalStatus = "action_required" | "reference" | "resolved";
export type LegalSeverity = "critical" | "warning" | "info" | "resolved";

export interface LegalChange {
  readonly id: string;
  readonly title: string;
  readonly icon: string;              // emoji "📋", "⚖️", "🌐"
  readonly lawName: string;           // "외국인근로자의 고용 등에 관한 법률 시행규칙"
  readonly effectiveDate: string;     // "2026-04-15"
  readonly detectedDate: string;      // "2026-03-18"
  readonly severity: LegalSeverity;
  readonly status: LegalStatus;
  readonly badge: { readonly text: string; readonly color: SignalColor };
  readonly dDay?: number;
}

export interface LegalChangesResponse {
  readonly changes: readonly LegalChange[];
  readonly lastSyncedAt: string;      // ISO datetime
}

// ─── Legal Impact (Detail) ──────────────────────────
export interface LegalImpact {
  readonly changeId: string;
  readonly impacts: readonly string[];
  readonly aiAnalysis: string;        // HTML (sanitize with DOMPurify)
  readonly actions: readonly LegalAction[];
}

export interface LegalAction {
  readonly label: string;
  readonly primary?: boolean;
  readonly href?: string;
}
```

### types/report.ts

```typescript
import type { SignalColor } from "./shared";

// ─── Checklist ──────────────────────────────────────
export type CheckStatus = "done" | "miss" | "pending";

export interface ChecklistItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: CheckStatus;
  readonly date?: string;             // "03.05"
  readonly badge?: { readonly text: string; readonly color: SignalColor };
}

// ─── Legal Change Summary (in report) ───────────────
export interface LegalChangeSummary {
  readonly title: string;
  readonly description: string;
  readonly color: SignalColor;
}

// ─── Upcoming Obligations ───────────────────────────
export type UrgencyLevel = "urgent" | "warning" | "normal";

export interface UpcomingItem {
  readonly title: string;
  readonly description: string;
  readonly urgency: UrgencyLevel;
}

// ─── Report Response ────────────────────────────────
export interface ComplianceReportResponse {
  readonly id: string;
  readonly title: string;             // "2026년 3월 컴플라이언스 월간 리포트"
  readonly period: string;            // "안산제조 주식회사 · 2026.03.01 ~ 2026.03.24 · 자동 생성"
  readonly score: number;
  readonly scoreChange: number;
  readonly aiSummary: string;         // HTML (sanitize)
  readonly completed: readonly ChecklistItem[];
  readonly pending: readonly ChecklistItem[];
  readonly legalChanges: readonly LegalChangeSummary[];
  readonly upcoming: readonly UpcomingItem[];
}
```

## Mock Data

Values extracted from HTML mockup:

### Legal Changes (3건)

1. **고용허가제 시행규칙 개정** — icon: "📋", severity: warning, status: reference, effectiveDate: "2026-04-15", detectedDate: "2026-03-18", badge: "참고" (orange), dDay: 22
2. **최저임금법 시행령 개정** — icon: "⚖️", severity: critical, status: action_required, effectiveDate: "2026-07-01", detectedDate: "2026-03-20", badge: "조치 필요" (red), dDay: 99
3. **한-캄보디아 사회보장협정** — icon: "🌐", severity: resolved, status: resolved, effectiveDate: "2026-03-01", detectedDate: "2026-02-15", badge: "확인 완료" (green), no dDay

### Legal Impacts (2건, resolved has no detail)

**시행규칙 개정:**
- impacts: 3 items (사업장 변경 사유 확대, E-9/H-2 11명 해당, 직접 조치 없음 점검 권장)
- aiAnalysis: HTML paragraph (직접적 리스크 낮음, 주기적 점검 권장)
- actions: "근로조건 점검 시작", "확인 완료 처리"

**최저임금법:**
- impacts: 3 items (시간급 변경, E-9 3명 미달, 계약서 갱신 필요)
- aiAnalysis: HTML paragraph (3명 영향, 7월 1일 전 갱신 필요, 미이행 시 벌칙)
- actions: "계약서 갱신 시작" (primary), "영향 근로자 목록 보기", "확인 완료 처리"

### Compliance Report

- **Score**: 73, change +4
- **Completed** (5건): Tran E 고용변동 신고, Rahman C 건강보험, 분기 산재보험, 사회보장협정 확인, Li Wei D 근로계약 갱신
- **Pending** (3건): Nguyen Van A 비자 연장(D-4, miss), Pham Thi B 건강보험(지연, miss), 최저임금 대응 3건(D-99, pending)
- **Legal changes** (2건): 최저임금법(red), 고용허가제(orange)
- **Upcoming** (3건): Li Wei D 비자(urgent), Rahman C 계약(warning), 분기 보험료(normal)

**lastSyncedAt**: "2026-03-24T06:00:00+09:00"

## Component Specs

### Tab Layout (`(legal)/layout.tsx`)

- Uses shadcn/ui-style tab navigation (inline flex, `bg-secondary` track, active tab `bg-card` with shadow)
- Two tabs: "법령 변경 알림" → `/legal-changes`, "컴플라이언스 리포트" → `/reports`
- Active state derived from `usePathname()`
- `{children}` rendered below tabs

### FilterBar

- `role="group"` with `aria-label="법령 필터"`
- Chips: 전체 (all), 영향있음 (all except `resolved` — i.e., `action_required` + `reference`), 조치필요 (`action_required` only), 확인완료 (`resolved` only)
- Active chip: `aria-pressed="true"`, primary color bg
- Filter state via `useState`, applied client-side with `.filter()`

### SyncStatus

- Right-aligned text: "법제처 API 마지막 동기화: {formatted date}"
- `text-xs text-muted-foreground`

### LegalTimeline

- Container with left border line (vertical timeline)
- `role="list"`, each `LegalCard` wrapped in `role="listitem"`
- Timeline dot colors based on `severity`: critical → signal-red, warning → signal-orange, info → signal-blue, resolved → signal-green

### LegalCard

- **Header** (always visible): clickable, toggles body
  - Icon (emoji, 20px), title (14px semibold), meta row (시행일/감지일/법령명 in muted text), badges (status + D-day)
  - `aria-expanded={isOpen}` on header button
- **Body** (shown when open): fetches impact data via `useLegalImpact(change.id, companyId)` with `enabled: isOpen`
  - Loading state: skeleton inside card body
  - Renders ImpactBox + AI block + ActionRow
- Resolved items show header only, no expandable body
- **Card-level error state**: If `useLegalImpact` fails, show inline error message inside card body: "영향 분석을 불러오지 못했습니다" + "다시 시도" button (calls `refetch()`)

### ImpactBox

- `bg-secondary` container
- Title: icon (SVG, signal color stroke) + "귀사 영향 분석"
- Bulleted list with `→` prefix, items from `impacts` array

### ActionRow

- Flex row of buttons
- `primary` action: filled primary button
- Others: outlined/ghost buttons
- Mock phase: all buttons call `toast("준비 중입니다")`

### ReportHeaderCard

- Card with flex layout: score (left) + summary (right)
- Score: large number (48px bold, signal-orange), "종합 점수" label, "+4 전월 대비" (signal-green)
- Summary: title (18px bold), period (muted), AI summary block (DOMPurify sanitized)

### ReportSection

- Common shell: header with icon (SVG, signal color) + title with count + body
- Card with border, header has bottom border separator

### ChecklistItem

- Flex row: status icon (20px circle) + info (title + description) + date/badge
- Status icon colors: done → signal-green "✓", miss → signal-red "!", pending → signal-yellow "⏳"
- `aria-label` on status icon describing state

### LegalChangeSummary

- 2-column grid of cards
- Each: `border-left-[3px]` with signal color, signal-color-bg background
- Title (13px semibold) + description (12px muted)

### UpcomingGrid

- 3-column grid
- Each item: `bg-secondary`, `border-left-[3px]` with urgency color (urgent → signal-red, warning → signal-orange, normal → signal-blue)
- Title (13px semibold) + description (12px muted)

### ExportButtons

- Center-aligned flex row
- "📥 PDF로 다운로드" + "📧 이메일로 전송"
- Both call `toast("준비 중입니다")` in mock phase

## API

### GET /api/legal-changes (BFF)

```typescript
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) return NextResponse.json({ message: "companyId required" }, { status: 400 });
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

### GET /api/legal-changes/[id]/impacts (BFF)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) return NextResponse.json({ message: "companyId required" }, { status: 400 });
  const companyId = Number(raw);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 companyId" }, { status: 400 });
  }
  try {
    const impact = mockImpacts[id];
    if (!impact) return NextResponse.json({ message: "not found" }, { status: 404 });
    // TODO: Replace with apiClient.get<LegalImpact>(`/api/legal-changes/${id}/impacts?companyId=${companyId}`)
    return NextResponse.json(impact);
  } catch (error) {
    return handleRouteError(error, `GET /api/legal-changes/${id}/impacts`);
  }
}
```

### GET /api/reports (BFF)

```typescript
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) return NextResponse.json({ message: "companyId required" }, { status: 400 });
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

### Query Hooks

```typescript
// lib/queries/use-legal-changes.ts
"use client";
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

// lib/queries/use-legal-impact.ts
"use client";
export function useLegalImpact(changeId: string, companyId: number | null | undefined, enabled: boolean) {
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

// lib/queries/use-compliance-report.ts
"use client";
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

**Note**: `companyId` comes from the `useCompanyStore` (or `CompanyProvider` context) — same pattern as Dashboard/Benchmark pages. Each page calls `const { selectedCompanyId } = useCompanyStore()` and passes it to the query hook.

## MSW Handlers

```typescript
// mocks/handlers.ts — add
const getLegalChanges: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockLegalChangesResponse);

const getLegalImpact: Parameters<typeof http.get>[1] = ({ params }) => {
  const impact = mockImpacts[params.id as string];
  if (!impact) return new HttpResponse(null, { status: 404 });
  return HttpResponse.json(impact);
};

const getReport: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockComplianceReport);

// Add to handlers array:
http.get(`${BACKEND}/api/legal-changes`, getLegalChanges),
http.get("*/api/legal-changes", getLegalChanges),
http.get(`${BACKEND}/api/legal-changes/:id/impacts`, getLegalImpact),
http.get("*/api/legal-changes/:id/impacts", getLegalImpact),
http.get(`${BACKEND}/api/reports`, getReport),
http.get("*/api/reports", getReport),
```

## Sidebar

Add two nav items at the end of the nav list (after "컴플라이언스" — these are "지속 관리" features per mockup):

```typescript
{ href: "/legal-changes", label: "법령 변경 알림", icon: FileText },
{ href: "/reports", label: "컴플라이언스 리포트", icon: ClipboardList },
```

## Accessibility

- `LegalTimeline`: `role="list"`, each `LegalCard` in `role="listitem"`
- `LegalCard` header: `aria-expanded={isOpen}`, `aria-controls={bodyId}`
- `FilterBar`: `role="group"`, `aria-label="법령 필터"`, active chip `aria-pressed="true"`
- `ChecklistItem` status icon: `aria-label` ("완료"/"미완료"/"진행중")
- `ReportSection`: semantic `<section>` with heading
- AI blocks: DOMPurify (ALLOWED_TAGS: `["strong", "em", "br", "p"]`, ALLOWED_ATTR: `["class"]`)

## Page States

| State | Legal Changes | Compliance Report |
|---|---|---|
| No company selected | "사업장을 선택해주세요" | "사업장을 선택해주세요" |
| Loading | 카드 스켈레톤 3개 | 헤더 + 섹션 스켈레톤 |
| Error | 에러 메시지 + 재시도 | 에러 메시지 + 재시도 |
| Success | 필터 + 타임라인 | 전체 리포트 |
| Empty | "등록된 법령 변경이 없습니다" | "생성된 리포트가 없습니다" |

## Styling Notes

- All colors via signal CSS variables (`text-signal-orange`, `bg-signal-green-bg`)
- Never use `bg-[var(...)]` — use direct Tailwind utilities
- oklch format only
- Dark mode: signal text colors shared, signal bg colors overridden
- Sanitize all AI HTML with `isomorphic-dompurify` (ALLOWED_ATTR: `["class"]`, not `"style"`)

## Testing Strategy

Each component gets a test file. Key test scenarios:
- Type validation (mock data shape correctness)
- BFF routes: valid request, missing companyId → 400, impacts 404 for unknown id
- Legal card: renders title, badges, toggles body on click
- FilterBar: filters list by status
- ImpactBox: renders impact items
- ReportHeaderCard: renders score, change, AI summary
- ChecklistItem: renders correct icon per status
- UpcomingGrid: renders all items with correct urgency colors
- Page states: no-company, loading, error, success, empty
- Sidebar: 2 new nav items present

## Disclaimer

Footer text: "⚖ 본 서비스는 법률 자문이 아닌 관리 보조 도구입니다."
