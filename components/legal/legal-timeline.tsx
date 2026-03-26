import type { LegalChange } from "@/types/legal";
import { LegalCard } from "./legal-card";
import { cn } from "@/lib/utils";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-signal-red",
  warning: "bg-signal-orange",
  info: "bg-signal-blue",
  resolved: "bg-signal-green",
};

interface LegalTimelineProps {
  readonly changes: readonly LegalChange[];
  readonly companyId: number;
}

export function LegalTimeline({ changes, companyId }: LegalTimelineProps) {
  return (
    <div role="list" className="relative space-y-4 pl-6">
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
      {changes.map((change) => (
        <div key={change.id} role="listitem" className="relative">
          <div
            className={cn(
              "absolute -left-3.5 top-4 h-3 w-3 rounded-full border-2 border-background",
              SEVERITY_COLORS[change.severity] ?? "bg-signal-gray",
            )}
          />
          <LegalCard change={change} companyId={companyId} />
        </div>
      ))}
    </div>
  );
}
