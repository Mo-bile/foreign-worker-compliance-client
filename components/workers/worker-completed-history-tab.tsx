"use client";

import { ArrowUpRight } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompletedDeadlinesByWorker } from "@/lib/queries/use-compliance";
import { DEADLINE_TYPE_LABELS } from "@/types/api";

interface WorkerCompletedHistoryTabProps {
  readonly workerId: number;
}

function formatKoreaDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR");
}

export function WorkerCompletedHistoryTab({ workerId }: WorkerCompletedHistoryTabProps) {
  const { data, isLoading, isError } = useCompletedDeadlinesByWorker(workerId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">완료 이력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">완료 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            message="이력을 불러오지 못했습니다. 페이지를 새로고침해 주세요."
            variant="error"
          />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">완료 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="완료된 이력이 없습니다" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">완료 이력</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>완료일</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>증권번호</TableHead>
              <TableHead>갱신 만료일</TableHead>
              <TableHead>증빙</TableHead>
              <TableHead>메모</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((deadline) => (
              <TableRow key={deadline.id}>
                <TableCell>{formatKoreaDate(deadline.completedAt)}</TableCell>
                <TableCell>{DEADLINE_TYPE_LABELS[deadline.deadlineType]}</TableCell>
                <TableCell>{deadline.referenceNumber ?? "-"}</TableCell>
                <TableCell>{formatKoreaDate(deadline.renewedUntil)}</TableCell>
                <TableCell>
                  {deadline.evidenceUrl ? (
                    <a
                      href={deadline.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                      aria-label="증빙 외부 링크 열기"
                    >
                      증빙
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">{deadline.note ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
