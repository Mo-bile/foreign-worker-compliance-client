import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsuranceSummaryItem } from "@/types/dashboard";

interface InsuranceSummaryProps {
  readonly items: readonly InsuranceSummaryItem[];
}

export function InsuranceSummary({ items }: InsuranceSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-muted-foreground" />
          4대보험 현황
          <Info
            className="h-3.5 w-3.5 cursor-help text-muted-foreground"
            title="비자 유형별 보험 가입 의무가 상이합니다"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <div
              key={item.type}
              className="rounded-lg bg-secondary p-3 text-center"
            >
              <p className="text-xl font-bold">{item.enrolled}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p
                className={cn(
                  "mt-0.5 text-[10px]",
                  item.status === "ok"
                    ? "text-signal-green"
                    : "text-signal-orange",
                )}
              >
                {item.statusText}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
