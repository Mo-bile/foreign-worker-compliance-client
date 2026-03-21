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
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { paginateItems } from "@/lib/pagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import type { ComplianceDeadlineResponse } from "@/types/api";

interface PaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
}

interface DeadlineTableProps {
  readonly title: string;
  readonly deadlines: readonly ComplianceDeadlineResponse[] | undefined;
  readonly isLoading: boolean;
  readonly limit?: number;
  readonly pagination?: PaginationProps;
}

export function DeadlineTable({
  title,
  deadlines,
  isLoading,
  limit,
  pagination,
}: DeadlineTableProps) {
  const [internalPage, setInternalPage] = useState(1);

  // 3-way branching:
  // 1. limit → slice only, no pagination
  // 2. pagination prop → external control, data already paginated
  // 3. neither → internal useState pagination
  let items: readonly ComplianceDeadlineResponse[] | undefined;
  let paginationControls: PaginationProps | null = null;

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
        ) : !items?.length ? (
          <p className="text-muted-foreground text-sm py-4 text-center">데이터가 없습니다</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>근로자 ID</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>기한</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.workerId}</TableCell>
                    <TableCell>{d.description}</TableCell>
                    <TableCell>{d.dueDate}</TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
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
