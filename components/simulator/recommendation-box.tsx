import { CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecommendationDisplayData } from "@/types/simulator";

interface RecommendationBoxProps {
  readonly data: RecommendationDisplayData;
}

const VARIANT_STYLES = {
  green: {
    container: "bg-signal-green-bg border-signal-green/30",
    title: "text-signal-green",
    arrow: "text-signal-green",
    Icon: CheckCircle,
  },
  yellow: {
    container: "bg-signal-yellow-bg border-signal-orange/30",
    title: "text-signal-orange",
    arrow: "text-signal-orange",
    Icon: AlertTriangle,
  },
} as const;

export function RecommendationBox({ data }: RecommendationBoxProps) {
  const style = VARIANT_STYLES[data.variant];

  return (
    <div className={cn("rounded-lg border p-4", style.container)}>
      <div className={cn("mb-2 flex items-center gap-1.5 text-[13px] font-semibold", style.title)}>
        <style.Icon className="h-4 w-4" />
        {data.title}
      </div>
      <ul className="space-y-1.5">
        {data.items.map((item) => (
          <li key={item.text} className="flex items-start gap-2 pl-1 text-[13px]">
            <span className={cn("mt-0.5 shrink-0", style.arrow)}>→</span>
            <span>
              {item.text}
              {item.linkText && item.href && (
                <>
                  {" ("}
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-primary/30 font-medium text-primary transition-opacity hover:opacity-80"
                  >
                    {item.linkText}
                    <span className="ml-0.5">→</span>
                  </a>
                  {")"}
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
