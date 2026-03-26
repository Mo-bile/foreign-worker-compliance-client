"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DependencyDonutProps {
  readonly companyRatio: number;
  readonly companyCount: number;
  readonly totalCount: number;
}

export function DependencyDonut({ companyRatio, companyCount, totalCount }: DependencyDonutProps) {
  const data = [
    { name: "외국인 근로자", value: companyRatio },
    { name: "내국인 근로자", value: 100 - companyRatio },
  ];

  return (
    <div aria-label="외국인 의존도 차트">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={65}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill="oklch(0.7 0.12 240)" />
            <Cell fill="oklch(0.85 0.02 260)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-blue" />
          외국인 {companyCount}명
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          내국인 {totalCount - companyCount}명
        </span>
      </div>
    </div>
  );
}
