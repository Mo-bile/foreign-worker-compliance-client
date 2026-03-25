import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisaDistributionItem } from "@/types/dashboard";

const barColors: Record<string, string> = {
  "E-9": "bg-signal-blue",
  "H-2": "bg-signal-green",
  "E-7": "bg-signal-orange",
};

interface VisaDistributionProps {
  readonly items: readonly VisaDistributionItem[];
}

export function VisaDistribution({ items }: VisaDistributionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-muted-foreground" />
          비자 유형별 분포
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {items.map((item) => (
          <div key={item.type} className="flex items-center gap-2.5">
            <span className="w-9 text-xs font-semibold">{item.type}</span>
            <div className="relative h-6 flex-1 overflow-hidden rounded bg-secondary">
              <div
                className={cn(
                  "h-full rounded transition-[width] duration-600 ease-out",
                  barColors[item.type] ?? "bg-signal-gray",
                )}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="w-9 text-right text-xs font-semibold">
              {item.count}명
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
