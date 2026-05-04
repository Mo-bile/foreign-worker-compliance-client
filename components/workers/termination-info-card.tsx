import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EMPLOYMENT_END_REASON_LABELS,
  INSURANCE_DEREGISTRATION_NOTICE,
} from "@/types/api";
import type { TerminationInfoDto } from "@/types/api";

interface TerminationInfoCardProps {
  readonly terminationInfo: TerminationInfoDto;
}

export function TerminationInfoCard({ terminationInfo }: TerminationInfoCardProps) {
  const { endedAt, reason, employerFault, memo, systemInferred } = terminationInfo;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">고용종료 정보</CardTitle>
          {systemInferred && (
            <span className="rounded-full bg-[var(--signal-orange-bg)] px-2 py-0.5 text-xs font-medium text-[var(--signal-orange)]">
              시스템 자동 추론값
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">종료일</dt>
            <dd className="font-medium">{endedAt}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">종료 사유</dt>
            <dd className="font-medium">{EMPLOYMENT_END_REASON_LABELS[reason]}</dd>
          </div>
          {reason === "WORKPLACE_CHANGE" && (
            <div>
              <dt className="text-sm text-muted-foreground">사업주 귀책 여부</dt>
              <dd className="font-medium">
                {employerFault === true
                  ? "예"
                  : employerFault === false
                    ? "아니오"
                    : "확인 필요"}
              </dd>
            </div>
          )}
          {memo && (
            <div className="md:col-span-2">
              <dt className="text-sm text-muted-foreground">메모</dt>
              <dd className="whitespace-pre-wrap font-medium">{memo}</dd>
            </div>
          )}
        </dl>
        <div className="rounded-md border border-[var(--signal-blue-bg)] bg-[var(--signal-blue-bg)]/40 p-3 text-xs text-foreground/80">
          ℹ️ {INSURANCE_DEREGISTRATION_NOTICE}
        </div>
      </CardContent>
    </Card>
  );
}
