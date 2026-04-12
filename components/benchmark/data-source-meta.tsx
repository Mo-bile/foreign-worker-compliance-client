"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface DataSourceMetaProps {
  readonly source: string;
  readonly baseDate: string;
  readonly population: string;
  readonly caution?: string;
}

export function DataSourceMeta({ source, baseDate, population, caution }: DataSourceMetaProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 border-t border-dashed pt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="text-xs">ⓘ</span>
        <span>데이터 정보</span>
        <ChevronDown
          className={`ml-auto h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <dl className="mt-2 space-y-1.5 text-[11px]">
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 font-medium text-muted-foreground">출처</dt>
            <dd>{source}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 font-medium text-muted-foreground">기준일</dt>
            <dd>{baseDate}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 font-medium text-muted-foreground">모집단</dt>
            <dd>{population}</dd>
          </div>
          {caution && (
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 font-medium text-muted-foreground">유의사항</dt>
              <dd className="text-[oklch(0.55_0.12_55)]">{caution}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
