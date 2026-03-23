"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { DEADLINE_STATUS_LABELS } from "@/types/api";
import { DEADLINE_STATUS_CHART_COLORS } from "@/lib/constants/status";

// ─── Constants ───────────────────────────────────────────
const CHART_STATUSES = ["PENDING", "APPROACHING", "URGENT"] as const;
type ChartStatus = (typeof CHART_STATUSES)[number];

// Stack order bottom → top: 낮은 긴급도가 바닥, 높은 긴급도가 꼭대기.
// 마지막 요소(URGENT)에만 radius=[4,4,0,0] 적용됨 — 순서 변경 시 radius 로직도 확인할 것.
const STACK_ORDER: ChartStatus[] = ["PENDING", "APPROACHING", "URGENT"];

export interface ChartDatum {
  readonly sortKey: string;
  readonly date: string;
  readonly displayDate: string;
  readonly urgent: number;
  readonly approaching: number;
  readonly pending: number;
}

// ─── Helpers ─────────────────────────────────────────────
const weekdayFormatter = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return Number.isNaN(m) || Number.isNaN(d) ? iso : `${m}/${d}`;
}

function formatDateWithDay(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  if (Number.isNaN(date.getTime())) return formatDate(iso);
  const weekday = weekdayFormatter.format(date);
  return `${formatDate(iso)} (${weekday})`;
}

function isChartStatus(status: string): status is ChartStatus {
  return CHART_STATUSES.includes(status as ChartStatus);
}

// ─── Grouping Logic (exported for unit testing only — not part of public API) ──
export function groupDeadlinesByDateAndStatus(
  deadlines: readonly ComplianceDeadlineResponse[],
): ChartDatum[] {
  const grouped = new Map<string, { urgent: number; approaching: number; pending: number }>();

  for (const d of deadlines) {
    if (!d.dueDate || !ISO_DATE_RE.test(d.dueDate)) continue;
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
}

// ─── Custom Tooltip ──────────────────────────────────────
interface ChartTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ readonly payload: ChartDatum }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) return null;

  const total = datum.urgent + datum.approaching + datum.pending;

  const rows: { label: string; color: string; value: number }[] = [
    { label: DEADLINE_STATUS_LABELS.URGENT, color: DEADLINE_STATUS_CHART_COLORS.URGENT, value: datum.urgent },
    { label: DEADLINE_STATUS_LABELS.APPROACHING, color: DEADLINE_STATUS_CHART_COLORS.APPROACHING, value: datum.approaching },
    { label: DEADLINE_STATUS_LABELS.PENDING, color: DEADLINE_STATUS_CHART_COLORS.PENDING, value: datum.pending },
  ].filter((r) => r.value > 0);

  return (
    <div
      className="rounded-lg border px-3 py-2 text-sm shadow-md"
      style={{
        backgroundColor: "var(--popover)",
        borderColor: "var(--border)",
        color: "var(--popover-foreground)",
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
          <div className="my-1.5 border-t" style={{ borderColor: "var(--border)" }} />
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
// Legend shows highest-severity first (URGENT → PENDING), opposite of STACK_ORDER.
const LEGEND_ORDER: readonly ChartStatus[] = [...STACK_ORDER].reverse();

function ChartLegend() {
  return (
    <div className="flex items-center justify-center gap-4 pb-2">
      {LEGEND_ORDER.map((status) => (
        <span key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: DEADLINE_STATUS_CHART_COLORS[status] }}
          />
          {DEADLINE_STATUS_LABELS[status]}
        </span>
      ))}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────
interface DeadlineChartProps {
  readonly deadlines: readonly ComplianceDeadlineResponse[] | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

// ─── Reduced Motion (useSyncExternalStore) ──────────────
function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ─── Component ───────────────────────────────────────────
export function DeadlineChart({ deadlines, isLoading, isError }: DeadlineChartProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

  const chartData = useMemo(() => {
    if (!deadlines) return [];
    return groupDeadlinesByDateAndStatus(deadlines);
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
                {STACK_ORDER.map((status, i) => (
                  <Bar
                    key={status}
                    dataKey={status.toLowerCase()}
                    stackId="status"
                    fill={DEADLINE_STATUS_CHART_COLORS[status]}
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
