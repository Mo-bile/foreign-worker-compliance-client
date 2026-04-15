"use client";

import Markdown from "react-markdown";
import { Sparkles, RefreshCw } from "lucide-react";
import { AiAnalysisProgress } from "@/components/common/ai-analysis-progress";
import type { AiInsight } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

const DISALLOWED_ELEMENTS = ["img", "a", "script", "iframe", "input", "form", "table"];

interface DashboardAiInsightProps {
  readonly aiInsight: Readonly<AiInsight> | null;
  readonly isPending: boolean;
  readonly onGenerate: () => void;
}

export function DashboardAiInsight({ aiInsight, isPending, onGenerate }: DashboardAiInsightProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[oklch(0.85_0.04_280)] bg-gradient-to-br from-[oklch(0.97_0.02_280)] to-[oklch(0.96_0.02_260)] p-5 pl-7">
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-[oklch(0.6_0.15_255)] to-[oklch(0.55_0.18_300)]" />

      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.6_0.15_255)] to-[oklch(0.55_0.18_300)] text-xs font-bold text-white">
          AI
        </div>
        <span className="text-sm font-bold text-[oklch(0.3_0.03_260)]">AI 인사이트</span>
        {aiInsight && !isPending && (
          <>
            <span className="rounded-full bg-[oklch(0.6_0.15_255)]/12 px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.45_0.12_260)]">
              AI 분석
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {formatRelativeTime(aiInsight.generatedAt)} 분석됨
            </span>
          </>
        )}
      </div>

      {/* Body: 3 states */}
      {isPending ? (
        <AiAnalysisProgress variant="dashboard" isPending={isPending} />
      ) : aiInsight === null ? (
        <EmptyState onGenerate={onGenerate} />
      ) : (
        <InsightContent content={aiInsight.content} onGenerate={onGenerate} />
      )}

      {/* Disclaimer */}
      <p className="mt-3 border-t border-[oklch(0.85_0.03_260)] pt-2 text-center text-[10px] text-muted-foreground">
        ⚖ 본 서비스는 법률 자문이 아닌 관리 보조 도구입니다. 정확한 판단은 전문가와 상담하세요.
      </p>
    </div>
  );
}

function EmptyState({ onGenerate }: { readonly onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.6_0.15_255)]/10">
        <Sparkles className="h-5 w-5 text-[oklch(0.5_0.12_260)]" />
      </div>
      <p className="text-[13px] text-[oklch(0.45_0.02_260)]">
        아직 AI 분석 결과가 없습니다.
      </p>
      <p className="mb-4 text-[12px] text-muted-foreground">
        버튼을 눌러 현재 사업장 상태를 AI로 분석해 보세요.
      </p>
      <button
        type="button"
        onClick={onGenerate}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.6_0.15_255)] to-[oklch(0.55_0.18_300)] px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI 분석
      </button>
    </div>
  );
}

function InsightContent({
  content,
  onGenerate,
}: {
  readonly content: string;
  readonly onGenerate: () => void;
}) {
  return (
    <>
      <div className="prose prose-sm max-w-none leading-relaxed text-[oklch(0.35_0.02_260)] prose-strong:text-[oklch(0.25_0.03_260)]">
        <Markdown disallowedElements={DISALLOWED_ELEMENTS}>{content}</Markdown>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex items-center gap-1 rounded-md border border-[oklch(0.8_0.03_260)] px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-[oklch(0.95_0.01_260)]"
        >
          <RefreshCw className="h-3 w-3" />
          다시 분석
        </button>
      </div>
    </>
  );
}
