import type { WageAnalysis } from "@/types/benchmark";
import { DetailCardShell } from "./detail-card-shell";
import { PercentileBar } from "./percentile-bar";

interface WageCardProps {
  readonly data: WageAnalysis;
  readonly defaultInsightOpen?: boolean;
}

export function WageCard({ data, defaultInsightOpen = false }: WageCardProps) {
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
      <PercentileBar
        percentile={data.percentile}
        medianPercentile={data.medianPercentile}
        label={data.percentileLabel}
      />
    </DetailCardShell>
  );
}
