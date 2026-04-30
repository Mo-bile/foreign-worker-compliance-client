import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AiSummarySectionProps {
  /** Pre-sanitized HTML from transform layer (DOMPurify applied) */
  readonly sanitizedHtml: string;
}

export function AiSummarySection({ sanitizedHtml }: AiSummarySectionProps) {
  return (
    <Card className="border-l-[3px] border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            AI
          </span>
          <span className="text-primary">종합 안내</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content is pre-sanitized with DOMPurify in simulation-transform.ts */}
        <div
          className="text-[13px] leading-[1.8]"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </CardContent>
    </Card>
  );
}
