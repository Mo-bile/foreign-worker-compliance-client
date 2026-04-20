"use client";

import { useState } from "react";
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

  const hasData = hasUnfilteredData ?? (deadlines != null && deadlines.length > 0);
  const emptyMessage = hasData ? "조건에 맞는 결과가 없습니다" : "데이터가 없습니다";

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>근로자</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>기한</TableHead>
                  <TableHead>상태</TableHead>
                  {onComplete && <TableHead>처리</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      {d.workerName} ({d.workerId})
                    </TableCell>
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
