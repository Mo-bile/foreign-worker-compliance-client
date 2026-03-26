import type { DataSource } from "@/types/shared";

interface DataSourceChipsProps {
  readonly sources: readonly DataSource[];
}

export function DataSourceChips({ sources }: DataSourceChipsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {sources.map((src) => (
        <span
          key={src.dataId}
          title={src.dataId}
          className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
        >
          📄 {src.name}
        </span>
      ))}
    </div>
  );
}
