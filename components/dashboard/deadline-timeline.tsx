import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { TimelineItem, DeadlineUrgency } from "@/types/dashboard";

const urgencyBarColors: Record<DeadlineUrgency, string> = {
  overdue: "bg-signal-red",
  d7: "bg-signal-orange",
  d30: "bg-signal-yellow",
  safe: "bg-signal-green",
};

interface DeadlineTimelineProps {
  readonly items: readonly TimelineItem[];
}

export function DeadlineTimeline({ items }: DeadlineTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            30일 타임라인
          </CardTitle>
          <Link href="/compliance" className="text-xs text-primary hover:underline">
            전체 보기 →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            30일 이내 예정 항목이 없습니다
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 rounded-lg bg-secondary p-2.5 text-[13px]"
            >
              <div className={cn("h-7 w-1 shrink-0 rounded-sm", urgencyBarColors[item.urgency])} />
              <span className="min-w-[52px] text-xs text-muted-foreground">{item.date}</span>
              <span className="flex-1">{item.deadlineLabel}</span>
              <span className="text-xs text-muted-foreground">{item.workerName}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
