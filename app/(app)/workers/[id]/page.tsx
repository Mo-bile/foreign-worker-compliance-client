"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { InsuranceBadge } from "@/components/workers/insurance-badge";
import { DeadlineTable } from "@/components/compliance/deadline-table";
import { useWorker } from "@/lib/queries/use-workers";
import { useWorkerDeadlines } from "@/lib/queries/use-compliance";
import { NATIONALITY_LABELS, VISA_TYPE_LABELS } from "@/types/api";

export default function WorkerDetailPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const workerId = Number(id);
  const worker = useWorker(workerId);
  const deadlines = useWorkerDeadlines(workerId);

  if (worker.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (worker.error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">근로자를 찾을 수 없습니다</p>
      </div>
    );
  }

  const w = worker.data;
  if (!w) return null;

  const nationalityLabel = NATIONALITY_LABELS[w.nationality as keyof typeof NATIONALITY_LABELS] || w.nationality;
  const visaTypeLabel = VISA_TYPE_LABELS[w.visaType as keyof typeof VISA_TYPE_LABELS] || w.visaType;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{w.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">국적</dt>
              <dd className="font-medium">{nationalityLabel}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">비자 유형</dt>
              <dd className="font-medium">{visaTypeLabel}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">비자 만료일</dt>
              <dd className="font-medium">{w.visaExpiryDate}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">상태</dt>
              <dd className="font-medium">{w.status}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">보험 자격</CardTitle>
        </CardHeader>
        <CardContent>
          {w.insuranceEligibilities.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">보험 자격 정보가 없습니다</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>보험 유형</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>사유</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {w.insuranceEligibilities.map((ie) => (
                  <TableRow key={ie.insuranceType}>
                    <TableCell className="font-medium">{ie.insuranceType}</TableCell>
                    <TableCell><InsuranceBadge status={ie.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{ie.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeadlineTable
        title="컴플라이언스 데드라인"
        deadlines={deadlines.data}
        isLoading={deadlines.isLoading}
      />
    </div>
  );
}
