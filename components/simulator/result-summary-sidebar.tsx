import { Card, CardContent } from "@/components/ui/card";
import { REGION_LABELS } from "@/types/api";
import type { SimulationRequest } from "@/types/simulator";
import type { CompanyResponse } from "@/types/api";

interface ResultSummarySidebarProps {
  readonly request: SimulationRequest;
  readonly company: CompanyResponse | null;
  readonly estimatedScore: number;
  readonly isExceeded: boolean;
  readonly onEdit: () => void;
}

export function ResultSummarySidebar({
  request,
  company,
  estimatedScore,
  isExceeded,
  onEdit,
}: ResultSummarySidebarProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 text-[13px] font-semibold">예상 계산 조건</div>
        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">내국인:</strong> {request.domesticInsuredCount}명
          </p>
          <p>
            <strong className="text-foreground">현 외국인:</strong>{" "}
            {company?.foreignWorkerCount ?? "—"}명
          </p>
          <p>
            <strong className="text-foreground">희망 채용:</strong> {request.desiredWorkers}명
          </p>
          <p>
            <strong className="text-foreground">사업장:</strong>{" "}
            {company ? (REGION_LABELS[company.region] ?? company.region) : "—"}
          </p>
          <p>
            <strong className="text-foreground">{isExceeded ? "상태:" : "예상 점수:"}</strong>{" "}
            {isExceeded ? "한도 초과" : `${estimatedScore}점`}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="mt-3 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          조건 수정
        </button>
      </CardContent>
    </Card>
  );
}
