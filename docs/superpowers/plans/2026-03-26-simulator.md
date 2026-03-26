# Employment Permit Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Employment Permit Simulator screen — a form+result hybrid layout where users input hiring requirements and receive AI-powered analysis of E-9 visa allocation likelihood.

**Architecture:** Left sticky form (380px) captures hiring intent (desired count, nationality, timing), auto-fills company info from CompanyProvider context. On submit, `POST /api/simulations` returns structured analysis. Right scrollable area renders verdict, key stats, collapsible analysis cards, and recommendation links. Mock-phase: BFF route returns hardcoded mock data.

**Tech Stack:** Next.js 16 App Router, React 19, TanStack React Query v5 (useMutation), Tailwind CSS v4 (oklch), shadcn/ui, Lucide React, Zod, MSW v2, Vitest + Testing Library

**Security Note:** All AI-generated HTML content is sanitized using `isomorphic-dompurify` with `ALLOWED_TAGS: ["strong", "em", "br"]` and `ALLOWED_ATTR: []` before rendering via `dangerouslySetInnerHTML`. This is the established pattern from `components/common/ai-insight-block.tsx`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `types/simulator.ts` | Request/response types, Zod schema |
| `mocks/simulator-data.ts` | Hardcoded mock simulation result |
| `app/api/simulations/route.ts` | BFF POST route handler |
| `mocks/handlers.ts` | Add simulator MSW handler |
| `lib/queries/use-simulation.ts` | `useMutation` hook for POST |
| `components/simulator/simulation-form.tsx` | Input form with auto-fill box |
| `components/simulator/result-verdict.tsx` | Overall verdict header |
| `components/simulator/result-stats.tsx` | 3-column key numbers grid |
| `components/simulator/analysis-card.tsx` | Collapsible analysis section |
| `components/simulator/recommendation-box.tsx` | Next steps with external links |
| `app/(app)/simulator/page.tsx` | Page assembly (grid layout) |

---

### Task 1: Types and Zod Schema

**Files:**
- Create: `types/simulator.ts`
- Test: `__tests__/types/simulator-types.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/types/simulator-types.test.ts
import { describe, it, expect } from "vitest";
import {
  simulationRequestSchema,
  type SimulationRequest,
  type SimulationResponse,
  type SimulationVerdict,
} from "@/types/simulator";

describe("Simulator Types", () => {
  it("유효한_시뮬레이션_요청을_파싱한다", () => {
    const input: SimulationRequest = {
      desiredCount: 3,
      preferredNationality: "VIETNAM",
      preferredPeriod: "2026_H2",
    };
    const result = simulationRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("desiredCount가_0이면_실패한다", () => {
    const result = simulationRequestSchema.safeParse({
      desiredCount: 0,
      preferredPeriod: "2026_H2",
    });
    expect(result.success).toBe(false);
  });

  it("SimulationVerdict_유니온이_3가지_값을_허용한다", () => {
    const verdicts: SimulationVerdict[] = ["HIGH", "MEDIUM", "LOW"];
    expect(verdicts).toHaveLength(3);
  });

  it("SimulationResponse_구조가_올바르다", () => {
    const response: SimulationResponse = {
      id: "sim-1",
      verdict: "HIGH",
      verdictText: "높음",
      summary: "배정 가능성이 양호합니다.",
      analyzedAt: "2026-03-24T14:32:00Z",
      dataSourceCount: 4,
      stats: {
        allocation: { label: "배정 가능성", value: "높음", subText: "쿼터 여유 충분", color: "green" },
        competition: { label: "지역 경쟁도", value: "보통", subText: "밀집도 상위 35%", color: "orange" },
        duration: { label: "예상 소요기간", value: "3~5개월", subText: "내국인 구인노력 포함", color: "blue" },
      },
      analyses: [
        {
          id: "quota",
          icon: "BarChart3",
          title: "쿼터 분석",
          badge: { text: "여유", color: "green" },
          dataRows: [{ key: "쿼터", value: "4,200명" }],
          progress: { label: "소진율", value: 68, level: "mid" },
          dataSources: [{ name: "고용노동부", dataId: "15002263" }],
          aiInsight: "현재 소진율 68%는 양호한 수준입니다.",
        },
      ],
      nationality: null,
      recommendations: [
        { text: "내국인 구인노력 의무기간 14일을 우선 이행하세요", linkText: "워크넷 바로가기", href: "https://www.work.go.kr" },
      ],
    };
    expect(response.verdict).toBe("HIGH");
    expect(response.analyses).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/types/simulator-types.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `types/simulator.ts` with:
- `E9_NATIONALITIES` const array (E-9 eligible sending countries subset of NATIONALITIES)
- `PREFERRED_PERIODS` const array and labels
- `simulationRequestSchema` Zod schema (desiredCount min 1 max 50, optional nationality, required period)
- `SimulationVerdict`, `SignalColor`, `ProgressLevel` type unions
- `SimStatItem`, `DataSource`, `DataRow`, `ProgressData`, `AnalysisSection`, `RecommendationItem`, `NationalityAnalysis`, `SimulationResponse` interfaces (all readonly)

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add types/simulator.ts __tests__/types/simulator-types.test.ts
git commit -m "feat: add simulator types and Zod schema"
```

