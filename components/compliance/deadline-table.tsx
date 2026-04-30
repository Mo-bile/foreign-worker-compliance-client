"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { paginateItems } from "@/lib/pagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import type { PaginationControlsProps } from "@/components/ui/pagination-controls";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { EmptyState } from "@/components/common/empty-state";

type DeadlineWithWorkerName = ComplianceDeadlineResponse & {
  readonly workerName?: string;
};

interface WorkerDeadlineGroup {
  readonly workerId: number;
  readonly workerLabel: string;
  readonly deadlines: readonly DeadlineWithWorkerName[];
  readonly earliestDueDate: string;
}

interface DeadlineTableProps {
  readonly title: string;
  readonly deadlines: readonly ComplianceDeadlineResponse[] | undefined;
  readonly isLoading: boolean;
  readonly isError?: boolean;
  readonly limit?: number;
  readonly pagination?: PaginationControlsProps;
  readonly hasUnfilteredData?: boolean;
  readonly onComplete?: (id: number) => void;
  readonly isCompleting?: boolean;
  readonly variant?: "overdue" | "upcoming";
}

function getWorkerLabel(item: DeadlineWithWorkerName): string {
  return item.workerName?.trim() || `근로자 ${item.workerId}`;
}

function groupByWorker(
  items: readonly ComplianceDeadlineResponse[],
  shouldSortByDueDate: boolean,
): readonly WorkerDeadlineGroup[] {
  const grouped = new Map<number, WorkerDeadlineGroup>();

  for (const deadline of items as readonly DeadlineWithWorkerName[]) {
    const existing = grouped.get(deadline.workerId);

    if (existing) {
      grouped.set(deadline.workerId, {
        ...existing,
        deadlines: [...existing.deadlines, deadline],
        earliestDueDate:
          deadline.dueDate < existing.earliestDueDate ? deadline.dueDate : existing.earliestDueDate,
      });
      continue;
    }

    grouped.set(deadline.workerId, {
      workerId: deadline.workerId,
      workerLabel: getWorkerLabel(deadline),
      deadlines: [deadline],
      earliestDueDate: deadline.dueDate,
    });
  }

  const groups = Array.from(grouped.values()).map((group) => ({
    ...group,
    deadlines: [...group.deadlines].sort((left, right) =>
      left.dueDate.localeCompare(right.dueDate),
    ),
  }));

  if (!shouldSortByDueDate) {
    return groups;
  }

  return [...groups].sort((left, right) => {
    const dueDateDiff = left.earliestDueDate.localeCompare(right.earliestDueDate);

    if (dueDateDiff !== 0) {
      return dueDateDiff;
    }

    return left.workerLabel.localeCompare(right.workerLabel, "ko");
  });
}

function renderRows(
  deadlines: readonly ComplianceDeadlineResponse[],
  {
    onComplete,
    isCompleting,
    showWorkerId,
  }: {
    readonly onComplete?: (id: number) => void;
    readonly isCompleting?: boolean;
    readonly showWorkerId: boolean;
  },
) {
  return deadlines.map((deadline) => (
    <TableRow key={deadline.id}>
      {showWorkerId && <TableCell>{deadline.workerId}</TableCell>}
      <TableCell>{deadline.description}</TableCell>
      <TableCell>{deadline.dueDate}</TableCell>
      <TableCell>
        <StatusBadge status={deadline.status} />
      </TableCell>
      {onComplete && (
        <TableCell>
          <Button
            variant="outline"
            size="sm"
            disabled={deadline.status === "COMPLETED" || isCompleting}
            onClick={() => onComplete(deadline.id)}
          >
            {deadline.status === "COMPLETED" ? "완료됨" : "완료"}
          </Button>
        </TableCell>
      )}
    </TableRow>
  ));
}

