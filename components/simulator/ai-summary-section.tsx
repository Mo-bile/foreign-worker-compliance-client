import { CollapsibleCard } from "./collapsible-card";

interface AiSummarySectionProps {
  /** Pre-sanitized HTML from transform layer (DOMPurify applied) */
  readonly sanitizedHtml: string;
}

export function AiSummarySection({ sanitizedHtml }: AiSummarySectionProps) {
  return (
    <CollapsibleCard
      icon={<span className="text-sm font-semibold">✦</span>}
      iconColorClass="bg-transparent"
      title="AI 종합 분석"
      defaultOpen
    >
      {/* Content is pre-sanitized with DOMPurify in simulation-transform.ts */}
      <div
        className="text-[13px] leading-[1.8]"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </CollapsibleCard>
  );
}
