"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Markdown from "react-markdown";

interface AiReportSectionProps {
  readonly aiReport: string;
}

const DISALLOWED_ELEMENTS = ["img", "a", "script", "iframe", "input", "form", "table"];

const COLLAPSED_MAX_HEIGHT = 120;

export function AiReportSection({ aiReport }: AiReportSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-xl border border-[oklch(0.85_0.04_280)] bg-gradient-to-br from-[oklch(0.97_0.02_280)] to-[oklch(0.96_0.02_260)] p-5 pl-7 dark:border-border dark:from-card dark:to-[oklch(0.16_0.03_260)]">
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-[oklch(0.6_0.15_255)] to-[oklch(0.55_0.18_300)]" />

      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.6_0.15_255)] to-[oklch(0.55_0.18_300)] text-xs font-bold text-white">
          AI
        </div>
        <span className="text-sm font-bold text-[oklch(0.3_0.03_260)] dark:text-card-foreground">
          AI 종합 안내
        </span>
        <span className="rounded-full bg-[oklch(0.6_0.15_255)]/12 px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.45_0.12_260)] dark:bg-primary/15 dark:text-primary">
          AI 안내
        </span>
      </div>

      <div className="relative">
        <div
          className={`prose prose-sm max-w-none leading-relaxed text-[oklch(0.35_0.02_260)] prose-strong:text-[oklch(0.25_0.03_260)] dark:text-card-foreground dark:prose-strong:text-foreground ${
            !expanded ? "overflow-hidden" : ""
          }`}
          style={!expanded ? { maxHeight: COLLAPSED_MAX_HEIGHT } : undefined}
        >
          <Markdown disallowedElements={DISALLOWED_ELEMENTS}>{aiReport}</Markdown>
        </div>

        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[oklch(0.97_0.02_280)] to-transparent dark:from-card" />
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-2 flex w-full items-center justify-center gap-1 text-xs font-medium text-[oklch(0.45_0.12_260)] transition-colors hover:text-[oklch(0.3_0.03_260)] dark:text-primary dark:hover:text-foreground"
      >
        {expanded ? "접기" : "더 보기"}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
