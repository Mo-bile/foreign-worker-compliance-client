import { cn } from "@/lib/utils";

const LEVEL_STYLES: Record<string, { label: string; className: string }> = {
  HIGH: { label: "높음", className: "text-signal-red bg-signal-red-bg" },
  MEDIUM: { label: "보통", className: "text-signal-orange bg-signal-orange-bg" },
  LOW: { label: "낮음", className: "text-signal-green bg-signal-green-bg" },
};

interface ImpactBoxProps {
  readonly level?: string;
  readonly description?: string;
  readonly actions?: readonly string[];
}

export function ImpactBox({ level, description, actions }: ImpactBoxProps) {
  const levelStyle = level ? LEVEL_STYLES[level] : undefined;
  const hasContent = level || description || (actions && actions.length > 0);

  return (
    <div className="rounded-lg bg-secondary p-4">
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-sm font-semibold">귀사 영향 분석</h4>
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
        <p className="text-sm text-muted-foreground">영향 분석 데이터가 없습니다</p>
      )}
      {description && (
        <p className="mb-2 text-sm text-muted-foreground">{description}</p>
      )}
      {actions && actions.length > 0 && (
        <ul className="space-y-1">
          {actions.map((action) => (
            <li key={action} className="text-sm text-muted-foreground">
              → {action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