function renderTable(
  deadlines: readonly ComplianceDeadlineResponse[],
  {
    onComplete,
    isCompleting,
    showWorkerId,
  }: {
    readonly onComplete?: (id: number) => void;
    readonly isCompleting?: boolean;
    readonly showWorkerId: boolean;
  },
) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showWorkerId && <TableHead>근로자 ID</TableHead>}
          <TableHead>설명</TableHead>
          <TableHead>기한</TableHead>
          <TableHead>상태</TableHead>
          {onComplete && <TableHead>처리</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>{renderRows(deadlines, { onComplete, isCompleting, showWorkerId })}</TableBody>
    </Table>
  );
}

export function DeadlineTable({
  title,
  deadlines,
  isLoading,
  isError,
  limit,
  pagination,
  hasUnfilteredData,
  onComplete,
  isCompleting,
  variant,
}: DeadlineTableProps) {
  const [internalPage, setInternalPage] = useState(1);
  const [expandedWorkers, setExpandedWorkers] = useState<Set<number>>(new Set());

  // 3-way branching to support different consumers:
  // dashboard summary (limit), compliance page with filters (external pagination),
  // and standalone usage (internal pagination)
  let items: readonly ComplianceDeadlineResponse[] | undefined;
  let paginationControls: PaginationControlsProps | null = null;

  if (limit) {
    items = deadlines?.slice(0, limit);
  } else if (pagination) {
    items = deadlines;
    paginationControls = pagination;
  } else if (deadlines) {
    const paginated = paginateItems(deadlines, internalPage);
    items = paginated.items;
    if (paginated.totalPages > 1) {
      paginationControls = {
        currentPage: paginated.currentPage,
        totalPages: paginated.totalPages,
        totalItems: paginated.totalItems,
        pageSize: paginated.pageSize,
        onPageChange: setInternalPage,
      };
    }
  }

  const groupStatusLabel =
    variant === "overdue" || (variant === undefined && title.includes("기한초과"))
      ? "기한초과"
      : "임박";
  const groups = items ? groupByWorker(items, groupStatusLabel !== "기한초과") : [];
  const isSingleWorker = groups.length <= 1;
  const deadlinesRef = JSON.stringify(deadlines?.map((deadline) => deadline.id) ?? []);
  const hasData = hasUnfilteredData ?? (deadlines != null && deadlines.length > 0);
  const emptyMessage = hasData ? "조건에 맞는 결과가 없습니다" : "표시할 내용이 없습니다";

  useEffect(() => {
    if (groups.length > 0 && !isSingleWorker) {
      setExpandedWorkers(new Set([groups[0].workerId]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlinesRef]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            message="내용을 불러오지 못했습니다. 페이지를 새로고침해 주세요."
            variant="error"
          />
        ) : !items?.length ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <>
            {isSingleWorker ? (
              renderTable(items, { onComplete, isCompleting, showWorkerId: true })
            ) : (
              <div className="space-y-3">
                {groups.map((group) => {
                  const isExpanded = expandedWorkers.has(group.workerId);
                  const contentId = `deadline-group-${group.workerId}`;

                  return (
                    <section key={group.workerId} className="overflow-hidden rounded-lg border">
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex h-auto w-full items-center justify-between rounded-none px-4 py-3 text-left"
                        aria-expanded={isExpanded}
                        aria-controls={contentId}
                        onClick={() => {
                          setExpandedWorkers((current) => {
                            const next = new Set(current);

                            if (next.has(group.workerId)) {
                              next.delete(group.workerId);
                            } else {
                              next.add(group.workerId);
                            }

                            return next;
                          });
                        }}
                      >
                        <span className="font-medium">
                          {group.workerLabel} — {groupStatusLabel} {group.deadlines.length}건
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                        )}
                      </Button>
                      {isExpanded && (
                        <div id={contentId} className="border-t px-4 py-3">
                          {renderTable(group.deadlines, {
                            onComplete,
                            isCompleting,
                            showWorkerId: false,
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
            {paginationControls && (
              <PaginationControls
                currentPage={paginationControls.currentPage}
                totalPages={paginationControls.totalPages}
                totalItems={paginationControls.totalItems}
                pageSize={paginationControls.pageSize}
                onPageChange={paginationControls.onPageChange}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
