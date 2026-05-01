import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  AlertGroup,
  AlertGroupCategory,
  AlertGroupTiming,
  AlertGroupUrgency,
} from "@/types/dashboard";

const urgencyStyles: Record<AlertGroupUrgency, { bg: string; dot: string; border: string }> = {
  critical: { bg: "bg-signal-red-bg", dot: "bg-signal-red", border: "border-signal-red/30" },
  warning: {
    bg: "bg-signal-orange-bg",
    dot: "bg-signal-orange",
    border: "border-signal-orange/30",
  },
  caution: {
    bg: "bg-signal-yellow-bg",
    dot: "bg-signal-yellow",
    border: "border-signal-yellow/30",
  },
};

const TIMING_LABELS: Record<AlertGroupTiming, string> = {
  immediate: "즉시 조치",
  scheduled: "예정 관리",
};

const TIMING_ORDER: readonly AlertGroupTiming[] = ["immediate", "scheduled"];
const CATEGORY_ORDER: readonly AlertGroupCategory[] = [
  "socialInsurance",
  "guaranteeInsurance",
  "other",
];

const CATEGORY_LABELS: Record<AlertGroupTiming, Record<AlertGroupCategory, string>> = {
  immediate: {
    socialInsurance: "4대보험 신고 지연",
    guaranteeInsurance: "전용보험 가입 지연",
    other: "기타 조치",
  },
  scheduled: {
    socialInsurance: "4대보험 신고 예정",
    guaranteeInsurance: "전용보험 가입 예정",
    other: "기타 예정 관리",
  },
};

interface AlertGroupCardProps {
  readonly alertGroups: readonly AlertGroup[];
}

function sumCounts(groups: readonly AlertGroup[]): number {
  return groups.reduce((sum, group) => sum + group.count, 0);
}

export function AlertGroupCard({ alertGroups }: AlertGroupCardProps) {
  if (alertGroups.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">조치 알림이 없습니다</p>;
  }

  return (
    <div className="space-y-4">
      {TIMING_ORDER.map((timing) => {
        const timingGroups = alertGroups.filter((group) => group.timing === timing);
        if (timingGroups.length === 0) return null;

        return (
          <section key={timing} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground">
                {TIMING_LABELS[timing]}
              </h3>
              <span className="text-[11px] text-muted-foreground">
                총 {sumCounts(timingGroups)}건
              </span>
            </div>
            {CATEGORY_ORDER.map((category) => {
              const categoryGroups = timingGroups.filter((group) => group.category === category);
              if (categoryGroups.length === 0) return null;
              const categoryCount = sumCounts(categoryGroups);

              return (
                <div key={`${timing}-${category}`} className="space-y-2">
                  <div className="text-[12px] font-semibold">
                    <span>
                      {CATEGORY_LABELS[timing][category]} {categoryCount}건
                    </span>
                  </div>
                  {categoryGroups.map((group) => {
                    const style = urgencyStyles[group.urgency];
                    return (
                      <div
                        key={`${group.timing}-${group.deadlineType}`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-4 transition-shadow hover:shadow-md",
                          style.bg,
                          style.border,
                        )}
                      >
                        <div className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)} />
                        <span className="flex-1 text-[13px] font-semibold">{group.label}</span>
                        <span className="text-xs text-muted-foreground">{group.count}건</span>
                        <Link
                          href={group.href}
                          className="text-[11px] text-primary hover:underline"
                        >
                          전체 보기 →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
