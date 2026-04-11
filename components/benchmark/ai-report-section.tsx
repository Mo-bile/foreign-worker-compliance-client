"use client";

import Markdown from "react-markdown";
import DOMPurify from "isomorphic-dompurify";

interface AiReportSectionProps {
  readonly aiReport: string;
}

export function AiReportSection({ aiReport }: AiReportSectionProps) {
  const sanitized = DOMPurify.sanitize(aiReport);

  return (
    <div className="relative overflow-hidden rounded-xl border border-[oklch(0.85_0.04_280)] bg-gradient-to-br from-[oklch(0.97_0.02_280)] to-[oklch(0.96_0.02_260)] p-5 pl-7">
      {/* 좌측 그라데이션 바 */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-[oklch(0.6_0.15_255)] to-[oklch(0.55_0.18_300)]" />

      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.6_0.15_255)] to-[oklch(0.55_0.18_300)] text-xs font-bold text-white">
          AI
        </div>
        <span className="text-sm font-bold text-[oklch(0.3_0.03_260)]">
          AI 종합 분석
        </span>
        <span className="rounded-full bg-[oklch(0.6_0.15_255)]/12 px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.45_0.12_260)]">
          AI 분석
        </span>
      </div>

      <div className="prose prose-sm max-w-none text-[oklch(0.35_0.02_260)] prose-strong:text-[oklch(0.25_0.03_260)]">
        <Markdown>{sanitized}</Markdown>
      </div>
    </div>
  );
}
