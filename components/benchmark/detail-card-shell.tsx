import { Card, CardContent } from "@/components/ui/card";
import type { SignalColor, DataSource, DataRow } from "@/types/shared";
import { DataSourceChips } from "./data-source-chips";
import { CollapsibleInsight } from "./collapsible-insight";

type BenchmarkDataRow = DataRow & {
  readonly color?: SignalColor;
};

const badgeColors: Record<SignalColor, string> = {
  green: "bg-signal-green-bg text-signal-green",
  orange: "bg-signal-orange-bg text-signal-orange",
  red: "bg-signal-red-bg text-signal-red",
  blue: "bg-signal-blue-bg text-signal-blue",
  yellow: "bg-signal-yellow-bg text-signal-yellow",
  gray: "bg-signal-gray-bg text-signal-gray",
};

const valueColors: Record<SignalColor, string> = {
  green: "text-signal-green",
  orange: "text-signal-orange",
  red: "text-signal-red",
  blue: "text-signal-blue",
  yellow: "text-signal-yellow",
  gray: "text-signal-gray",
};

interface DetailCardShellProps {
  readonly icon: string;
  readonly title: string;
  readonly badge: { readonly text: string; readonly color: SignalColor };
  readonly dataRows: readonly BenchmarkDataRow[];
  readonly dataSources: readonly DataSource[];
  readonly aiInsight: string;
  readonly defaultInsightOpen?: boolean;
  readonly children?: React.ReactNode;
}

export function DetailCardShell({
  icon,
  title,
  badge,
  dataRows,
  dataSources,
  aiInsight,
  defaultInsightOpen = false,
  children,
}: DetailCardShellProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
            {icon}
          </span>
          <span className="flex-1 text-sm font-semibold">{title}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColors[badge.color]}`}
          >
            {badge.text}
          </span>
        </div>

        {/* Card-specific visualization */}
        {children}

        {/* Data Rows */}
        {dataRows.length > 0 && (
          <div className="space-y-2">
            {dataRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.key}</span>
                <span className={`font-medium ${row.color ? valueColors[row.color] : ""}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Data Sources */}
        <DataSourceChips sources={dataSources} />

        {/* AI Insight */}
        <CollapsibleInsight content={aiInsight} defaultOpen={defaultInsightOpen} />
      </CardContent>
    </Card>
  );
}
