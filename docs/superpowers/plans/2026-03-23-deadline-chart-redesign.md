# 임박 데드라인 분포 차트 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 단색 막대 그래프를 상태별 색상 누적 막대 그래프로 리디자인하여 정보 밀도와 시각적 완성도를 향상시킨다.

**Architecture:** `components/dashboard/deadline-chart.tsx` 단일 파일 수정. `useMemo` 내부 그룹핑 로직을 날짜×상태별로 변경하고, Recharts StackedBar + 커스텀 Tooltip/Legend로 교체. props 인터페이스 변경 없음.

**Tech Stack:** React 19, Recharts (StackedBar), Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-03-23-deadline-chart-redesign.md`

---

## File Structure

| 파일 | 작업 | 역할 |
|------|------|------|
| `components/dashboard/deadline-chart.tsx` | Modify | 그룹핑 로직 변경, StackedBar, 커스텀 Tooltip/Legend, 애니메이션 |
| `__tests__/components/deadline-chart.test.tsx` | Create | 6개 테스트 케이스 |

---

### Task 1: 테스트 작성 (RED)

**Files:**
- Create: `__tests__/components/deadline-chart.test.tsx`

- [ ] **Step 1: 테스트 파일 작성**

Recharts는 jsdom에서 SVG를 렌더하지 않으므로, 그룹핑 로직은 직접 추출하여 테스트하고, UI 상태(로딩/에러/빈 상태)는 텍스트 기반으로 검증한다.

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeadlineChart } from "@/components/dashboard/deadline-chart";
import type { ComplianceDeadlineResponse } from "@/types/api";

function makeDeadline(
  overrides: Partial<ComplianceDeadlineResponse> = {},
): ComplianceDeadlineResponse {
  return {
    id: 1,
    workerId: 1,
    deadlineType: "VISA_EXPIRY",
    dueDate: "2026-04-01",
    status: "PENDING",
    description: "테스트",
    ...overrides,
  };
}

describe("DeadlineChart", () => {
  it("로딩_중에_스켈레톤을_표시한다", () => {
    render(<DeadlineChart deadlines={undefined} isLoading={true} />);
    expect(document.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });

  it("에러_상태에서_오류_메시지를_표시한다", () => {
    render(<DeadlineChart deadlines={undefined} isLoading={false} isError={true} />);
    expect(screen.getByText(/오류가 발생했습니다/)).toBeDefined();
  });

  it("빈_배열일_때_빈_상태_메시지를_표시한다", () => {
    render(<DeadlineChart deadlines={[]} isLoading={false} />);
    expect(screen.getByText("데이터가 없습니다")).toBeDefined();
  });

  it("OVERDUE와_COMPLETED만_있으면_빈_상태를_표시한다", () => {
    const deadlines = [
      makeDeadline({ id: 1, status: "OVERDUE" }),
      makeDeadline({ id: 2, status: "COMPLETED" }),
    ];
    render(<DeadlineChart deadlines={deadlines} isLoading={false} />);
    expect(screen.getByText("데이터가 없습니다")).toBeDefined();
  });

  it("범례에_상태_라벨이_표시된다", () => {
    const deadlines = [
      makeDeadline({ id: 1, status: "URGENT", dueDate: "2026-04-01" }),
      makeDeadline({ id: 2, status: "APPROACHING", dueDate: "2026-04-01" }),
      makeDeadline({ id: 3, status: "PENDING", dueDate: "2026-04-02" }),
    ];
    render(<DeadlineChart deadlines={deadlines} isLoading={false} />);
    expect(screen.getByText("긴급")).toBeDefined();
    expect(screen.getByText("임박")).toBeDefined();
    expect(screen.getByText("대기")).toBeDefined();
  });

  it("단일_날짜_단일_상태에서_정상_렌더한다", () => {
    const deadlines = [makeDeadline({ id: 1, status: "PENDING", dueDate: "2026-04-01" })];
    render(<DeadlineChart deadlines={deadlines} isLoading={false} />);
    // 차트가 렌더되면 빈 상태 메시지가 없어야 한다
    expect(screen.queryByText("데이터가 없습니다")).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행 — OVERDUE/COMPLETED 필터링 테스트가 FAIL 확인**

Run: `npx vitest run __tests__/components/deadline-chart.test.tsx`
Expected: `OVERDUE와_COMPLETED만_있으면_빈_상태를_표시한다` FAIL (현재 구현은 status 필터링 없음), `범례에_상태_라벨이_표시된다` FAIL

- [ ] **Step 3: Commit (RED 테스트)**

```bash
git add __tests__/components/deadline-chart.test.tsx
git commit -m "test: add deadline chart redesign tests (RED)"
```

---

### Task 2: 구현 (GREEN)

**Files:**
- Modify: `components/dashboard/deadline-chart.tsx`

- [ ] **Step 4: deadline-chart.tsx 전체 교체**

```tsx
"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ComplianceDeadlineResponse } from "@/types/api";

// ─── Constants ───────────────────────────────────────────
const CHART_STATUSES = ["PENDING", "APPROACHING", "URGENT"] as const;
type ChartStatus = (typeof CHART_STATUSES)[number];

const STATUS_CONFIG: Record<ChartStatus, { color: string; label: string }> = {
  URGENT: { color: "#ef4444", label: "긴급" },
  APPROACHING: { color: "#f59e0b", label: "임박" },
  PENDING: { color: "#22c55e", label: "대기" },
};

