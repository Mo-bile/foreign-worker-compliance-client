"use client";

import DOMPurify from "isomorphic-dompurify";

interface AiSummaryBlockProps {
  readonly html: string;
}

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ["strong", "em", "br", "p"],
  ALLOWED_ATTR: ["class"],
} as const;

export function AiSummaryBlock({ html }: AiSummaryBlockProps) {
  const sanitized = DOMPurify.sanitize(html, PURIFY_CONFIG);

  return (
    <div className="rounded-lg bg-secondary p-4">
      <span className="mb-3 inline-block rounded-full bg-background px-3 py-1 text-xs font-medium">
        ✦ AI 종합 진단
      </span>
      <div
        className="space-y-2 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </div>
  );
}
