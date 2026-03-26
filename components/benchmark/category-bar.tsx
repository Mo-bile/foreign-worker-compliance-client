import type { SignalColor } from "@/types/shared";

const fillColors: Record<SignalColor, string> = {
  green: "bg-signal-green",
  orange: "bg-signal-orange",
  red: "bg-signal-red",
  blue: "bg-signal-blue",
  yellow: "bg-signal-yellow",
  gray: "bg-signal-gray",
};

interface CategoryBarProps {
  readonly label: string;
  readonly score: number;
  readonly color: SignalColor;
}

export function CategoryBar({ label, score, color }: CategoryBarProps) {
  return (
    <div
      className="flex items-center gap-2"
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${fillColors[color]} transition-[width] duration-500 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-medium">{score}</span>
    </div>
  );
}
