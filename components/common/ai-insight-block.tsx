"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface AiInsightBlockProps {
  readonly content: string;
  readonly title?: string;
  readonly showDisclaimer?: boolean;
}

export function AiInsightBlock({
  content,
  title = "AI 인사이트",
  showDisclaimer = true,
}: AiInsightBlockProps) {
  const sanitizedContent = useMemo(
    () => DOMPurify.sanitize(content, { ALLOWED_TAGS: ["strong", "em", "br"] }),
    [content],
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-secondary p-3.5">
          <span className="mb-2 ml-[22px] inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            ✦ AI 분석
          </span>
          <div
            className="pl-[22px] text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
        {showDisclaimer && (
          <p className="mt-2 border-t pt-2 text-center text-[10px] text-muted-foreground">
            ⚖ 본 서비스는 법률 자문이 아닌 관리 보조 도구입니다. 정확한 판단은 전문가와 상담하세요.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
