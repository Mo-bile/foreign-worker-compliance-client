# Benchmark (사업장 건강검진) Screen Design Spec

## Overview

Company-scoped health check report showing compliance score, AI analysis, and 4 detail analysis cards. Route: `(app)/benchmark`. Data from `GET /api/benchmarks?companyId={id}`. Mock phase returns hardcoded data matching the HTML mockup.

## Architecture

Single page consuming one API endpoint via `useQuery`. BFF route handler returns mock data initially, later proxies to Spring Boot backend. All analysis cards are Benchmark-specific (no sharing with Simulator's AnalysisCard — YAGNI).

**Chart strategy**: Custom SVG for score ring, category bars, percentile bar, risk gauge. Recharts `PieChart` for donut chart only. HTML table for trend data.

## Route & Data Flow

```
types/shared.ts             → Shared types (SignalColor, DataSource, DataRow) extracted from simulator
types/benchmark.ts          → Benchmark-specific types + re-export shared types
mocks/benchmark-data.ts     → Mock data (values from HTML mockup)
app/api/benchmarks/route.ts → BFF GET handler (mock phase)
lib/queries/use-benchmark.ts → useQuery hook ("use client")
app/(app)/benchmark/page.tsx → Page assembly
```

**Shared type extraction**: `SignalColor`, `DataSource`, and `DataRow` are used by both Simulator and Benchmark. Extract them to `types/shared.ts` and update Simulator imports to re-export from there.

## Component Tree

```
page.tsx
├── BenchmarkHeader         — Title + report period badge + PDF/재분석 buttons
├── ScoreOverview           — grid-cols-[300px_1fr]
│   ├── ScoreRingCard       — SVG circle gauge (73/100) + grade (B+) + 3 category bars
│   ├── AiSummaryBlock      — ✦ AI 종합 진단 (sanitized HTML)
│   └── QuickActionCards    — 2 cards: 즉시 조치 (red-bg) + 개선 권고 (orange-bg)
└── DetailGrid              — grid-cols-2 gap-4
    ├── WageCard            — PercentileBar + data rows + AI insight (collapsible)
    ├── AttritionCard       — RiskGauge + data rows + AI insight (collapsible)
    ├── DependencyCard      — DependencyDonut (Recharts) + data rows + AI insight (collapsible)
    └── TrendCard           — TrendTable (HTML) + AI insight (collapsible)
```

## File Structure

```
types/shared.ts                             — Shared types: SignalColor, DataSource, DataRow (NEW — extracted from simulator)
types/benchmark.ts                          — Benchmark types (NEW)
mocks/benchmark-data.ts                     — Mock data (NEW)
app/api/benchmarks/route.ts                 — BFF route handler (NEW)
lib/queries/use-benchmark.ts                — Query hook (NEW)
app/(app)/benchmark/page.tsx                — Page (NEW)
components/benchmark/benchmark-header.tsx    — Header with buttons (NEW)
components/benchmark/score-ring-card.tsx     — Score ring + grade + bars (NEW)
components/benchmark/score-ring.tsx          — SVG circular gauge (NEW)
components/benchmark/category-bar.tsx        — Horizontal score bar (NEW)
components/benchmark/ai-summary-block.tsx    — AI summary (NEW)
components/benchmark/quick-action-cards.tsx  — 2 quick action cards (NEW)
components/benchmark/wage-card.tsx           — Wage analysis card (NEW)
components/benchmark/percentile-bar.tsx      — SVG percentile visualization (NEW)
components/benchmark/attrition-card.tsx      — Attrition risk card (NEW)
components/benchmark/risk-gauge.tsx          — 4-level risk gauge (NEW)
components/benchmark/dependency-card.tsx     — Dependency analysis card (NEW)
components/benchmark/dependency-donut.tsx    — Recharts PieChart wrapper (NEW)
components/benchmark/trend-card.tsx          — Score trend card (NEW)
components/benchmark/trend-table.tsx         — 3-month trend HTML table (NEW)
components/benchmark/collapsible-insight.tsx — Collapsible AI insight block (NEW)
components/benchmark/data-source-chips.tsx   — Data source badges (NEW)
components/benchmark/detail-card-shell.tsx   — Common card shell: icon, title, badge, collapsible (NEW)
components/layout/sidebar.tsx               — Add benchmark nav item (MODIFY)
```

## Type Definitions

### types/shared.ts (NEW — extracted from simulator)

```typescript
// Shared types used by both Simulator and Benchmark
export type SignalColor = "red" | "orange" | "yellow" | "blue" | "green" | "gray";

export interface DataSource {
  readonly name: string;
  readonly dataId: string;
}

export interface DataRow {
  readonly key: string;
  readonly value: string;
}
```

Note: After creating `types/shared.ts`, update `types/simulator.ts` to re-export from shared:
```typescript
export type { SignalColor, DataSource, DataRow } from "./shared";
```

### types/benchmark.ts

```typescript
import type { SignalColor, DataSource, DataRow } from "./shared";

// ─── Score ──────────────────────────────────────────────────
export interface ScoreCategory {
  readonly label: string;       // "보험 가입"
  readonly score: number;       // 0-100
  readonly color: SignalColor;
}

export interface BenchmarkScore {
  readonly total: number;       // 0-100
  readonly grade: string;       // "B+"
  readonly change: number;      // +4
  readonly categories: readonly ScoreCategory[];
}

// ─── Quick Actions ──────────────────────────────────────────
export interface QuickActionItem {
  readonly text: string;
  readonly href?: string;
}

export interface QuickActionCard {
  readonly count: number;
  readonly items: readonly QuickActionItem[];
}

export interface QuickActions {
  readonly urgent: QuickActionCard;
  readonly improvement: QuickActionCard;
}

// ─── Benchmark Data Row (extends shared DataRow with color) ─
export interface BenchmarkDataRow extends DataRow {
  readonly color?: SignalColor;  // optional signal color for value text
}

// ─── Analysis Base ──────────────────────────────────────────
interface AnalysisBase {
  readonly title: string;
  readonly icon: string;        // emoji character, e.g. "💰", "🚪", "📊", "📈"
  readonly badge: { readonly text: string; readonly color: SignalColor };
  readonly dataRows: readonly BenchmarkDataRow[];
  readonly dataSources: readonly DataSource[];
  readonly aiInsight: string;   // HTML (sanitize with DOMPurify)
}

// ─── Wage Analysis ──────────────────────────────────────────
export interface WageAnalysis extends AnalysisBase {
  readonly percentile: number;        // 0-100 (company position)
  readonly medianPercentile: number;   // 50
  readonly percentileLabel: string;    // "경기도 안산시 식료품제조업 외국인 근로자 임금 분포"
}

// ─── Attrition Analysis ─────────────────────────────────────
export type RiskLevel = "low" | "caution" | "moderate" | "high";

export interface AttritionAnalysis extends AnalysisBase {
  readonly riskLevel: RiskLevel;
}

// ─── Dependency Analysis ────────────────────────────────────
export interface DependencyAnalysis extends AnalysisBase {
  readonly companyRatio: number;     // 26.7
  readonly industryRatio: number;    // 22.1
  readonly companyCount: number;     // 12
  readonly totalCount: number;       // 45
}

// ─── Trend Analysis ─────────────────────────────────────────
export interface TrendMonth {
  readonly month: string;       // "2026.01"
  readonly total: number;
  readonly insurance: number;
  readonly deadline: number;
  readonly wage: number;
}

export interface TrendAnalysis extends AnalysisBase {
  readonly months: readonly TrendMonth[];
}

// ─── Response ───────────────────────────────────────────────
export interface BenchmarkResponse {
  readonly id: string;
  readonly reportPeriod: string;       // "2026년 1분기"
  readonly analyzedAt: string;         // ISO datetime — format to "YYYY.MM.DD 기준" for display
  readonly dataSourceCount: number;

  readonly score: BenchmarkScore;
  readonly aiSummary: string;          // HTML (sanitize)
  readonly quickActions: QuickActions;

  readonly wage: WageAnalysis;
  readonly attrition: AttritionAnalysis;
  readonly dependency: DependencyAnalysis;
  readonly trend: TrendAnalysis;
}
```

**Trend change values**: The "변동" column is computed by the `TrendTable` component: `months[last].field - months[last-1].field`. No dedicated field needed.

**Dependency difference**: The "+4.6%p 높음" text is computed: `companyRatio - industryRatio`. Displayed via `BenchmarkDataRow` with appropriate signal color.

## Mock Data

Values extracted directly from HTML mockup:

- **Score**: 73/100, grade "B+", change +4
- **Categories**: 보험 가입 92 (green), 데드라인 65 (orange), 임금 경쟁력 62 (yellow)
- **AI Summary**: 3 paragraphs (양호 B+, 주요 개선점, 강점)
- **Quick Actions**: urgent 2건 (비자만료 1, 보험미가입 1), improvement 3건 (임금조정 2, 계약갱신 1)
- **Wage**: percentile 30, median 50, company 220만원, industry median 248만원, gap -28만원 (-11.3%)
- **Attrition**: riskLevel "moderate", 4 data rows
- **Dependency**: companyRatio 26.7, industryRatio 22.1, 12/45
- **Trend**: 3 months (Jan 65/83/55/60, Feb 69/88/60/62, Mar 73/92/65/62)

## Component Specs

### BenchmarkHeader
- Title "사업장 건강검진" + `<Badge>2026년 1분기 리포트</Badge>` (blue)
- PDF download button: `toast("준비 중입니다")` on click
- 재분석 button: `toast("준비 중입니다")` on click

### ScoreRingCard
- Contains `ScoreRing` SVG component + grade display + 3 `CategoryBar` components
- `ScoreRing`: SVG 180×180, two circles (bg + fg with strokeDasharray animation). Use `useId()` for gradient IDs. Score number centered with absolute positioning.
- `CategoryBar`: Horizontal bar with label (80px), track, fill (width = score%), value text. Color via signal CSS variables.
- Grade display: "양호" text + Badge "B+" (orange) + date/change text

### AiSummaryBlock
- `bg-secondary` container, "✦ AI 종합 진단" tag
- HTML content sanitized via `isomorphic-dompurify` (ALLOWED_TAGS: ["strong", "em", "br", "p"], ALLOWED_ATTR: ["class"])
- Signal colors in HTML use CSS classes instead of inline styles: `<strong class="text-signal-orange">` not `<strong style="color:var(--signal-orange)">`
- Mock data encodes colors via class names; DOMPurify allows `class` attr (safer than `style`)

### QuickActionCards
- 2-column grid: urgent (signal-red-bg) + improvement (signal-orange-bg)
- Each card: emoji + title with count + subtitle with item summary
- Clickable (cursor-pointer) but mock phase = no action

### Detail Cards (WageCard, AttritionCard, DependencyCard, TrendCard)
Each card shares a common shell `DetailCardShell`:
- Icon (36px rounded square, signal color bg)
- Title (14px semibold)
- Badge (signal color)
- Content area (card-specific visualization + data rows)
- `DataSourceChips` — small gray badges with `title` tooltip for dataId
- `CollapsibleInsight` — AI insight block, first card expanded by default, rest collapsed with "✦ AI 해석 보기" toggle

### PercentileBar (WageCard)
- SVG or CSS: horizontal gradient bar (red→orange→yellow→green)
- Marker at company percentile position (vertical line + label tooltip "귀사 30%")
- Labels: "가장 낮음 ←" ... "→ 가장 높음"

### RiskGauge (AttritionCard)
- 4 horizontal segments: green, yellow, orange, red
- Active segment at full opacity, others at 0.3
- Labels below: 낮음, 주의, 보통, 높음
- Large risk level text on the right

### DependencyDonut (DependencyCard)
- Recharts `PieChart` with `Pie` component
- 2 segments: company (signal-blue) + rest (secondary)
- Legend: two items with color dots and labels
- innerRadius/outerRadius for donut shape

### TrendTable (TrendCard)
- HTML table with header row (항목, 1월, 2월, 3월, 변동)
- 4 data rows: 종합, 보험, 데드라인, 임금
- Change column: positive = signal-green, zero = signal-gray, negative = signal-red
- Latest month values bold

### CollapsibleInsight
- Expanded state: `bg-secondary` block with "✦ AI 해석 닫기" clickable tag + sanitized HTML content
- Collapsed state: just "✦ AI 해석 보기" clickable tag
- Toggle via `useState`; uses `aria-expanded` on the toggle button
- Props: `content: string`, `defaultOpen?: boolean`

### DataSourceChips
- Flex row of small chips: "📄 {name}" with `title={dataId}` for tooltip
- `bg-secondary text-muted-foreground text-[10px]`

## Page States

| State | Display |
|-------|---------|
| No company selected | "사업장을 선택해주세요" message |
| Loading | Skeleton (score ring placeholder + 4 card skeletons) |
| Error | Error message with retry |
| Success | Full report |

## API

### GET /api/benchmarks (BFF route handler)

```typescript
// app/api/benchmarks/route.ts
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) return NextResponse.json({ message: "companyId required" }, { status: 400 });
  const companyId = Number(raw);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 companyId" }, { status: 400 });
  }
  // Mock phase: return mock data
  return NextResponse.json(mockBenchmarkResponse);
}
```

### Query Hook

```typescript
"use client";
// lib/queries/use-benchmark.ts
export function useBenchmark(companyId: number | null) {
  return useQuery<BenchmarkResponse>({
    queryKey: ["benchmark", companyId],
    queryFn: () => {
      if (!companyId || companyId <= 0) throw new Error("유효하지 않은 companyId");
      return fetchApi(`/api/benchmarks?companyId=${companyId}`, "벤치마크 조회에 실패했습니다");
    },
    enabled: companyId !== null && companyId > 0,
  });
}
```

## MSW Handler

```typescript
// mocks/handlers.ts — add
const getBenchmark: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockBenchmarkResponse);

http.get(`${BACKEND}/api/benchmarks`, getBenchmark),
http.get("*/api/benchmarks", getBenchmark),
```

## Sidebar

Add benchmark nav item to sidebar after simulator:
```typescript
{ href: "/benchmark", label: "사업장 건강검진", icon: BarChart3 }
```

## Accessibility

- `ScoreRing`: `role="meter"` with `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-label="컴플라이언스 점수"`
- `CategoryBar`: `role="meter"` with `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-label={label}`
- `PercentileBar`: `aria-label="임금 백분위 {percentile}%"` on the marker
- `RiskGauge`: `aria-label="인력 유출 위험도: {riskLevel}"` on the container
- `CollapsibleInsight`: toggle button has `aria-expanded={isOpen}`
- `DependencyDonut`: Recharts handles basic ARIA; add `aria-label="외국인 의존도 차트"` on container

## Styling Notes

- All colors via signal CSS variables (e.g., `text-signal-orange`, `bg-signal-green-bg`)
- Never use `bg-[var(...)]` — use direct Tailwind utilities
- oklch format only
- Dark mode: signal text colors shared, signal bg colors overridden
- Sanitize all AI HTML with `isomorphic-dompurify` (ALLOWED_ATTR: ["class"], not "style")

## Testing Strategy

Each component gets a test file. Key test scenarios:
- Type validation (Zod if needed, or type-level)
- Mock data shape correctness
- BFF route: valid request, missing companyId → 400
- Query hook: successful fetch
- ScoreRing: renders score number, grade
- Each detail card: renders title, badge, data rows, toggles AI insight
- PercentileBar: renders marker at correct position
- RiskGauge: highlights correct risk level
- DependencyDonut: renders both segments
- TrendTable: renders all months, highlights changes
- Page: no-company state, loading skeleton, error state, success state with all sections
- Sidebar: benchmark nav item present

## Disclaimer

Footer text: "⚖ 본 서비스는 법률 자문이 아닌 관리 보조 도구입니다. 공공데이터 기준 시점: 2026년 1분기"
