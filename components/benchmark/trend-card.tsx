import type { TrendAnalysis } from "@/types/benchmark";
import { DetailCardShell } from "./detail-card-shell";
import { TrendTable } from "./trend-table";

interface TrendCardProps {
  readonly data: TrendAnalysis;
  readonly defaultInsightOpen?: boolean;
}

export function TrendCard({ data, defaultInsightOpen = false }: TrendCardProps) {
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
      <TrendTable months={data.months} />
    </DetailCardShell>
  );
}
