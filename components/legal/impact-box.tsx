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
  /** @deprecated 구 형식 호환 — impacts 배열 */
  readonly impacts?: readonly string[];
}

export function ImpactBox({ level, description, actions, impacts }: ImpactBoxProps) {
  const levelStyle = level ? LEVEL_STYLES[level] : undefined;

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
      {impacts && impacts.length > 0 && !actions && (
        <ul className="space-y-1">
          {impacts.map((impact) => (
            <li key={impact} className="text-sm text-muted-foreground">
              → {impact}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
