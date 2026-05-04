import { cn } from "@/lib/utils";
import { ActionRow } from "./action-row";
import type { LegalAction } from "@/types/legal";

const LEVEL_STYLES: Record<string, { label: string; className: string }> = {
  HIGH: { label: "높음", className: "text-signal-red bg-signal-red-bg" },
  MEDIUM: { label: "보통", className: "text-signal-orange bg-signal-orange-bg" },
  LOW: { label: "낮음", className: "text-signal-green bg-signal-green-bg" },
};

interface ImpactBoxProps {
  readonly level?: string;
  readonly description?: string;
  readonly actions?: readonly LegalAction[];
}

export function ImpactBox({ level, description, actions }: ImpactBoxProps) {
  const levelStyle = level ? LEVEL_STYLES[level] : undefined;
  const hasContent = level || description || (actions && actions.length > 0);

  return (
    <div className="rounded-lg bg-secondary p-4">
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-sm font-semibold">✦ AI 안내 — 공식 출처 + 사업장 정보 기반</h4>
        {levelStyle && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              levelStyle.className,
            )}
          >
            영향도: {levelStyle.label}
          </span>
        )}
      </div>
      {!hasContent && (
        <p className="text-sm text-muted-foreground">AI 안내를 표시할 내용이 없습니다</p>
      )}
      {description && <p className="mb-2 text-sm text-muted-foreground">{description}</p>}
      {actions && actions.length > 0 && (
        <ActionRow actions={actions} />
      )}
    </div>
  );
}
