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

// ─── Grouping Logic (exported for testing) ───────────────
export function groupDeadlinesByDateAndStatus(
  deadlines: readonly ComplianceDeadlineResponse[],
): ChartDatum[] {
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
}

// ─── Custom Tooltip ──────────────────────────────────────
function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) return null;

  const total = datum.urgent + datum.approaching + datum.pending;

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
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
