"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "./collapsible-card";
import type { AutoSuggestedDeductionDisplay } from "@/types/simulator";

interface AutoSuggestedDeductionsCardProps {
  readonly autoSuggested: readonly AutoSuggestedDeductionDisplay[];
  readonly onResubmit: (codesToAdd: readonly string[]) => void;
  readonly isPending: boolean;
}

export function AutoSuggestedDeductionsCard({
  autoSuggested,
  onResubmit,
  isPending,
}: AutoSuggestedDeductionsCardProps) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());

  if (autoSuggested.length === 0) return null;

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  return (
    <CollapsibleCard
      icon={<span>🔍</span>}
      iconColorClass="bg-signal-orange-bg text-signal-orange"
      title="자동 감지 감점 후보"
      defaultOpen={true}
    >
      <p className="mb-3 text-xs text-muted-foreground">
        체크 시 다음 시뮬레이션에 반영됩니다. BE가 워커 lifecycle 데이터를 분석해 자동 추론한 감점 후보입니다.
      </p>
      <ul className="space-y-3">
        {autoSuggested.map((item) => (
          <li key={item.code} className="rounded-lg border p-3">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.has(item.code)}
                onChange={() => toggle(item.code)}
                className="mt-0.5"
                aria-label={item.displayName}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.displayName}</span>
                  <span className="font-semibold text-signal-red">{item.pointsLabel}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">{item.triggerCountLabel}</p>
              </div>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end">
        <Button
          variant="default"
          size="sm"
          onClick={() => onResubmit(Array.from(selected))}
          disabled={selected.size === 0 || isPending}
        >
          {isPending ? "처리 중..." : "다시 시뮬레이션"}
        </Button>
      </div>
    </CollapsibleCard>
  );
}
