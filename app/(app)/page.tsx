"use client";

import { VISA_TYPE_SHORT } from "@/types/api";
import { Users, Shield, Clock, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { AlertCard } from "@/components/dashboard/alert-card";
import { ComplianceGauge } from "@/components/dashboard/compliance-gauge";
import { VisaDistribution } from "@/components/dashboard/visa-distribution";
import { InsuranceSummary } from "@/components/dashboard/insurance-summary";
import { AiInsightBlock } from "@/components/common/ai-insight-block";
import { DeadlineMini } from "@/components/dashboard/deadline-mini";
import { useDashboard } from "@/lib/queries/use-dashboard";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function DashboardPage() {
  const { selectedCompanyId } = useCompanyContext();
  const { data, isLoading, isError, error, refetch } = useDashboard(selectedCompanyId);

  if (selectedCompanyId == null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">사업장을 선택해주세요</p>
        <p className="mt-2 text-sm text-muted-foreground">
          대시보드를 확인하려면 상단에서 사업장을 먼저 선택해야 합니다.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-destructive">대시보드를 불러올 수 없습니다</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message ?? "잠시 후 다시 시도해주세요."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="space-y-6">
      {/* Stat Cards: 3 normal + 1 urgent (row-span-2) */}
      <div className="grid grid-cols-[repeat(3,1fr)_1fr] gap-4">
        <StatCard
          title="등록 근로자"
          value={stats.totalWorkers}
          icon={Users}
          isLoading={false}
          className="border-t-[color:var(--signal-blue)]"
          subtitle={stats.visaBreakdown.map((v) => `${VISA_TYPE_SHORT[v.type]} ${v.count}명`).join(" · ")}
        />
        <StatCard
          title="보험 가입률"
          value={stats.insuranceRate}
          icon={Shield}
          isLoading={false}
          className="border-t-[color:var(--signal-green)]"
          valueSuffix="%"
          change={
            stats.insuranceRateChange != null
              ? {
                  direction: stats.insuranceRateChange >= 0 ? "up" : "down",
                  text: `전월 대비 ${Math.abs(stats.insuranceRateChange)}%p ${stats.insuranceRateChange >= 0 ? "개선" : "하락"}`,
                }
              : undefined
          }
        />
        <StatCard
          title="다가오는 데드라인"
          value={stats.upcomingDeadlines}
          icon={Clock}
          isLoading={false}
          className="border-t-[color:var(--signal-orange)]"
          subtitle={`D-7 이내 ${stats.deadlineBreakdown.d7}건 · D-30 이내 ${stats.deadlineBreakdown.d30}건`}
        />
        <div className="col-start-4 row-span-2">
          <StatCard
            title="긴급 조치 필요"
            value={stats.urgentActions}
            icon={AlertTriangle}
            isLoading={false}
            variant="urgent"
            className="h-full border-t-[color:var(--signal-red)]"
            subtitle={`비자 만료 ${stats.urgentBreakdown.visa} · 보험 미가입 ${stats.urgentBreakdown.insurance}`}
          />
        </div>
      </div>

      {/* Main Grid: Left content + Right 360px sidebar */}
      <div className="grid grid-cols-[1fr_360px] gap-5">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Urgent Alerts */}
          <section>
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">⚡ 긴급 알림</h2>
              <Link href="/deadlines" className="text-xs text-primary hover:underline">
                전체 보기 →
              </Link>
            </div>
            <div className="space-y-2.5">
              {data.alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </section>

          {/* Visa Distribution + Insurance Summary */}
          <div className="grid grid-cols-2 gap-4">
            <VisaDistribution items={data.visaDistribution} />
            <InsuranceSummary items={data.insuranceSummary} />
          </div>

          {/* AI Insight */}
          <AiInsightBlock content={data.aiInsight} />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <ComplianceGauge data={data.complianceScore} />
          <DeadlineMini deadlines={data.upcomingDeadlines} />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-[1fr_360px] gap-5">
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
