import { CheckCircle, ExternalLink } from "lucide-react";
import type { RecommendationItem } from "@/types/simulator";

interface RecommendationBoxProps {
  readonly recommendations: readonly RecommendationItem[];
}

export function RecommendationBox({ recommendations }: RecommendationBoxProps) {
  return (
    <div className="rounded-lg bg-signal-green-bg p-4">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-signal-green" />
        <span className="text-sm font-medium text-signal-green">다음 단계 추천</span>
      </div>
      <ul className="space-y-2">
        {recommendations.map((item) => (
          <li key={item.text} className="flex items-start gap-2">
            <span className="text-signal-green">→</span>
            <div className="text-sm">
              <span>{item.text}</span>
              {item.href && item.linkText && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {item.linkText}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