// Stack order: bottom → top
const STACK_ORDER: ChartStatus[] = ["PENDING", "APPROACHING", "URGENT"];

interface ChartDatum {
  readonly sortKey: string; // ISO date for correct sort (handles year boundary)
  readonly date: string;
  readonly displayDate: string;
  readonly urgent: number;
  readonly approaching: number;
  readonly pending: number;
}

// ─── Helpers ─────────────────────────────────────────────
const weekdayFormatter = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });

function formatDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function formatDateWithDay(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  const weekday = weekdayFormatter.format(date);
  return `${formatDate(iso)} (${weekday})`;
}

function isChartStatus(status: string): status is ChartStatus {
  return CHART_STATUSES.includes(status as ChartStatus);
}

// ─── Custom Tooltip ──────────────────────────────────────
function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) return null;

  const total = datum.urgent + datum.approaching + datum.pending;

  // Display order: top of stack first (URGENT → APPROACHING → PENDING)
  const rows: { label: string; color: string; value: number }[] = [
    { ...STATUS_CONFIG.URGENT, value: datum.urgent },
    { ...STATUS_CONFIG.APPROACHING, value: datum.approaching },
    { ...STATUS_CONFIG.PENDING, value: datum.pending },
  ].filter((r) => r.value > 0);

  return (
    <div
      className="rounded-lg border px-3 py-2 text-sm shadow-md"
      style={{
        backgroundColor: "hsl(var(--popover))",
        borderColor: "hsl(var(--border))",
        color: "hsl(var(--popover-foreground))",
      }}
    >
      <p className="mb-1.5 font-medium">{datum.displayDate}</p>
      <div className="space-y-0.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              {r.label}
            </span>
            <span className="font-medium tabular-nums">{r.value}건</span>
          </div>
        ))}
      </div>
      {rows.length > 1 && (
        <>
          <div className="my-1.5 border-t" style={{ borderColor: "hsl(var(--border))" }} />
          <div className="flex items-center justify-between font-medium">
            <span>합계</span>
            <span className="tabular-nums">{total}건</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Custom Legend ────────────────────────────────────────
function ChartLegend() {
  // Display order matches stack top-to-bottom: URGENT first
  const items: ChartStatus[] = ["URGENT", "APPROACHING", "PENDING"];
  return (
    <div className="flex items-center justify-center gap-4 pb-2">
      {items.map((status) => (
        <span key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: STATUS_CONFIG[status].color }}
          />
          {STATUS_CONFIG[status].label}
        </span>
      ))}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────
interface DeadlineChartProps {
  readonly deadlines: readonly ComplianceDeadlineResponse[] | undefined;
  readonly isLoading: boolean;
  readonly isError?: boolean;
}

// ─── Component ───────────────────────────────────────────
export function DeadlineChart({ deadlines, isLoading, isError }: DeadlineChartProps) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const chartData = useMemo(() => {
    if (!deadlines) return [];

    const grouped = new Map<string, { urgent: number; approaching: number; pending: number }>();

    for (const d of deadlines) {
      if (!isChartStatus(d.status)) continue;

      const entry = grouped.get(d.dueDate) ?? { urgent: 0, approaching: 0, pending: 0 };
      const key = d.status.toLowerCase() as "urgent" | "approaching" | "pending";
      grouped.set(d.dueDate, { ...entry, [key]: entry[key] + 1 });
    }

    return Array.from(grouped.entries())
      .map(
        ([date, counts]): ChartDatum => ({
          sortKey: date,
          date: formatDate(date),
          displayDate: formatDateWithDay(date),
          ...counts,
        }),
      )
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [deadlines]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">임박 데드라인 분포 (30일)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : isError ? (
          <p className="text-destructive text-sm py-8 text-center">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">데이터가 없습니다</p>
        ) : (
          <>
            <ChartLegend />
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                {STACK_ORDER.map((status, i) => (
                  <Bar
                    key={status}
                    dataKey={status.toLowerCase()}
                    stackId="status"
                    fill={STATUS_CONFIG[status].color}
                    radius={i === STACK_ORDER.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    animationDuration={prefersReducedMotion ? 0 : 800}
                    isAnimationActive={!prefersReducedMotion}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: 테스트 실행 — 전체 PASS 확인**

Run: `npx vitest run __tests__/components/deadline-chart.test.tsx`
Expected: 6 tests PASS

- [ ] **Step 6: Commit (GREEN)**

```bash
git add components/dashboard/deadline-chart.tsx __tests__/components/deadline-chart.test.tsx
git commit -m "feat: redesign deadline chart with stacked bars and status colors"
```

---

### Task 3: 수동 검증 및 정리

- [ ] **Step 7: 개발 서버에서 시각적 확인**

Run: `npm run dev`
확인 사항:
- 대시보드 (`/`) — DeadlineChart에 상태별 색상 누적 막대 표시
- 컴플라이언스 (`/compliance`) — 동일한 차트 정상 렌더
- 다크모드/라이트모드 전환 시 Tooltip 스타일 정상
- 빈 데이터 시 "데이터가 없습니다" 표시

- [ ] **Step 8: lint 확인**

Run: `npm run lint`
Expected: 에러 없음

- [ ] **Step 9: 전체 테스트 확인**

Run: `npm test`
Expected: 기존 테스트 + 새 테스트 전체 PASS