---

### Task 2: Mock Data

**Files:**
- Create: `mocks/simulator-data.ts`
- Test: `__tests__/mocks/simulator-data.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/mocks/simulator-data.test.ts
import { describe, it, expect } from "vitest";
import { mockSimulationResponse } from "@/mocks/simulator-data";

describe("mockSimulationResponse", () => {
  it("필수_필드가_존재한다", () => {
    expect(mockSimulationResponse.id).toBeDefined();
    expect(mockSimulationResponse.verdict).toBe("HIGH");
    expect(mockSimulationResponse.stats.allocation).toBeDefined();
    expect(mockSimulationResponse.stats.competition).toBeDefined();
    expect(mockSimulationResponse.stats.duration).toBeDefined();
  });

  it("분석_섹션이_2개_이상이다", () => {
    expect(mockSimulationResponse.analyses.length).toBeGreaterThanOrEqual(2);
  });

  it("추천_항목이_존재한다", () => {
    expect(mockSimulationResponse.recommendations.length).toBeGreaterThan(0);
  });

  it("국적_분석이_포함되어_있다", () => {
    expect(mockSimulationResponse.nationality).not.toBeNull();
    expect(mockSimulationResponse.nationality?.nationality).toBe("베트남");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

Create `mocks/simulator-data.ts` with mock data matching the HTML mockup values exactly:
- verdict: "HIGH", verdictText: "높음"
- summary from mockup text
- stats: allocation(높음/green), competition(보통/orange), duration(3~5개월/blue)
- analyses[0]: quota — 4,200명 쿼터, 2,856명 현재, 1,344명 잔여, 68% 소진율
- analyses[1]: competition — 127개 사업장, 상위 35% 밀집도, 1.4배
- nationality: 베트남, 32.4%, 28.7%, +2.1%p
- recommendations: 워크넷, 서류목록, 고용센터, 소요기간
- All AI insight texts from the mockup

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add mocks/simulator-data.ts __tests__/mocks/simulator-data.test.ts
git commit -m "feat: add simulator mock data"
```

---

### Task 3: BFF Route Handler + MSW Handler

**Files:**
- Create: `app/api/simulations/route.ts`
- Modify: `mocks/handlers.ts`
- Test: `__tests__/api/simulations-route.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/api/simulations-route.test.ts
import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/simulations/route";

describe("POST /api/simulations", () => {
  it("유효한_요청에_시뮬레이션_결과를_반환한다", async () => {
    const body = JSON.stringify({
      desiredCount: 3,
      preferredNationality: "VIETNAM",
      preferredPeriod: "2026_H2",
    });
    const request = new Request("http://localhost:3000/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.verdict).toBe("HIGH");
    expect(data.analyses.length).toBeGreaterThan(0);
  });

  it("desiredCount가_누락되면_400을_반환한다", async () => {
    const body = JSON.stringify({ preferredPeriod: "2026_H2" });
    const request = new Request("http://localhost:3000/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write BFF route**

Create `app/api/simulations/route.ts`:
- Use `parseRequestBody(request)` then `validateSchema(simulationRequestSchema, parsed.data)` from `lib/api-route-utils.ts`
- If either returns `NextResponse`, return it directly (400 error)
- On success: return `NextResponse.json(mockSimulationResponse)`
- Wrap in try/catch with `handleRouteError()`

- [ ] **Step 4: Add MSW handler**

In `mocks/handlers.ts`, add:
- Import `mockSimulationResponse`
- `postSimulation` callback returning `HttpResponse.json(mockSimulationResponse)`
- Register only `*/api/simulations` POST handler (wildcard path for jsdom tests)
- NOTE: BACKEND-prefixed path omitted — mock-phase BFF returns data directly without calling Spring Boot

- [ ] **Step 5: Run test to verify it passes**

- [ ] **Step 6: Commit**

```bash
git add app/api/simulations/route.ts mocks/handlers.ts __tests__/api/simulations-route.test.ts
git commit -m "feat: add simulator BFF route and MSW handler"
```

---

### Task 4: React Query Mutation Hook

**Files:**
- Create: `lib/queries/use-simulation.ts`
- Test: `__tests__/lib/use-simulation.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/use-simulation.test.tsx
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import { useSimulation } from "@/lib/queries/use-simulation";

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

