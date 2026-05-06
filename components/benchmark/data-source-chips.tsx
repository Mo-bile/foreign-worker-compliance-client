import type { DataSource } from "@/types/shared";

interface DataSourceChipsProps {
  readonly sources: readonly DataSource[];
}

export function DataSourceChips({ sources }: DataSourceChipsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {sources.map((source) => (
        <span
          key={`${source.name}-${source.dataId}`}
          className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
        >
          {source.name}
        </span>
      ))}
    </div>
  );
}
