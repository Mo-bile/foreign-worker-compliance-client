"use client";

import Markdown from "react-markdown";
import { Sparkles, RefreshCw } from "lucide-react";
import { AiAnalysisProgress } from "@/components/common/ai-analysis-progress";
import type { AiInsight } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

const DISALLOWED_ELEMENTS = ["img", "a", "script", "iframe", "input", "form", "table"];
const COOLDOWN_MS = 5 * 60 * 1000; // 5분

function isCooldownActive(generatedAt: string): boolean {
  return Date.now() - new Date(generatedAt).getTime() < COOLDOWN_MS;
}

function formatCooldownRemaining(generatedAt: string): string {
  const remaining = COOLDOWN_MS - (Date.now() - new Date(generatedAt).getTime());
  const minutes = Math.ceil(remaining / 60_000);
  return `${minutes}분 후 다시 분석할 수 있습니다`;
}

interface DashboardAiInsightProps {
  readonly aiInsight: Readonly<AiInsight> | null;
  readonly isPending: boolean;
  readonly onGenerate: () => void;
}

export function DashboardAiInsight({ aiInsight, isPending, onGenerate }: DashboardAiInsightProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[oklch(0.85_0.04_280)] bg-gradient-to-br from-[oklch(0.97_0.02_280)] to-[oklch(0.96_0.02_260)] p-5 pl-7 dark:border-border dark:from-card dark:to-[oklch(0.16_0.03_260)]">
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-[oklch(0.6_0.15_255)] to-[oklch(0.55_0.18_300)]" />

      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.6_0.15_255)] to-[oklch(0.55_0.18_300)] text-xs font-bold text-white">
          AI
        </div>
        <span className="text-sm font-bold text-[oklch(0.3_0.03_260)] dark:text-card-foreground">
          AI 인사이트
        </span>
        {aiInsight && !isPending && (
          <>
            <span className="rounded-full bg-[oklch(0.6_0.15_255)]/12 px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.45_0.12_260)] dark:bg-primary/15 dark:text-primary">
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
        <InsightContent
          content={aiInsight.content}
          generatedAt={aiInsight.generatedAt}
          onGenerate={onGenerate}
        />
      )}

      {/* Disclaimer */}
      <p className="mt-3 border-t border-[oklch(0.85_0.03_260)] pt-2 text-center text-[10px] text-muted-foreground dark:border-border">
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
      <p className="text-[13px] text-[oklch(0.45_0.02_260)] dark:text-card-foreground">
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
  generatedAt,
  onGenerate,
}: {
  readonly content: string;
  readonly generatedAt: string;
  readonly onGenerate: () => void;
}) {
  const cooldown = isCooldownActive(generatedAt);

  return (
    <>
      <div className="prose prose-sm max-w-none leading-relaxed text-[oklch(0.35_0.02_260)] prose-strong:text-[oklch(0.25_0.03_260)] dark:text-card-foreground dark:prose-strong:text-foreground">
        <Markdown disallowedElements={DISALLOWED_ELEMENTS}>{content}</Markdown>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        {cooldown && (
          <span className="text-[11px] text-muted-foreground">
            {formatCooldownRemaining(generatedAt)}
          </span>
        )}
        <button
          type="button"
          onClick={onGenerate}
          disabled={cooldown}
          className="inline-flex items-center gap-1 rounded-md border border-[oklch(0.8_0.03_260)] px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-[oklch(0.95_0.01_260)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:hover:bg-muted/50"
        >
          <RefreshCw className="h-3 w-3" />
          다시 분석
        </button>
      </div>
    </>
  );
}
