"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { InsuranceBadge } from "@/components/workers/insurance-badge";
import { H2Badge } from "@/components/workers/h2-badge";
import { SpecialtyInsuranceCard } from "@/components/workers/specialty-insurance-card";
import { WorkerDeadlineTimeline } from "@/components/workers/worker-deadline-timeline";
import {
  NATIONALITY_LABELS,
  VISA_TYPE_LABELS,
  WORKER_STATUS_LABELS,
  INSURANCE_TYPE_LABELS,
} from "@/types/api";
import { useWorker } from "@/lib/queries/use-workers";
import { useWorkerDeadlines } from "@/lib/queries/use-compliance";

export default function WorkerDetailPage({ params }: { readonly params: Promise<{ id: string }> }) {
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
  const koreanName = w.koreanName?.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{w.name}</h1>
          {koreanName && <p className="mt-1 text-sm text-muted-foreground">{koreanName}</p>}
        </div>
        <Link
          href={`/workers/${workerId}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          수정
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 md:grid-cols-2">
            {koreanName && (
              <div>
                <dt className="text-sm text-muted-foreground">한글 이름</dt>
                <dd className="font-medium">{koreanName}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted-foreground">생년월일</dt>
              <dd className="font-medium">{w.dateOfBirth}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">국적</dt>
              <dd className="font-medium">{NATIONALITY_LABELS[w.nationality]}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">비자 유형</dt>
              <dd className="font-medium">
                <span className="font-mono text-xs">{w.visaType}</span>
                <span className="ml-1.5">{VISA_TYPE_LABELS[w.visaType]}</span>
                <H2Badge visaType={w.visaType} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">비자 만료일</dt>
              <dd className="font-medium">{w.visaExpiryDate}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">상태</dt>
              <dd className="font-medium">{WORKER_STATUS_LABELS[w.status]}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">계약 시작일</dt>
              <dd className="font-medium">{w.contractStartDate}</dd>
            </div>
            {w.contractEndDate && (
              <div>
                <dt className="text-sm text-muted-foreground">계약 종료일</dt>
                <dd className="font-medium">{w.contractEndDate}</dd>
              </div>
            )}
            {w.jobPosition && (
              <div>
                <dt className="text-sm text-muted-foreground">직무</dt>
                <dd className="font-medium">{w.jobPosition}</dd>
              </div>
            )}
            {w.entryDate && (
              <div>
                <dt className="text-sm text-muted-foreground">입국일</dt>
                <dd className="font-medium">{w.entryDate}</dd>
              </div>
            )}
            {w.passportNumber && (
              <div>
                <dt className="text-sm text-muted-foreground">여권번호</dt>
                <dd className="font-medium">{w.passportNumber}</dd>
              </div>
            )}
            {w.registrationNumber && (
              <div>
                <dt className="text-sm text-muted-foreground">외국인등록번호</dt>
                <dd className="font-medium">{w.registrationNumber}</dd>
              </div>
            )}
            {w.contactPhone && (
              <div>
                <dt className="text-sm text-muted-foreground">연락처</dt>
                <dd className="font-medium">{w.contactPhone}</dd>
              </div>
            )}
            {w.contactEmail && (
              <div>
                <dt className="text-sm text-muted-foreground">이메일</dt>
                <dd className="font-medium">{w.contactEmail}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">보험 자격</CardTitle>
        </CardHeader>
        <CardContent>
          {w.insuranceEligibilities.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              보험 자격 정보가 없습니다
            </p>
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
                    <TableCell className="font-medium">
                      {INSURANCE_TYPE_LABELS[ie.insuranceType] ?? ie.insuranceType}
                    </TableCell>
                    <TableCell>
                      <InsuranceBadge status={ie.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div>{ie.reason}</div>
                      {ie.note !== null && (
                        <p className="mt-1 text-xs text-muted-foreground/70">💡 {ie.note}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {w.insuranceDisclaimer && (
            <p className="mt-3 text-[11px] text-muted-foreground/60">※ {w.insuranceDisclaimer}</p>
          )}
        </CardContent>
      </Card>

      <SpecialtyInsuranceCard visaType={w.visaType} deadlines={deadlines.data ?? []} />

      <WorkerDeadlineTimeline
        deadlines={deadlines.data}
        isLoading={deadlines.isLoading}
        isError={deadlines.isError}
      />
    </div>
  );
}
