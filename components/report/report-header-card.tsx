"use client";

import DOMPurify from "isomorphic-dompurify";

interface ReportHeaderCardProps {
  readonly title: string;
  readonly period: string;
  readonly score: number;
  readonly scoreChange: number;
  readonly aiSummary: string;
}

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ["strong", "em", "br", "p"] as string[],
  ALLOWED_ATTR: ["class"] as string[],
};

export function ReportHeaderCard({ title, period, score, scoreChange, aiSummary }: ReportHeaderCardProps) {
  const sanitized = DOMPurify.sanitize(aiSummary, PURIFY_CONFIG);
  const changeSign = scoreChange > 0 ? "+" : "";

  return (
    <div className="rounded-lg border p-6">
      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-5xl font-bold text-signal-orange">{score}</span>
          <span className="text-xs text-muted-foreground">종합 점수</span>
          <span className="text-xs font-medium text-signal-green">
            {changeSign}{scoreChange} 전월 대비
          </span>
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-xs text-muted-foreground">{period}</p>
          {/* Content sanitized via DOMPurify with strict allowlist — see PURIFY_CONFIG */}
          <div
            className="space-y-2 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />
        </div>
      </div>
    </div>
  );
}
