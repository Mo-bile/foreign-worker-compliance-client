import type { DependencyAnalysis } from "@/types/benchmark";
import { DetailCardShell } from "./detail-card-shell";
import { DependencyDonut } from "./dependency-donut";

interface DependencyCardProps {
  readonly data: DependencyAnalysis;
  readonly defaultInsightOpen?: boolean;
}

export function DependencyCard({ data, defaultInsightOpen = false }: DependencyCardProps) {
  return (
    <DetailCardShell
      icon={data.icon}
      title={data.title}
      badge={data.badge}
      dataRows={data.dataRows}
      dataSources={data.dataSources}
      aiInsight={data.aiInsight}
      defaultInsightOpen={defaultInsightOpen}
    >
      <DependencyDonut
        companyRatio={data.companyRatio}
        companyCount={data.companyCount}
        totalCount={data.totalCount}
      />
    </DetailCardShell>
  );
}
