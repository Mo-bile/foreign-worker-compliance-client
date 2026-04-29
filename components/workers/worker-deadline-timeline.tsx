import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";
import { DEADLINE_STATUS_LABELS } from "@/types/api";
import type { DeadlineStatus, ComplianceDeadlineResponse } from "@/types/api";

const STATUS_DOT_COLORS: Record<DeadlineStatus, string> = {
  OVERDUE: "bg-signal-red",
  URGENT: "bg-signal-orange",
  APPROACHING: "bg-signal-yellow",
  PENDING: "bg-signal-blue",
  COMPLETED: "bg-signal-green",
};

const STATUS_TEXT_COLORS: Record<DeadlineStatus, string> = {
  OVERDUE: "text-signal-red",
  URGENT: "text-signal-orange",
  APPROACHING: "text-signal-yellow",
  PENDING: "text-signal-blue",
  COMPLETED: "text-signal-green",
};

const STATUS_PRIORITY: Record<DeadlineStatus, number> = {
  OVERDUE: 0,
  URGENT: 1,
  APPROACHING: 2,
  PENDING: 3,
  COMPLETED: 4,
};

function sortDeadlines(
  deadlines: readonly ComplianceDeadlineResponse[],
): readonly ComplianceDeadlineResponse[] {
  return [...deadlines].sort((a, b) => {
    const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (priorityDiff !== 0) return priorityDiff;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

interface WorkerDeadlineTimelineProps {
  readonly deadlines: readonly ComplianceDeadlineResponse[] | undefined;
  readonly isLoading: boolean;
  readonly isError?: boolean;
}

export function WorkerDeadlineTimeline({
  deadlines,
  isLoading,
  isError,
}: WorkerDeadlineTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">컴플라이언스 데드라인</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            message="데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요."
            variant="error"
          />
        ) : !deadlines?.length ? (
          <EmptyState message="등록된 데드라인이 없습니다" />
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-border" />
            <div className="space-y-5">
              {sortDeadlines(deadlines).map((deadline) => {
                const isCompleted = deadline.status === "COMPLETED";
                return (
                  <div
                    key={deadline.id}
                    data-testid="timeline-item"
                    className={cn("relative", isCompleted && "opacity-50")}
                  >
                    <div
                      className={cn(
                        "absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-background",
                        STATUS_DOT_COLORS[deadline.status],
                      )}
                    />
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          STATUS_TEXT_COLORS[deadline.status],
                        )}
                      >
                        {DEADLINE_STATUS_LABELS[deadline.status]}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{deadline.dueDate}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-foreground">{deadline.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
