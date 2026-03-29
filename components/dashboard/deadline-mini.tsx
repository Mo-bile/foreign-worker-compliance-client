import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { VISA_TYPE_SHORT } from "@/types/api";
import type { DashboardDeadline, DeadlineUrgency } from "@/types/dashboard";
import Link from "next/link";

const urgencyColors: Record<DeadlineUrgency, string> = {
  overdue: "bg-signal-red",
  d7: "bg-signal-orange",
  d30: "bg-signal-yellow",
  safe: "bg-signal-green",
};

const dDayColors: Record<DeadlineUrgency, string> = {
  overdue: "text-signal-red",
  d7: "text-signal-orange",
  d30: "text-signal-yellow",
  safe: "text-foreground",
};

interface DeadlineMiniProps {
  readonly deadlines: readonly DashboardDeadline[];
}

export function DeadlineMini({ deadlines }: DeadlineMiniProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-muted-foreground" />
            다가오는 데드라인
          </CardTitle>
          <Link href="/deadlines" className="text-xs text-primary hover:underline">
            전체 →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {deadlines.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2.5 rounded-lg bg-secondary p-2.5 text-[13px]"
          >
            <div className={cn("h-8 w-1 shrink-0 rounded-sm", urgencyColors[item.urgency])} />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {item.workerName} · {VISA_TYPE_SHORT[item.visaType]}
              </p>
            </div>
            <span className={cn("shrink-0 text-xs font-semibold", dDayColors[item.urgency])}>
              D-{Math.abs(item.dDay)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
