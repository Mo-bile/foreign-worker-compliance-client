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

        <div className="mt-5 grid grid-cols-3 gap-3">
          {data.breakdown.map((item) => (
            <div key={item.label} className="rounded-lg bg-secondary p-3 text-center">
              <p className={cn("text-lg font-bold", getScoreColor(item.score))}>{item.score}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
