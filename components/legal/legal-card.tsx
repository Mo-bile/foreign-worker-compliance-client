"use client";

import { useState, useId } from "react";
import { useLegalImpact } from "@/lib/queries/use-legal-impact";
import { ImpactBox } from "./impact-box";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BADGE_COLORS, BADGE_FALLBACK } from "@/lib/constants/signal-colors";
import { DISPLAY_STATUS_LABELS, DISPLAY_STATUS_COLORS, SOURCE_TYPE_LABELS } from "@/lib/constants/legal-change";
import type { LegalChange } from "@/types/legal";

interface LegalCardProps {
  readonly change: LegalChange;
  readonly companyId: number;
}

export function LegalCard({ change, companyId }: LegalCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bodyId = useId();
  const isResolved = change.status === "resolved";

  const { data, isLoading, isError, refetch } = useLegalImpact(change.id, companyId, isOpen);

  const header = (
    <>
      <div className="flex items-center gap-2">
        <span className="text-xl">{change.icon}</span>
        <span className="text-sm font-semibold">
          {change.title}
          <span className="ml-1.5 text-[10px] text-signal-blue font-semibold">✦ AI</span>
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        시행일: {change.effectiveDate} · 감지일: {change.detectedDate} · {change.lawName}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", DISPLAY_STATUS_COLORS[change.displayStatus]?.badge)}>
          {DISPLAY_STATUS_LABELS[change.displayStatus]}
          {change.displayStatus === "UPCOMING" && change.dDay != null && ` (D${change.dDay > 0 ? `+${change.dDay}` : change.dDay === 0 ? "-Day" : change.dDay})`}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          {SOURCE_TYPE_LABELS[change.sourceType]}
        </span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", BADGE_COLORS[change.badge.color] ?? BADGE_FALLBACK)}>
          {change.badge.text}
        </span>
      </div>
    </>
  );

  if (isResolved) {
    return <div className="rounded-lg border p-4 opacity-70">{header}</div>;
  }

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        className="w-full p-4 text-left"
      >
        {header}
      </button>
      {isOpen && (
        <div id={bodyId} className="space-y-4 border-t px-4 pb-4 pt-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : isError ? (
            <div className="rounded-md bg-destructive/5 p-3 text-center">
              <p className="text-sm text-destructive">영향 분석을 불러오지 못했습니다</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-xs text-primary hover:underline"
              >
                다시 시도
              </button>
            </div>
          ) : data ? (
            <>
              <ImpactBox
                level={data.level}
                description={data.description}
                actions={data.actions}
              />
              {change.officialSourceUrl && (
                <a
                  href={change.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  📎 공식 출처
                </a>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
