import { Card, CardContent } from "@/components/ui/card";
import type { SignalColor, SimStatItem } from "@/types/simulator";

interface ResultStatsProps {
  readonly stats: {
    readonly allocation: SimStatItem;
    readonly competition: SimStatItem;
    readonly duration: SimStatItem;
  };
}

const colorClasses: Record<SignalColor, { border: string; text: string }> = {
  green: { border: "border-t-signal-green", text: "text-signal-green" },
  orange: { border: "border-t-signal-orange", text: "text-signal-orange" },
  blue: { border: "border-t-signal-blue", text: "text-signal-blue" },
  red: { border: "border-t-signal-red", text: "text-signal-red" },
  yellow: { border: "border-t-signal-yellow", text: "text-signal-yellow" },
  gray: { border: "border-t-signal-gray", text: "text-signal-gray" },
};

function StatCard({ stat }: { readonly stat: SimStatItem }) {
  const { border, text } = colorClasses[stat.color as keyof typeof colorClasses];

  return (
    <Card className={`border-t-[3px] ${border}`}>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{stat.label}</p>
        <p className={`text-[26px] font-bold ${text}`}>{stat.value}</p>
        <p className="text-[11px] text-muted-foreground">{stat.subText}</p>
      </CardContent>
    </Card>
  );
}

export function ResultStats({ stats }: ResultStatsProps) {
  const statItems = [stats.allocation, stats.competition, stats.duration];

  return (
    <div className="grid grid-cols-3 gap-3">
      {statItems.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