describe("useSimulation", () => {
  it("시뮬레이션_요청을_보내고_결과를_반환한다", async () => {
    const { result } = renderHook(() => useSimulation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        desiredCount: 3,
        preferredNationality: "VIETNAM",
        preferredPeriod: "2026_H2",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.verdict).toBe("HIGH");
    expect(result.current.data?.analyses.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

`useMutation<SimulationResponse, Error, SimulationRequest>` calling `mutateApi()` with POST to `/api/simulations`.

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add lib/queries/use-simulation.ts __tests__/lib/use-simulation.test.tsx
git commit -m "feat: add useSimulation mutation hook"
```

---

### Task 5: SimulationForm Component

**Files:**
- Create: `components/simulator/simulation-form.tsx`
- Test: `__tests__/components/simulation-form.test.tsx`

**Context:** Auto-fill box shows company info (region, industry, employees, foreign workers) from `CompanyResponse`. Three inputs: desired count (number, required), preferred nationality (select from E-9 eligible countries, optional), preferred period (select). Submit button triggers `onSubmit` callback.

- [ ] **Step 1: Write the failing test**

Tests: auto-fill info displayed, required input exists, onSubmit called, button disabled when isPending.

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

Key details:
- Auto-fill box: `bg-signal-blue-bg`, CheckCircle icon, company info text
- `E9_NATIONALITIES` subset of `NATIONALITIES` (main sending countries)
- Select elements use native `<select>` with focus ring styling
- Submit button: full-width, Lightbulb icon, shows Loader2 + "분석 중..." when pending
- Disclaimer at bottom

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add components/simulator/simulation-form.tsx __tests__/components/simulation-form.test.tsx
git commit -m "feat: add SimulationForm component"
```

---

### Task 6: ResultVerdict Component

**Files:**
- Create: `components/simulator/result-verdict.tsx`
- Test: `__tests__/components/result-verdict.test.tsx`

- [ ] **Step 1: Write the failing test**

Tests: verdict text displayed with correct color, "✓ 분석 완료" badge, formatted date, data source count.

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

Card with: meta line (badge + timestamp + data source count), verdict text (22px bold, color by verdict), summary text (14px muted).

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add components/simulator/result-verdict.tsx __tests__/components/result-verdict.test.tsx
git commit -m "feat: add ResultVerdict component"
```

---

### Task 7: ResultStats Component

**Files:**
- Create: `components/simulator/result-stats.tsx`
- Test: `__tests__/components/result-stats.test.tsx`

- [ ] **Step 1: Write the failing test**

Tests: 3 stat cards rendered with labels/values/subtext, colored top borders.

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

3-column grid of Card components, each with 3px colored top border, label (12px muted), value (26px bold colored), subtext (11px muted).

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add components/simulator/result-stats.tsx __tests__/components/result-stats.test.tsx
git commit -m "feat: add ResultStats component"
```

---

### Task 8: AnalysisCard Component (Collapsible)

**Files:**
- Create: `components/simulator/analysis-card.tsx`
- Test: `__tests__/components/analysis-card.test.tsx`

**Context:** Collapsible card. Header: icon (32px, signal-colored bg) + title + badge + chevron. Body: data rows, optional progress bar, data source chips, AI insight block. Uses DOMPurify for AI insight HTML sanitization (`ALLOWED_TAGS: ["strong", "em", "br"], ALLOWED_ATTR: []`).

- [ ] **Step 1: Write the failing test**

Tests: title/badge, data rows, progress bar, AI insight, toggle open/close, defaultOpen behavior, data source chips.

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

Key implementation details:
- `useState(defaultOpen)` for collapse state
- Icon mapping: `{ BarChart3, Factory, Globe }` from lucide-react
- Section ID → icon background color mapping
- Badge color mapping using signal colors
- Progress bar: 8px height, colored fill based on `level`
- Data source chips: 10px, tooltip with data ID, hover effect
- AI insight: sanitized with DOMPurify, rendered via `dangerouslySetInnerHTML`
- `data-slot="analysis-body"` attribute on body div for test targeting

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add components/simulator/analysis-card.tsx __tests__/components/analysis-card.test.tsx
git commit -m "feat: add collapsible AnalysisCard component"
```

---

### Task 9: RecommendationBox Component

**Files:**
- Create: `components/simulator/recommendation-box.tsx`
- Test: `__tests__/components/recommendation-box.test.tsx`

- [ ] **Step 1: Write the failing test**

Tests: title rendered, items listed, links rendered as `<a>` with correct href, items without links show text only.

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

Green background box (`bg-signal-green-bg`), CheckCircle icon title, list with `→` prefix, optional external links with ExternalLink icon.

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add components/simulator/recommendation-box.tsx __tests__/components/recommendation-box.test.tsx
git commit -m "feat: add RecommendationBox component"
```

---

### Task 10: Simulator Page Assembly

**Files:**
- Create: `app/(app)/simulator/page.tsx`
- Test: `__tests__/pages/simulator-page.test.tsx`

**Context:** Grid layout `380px 1fr`. Left: SimulationForm (sticky). Right: shows empty state before submission, skeleton during loading, result components after success. Uses `useCompanyContext()` for company info and `useSimulation()` for mutation. Handles: no company selected, pre-submission (empty state with dashed border), loading (skeleton), error, result. Nationality data is converted to an `AnalysisSection` at the page level and rendered via `AnalysisCard` (DRY — no separate NationalityCard component needed).

- [ ] **Step 1: Write the failing test**

Tests: company-not-selected message, form rendered, empty state before submission, result displayed after form submission.

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

Key layout details:
- `grid grid-cols-[380px_1fr] gap-6`
- Left: `SimulationForm` with `sticky top-0`
- Right: conditional rendering based on mutation state
- Empty state: dashed border, Lightbulb icon, prompt text
- Skeleton: verdict + 3 stats + 2 analysis cards
- Error: destructive text + error message
- Result: ResultVerdict → ResultStats → AnalysisCards → (nationality converted to AnalysisSection) → RecommendationBox → disclaimer
- Helper function `toNationalitySection(n: NationalityAnalysis): AnalysisSection` converts nationality data to AnalysisCard-compatible format

- [ ] **Step 4: Run all tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 5: Run lint and format**

Run: `npm run lint && npm run format`

- [ ] **Step 6: Commit**

```bash
git add "app/(app)/simulator/page.tsx" "__tests__/pages/simulator-page.test.tsx"
git commit -m "feat: add simulator page with form-result grid layout"
```

---

### Task 11: Sidebar Navigation Update

**Files:**
- Modify: sidebar/navigation component
- Test: `__tests__/components/sidebar-simulator.test.tsx`

**Context:** Add "고용허가 시뮬레이터" link to sidebar under "고용 전" section. Use Lightbulb icon.

- [ ] **Step 1: Locate and read sidebar component**

- [ ] **Step 2: Add simulator nav item**

Path: `/simulator`, Label: "고용허가 시뮬레이터", Icon: Lightbulb, Section: "고용 전"

- [ ] **Step 3: Write smoke test**

Test that the sidebar renders the simulator link with correct href `/simulator`.

- [ ] **Step 4: Run all tests**

- [ ] **Step 5: Commit**

```bash
git add components/layout/sidebar.tsx __tests__/components/sidebar-simulator.test.tsx
git commit -m "feat: add simulator link to sidebar navigation"
```
