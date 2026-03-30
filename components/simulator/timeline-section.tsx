import { cn } from "@/lib/utils";
import { NATIONALITY_LABELS } from "@/types/api";
import { CollapsibleCard } from "./collapsible-card";
import type { TimelineDisplayData } from "@/types/simulator";

interface TimelineSectionProps {
  readonly data: TimelineDisplayData;
  readonly defaultOpen?: boolean;
  readonly muted?: boolean;
}

export function TimelineSection({ data, defaultOpen = true, muted = false }: TimelineSectionProps) {
  const preferredLabel = data.preferredNationality
    ? (NATIONALITY_LABELS as Record<string, string>)[data.preferredNationality] ?? null
    : null;

  const selectedNat = preferredLabel
    ? data.nationalityComparison.find((n) => n.nationality === preferredLabel)
    : null;
  const unspecified = data.nationalityComparison.find((n) => n.nationality === "무관 (미지정)");

  return (
    <CollapsibleCard
      icon={<span>⏱</span>}
      iconColorClass="bg-signal-yellow-bg text-signal-yellow"
      title="예상 소요기간"
      badge={
        <span className="inline-flex items-center rounded-full bg-signal-yellow-bg px-2 py-0.5 text-[11px] font-semibold text-signal-yellow">
          약 {data.estimatedMonths}개월
        </span>
      }
      defaultOpen={defaultOpen}
      muted={muted}
    >
      {/* Dot-line timeline */}
      <div className="mb-4 flex flex-col">
        {data.steps.map((step, i) => {
          const isLast = i === data.steps.length - 1;
          return (
            <div key={step.step} className="flex items-stretch gap-3">
              <div className="flex w-6 flex-col items-center">
                <div
                  className={cn(
                    "mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full",
                    isLast ? "bg-signal-green" : "bg-primary",
                  )}
                />
                {!isLast && <div className="w-0.5 flex-1 bg-border" />}
              </div>
              <div className={cn("flex-1", !isLast && "pb-4")}>
                <div className="text-[13px] font-semibold">
                  {step.step}. {step.title}
                </div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
                <span
                  className={cn(
                    "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    step.duration.includes("개월")
                      ? "bg-signal-orange-bg text-signal-orange"
                      : "bg-signal-blue-bg text-signal-blue",
                  )}
                >
                  {step.duration}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nationality comparison table */}
      <div className="mb-2 text-[13px] font-semibold">주요 송출국별 예상 소요기간</div>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">국적</th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">평균 소요기간</th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">비고</th>
          </tr>
        </thead>
        <tbody>
          {data.nationalityComparison.map((nat) => {
            const isUnspecified = nat.nationality === "무관 (미지정)";
            return (
              <tr key={nat.nationality}>
                <td
                  className={cn(
                    "border border-border px-2.5 py-2.5",
                    isUnspecified && "font-semibold",
                  )}
                >
                  {nat.flag} {nat.nationality}
                </td>
                <td
                  className={cn(
                    "border border-border px-2.5 py-2.5",
                    isUnspecified && "font-semibold text-signal-green",
                  )}
                >
                  약 {nat.avgMonths}개월
                </td>
                <td
                  className={cn(
                    "border border-border px-2.5 py-2.5",
                    isUnspecified && "font-medium text-signal-green",
                  )}
                >
                  {nat.note}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Highlight box */}
      {data.preferredNationality && selectedNat && unspecified && (
        <div className="mt-3 rounded-lg bg-signal-yellow-bg p-3">
          <p className="text-xs leading-relaxed">
            <strong className="text-signal-orange">
              현재 선택: {selectedNat.nationality} → 약 {selectedNat.avgMonths}개월 예상.
            </strong>{" "}
            국적을 미지정하면 약{" "}
            <strong>{selectedNat.avgMonths - unspecified.avgMonths}개월 단축</strong> 가능합니다.
          </p>
        </div>
      )}
    </CollapsibleCard>
  );
}
