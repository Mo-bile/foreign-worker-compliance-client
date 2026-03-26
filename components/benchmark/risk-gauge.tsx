import type { RiskLevel } from "@/types/benchmark";

interface RiskGaugeProps {
  readonly level: RiskLevel;
}

const LEVELS: readonly { readonly key: RiskLevel; readonly label: string; readonly color: string }[] = [
  { key: "low", label: "낮음", color: "bg-signal-green" },
  { key: "caution", label: "주의", color: "bg-signal-yellow" },
  { key: "moderate", label: "보통", color: "bg-signal-orange" },
  { key: "high", label: "높음", color: "bg-signal-red" },
];

export function RiskGauge({ level }: RiskGaugeProps) {
  return (
    <div aria-label={`인력 유출 위험도: ${level}`}>
      <div className="flex gap-1">
        {LEVELS.map((lv) => (
          <div
            key={lv.key}
            className={`h-3 flex-1 rounded-sm ${lv.color} ${lv.key === level ? "opacity-100" : "opacity-30"}`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between">
        {LEVELS.map((lv) => (
          <span
            key={lv.key}
            className={`text-[10px] ${lv.key === level ? "font-semibold text-foreground" : "text-muted-foreground"}`}
          >
            {lv.label}
          </span>
        ))}
      </div>
    </div>
  );
}
