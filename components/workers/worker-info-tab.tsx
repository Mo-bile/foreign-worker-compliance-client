"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { H2Badge } from "@/components/workers/h2-badge";
import { InsuranceBadge } from "@/components/workers/insurance-badge";
import { SpecialtyInsuranceCard } from "@/components/workers/specialty-insurance-card";
import { TerminationInfoCard } from "@/components/workers/termination-info-card";
import { WorkerDeadlineTimeline } from "@/components/workers/worker-deadline-timeline";
import {
  INSURANCE_TYPE_LABELS,
  NATIONALITY_LABELS,
  VISA_TYPE_LABELS,
  resolveWorkerStatusLabel,
  type ComplianceDeadlineResponse,
  type WorkerResponse,
} from "@/types/api";

interface WorkerInfoTabProps {
  readonly worker: WorkerResponse;
  readonly deadlines: readonly ComplianceDeadlineResponse[] | undefined;
  readonly isDeadlinesLoading: boolean;
  readonly isDeadlinesError: boolean;
}

export function WorkerInfoTab({
  worker,
  deadlines,
  isDeadlinesLoading,
  isDeadlinesError,
}: WorkerInfoTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">생년월일</dt>
              <dd className="font-medium">{worker.dateOfBirth}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">국적</dt>
              <dd className="font-medium">{NATIONALITY_LABELS[worker.nationality]}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">비자 유형</dt>
              <dd className="font-medium">
                <span className="font-mono text-xs">{worker.visaType}</span>
                <span className="ml-1.5">{VISA_TYPE_LABELS[worker.visaType]}</span>
                <H2Badge visaType={worker.visaType} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">비자 만료일</dt>
              <dd className="font-medium">{worker.visaExpiryDate}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">상태</dt>
              <dd className="font-medium">{resolveWorkerStatusLabel(worker.status)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">계약 시작일</dt>
              <dd className="font-medium">{worker.contractStartDate}</dd>
            </div>
            {worker.contractEndDate && (
              <div>
                <dt className="text-sm text-muted-foreground">계약 종료일</dt>
                <dd className="font-medium">{worker.contractEndDate}</dd>
              </div>
            )}
            {worker.jobPosition && (
              <div>
                <dt className="text-sm text-muted-foreground">직무</dt>
                <dd className="font-medium">{worker.jobPosition}</dd>
              </div>
            )}
            {worker.entryDate && (
              <div>
                <dt className="text-sm text-muted-foreground">입국일</dt>
                <dd className="font-medium">{worker.entryDate}</dd>
              </div>
            )}
            {worker.passportNumber && (
              <div>
                <dt className="text-sm text-muted-foreground">여권번호</dt>
                <dd className="font-medium">{worker.passportNumber}</dd>
              </div>
            )}
            {worker.registrationNumber && (
              <div>
                <dt className="text-sm text-muted-foreground">외국인등록번호</dt>
                <dd className="font-medium">{worker.registrationNumber}</dd>
              </div>
            )}
            {worker.contactPhone && (
              <div>
                <dt className="text-sm text-muted-foreground">연락처</dt>
                <dd className="font-medium">{worker.contactPhone}</dd>
              </div>
            )}
            {worker.contactEmail && (
              <div>
                <dt className="text-sm text-muted-foreground">이메일</dt>
                <dd className="font-medium">{worker.contactEmail}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {worker.terminationInfo && <TerminationInfoCard terminationInfo={worker.terminationInfo} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">보험 자격</CardTitle>
        </CardHeader>
        <CardContent>
          {worker.insuranceEligibilities.length === 0 ? (
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
                {worker.insuranceEligibilities.map((insurance) => (
                  <TableRow key={insurance.insuranceType}>
                    <TableCell className="font-medium">
                      {INSURANCE_TYPE_LABELS[insurance.insuranceType] ?? insurance.insuranceType}
                    </TableCell>
                    <TableCell>
                      <InsuranceBadge status={insurance.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div>{insurance.reason}</div>
                      {insurance.note !== null && (
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          💡 {insurance.note}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {worker.insuranceDisclaimer && (
            <p className="mt-3 text-[11px] text-muted-foreground/60">
              ※ {worker.insuranceDisclaimer}
            </p>
          )}
        </CardContent>
      </Card>

      <SpecialtyInsuranceCard visaType={worker.visaType} deadlines={deadlines ?? []} />

      <WorkerDeadlineTimeline
        deadlines={deadlines}
        isLoading={isDeadlinesLoading}
        isError={isDeadlinesError}
      />
    </div>
  );
}
