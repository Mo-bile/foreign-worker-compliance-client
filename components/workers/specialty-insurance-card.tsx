import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEADLINE_TYPE_LABELS, DEADLINE_STATUS_LABELS } from "@/types/api";
import type { ComplianceDeadlineResponse, DeadlineType } from "@/types/api";
import { cn } from "@/lib/utils";
import { H2Badge } from "./h2-badge";

const EMPLOYER_TYPES: readonly DeadlineType[] = [
  "EXIT_GUARANTEE_INSURANCE",
  "WAGE_GUARANTEE_INSURANCE",
];

const WORKER_INFO = [
  { label: "귀국비용보험", description: "외국인 근로자 본인 가입 (효력발생일 + 3개월)" },
  { label: "상해보험", description: "외국인 근로자 본인 가입 (효력발생일 + 15일)" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  OVERDUE: "text-signal-red",
  URGENT: "text-signal-orange",
  APPROACHING: "text-signal-yellow",
  COMPLETED: "text-signal-green",
};

interface SpecialtyInsuranceCardProps {
  readonly visaType: string;
  readonly deadlines: readonly ComplianceDeadlineResponse[];
}

export function SpecialtyInsuranceCard({
  visaType,
  deadlines,
}: SpecialtyInsuranceCardProps) {
  if (visaType !== "E9" && visaType !== "H2") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          전용보험 (E-9/H-2)
          <H2Badge visaType={visaType} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">사업주 의무 — 자동 추적</p>
          <div className="space-y-2">
            {EMPLOYER_TYPES.map((type) => {
              const deadline = deadlines.find((d) => d.deadlineType === type);
              return (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{DEADLINE_TYPE_LABELS[type]}</p>
                    <p className="text-xs text-muted-foreground">사업주 가입 필수</p>
                  </div>
                  {deadline ? (
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        STATUS_COLORS[deadline.status] ?? "text-muted-foreground",
                      )}
                    >
                      {DEADLINE_STATUS_LABELS[deadline.status]}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">데드라인 미등록</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="opacity-60">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">근로자 의무 — 안내</p>
          <div className="space-y-2">
            {WORKER_INFO.map((info) => (
              <div
                key={info.label}
                className="flex items-center justify-between rounded-lg border border-dashed p-3"
              >
                <div>
                  <p className="text-sm font-medium">{info.label}</p>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">근로자 본인</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/60">
          ※ 본 판정은 관리 보조 목적이며 법적 자문이 아닙니다. 정확한 가입 요건은 관할 기관에
          확인하세요.
        </p>
      </CardContent>
    </Card>
  );
}
