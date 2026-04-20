"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
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

interface DeadlineGroup {
  readonly workerId: number;
  readonly workerName: string;
  readonly deadlines: readonly ComplianceDeadlineResponse[];
  readonly earliestDueDate: string;
}

function groupByWorker(items: readonly ComplianceDeadlineResponse[]): DeadlineGroup[] {
  const grouped = new Map<
    number,
    {
      workerId: number;
      workerName: string;
      deadlines: ComplianceDeadlineResponse[];
      earliestDueDate: string;
    }
  >();

  for (const item of items) {
    const existing = grouped.get(item.workerId);

    if (existing) {
      existing.deadlines.push(item);
      if (item.dueDate < existing.earliestDueDate) {
        existing.earliestDueDate = item.dueDate;
      }
      continue;
    }

    grouped.set(item.workerId, {
      workerId: item.workerId,
      workerName: item.workerName,
      deadlines: [item],
      earliestDueDate: item.dueDate,
    });
  }

  const groups = Array.from(grouped.values());
  const allOverdue = items.every((item) => item.status === "OVERDUE");

  groups.sort((a, b) => {
    if (allOverdue) {
      return b.deadlines.length - a.deadlines.length || a.workerId - b.workerId;
    }

    return a.earliestDueDate.localeCompare(b.earliestDueDate) || a.workerId - b.workerId;
  });

  return groups;
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
}: DeadlineTableProps) {
  const [internalPage, setInternalPage] = useState(1);

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

  const groups = items ? groupByWorker(items) : [];
  const isSingleWorker = groups.length <= 1;
  const [expandedWorkers, setExpandedWorkers] = useState<Set<number>>(new Set());
  const firstGroupId = groups[0]?.workerId;
  const itemsKey = items?.map((item) => item.id).join(",") ?? "";

  useEffect(() => {
    if (isSingleWorker) {
      setExpandedWorkers(new Set());
      return;
    }

    if (firstGroupId != null) {
      setExpandedWorkers(new Set([firstGroupId]));
    }
  }, [firstGroupId, isSingleWorker, itemsKey]);

  const toggleWorker = (workerId: number) => {
    setExpandedWorkers((prev) => {
      const next = new Set(prev);

      if (next.has(workerId)) {
        next.delete(workerId);
      } else {
        next.add(workerId);
      }

      return next;
    });
  };

  const hasData = hasUnfilteredData ?? (deadlines != null && deadlines.length > 0);
  const emptyMessage = hasData ? "조건에 맞는 결과가 없습니다" : "데이터가 없습니다";
  const groupStatusLabel = title.includes("기한초과") ? "기한초과" : "임박";
  const groupStatusClass = title.includes("기한초과")
    ? "bg-destructive/10 text-destructive"
    : "bg-amber-500/10 text-amber-700";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            message="데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요."
            variant="error"
          />
        ) : !items?.length ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <>
            {isSingleWorker ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>설명</TableHead>
                    <TableHead>기한</TableHead>
                    <TableHead>상태</TableHead>
                    {onComplete && <TableHead>처리</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.description}</TableCell>
                      <TableCell>{d.dueDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={d.status} />
                      </TableCell>
                      {onComplete && (
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={d.status === "COMPLETED" || isCompleting}
                            onClick={() => onComplete(d.id)}
                          >
                            {d.status === "COMPLETED" ? "완료됨" : "완료"}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => {
                  const isExpanded = expandedWorkers.has(group.workerId);

                  return (
                    <div key={group.workerId} className="overflow-hidden rounded-lg border">
                      <button
                        type="button"
                        onClick={() => toggleWorker(group.workerId)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                        aria-expanded={isExpanded}
                      >
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                            isExpanded ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{group.workerName}</div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${groupStatusClass}`}
                        >
                          {groupStatusLabel}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {group.deadlines.length}건
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="border-t">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>설명</TableHead>
                                <TableHead>기한</TableHead>
                                <TableHead>상태</TableHead>
                                {onComplete && <TableHead>처리</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.deadlines.map((d) => (
                                <TableRow key={d.id}>
                                  <TableCell>{d.description}</TableCell>
                                  <TableCell>{d.dueDate}</TableCell>
                                  <TableCell>
                                    <StatusBadge status={d.status} />
                                  </TableCell>
                                  {onComplete && (
                                    <TableCell>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={d.status === "COMPLETED" || isCompleting}
                                        onClick={() => onComplete(d.id)}
                                      >
                                        {d.status === "COMPLETED" ? "완료됨" : "완료"}
                                      </Button>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
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
