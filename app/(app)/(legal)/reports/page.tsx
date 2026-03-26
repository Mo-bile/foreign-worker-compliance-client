"use client";

import { useCompanyContext } from "@/lib/contexts/company-context";
import { useComplianceReport } from "@/lib/queries/use-compliance-report";
import { ReportHeaderCard } from "@/components/report/report-header-card";
import { ReportSection } from "@/components/report/report-section";
import { ChecklistItemRow } from "@/components/report/checklist-item";
import { LegalChangeSummaryGrid } from "@/components/report/legal-change-summary";
import { UpcomingGrid } from "@/components/report/upcoming-grid";
import { ExportButtons } from "@/components/report/export-buttons";
import { Disclaimer } from "@/components/report/disclaimer";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const { selectedCompanyId } = useCompanyContext();
  const { data, isLoading, isError, error, refetch } = useComplianceReport(selectedCompanyId);

  if (selectedCompanyId == null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">사업장을 선택해주세요</p>
        <p className="mt-2 text-sm text-muted-foreground">
          컴플라이언스 리포트를 확인하려면 상단에서 사업장을 먼저 선택해야 합니다.
        </p>
      </div>
    );
  }

  if (isLoading) return <ReportSkeleton />;

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">리포트 조회에 실패했습니다</p>
        <p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-xs text-primary hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!data) return <ReportSkeleton />;

  return (
    <div className="space-y-6">
      <ReportHeaderCard
        title={data.title}
        period={data.period}
        score={data.score}
        scoreChange={data.scoreChange}
        aiSummary={data.aiSummary}
      />

      <ReportSection icon="✅" title="완료된 의무사항" count={data.completed.length}>
        <div className="divide-y">
          {data.completed.map((item) => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
        </div>
      </ReportSection>

      <ReportSection icon="⚠️" title="미완료/진행 중" count={data.pending.length}>
        <div className="divide-y">
          {data.pending.map((item) => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
        </div>
      </ReportSection>

      <ReportSection icon="📋" title="이달의 법령 변경" count={data.legalChanges.length}>
        <LegalChangeSummaryGrid items={data.legalChanges} />
      </ReportSection>

      <ReportSection icon="📅" title="다음 달 예정" count={data.upcoming.length}>
        <UpcomingGrid items={data.upcoming} />
      </ReportSection>

      <ExportButtons />
      <Disclaimer />
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
  );
}
