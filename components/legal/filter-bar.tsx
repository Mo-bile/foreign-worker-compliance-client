import { cn } from "@/lib/utils";

export type FilterValue = "all" | "affected" | "action_required" | "resolved";

const FILTERS: readonly { readonly value: FilterValue; readonly label: string }[] = [
  { value: "all", label: "전체" },
  { value: "affected", label: "영향있음" },
  { value: "action_required", label: "조치필요" },
  { value: "resolved", label: "확인완료" },
];

interface FilterBarProps {
  readonly activeFilter: FilterValue;
  readonly counts?: Readonly<Record<FilterValue, number>>;
  readonly onFilterChange: (filter: FilterValue) => void;
}

export function FilterBar({ activeFilter, counts, onFilterChange }: FilterBarProps) {
  return (
    <div role="group" aria-label="법령 필터" className="flex gap-2">
      {FILTERS.map(({ value, label }) => {
        const isActive = activeFilter === value;
        const count = counts?.[value];
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onFilterChange(value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80",
            )}
          >
            {label}
            {count != null ? ` (${count})` : null}
          </button>
        );
      })}
    </div>
  );
}
