"use client";

import { useId } from "react";

interface PercentileBarProps {
  readonly percentile: number;
  readonly medianPercentile: number;
  readonly label: string;
}

export function PercentileBar({ percentile, medianPercentile, label }: PercentileBarProps) {
  const id = useId();

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <svg
        width="100%"
        height={40}
        viewBox="0 0 300 40"
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.65 0.2 25)" />
            <stop offset="33%" stopColor="oklch(0.75 0.15 60)" />
            <stop offset="66%" stopColor="oklch(0.8 0.15 95)" />
            <stop offset="100%" stopColor="oklch(0.75 0.15 145)" />
          </linearGradient>
        </defs>

        <rect x={0} y={12} width={300} height={8} rx={4} fill={`url(#${id}-grad)`} />

        <line
          x1={medianPercentile * 3} y1={8} x2={medianPercentile * 3} y2={24}
          stroke="currentColor" strokeWidth={1} strokeDasharray="2 2"
          className="text-muted-foreground"
        />

        <line
          x1={percentile * 3} y1={4} x2={percentile * 3} y2={28}
          stroke="currentColor" strokeWidth={2} className="text-foreground"
          aria-label={`임금 백분위 ${percentile}%`}
        />
        <text x={percentile * 3} y={38} textAnchor="middle" className="fill-foreground text-[9px] font-medium">
          귀사 {percentile}%
        </text>
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>← 가장 낮음</span>
        <span>가장 높음 →</span>
      </div>
    </div>
  );
}
