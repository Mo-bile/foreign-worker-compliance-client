import type { AttritionAnalysis } from "@/types/benchmark";
import { DetailCardShell } from "./detail-card-shell";
import { RiskGauge } from "./risk-gauge";

interface AttritionCardProps {
  readonly data: AttritionAnalysis;
  readonly defaultInsightOpen?: boolean;
}

export function AttritionCard({ data, defaultInsightOpen = false }: AttritionCardProps) {
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
      <RiskGauge level={data.riskLevel} />
    </DetailCardShell>
  );
}
